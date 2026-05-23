import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, School, Trophy, ArrowRight, Activity } from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import PageCard from '../components/ui/PageCard';
import { useI18n } from '../context/I18nContext';
import { ui } from '../theme/tokens';
import { dashboardApi } from '../api/services';
import LessonPlanningDashboardWidget from '../components/planning/LessonPlanningDashboardWidget';

export default function SchoolAdminDashboard() {
  const navigate = useNavigate();
  const { t } = useI18n();
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
      .catch((err) => setError(err.response?.data?.message || t('common.failedLoad')))
      .finally(() => setLoading(false));
  }, [t]);

  const statCards = [
    { label: t('dashboard.totalStudents'), key: 'student_count', icon: <Users size={22} className="text-emerald-600" /> },
    { label: t('dashboard.faculty'), key: 'teacher_count', icon: <GraduationCap size={22} className="text-amber-600" /> },
    { label: t('dashboard.activeClasses'), key: 'class_count', icon: <School size={22} className="text-blue-600" /> },
    { label: t('dashboard.exams'), key: 'exam_count', icon: <Trophy size={22} className="text-purple-600" /> },
  ];

  const quickActions = [
    { label: t('nav.students'), sub: t('dashboard.studentsAction'), path: '/school-admin/students' },
    { label: t('nav.teachers'), sub: t('dashboard.teachersAction'), path: '/school-admin/teachers' },
    { label: t('nav.classes'), sub: t('dashboard.classesAction'), path: '/school-admin/classes' },
    { label: t('nav.grading'), sub: t('dashboard.examsAction'), path: '/school-admin/grading' },
    { label: t('nav.lessonPlanning'), sub: t('dashboard.lessonPlanningAction'), path: '/school-admin/lesson-planning' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />

        {error && (
          <div className={ui.alertError}>
            <Activity size={16} className="inline mr-2" /> {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((s) => (
            <StatCard key={s.key} label={s.label} value={stats?.[s.key]} icon={s.icon} loading={loading} />
          ))}
        </div>

        <LessonPlanningDashboardWidget role="admin" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className={ui.mutedXs}>{t('common.quickActions')}</h3>
            {quickActions.map((a) => (
              <button
                key={a.path}
                type="button"
                onClick={() => navigate(a.path)}
                className={`w-full group flex items-center justify-between p-4 ${ui.card} ${ui.cardHover}`}
              >
                <div className="text-left">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{a.label}</p>
                  <p className={`text-xs ${ui.muted}`}>{a.sub}</p>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          <PageCard className="lg:col-span-2">
            <h3 className={`${ui.mutedXs} mb-4`}>{t('common.recentActivity')}</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
              </div>
            ) : activity.length === 0 ? (
              <p className={ui.muted}>{t('common.noActivity')}</p>
            ) : (
              <ul className="space-y-3">
                {activity.slice(0, 8).map((item, i) => (
                  <li key={i} className="text-sm border-b border-slate-50 dark:border-slate-800 pb-2 last:border-0">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{item.action || item.type}</span>
                    <span className={`${ui.muted} text-xs block`}>{item.created_at && new Date(item.created_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </PageCard>
        </div>
      </div>
    </AdminLayout>
  );
}
