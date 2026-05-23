import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import { platformApi } from '../../api/services';
import { Loader2 } from 'lucide-react';

export default function PlatformAuditPage() {
  const [tab, setTab] = useState('platform');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetcher = tab === 'platform' ? platformApi.listPlatformAudit : platformApi.listTenantAudit;
    fetcher({ limit: 100 })
      .then((res) => setRows(res.data.data || []))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">Audit log</h1>
          <p className="text-slate-500 font-medium">Platform and tenant activity trail</p>
        </div>

        <div className="flex gap-2">
          {['platform', 'tenant'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase ${
                tab === t ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600'
              }`}
            >
              {t === 'platform' ? 'Platform actions' : 'Tenant audit'}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-4 font-black text-[10px] uppercase text-slate-400">Time</th>
                  <th className="p-4 font-black text-[10px] uppercase text-slate-400">Action</th>
                  <th className="p-4 font-black text-[10px] uppercase text-slate-400">Entity</th>
                  <th className="p-4 font-black text-[10px] uppercase text-slate-400">Actor / School</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 dark:divide-slate-800">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{row.action}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{row.entity}{row.entity_id ? ` #${String(row.entity_id).slice(0, 8)}` : ''}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {row.actor_email || row.school_name || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && rows.length === 0 && (
            <p className="py-16 text-center text-slate-400">No audit entries yet.</p>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
}
