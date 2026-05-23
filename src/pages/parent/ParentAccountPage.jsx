import { useEffect, useState } from 'react';
import { KeyRound, User } from 'lucide-react';
import ParentLayout from '../../components/layouts/ParentLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { parentPortalApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

export default function ParentAccountPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    parentPortalApi.profile()
      .then((r) => setProfile(r.data.data))
      .catch(() => setProfile(null));
  }, []);

  const changePassword = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      toast('Passwords do not match', 'error');
      return;
    }
    setSaving(true);
    try {
      await parentPortalApi.changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      toast('Password updated', 'success');
      setForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast(err.response?.data?.message || 'Could not update password', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ParentLayout>
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">My account</h1>
        <p className={`${ui.muted} text-sm mt-1`}>Profile and security</p>
      </header>

      {profile && (
        <div className={`${ui.card} p-5 mb-6 flex items-start gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
            <User className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="font-black text-lg text-slate-900 dark:text-slate-100">{profile.first_name} {profile.last_name}</p>
            <p className={`text-sm ${ui.muted}`}>{profile.login_email || profile.email}</p>
            <p className={`text-sm ${ui.muted}`}>{profile.phone} · {profile.relationship}</p>
          </div>
        </div>
      )}

      <form onSubmit={changePassword} className={`${ui.card} p-6 max-w-md space-y-4`}>
        <p className={`font-black flex items-center gap-2 ${ui.panelTitle}`}>
          <KeyRound size={18} className="text-emerald-600" /> Change password
        </p>
        <Input
          label="Current password"
          type="password"
          required
          value={form.current_password}
          onChange={(e) => setForm((f) => ({ ...f, current_password: e.target.value }))}
        />
        <Input
          label="New password"
          type="password"
          required
          minLength={6}
          value={form.new_password}
          onChange={(e) => setForm((f) => ({ ...f, new_password: e.target.value }))}
        />
        <Input
          label="Confirm new password"
          type="password"
          required
          value={form.confirm}
          onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
        />
        <Button type="submit" loading={saving}>Update password</Button>
      </form>
    </ParentLayout>
  );
}
