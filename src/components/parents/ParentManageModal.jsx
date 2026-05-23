import { useEffect, useState } from 'react';
import { KeyRound, Link2, Unlink } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { parentsApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

export default function ParentManageModal({ open, parentId, onClose, onSaved }) {
  const { toast } = useToast();
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentHits, setStudentHits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !parentId) return;
    setLoading(true);
    parentsApi.getOne(parentId)
      .then((r) => {
        const d = r.data.data;
        setDetail(d);
        setForm({
          first_name: d.first_name,
          last_name: d.last_name,
          email: d.login_email || d.email,
          phone: d.phone,
          relationship: d.relationship || 'parent',
        });
      })
      .catch(() => toast('Could not load parent', 'error'))
      .finally(() => setLoading(false));
  }, [open, parentId, toast]);

  useEffect(() => {
    if (!studentSearch.trim()) { setStudentHits([]); return undefined; }
    const t = setTimeout(() => {
      parentsApi.searchStudents(studentSearch).then((r) => setStudentHits(r.data.data || [])).catch(() => setStudentHits([]));
    }, 300);
    return () => clearTimeout(t);
  }, [studentSearch]);

  const field = (k) => ({ value: form[k] || '', onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })) });

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await parentsApi.update(parentId, form);
      toast('Parent updated', 'success');
      onSaved?.();
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast('Password must be at least 6 characters', 'error');
      return;
    }
    setSaving(true);
    try {
      await parentsApi.resetPassword(parentId, newPassword);
      toast('Password reset', 'success');
      setNewPassword('');
    } catch (err) {
      toast(err.response?.data?.message || 'Reset failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const assignStudent = async (s) => {
    try {
      await parentsApi.linkStudents(parentId, [s.id]);
      toast(`Linked ${s.first_name} ${s.last_name}`, 'success');
      setStudentSearch('');
      setStudentHits([]);
      const r = await parentsApi.getOne(parentId);
      setDetail(r.data.data);
      onSaved?.();
    } catch (err) {
      toast(err.response?.data?.message || 'Link failed', 'error');
    }
  };

  const unlink = async (studentId) => {
    try {
      await parentsApi.unlinkStudent(parentId, studentId);
      toast('Student unlinked', 'success');
      const r = await parentsApi.getOne(parentId);
      setDetail(r.data.data);
      onSaved?.();
    } catch (err) {
      toast(err.response?.data?.message || 'Unlink failed', 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Manage parent account" size="lg">
      {loading ? (
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      ) : (
        <div className="space-y-6">
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First name" required {...field('first_name')} />
              <Input label="Last name" required {...field('last_name')} />
            </div>
            <Input label="Login email" type="email" required {...field('email')} />
            <Input label="Phone" required {...field('phone')} />
            <Select
              label="Relationship"
              value={form.relationship}
              onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
              options={[
                { value: 'parent', label: 'Parent' },
                { value: 'mother', label: 'Mother' },
                { value: 'father', label: 'Father' },
                { value: 'guardian', label: 'Guardian' },
              ]}
            />
            <Button type="submit" loading={saving}>Save profile</Button>
          </form>

          <div className={`${ui.panel} space-y-3`}>
            <p className={`font-bold flex items-center gap-2 ${ui.panelTitle}`}><KeyRound size={16} /> Reset password</p>
            <p className={`text-xs ${ui.muted}`}>Set a new password for parent login ({detail?.login_email || detail?.email}).</p>
            <div className="flex gap-2">
              <Input type="password" label="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="flex-1" />
              <Button type="button" className="self-end" onClick={resetPassword} loading={saving}>Reset</Button>
            </div>
          </div>

          <div className={`${ui.panel} space-y-3`}>
            <p className={`font-bold flex items-center gap-2 ${ui.panelTitle}`}><Link2 size={16} /> Linked students</p>
            {detail?.students?.length ? (
              <ul className="space-y-2">
                {detail.students.map((s) => (
                  <li key={s.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-bold">{s.first_name} {s.last_name} · {s.admission_number} · {s.grade_name} {s.section_name}</span>
                    <button type="button" className="text-rose-500 text-xs font-bold flex items-center gap-1" onClick={() => unlink(s.id)}>
                      <Unlink size={12} /> Unlink
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-sm ${ui.muted}`}>No students linked yet.</p>
            )}
            <input
              className={ui.input}
              placeholder="Search student to assign..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            {studentHits.length > 0 && (
              <ul className={`${ui.card} divide-y max-h-32 overflow-y-auto`}>
                {studentHits.map((s) => (
                  <li key={s.id}>
                    <button type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/40" onClick={() => assignStudent(s)}>
                      {s.first_name} {s.last_name} · {s.admission_number}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
