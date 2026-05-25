import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, Banknote, Bell, BookOpen, Calendar, ClipboardCheck, GraduationCap,
} from 'lucide-react';
import StudentLayout from '../../components/layouts/StudentLayout';
import Badge from '../../components/ui/Badge';
import { studentPortalApi } from '../../api/services';
import { ui } from '../../theme/tokens';

const ETB = new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 });

function QuickCard({ icon: Icon, label, value, sub, onClick, color = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600',
    sky: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600',
    violet: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${ui.card} p-4 text-left w-full hover:border-sky-500/40 transition-all`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tones[color]}`}>
        <Icon size={20} />
      </div>
      <p className={`text-xs font-bold uppercase tracking-wider ${ui.mutedXs}`}>{label}</p>
      <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
      {sub && <p className={`text-xs ${ui.muted} mt-1`}>{sub}</p>}
    </button>
  );
}

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentPortalApi.dashboard()
      .then((r) => setData(r.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const s = data?.student;

  return (
    <StudentLayout>
      <header className="mb-8">
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center shrink-0">
            <GraduationCap className="text-sky-600" size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {loading ? 'Loading…' : `${s?.first_name || ''} ${s?.last_name || ''}`.trim() || 'Student portal'}
            </h1>
            <p className={`${ui.muted} text-sm mt-1`}>
              {s?.admission_number && <span>{s.admission_number} · </span>}
              {s?.grade_name || '—'} · {s?.section_name || '—'}
              {s?.academic_year ? ` · ${s.academic_year}` : ''}
            </p>
            {s?.enrollment_status && (
              <Badge color="green" className="mt-2">{s.enrollment_status}</Badge>
            )}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <QuickCard
              icon={ClipboardCheck}
              label="Attendance (30d)"
              value={data?.attendance_summary?.rate != null ? `${data.attendance_summary.rate}%` : '—'}
              sub={`${data?.attendance_summary?.present ?? 0} present / ${data?.attendance_summary?.total ?? 0} days`}
              onClick={() => navigate('/student/attendance')}
              color="emerald"
            />
            <QuickCard
              icon={Award}
              label="Published grades"
              value={data?.academics_summary?.published_results ?? 0}
              sub={
                data?.academics_summary?.average_percent != null
                  ? `Avg ${data.academics_summary.average_percent}%`
                  : 'View exam results'
              }
              onClick={() => navigate('/student/exams')}
              color="violet"
            />
            <QuickCard
              icon={Banknote}
              label="Fee balance"
              value={ETB.format(Number(data?.fees_summary?.balance || 0))}
              sub={`${data?.fees_summary?.open_invoices ?? 0} open invoice(s)`}
              onClick={() => navigate('/student/fees')}
              color="amber"
            />
            <QuickCard
              icon={Bell}
              label="Announcements"
              value={data?.announcements_count ?? 0}
              sub="Recent school notices"
              onClick={() => navigate('/student/announcements')}
              color="sky"
            />
          </div>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className={`${ui.card} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Calendar className="text-sky-600" size={20} /> Today&apos;s classes
                </h2>
                <button
                  type="button"
                  className="text-xs font-bold text-sky-600 hover:underline"
                  onClick={() => navigate('/student/timetable')}
                >
                  Full timetable
                </button>
              </div>
              {data?.today_timetable?.length ? (
                <ul className="space-y-3">
                  {data.today_timetable.map((p, i) => (
                    <li key={i} className="flex justify-between gap-3 text-sm border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{p.subject_name}</p>
                        <p className={`text-xs ${ui.muted}`}>Period {p.period_number}{p.teacher_name ? ` · ${p.teacher_name}` : ''}</p>
                      </div>
                      {(p.start_time || p.end_time) && (
                        <p className={`text-xs ${ui.muted} shrink-0`}>
                          {p.start_time?.slice?.(0, 5)} – {p.end_time?.slice?.(0, 5)}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm ${ui.muted}`}>No classes scheduled for today.</p>
              )}
            </div>

            <div className={`${ui.card} p-5`}>
              <h2 className="font-black flex items-center gap-2 text-slate-900 dark:text-slate-100 mb-4">
                <BookOpen className="text-sky-600" size={20} /> Quick links
              </h2>
              <ul className="space-y-2">
                {[
                  { label: 'Class resources', path: '/student/resources' },
                  { label: 'Attendance history', path: '/student/attendance' },
                  { label: 'Exam results', path: '/student/exams' },
                  { label: 'Fee invoices', path: '/student/fees' },
                  { label: 'Account & password', path: '/student/account' },
                ].map((link) => (
                  <li key={link.path}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => navigate(link.path)}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </StudentLayout>
  );
}
