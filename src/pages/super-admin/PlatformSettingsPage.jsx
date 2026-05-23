import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import { platformApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { Loader2 } from 'lucide-react';

export default function PlatformSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    platformApi.getSettings()
      .then((res) => {
        const list = res.data.data || [];
        setSettings(list);
        const m = list.find((s) => s.key === 'maintenance_mode');
        setMaintenance(m?.value === true || m?.value === 'true');
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await platformApi.patchSettings({ maintenance_mode: maintenance });
      toast('Platform settings saved', 'success');
    } catch {
      toast('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">Platform settings</h1>
          <p className="text-slate-500 font-medium">Global configuration for all tenants</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-6">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">Maintenance mode</p>
                <p className="text-sm text-slate-500">Block tenant logins (super admins can still access)</p>
              </div>
              <input
                type="checkbox"
                className="w-12 h-7 rounded-full accent-violet-600"
                checked={maintenance}
                onChange={(e) => setMaintenance(e.target.checked)}
              />
            </label>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-3">Raw settings</p>
              <pre className="text-xs bg-slate-50 p-4 rounded-xl overflow-auto max-h-48">
                {JSON.stringify(settings, null, 2)}
              </pre>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="w-full py-4 rounded-2xl bg-violet-600 text-white font-black text-xs uppercase tracking-widest hover:bg-violet-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
