import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, UserPlus } from 'lucide-react';
import { financeApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { Field } from './financeUi';

export default function FinanceTeamPanel() {
  const { toast } = useToast();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', first_name: '', last_name: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await financeApi.listTeam();
      setTeam(res.data?.data ?? []);
    } catch {
      setTeam([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await financeApi.createTeamMember(form);
      toast('Finance officer account created', 'success');
      setForm({ email: '', password: '', first_name: '', last_name: '' });
      await load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create officer', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-10 bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
      <div className="flex items-center gap-2">
        <UserPlus className="text-emerald-600" size={20} />
        <div>
          <h2 className="text-lg font-black text-slate-900">Finance office accounts</h2>
          <p className="text-sm text-slate-500">
            Create dedicated finance officers. They sign in to the Finance Office portal (fees, payroll, ledger).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-emerald-600" /></div>
      ) : (
        <ul className="divide-y divide-slate-50 border border-slate-100 rounded-xl overflow-hidden">
          {team.length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate-400 text-center">No finance officers yet.</li>
          ) : team.map((u) => (
            <li key={u.id} className="flex justify-between px-4 py-3 text-sm">
              <span className="font-bold">{u.first_name} {u.last_name}</span>
              <span className="text-slate-500">{u.email}</span>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onSubmit} className="flex flex-wrap gap-3 items-end border-t border-slate-100 pt-5">
        <Field label="First name" value={form.first_name} onChange={(v) => setForm((f) => ({ ...f, first_name: v }))} />
        <Field label="Last name" value={form.last_name} onChange={(v) => setForm((f) => ({ ...f, last_name: v }))} />
        <Field label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
        <Field label="Password" type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
          Add officer
        </button>
      </form>
    </div>
  );
}
