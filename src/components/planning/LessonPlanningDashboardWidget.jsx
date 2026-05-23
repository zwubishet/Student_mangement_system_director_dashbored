import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Calendar, FileText, ClipboardList, AlertTriangle, ArrowRight,
  CheckCircle2, GraduationCap, Layers,
} from 'lucide-react';
import { catalogApi, lessonPlansApi } from '../../api/services';
import { useCatalog } from '../../hooks/useCatalog';
import { useAuth } from '../../context/AuthContext';
import { ui } from '../../theme/tokens';

const ADMIN_STEPS = [
  { n: 1, title: 'Academic setup', desc: 'Year + Semester 1 & 2', path: '/school-admin/academic-setup', icon: Calendar },
  { n: 2, title: 'Class timetables', desc: 'Day × period → subject + teacher', path: '/school-admin/classes', icon: GraduationCap },
  { n: 3, title: 'Review annual plans', desc: 'Approve teacher yearly plans', path: '/school-admin/lesson-planning', tab: 'annual' },
  { n: 4, title: 'Behind schedule', desc: 'Overdue plans & syllabus gaps', path: '/school-admin/lesson-planning', tab: 'behind' },
  { n: 5, title: 'CA & report cards', desc: '40% CA + 60% final preview', path: '/school-admin/lesson-planning', tab: 'ca' },
];

const TEACHER_STEPS = [
  { n: 1, title: 'Annual & units', desc: 'የዓመት plan + chapters', path: '/teachers/lesson-plans', tab: 'annual' },
  { n: 2, title: 'Weekly plans', desc: 'Topics per week', path: '/teachers/lesson-plans', tab: 'weekly' },
  { n: 3, title: 'Daily lesson plan', desc: 'የዕለት plan each period', path: '/teachers/lesson-plans', tab: 'daily' },
  { n: 4, title: 'CA marks', desc: 'Quizzes, tests, assignments', path: '/teachers/lesson-plans', tab: 'ca' },
  { n: 5, title: 'Term report', desc: 'See 40% + 60% grade', path: '/teachers/lesson-plans', tab: 'report' },
];

export default function LessonPlanningDashboardWidget({ role = 'admin' }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const teacherUserId = user?.userId;
  const { loadCatalog } = useCatalog();
  const [stats, setStats] = useState(null);
  const [planningReady, setPlanningReady] = useState(true);
  const [setupMessage, setSetupMessage] = useState('');
  const [teacherExtras, setTeacherExtras] = useState({ annual: 0, daily: 0, draft: 0 });
  const [loading, setLoading] = useState(true);

  const hubPath = role === 'admin' ? '/school-admin/lesson-planning' : '/teachers/lesson-plans';
  const steps = role === 'admin' ? ADMIN_STEPS : TEACHER_STEPS;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await loadCatalog();
      let yearId;
      try {
        const cur = await catalogApi.getCurrentYear();
        yearId = cur.data.data?.id;
      } catch {
        yearId = undefined;
      }
      const params = yearId ? { academic_year_id: yearId } : {};

      const ovRes = await lessonPlansApi.overview(params);
      const overview = ovRes.data.data || {};
      setStats(overview.stats || {});
      setPlanningReady(overview.planning_ready !== false);
      setSetupMessage(overview.message || '');

      if (role === 'teacher' && teacherUserId && overview.planning_ready !== false) {
        const [annualRes, dailyRes] = await Promise.all([
          lessonPlansApi.listAnnual({ ...params, teacher_id: teacherUserId }),
          lessonPlansApi.listDaily({ teacher_id: teacherUserId }),
        ]);
        const annual = annualRes.data.data || [];
        const daily = dailyRes.data.data || [];
        setTeacherExtras({
          annual: annual.length,
          daily: daily.length,
          draft: annual.filter((p) => p.status === 'draft' || p.status === 'rejected').length,
          submitted: annual.filter((p) => p.status === 'submitted').length,
        });
      }
    } catch {
      setStats(null);
      setPlanningReady(false);
      setSetupMessage('Could not load lesson planning overview. Check that the API is running and migrations are applied.');
    } finally {
      setLoading(false);
    }
  }, [loadCatalog, role, teacherUserId]);

  useEffect(() => { load(); }, [load]);

  const goToStep = (step) => {
    const url = step.tab ? `${step.path}?tab=${step.tab}` : step.path;
    navigate(url);
  };

  const miniStats = role === 'admin'
    ? [
        { label: 'Annual plans', value: stats?.annual_plans ?? '—', icon: Calendar },
        { label: 'Pending approval', value: stats?.annual_pending ?? '—', icon: FileText, warn: (stats?.annual_pending ?? 0) > 0 },
        { label: 'Daily plans', value: stats?.daily_plans ?? '—', icon: BookOpen },
        { label: 'Behind schedule', value: stats?.behind_schedule ?? '—', icon: AlertTriangle, warn: (stats?.behind_schedule ?? 0) > 0 },
      ]
    : [
        { label: 'My annual plans', value: teacherExtras.annual, icon: Calendar },
        { label: 'Draft / revise', value: teacherExtras.draft, icon: FileText },
        { label: 'Daily plans', value: teacherExtras.daily, icon: BookOpen },
        { label: 'School behind', value: stats?.behind_schedule ?? '—', icon: AlertTriangle, warn: (stats?.behind_schedule ?? 0) > 0 },
      ];

  return (
    <div className={`${ui.cardLg} overflow-hidden`}>
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between gap-3 items-start">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="text-emerald-600" size={22} />
            Lesson planning (Ethiopia MoE)
          </h3>
          <p className={`text-sm ${ui.muted} mt-1 max-w-xl`}>
            {role === 'admin'
              ? 'Director view: timetable → annual approval → daily oversight → CA 40% + final 60%.'
              : 'Your workflow: annual → weekly → daily → CA → term grade preview.'}
          </p>
        </div>
        <Link
          to={hubPath}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 transition-colors"
        >
          Open hub <ArrowRight size={16} />
        </Link>
      </div>

      {!planningReady && setupMessage && (
        <div className="mx-5 mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-100">
          <p className="font-bold flex items-center gap-2">
            <AlertTriangle size={16} />
            Lesson planning setup required
          </p>
          <p className="mt-1 opacity-90">{setupMessage}</p>
        </div>
      )}

      <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-3 border-b border-slate-100 dark:border-slate-800">
        {miniStats.map(({ label, value, icon: Icon, warn }) => (
          <div key={label} className={`${ui.stat} ${loading ? 'animate-pulse' : ''}`}>
            <Icon size={18} className={warn && Number(value) > 0 ? 'text-amber-500' : 'text-emerald-600'} />
            <p className={`${ui.mutedXs} mt-2`}>{label}</p>
            <p className="text-xl font-black">{loading ? '…' : value}</p>
          </div>
        ))}
      </div>

      <div className="p-5 grid lg:grid-cols-2 gap-6">
        <div>
          <p className={ui.mutedXs}>How it works — step by step</p>
          <ol className="mt-3 space-y-2">
            {steps.map((step) => {
              const Icon = step.icon || CheckCircle2;
              return (
                <li key={step.n}>
                  <button
                    type="button"
                    onClick={() => goToStep(step)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                      {step.n}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Icon size={14} className="text-emerald-600 shrink-0" />
                        {step.title}
                      </p>
                      <p className={`text-xs ${ui.muted}`}>{step.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-emerald-500 shrink-0 mt-1" />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className={`${ui.alertInfo} h-fit`}>
          <p className="font-bold text-sm">Grading split (Ethiopia)</p>
          <div className="mt-3 flex gap-2">
            <div className="flex-1 p-3 rounded-xl bg-white/60 dark:bg-slate-900/40 text-center">
              <p className="text-2xl font-black text-sky-700 dark:text-sky-300">40%</p>
              <p className="text-xs font-bold uppercase tracking-wide opacity-80">Continuous assessment</p>
              <p className="text-xs mt-1 opacity-70">Quizzes, tests, participation</p>
            </div>
            <div className="flex-1 p-3 rounded-xl bg-white/60 dark:bg-slate-900/40 text-center">
              <p className="text-2xl font-black text-sky-700 dark:text-sky-300">60%</p>
              <p className="text-xs font-bold uppercase tracking-wide opacity-80">Semester final</p>
              <p className="text-xs mt-1 opacity-70">Enter marks in Grading module</p>
            </div>
          </div>
          {role === 'teacher' && (
            <p className="text-xs mt-3 flex items-center gap-1">
              <ClipboardList size={12} />
              Record CA in Lesson plans → Term report tab. Finals in Exams & marks.
            </p>
          )}
          {role === 'admin' && (
            <p className="text-xs mt-3">
              Timetable must be set first — everything else links to subjects and teachers from the grid.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
