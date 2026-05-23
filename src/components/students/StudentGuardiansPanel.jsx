import { useCallback, useEffect, useState } from 'react';
import { KeyRound, Link2, MessageSquare, Shield, UserPlus, Users } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import { studentsApi, parentsApi, notificationsApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

const REL_OPTIONS = [
  { value: 'parent', label: 'Parent' },
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'other', label: 'Other' },
];

const emptyGuardian = {
  first_name: '',
  last_name: '',
  relationship: 'parent',
  phone: '',
  email: '',
  is_primary: false,
  is_emergency: false,
  can_pickup: true,
};

export default function StudentGuardiansPanel({ studentId, guardians = [], linkedParents = [], onRefresh }) {
  const { toast } = useToast();
  const [form, setForm] = useState(emptyGuardian);
  const [smsMessage, setSmsMessage] = useState('');
  const [parentQ, setParentQ] = useState('');
  const [parentHits, setParentHits] = useState([]);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [portalForm, setPortalForm] = useState({
    first_name: '', last_name: '', phone: '', email: '', password: '', relationship: 'parent',
  });
  const [saving, setSaving] = useState(false);

  const loadParents = useCallback(() => {
    parentsApi.byStudent(studentId).then((r) => onRefresh?.(r.data.data)).catch(() => {});
  }, [studentId, onRefresh]);

  useEffect(() => {
    if (!parentQ.trim()) { setParentHits([]); return undefined; }
    const t = setTimeout(() => {
      parentsApi.search(parentQ).then((r) => setParentHits(r.data.data || [])).catch(() => setParentHits([]));
    }, 300);
    return () => clearTimeout(t);
  }, [parentQ]);

  const addGuardian = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim() && !form.last_name.trim()) {
      toast('First or last name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await studentsApi.addGuardian(studentId, {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        relationship: form.relationship,
        phone: form.phone,
        email: form.email,
        is_primary: form.is_primary,
        is_emergency: form.is_emergency,
        can_pickup: form.can_pickup,
      });
      setForm(emptyGuardian);
      toast('Guardian added', 'success');
      onRefresh?.();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to add guardian', 'error');
    } finally {
      setSaving(false);
    }
  };

  const linkPortalParent = async (parentId) => {
    try {
      await parentsApi.linkToStudent(studentId, parentId);
      toast('Parent linked to student', 'success');
      setParentQ('');
      setParentHits([]);
      onRefresh?.();
      loadParents();
    } catch (err) {
      toast(err.response?.data?.message || 'Link failed', 'error');
    }
  };

  const openCreatePortal = () => {
    const primary = guardians.find((g) => g.is_primary) || guardians[0];
    setPortalForm({
      first_name: primary?.first_name || (primary?.full_name?.split(' ')[0]) || '',
      last_name: primary?.last_name || (primary?.full_name?.split(' ').slice(1).join(' ')) || '',
      phone: primary?.phone || '',
      email: primary?.email || '',
      password: '',
      relationship: primary?.relationship || 'parent',
    });
    setShowPortalModal(true);
  };

  const createPortalParent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await parentsApi.register({
        first_name: portalForm.first_name,
        last_name: portalForm.last_name,
        phone: portalForm.phone,
        email: portalForm.email,
        password: portalForm.password,
        relationship: portalForm.relationship,
        student_ids: [studentId],
      });
      toast('Parent portal account created', 'success');
      setShowPortalModal(false);
      onRefresh?.();
      loadParents();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create parent account', 'error');
    } finally {
      setSaving(false);
    }
  };

  const unlinkPortal = async (parentId) => {
    if (!window.confirm('Remove portal link for this student? Parent account stays active for other children.')) return;
    try {
      await parentsApi.unlinkStudent(parentId, studentId);
      toast('Parent unlinked', 'success');
      loadParents();
      onRefresh?.();
    } catch (err) {
      toast(err.response?.data?.message || 'Unlink failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className={ui.alertInfo}>
        <p className="font-bold text-sm flex items-center gap-2"><Shield size={16} /> Guardians & parent portal</p>
        <p className="text-sm mt-1 opacity-90">
          <strong>Guardians</strong> are contacts on the student file (SMS, pickup, emergency).
          <strong> Portal parents</strong> can log in with email + password to view attendance, grades, and fees.
        </p>
      </div>

      {linkedParents.length > 0 && (
        <div className={`${ui.card} p-4 space-y-3`}>
          <p className={`${ui.mutedXs} flex items-center gap-1`}><KeyRound size={12} /> Portal parent accounts</p>
          <ul className="space-y-2">
            {linkedParents.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{p.first_name} {p.last_name}</p>
                  <p className="text-xs text-slate-500">{p.email} · {p.phone} · {p.relationship}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => unlinkPortal(p.id)}>Unlink</Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={`${ui.card} p-4 space-y-3`}>
        <p className={`${ui.mutedXs} flex items-center gap-1`}><Link2 size={12} /> Link existing portal parent</p>
        <input
          className={ui.input}
          placeholder="Search parent by name, phone, or email..."
          value={parentQ}
          onChange={(e) => setParentQ(e.target.value)}
        />
        {parentHits.length > 0 && (
          <ul className={`${ui.card} divide-y max-h-40 overflow-y-auto`}>
            {parentHits.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  onClick={() => linkPortalParent(p.id)}
                >
                  {p.first_name} {p.last_name} · {p.phone} · {p.email}
                </button>
              </li>
            ))}
          </ul>
        )}
        <Button type="button" variant="secondary" size="sm" onClick={openCreatePortal}>
          <UserPlus size={14} /> Create new portal parent for this student
        </Button>
      </div>

      <form onSubmit={addGuardian} className={`${ui.panel} grid md:grid-cols-2 gap-3`}>
        <p className={`md:col-span-2 font-black text-slate-900 dark:text-slate-100 flex items-center gap-2`}>
          <Users size={18} className="text-emerald-600" /> Add guardian contact
        </p>
        <Input label="First name" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} required />
        <Input label="Last name" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
        <Select label="Relationship" value={form.relationship} onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))} options={REL_OPTIONS} />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <Input label="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <label className="flex items-center gap-2 text-sm font-bold md:col-span-2">
          <input type="checkbox" checked={form.is_primary} onChange={(e) => setForm((f) => ({ ...f, is_primary: e.target.checked }))} />
          Primary guardian
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={form.is_emergency} onChange={(e) => setForm((f) => ({ ...f, is_emergency: e.target.checked }))} />
          Emergency contact
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={form.can_pickup} onChange={(e) => setForm((f) => ({ ...f, can_pickup: e.target.checked }))} />
          Authorized pickup
        </label>
        <div className="md:col-span-2">
          <Button type="submit" loading={saving}>Save guardian</Button>
        </div>
      </form>

      <div className={`${ui.alertSuccess} flex flex-wrap gap-3 items-end`}>
        <div className="flex-1 min-w-[200px]">
          <p className="text-xs font-bold uppercase flex items-center gap-1 mb-2"><MessageSquare size={14} /> SMS all guardians</p>
          <Input value={smsMessage} onChange={(e) => setSmsMessage(e.target.value)} placeholder="Message to guardian phones..." />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={async () => {
            if (!smsMessage.trim()) return;
            await notificationsApi.notifyGuardians(studentId, smsMessage.trim());
            setSmsMessage('');
            toast('SMS queued for guardians', 'success');
          }}
        >
          Send SMS
        </Button>
      </div>

      <ul className="space-y-3">
        {guardians.length ? guardians.map((g) => (
          <li key={g.id} className={`${ui.card} p-4 flex flex-wrap justify-between gap-3`}>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {g.full_name || `${g.first_name || ''} ${g.last_name || ''}`.trim()}
                {g.is_primary && <span className="ml-2 text-emerald-600 text-xs font-black">PRIMARY</span>}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {g.relationship || '—'} · {g.phone || '—'} · {g.email || '—'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {g.is_emergency ? 'Emergency · ' : ''}{g.can_pickup !== false ? 'Pickup OK' : 'No pickup'}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                if (window.confirm('Remove this guardian from the student?')) {
                  await studentsApi.deleteGuardian(studentId, g.id);
                  toast('Guardian removed', 'success');
                  onRefresh?.();
                }
              }}
            >
              Remove
            </Button>
          </li>
        )) : (
          <p className={`text-center py-8 ${ui.muted}`}>No guardians on file yet.</p>
        )}
      </ul>

      <Modal open={showPortalModal} onClose={() => setShowPortalModal(false)} title="Create parent portal account" size="md">
        <form onSubmit={createPortalParent} className="space-y-4">
          <p className="text-sm text-slate-500">Parent signs in with <strong>email</strong> and password. Phone is used as the unique identity key.</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" required value={portalForm.first_name} onChange={(e) => setPortalForm((f) => ({ ...f, first_name: e.target.value }))} />
            <Input label="Last name" required value={portalForm.last_name} onChange={(e) => setPortalForm((f) => ({ ...f, last_name: e.target.value }))} />
          </div>
          <Input label="Phone" required value={portalForm.phone} onChange={(e) => setPortalForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="Login email" type="email" required value={portalForm.email} onChange={(e) => setPortalForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Password" type="password" required minLength={6} value={portalForm.password} onChange={(e) => setPortalForm((f) => ({ ...f, password: e.target.value }))} />
          <Select label="Relationship" value={portalForm.relationship} onChange={(e) => setPortalForm((f) => ({ ...f, relationship: e.target.value }))} options={REL_OPTIONS} />
          <Button type="submit" loading={saving}>Create & link</Button>
        </form>
      </Modal>
    </div>
  );
}
