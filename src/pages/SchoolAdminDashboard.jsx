import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, School, Trophy, ArrowRight, Activity } from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';
import StatCard from '../components/ui/StatCard';
import { dashboardApi } from '../api/services';

export default function SchoolAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([dashboardApi.getStats(), dashboardApi.getActivity()])
      .then(([statsRes, activityRes]) => {
        setStats(statsRes.data.data);
        setActivity(activityRes.data.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Students', key: 'student_count', icon: <Users size={22} className="text-emerald-600" /> },
    { label: 'Faculty Members', key: 'teacher_count', icon: <GraduationCap size={22} className="text-amber-600" /> },
    { label: 'Active Classes', key: 'class_count', icon: <School size={22} className="text-blue-600" /> },
    { label: 'Exams', key: 'exam_count', icon: <Trophy size={22} className="text-purple-600" /> },
  ];

  const quickActions = [
    { label: 'Students', sub: 'Enroll & manage', path: '/school-admin/students' },
    { label: 'Teachers', sub: 'Staff directory', path: '/school-admin/teachers' },
    { label: 'Classes', sub: 'Sections & capacity', path: '/school-admin/classes' },
    { label: 'Exams', sub: 'Results & grading', path: '/school-admin/grading' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">School overview and quick actions</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm flex items-center gap-2">
            <Activity size={16} /> {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((s) => (
            <StatCard key={s.key} label={s.label} value={stats?.[s.key]} icon={s.icon} loading={loading} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Quick Actions</h3>
            {quickActions.map((a) => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className="w-full group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-500 hover:shadow-sm transition-all"
              >
                <div className="text-left">
                  <p className="font-bold text-sm text-slate-800">{a.label}</p>
                  <p className="text-xs text-slate-400">{a.sub}</p>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Recent Activity</h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : activity.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {activity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                    <div>
                      <span className="text-xs font-bold text-slate-700">{item.action}</span>
                      <span className="text-xs text-slate-400 ml-2">{item.entity}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
