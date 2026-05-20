import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import { platformApi } from '../../api/services';
import { Activity, Database, Server, Loader2 } from 'lucide-react';

const statusStyle = (s) => {
  if (s === 'ok') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (s === 'unavailable') return 'bg-amber-50 text-amber-700 border-amber-100';
  return 'bg-rose-50 text-rose-700 border-rose-100';
};

export default function PlatformHealthPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    platformApi.getHealth()
      .then((res) => setHealth(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const services = health
    ? [
        { name: 'API', status: health.api, icon: Server },
        { name: 'PostgreSQL', status: health.database, icon: Database },
        { name: 'Redis', status: health.redis, icon: Activity },
      ]
    : [];

  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-900">Platform health</h1>
            <p className="text-slate-500 font-medium">Live status of core infrastructure</p>
          </div>
          <button type="button" onClick={refresh} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>
        ) : (
          <>
            <p className="text-xs text-slate-400">Last check: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : '—'}</p>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map(({ name, status, icon: Icon }) => (
                <div key={name} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                  <Icon className="text-violet-600 mb-4" size={28} />
                  <p className="font-black text-slate-900">{name}</p>
                  <span className={`inline-block mt-3 text-[10px] font-black uppercase px-3 py-1 rounded-full border ${statusStyle(status)}`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
}
