import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import PlatformPageHeader from '../../components/super-admin/PlatformPageHeader';
import PlatformStatusBadge from '../../components/super-admin/PlatformStatusBadge';
import { platformApi } from '../../api/services';
import {
  Building2, Users, GraduationCap, UserCircle, Activity, ArrowRight,
  Loader2, AlertTriangle, Plus, Wallet,
} from 'lucide-react';

const QUICK = [
  { to: '/super-admin/schools', label: 'Schools', desc: 'Provision & manage tenants', icon: Building2, color: 'violet' },
  { to: '/super-admin/users', label: 'Users', desc: 'All accounts & roles', icon: Users, color: 'sky' },
  { to: '/super-admin/students', label: 'Students', desc: 'Every learner', icon: GraduationCap, color: 'emerald' },
  { to: '/super-admin/teachers', label: 'Teachers', desc: 'Staff across schools', icon: UserCircle, color: 'amber' },
  { to: '/super-admin/activity', label: 'Activity', desc: 'Live system events', icon: Activity, color: 'rose' },
  { to: '/super-admin/finance', label: 'Finance', desc: 'Transactions & billing', icon: Wallet, color: 'violet' },
];

const colorMap = {
  violet: 'bg-violet-50 text-violet-600',
  sky: 'bg-sky-50 text-sky-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
};

export default function PlatformDashboard() {
  const [overview, setOverview] = useState(null);
  const [schools, setSchools] = useState([]);
  const [activity, setActivity] = useState([]);
  const [settings, setSettings] = useState(null);
  const [platformFinance, setPlatformFinance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      platformApi.getOverview(),
      platformApi.listSchools({ limit: 6 }),
      platformApi.getActivity({ limit: 12 }),
      platformApi.getSettings().catch(() => ({ data: { data: [] } })),
      platformApi.getFinanceOverview().catch(() => ({ data: { data: null } })),
    ])
      .then(([ov, sc, act, st, pf]) => {
        setOverview(ov.data.data);
        setSchools(Array.isArray(sc.data.data) ? sc.data.data : []);
        setActivity(Array.isArray(act.data.data) ? act.data.data : []);
        setPlatformFinance(pf.data.data);
        const rows = st.data.data;
        const map = {};
        if (Array.isArray(rows)) {
          rows.forEach((r) => { map[r.key] = r.value; });
        }
        setSettings(map);
      })
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
  const maint = settings?.maintenance_mode === true || settings?.maintenance_mode === 'true';

  const stats = [
    { label: 'Schools', value: s.total ?? 0, sub: `${s.active ?? 0} active`, to: '/super-admin/schools' },
    { label: 'Users', value: overview?.users?.total ?? 0, sub: 'All roles', to: '/super-admin/users' },
    { label: 'Students', value: overview?.students?.total ?? 0, sub: 'Enrolled', to: '/super-admin/students' },
    { label: 'Teachers', value: overview?.teachers?.total ?? 0, sub: 'Staff', to: '/super-admin/teachers' },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <PlatformPageHeader
          title="Platform overview"
          subtitle="See and manage everything happening across all schools"
          action={(
            <div className="flex flex-wrap gap-2">
              <Link
                to="/super-admin/schools"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700"
              >
                <Plus size={16} /> New school
              </Link>
            </div>
          )}
        />

        {maint && (
          <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <div>
              <p className="font-bold text-amber-900">Maintenance mode is on</p>
              <p className="text-amber-800/80">School logins are blocked. <Link to="/super-admin/settings" className="underline font-bold">Settings</Link></p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:border-violet-200 hover:shadow-sm transition-all"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 mt-1">{item.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.to}
                to={q.to}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 hover:border-violet-200 transition-all"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${colorMap[q.color]}`}>
                  <Icon size={18} />
                </div>
                <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{q.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{q.desc}</p>
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">Recent schools</h2>
              <Link to="/super-admin/schools" className="text-xs font-bold text-violet-600 flex items-center gap-1">
                All <ArrowRight size={12} />
              </Link>
            </div>
            <ul className="divide-y divide-slate-50 dark:divide-slate-800 dark:divide-slate-800">
              {schools.map((school) => (
                <li key={school.id}>
                  <Link to={`/super-admin/schools/${school.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:bg-slate-800">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{school.name}</p>
                      <p className="text-xs text-slate-400">{school.student_count ?? 0} students · {school.user_count ?? 0} users</p>
                    </div>
                    <PlatformStatusBadge status={school.status} />
                  </Link>
                </li>
              ))}
              {schools.length === 0 && <p className="p-8 text-center text-slate-400 text-sm">No schools yet</p>}
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">Live activity</h2>
              <Link to="/super-admin/activity" className="text-xs font-bold text-violet-600 flex items-center gap-1">
                All <ArrowRight size={12} />
              </Link>
            </div>
            <ul className="divide-y divide-slate-50 dark:divide-slate-800 dark:divide-slate-800 max-h-[320px] overflow-y-auto">
              {activity.map((item) => (
                <li key={`${item.source}-${item.id}`} className="px-4 py-3">
                  <p className="text-sm font-medium text-slate-800">
                    <span className="text-violet-600">{item.action}</span> · {item.entity}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.school_name || 'Platform'} · {new Date(item.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
              {activity.length === 0 && <p className="p-8 text-center text-slate-400 text-sm">No recent events</p>}
            </ul>
          </section>
        </div>

        {platformFinance && (
          <Link
            to="/super-admin/finance"
            className="block bg-violet-50 border border-violet-100 rounded-2xl p-5 grid sm:grid-cols-3 gap-4 hover:border-violet-300 transition-colors"
          >
            <div>
              <p className="text-[10px] font-black uppercase text-violet-500">Platform revenue (Flow 2)</p>
              <p className="text-2xl font-black text-violet-900 mt-1">
                ETB {Number(platformFinance.commissions?.total || 0).toLocaleString()}
              </p>
              <p className="text-xs text-violet-700">Total commissions</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-violet-500">Pending settlement</p>
              <p className="text-2xl font-black text-violet-900 mt-1">
                ETB {Number(platformFinance.commissions?.pending || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-violet-500">School payments (30d)</p>
              <p className="text-2xl font-black text-violet-900 mt-1">
                ETB {Number(platformFinance.payment_volume_30d || 0).toLocaleString()}
              </p>
              <p className="text-xs text-violet-700">Student fee volume via ledger</p>
            </div>
            <p className="sm:col-span-3 text-xs font-bold text-violet-600 flex items-center gap-1">
              Open platform finance <ArrowRight size={12} />
            </p>
          </Link>
        )}

        {(overview?.activity_24h > 0 || s.trials_expiring_7d > 0) && (
          <div className="flex flex-wrap gap-4 text-sm">
            {overview?.activity_24h > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {overview.activity_24h} events in last 24h
              </span>
            )}
            {s.trials_expiring_7d > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                {s.trials_expiring_7d} trials ending within 7 days
              </span>
            )}
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
