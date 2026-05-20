import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import { platformApi } from '../../api/services';
import { Building2, Users, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

export default function PlatformDashboard() {
  const [overview, setOverview] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      platformApi.getOverview(),
      platformApi.listSchools({ limit: 8 }),
    ])
      .then(([ov, sc]) => {
        setOverview(ov.data.data);
        setSchools(sc.data.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load platform data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-violet-600" size={36} /></div>
      </SuperAdminLayout>
    );
  }

  const s = overview?.schools || {};

  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Global control plane across all tenant schools.</p>
        </div>

        {error && (
          <p className="text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm">{error}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total schools', value: s.total ?? 0, icon: Building2, color: 'violet' },
            { label: 'Active', value: s.active ?? 0, icon: Building2, color: 'emerald' },
            { label: 'Suspended', value: s.suspended ?? 0, icon: Building2, color: 'rose' },
            { label: 'Platform users', value: overview?.users?.total ?? 0, icon: Users, color: 'sky' },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
              <p className="text-4xl font-black text-slate-900 mt-2">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="font-black text-slate-900">New schools (30 days)</p>
              <p className="text-3xl font-black text-violet-600">{s.created_last_30_days ?? 0}</p>
            </div>
          </div>
          <Link
            to="/super-admin/schools"
            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-violet-600 hover:text-violet-800"
          >
            Manage schools <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900">Recent schools</h2>
            <Link to="/super-admin/schools" className="text-sm font-bold text-violet-600">View all</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {schools.map((school) => (
              <Link
                key={school.id}
                to={`/super-admin/schools/${school.id}`}
                className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-black text-slate-900">{school.name}</p>
                  <p className="text-sm text-slate-400">{school.school_address || '—'}</p>
                </div>
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                  school.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-rose-50 text-rose-700 border-rose-100'
                }`}>
                  {school.status}
                </span>
              </Link>
            ))}
            {schools.length === 0 && (
              <p className="p-12 text-center text-slate-400">No tenant schools yet.</p>
            )}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
