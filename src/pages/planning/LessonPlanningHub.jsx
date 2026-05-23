import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Calendar, CheckCircle2, ClipboardList, Clock, FileText, GraduationCap,
  Layers, AlertTriangle, XCircle, FileSpreadsheet,
} from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import PlanningContextBar from '../../components/planning/PlanningContextBar';
import BehindSchedulePanel from '../../components/planning/BehindSchedulePanel';
import ContinuousAssessmentGrid from '../../components/planning/ContinuousAssessmentGrid';
import TermReportCardTable from '../../components/planning/TermReportCardTable';
import AnnualPlanWizard from '../../components/planning/AnnualPlanWizard';
import { lessonPlansApi, catalogApi } from '../../api/services';
import { useCatalog } from '../../hooks/useCatalog';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';
import { PLAN_STATUS_COLORS } from '../../components/planning/planningConstants';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'behind', label: 'Behind schedule', icon: AlertTriangle },
  { id: 'annual', label: 'Annual review', icon: Calendar },
  { id: 'daily', label: 'Daily plans', icon: FileText },
  { id: 'ca', label: 'CA & reports', icon: ClipboardList },
];

export default function LessonPlanningHub() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { years, grades, loadCatalog, loadSections } = useCatalog();
  const initialTab = searchParams.get('tab') || 'overview';
  const [tab, setTab] = useState(initialTab);
  const [yearId, setYearId] = useState('');
  const [termId, setTermId] = useState('');
  const [terms, setTerms] = useState([]);
  const [overview, setOverview] = useState(null);
  const [annualPlans, setAnnualPlans] = useState([]);
  const [dailyPlans, setDailyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewPlan, setReviewPlan] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [caSectionId, setCaSectionId] = useState('');
  const [caSubjectId, setCaSubjectId] = useState('');
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [caGradeId, setCaGradeId] = useState('');

  useEffect(() => { loadCatalog(); }, [loadCatalog]);
  useEffect(() => {
    if (years[0]?.id && !yearId) setYearId(years[0].id);
  }, [years, yearId]);

  useEffect(() => {
    if (!yearId) return;
    catalogApi.getTerms(yearId).then((r) => {
      const t = r.data.data || [];
      setTerms(t);
      const cur = t.find((x) => x.is_current) || t[0];
      if (cur && !termId) setTermId(cur.id);
    }).catch(() => {});
  }, [yearId, termId]);

  useEffect(() => {
    catalogApi.getSubjects().then((r) => setSubjects(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!caGradeId) { setSections([]); return undefined; }
    let c = false;
    loadSections(caGradeId).then((rows) => { if (!c) setSections(rows); });
    return () => { c = true; };
  }, [caGradeId, loadSections]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = yearId ? { academic_year_id: yearId } : {};
      const [ov, annual, daily] = await Promise.all([
        lessonPlansApi.overview(params),
        lessonPlansApi.listAnnual(params),
        lessonPlansApi.listDaily(params),
      ]);
      setOverview(ov.data.data);
      setAnnualPlans(annual.data.data || []);
      setDailyPlans(daily.data.data || []);
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to load planning data', 'error');
    } finally {
      setLoading(false);
    }
  }, [yearId, toast]);

  useEffect(() => { load(); }, [load]);

  const doReview = async (id, status) => {
    try {
      await lessonPlansApi.reviewAnnual(id, {
        status,
        director_notes: reviewNotes || (status === 'approved' ? 'Approved' : 'Needs revision'),
      });
      toast(status === 'approved' ? 'Plan approved' : 'Returned to teacher', 'success');
      setReviewPlan(null);
      setReviewNotes('');
      load();
    } catch (e) {
      toast(e.response?.data?.message || 'Review failed', 'error');
    }
  };

  const openReview = async (planRow) => {
    try {
      const full = await lessonPlansApi.getAnnual(planRow.id);
      setReviewPlan(full.data.data);
      setReviewNotes(full.data.data.director_notes || '');
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to load plan', 'error');
    }
  };

  const eth = overview?.ethiopia_calendar;
  const stats = overview?.stats || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="text-emerald-600" /> Lesson planning
            </h1>
            <p className={`${ui.muted} text-sm mt-1 max-w-2xl`}>
              Director oversight: timetable → annual plans → daily delivery → CA 40% + final 60%.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/school-admin/academic-setup">
              <Button variant="secondary"><Calendar size={16} /> Academic setup</Button>
            </Link>
            <Link to="/school-admin/classes">
              <Button variant="secondary"><GraduationCap size={16} /> Timetables</Button>
            </Link>
            <Link to="/school-admin/grading">
              <Button variant="secondary"><FileSpreadsheet size={16} /> Grading</Button>
            </Link>
          </div>
        </header>

        <PlanningContextBar
          years={years}
          terms={terms}
          yearId={yearId}
          termId={termId}
          onYearChange={setYearId}
          onTermChange={setTermId}
        />

        <nav className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setSearchParams(id === 'overview' ? {} : { tab: id });
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-bold ${
                tab === id ? 'bg-emerald-600 text-white' : `${ui.muted} hover:bg-slate-100 dark:hover:bg-slate-800`
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        {loading && tab === 'overview' ? (
          <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        ) : (
          <>
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Annual plans', value: stats.annual_plans ?? 0, icon: Calendar },
                    { label: 'Pending approval', value: stats.annual_pending ?? 0, icon: Clock },
                    { label: 'Daily plans', value: stats.daily_plans ?? 0, icon: FileText },
                    { label: 'Behind schedule', value: stats.behind_schedule ?? 0, icon: AlertTriangle, warn: true },
                  ].map(({ label, value, icon: Icon, warn }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => (label === 'Behind schedule' ? setTab('behind') : undefined)}
                      className={`${ui.card} p-4 text-left ${label === 'Behind schedule' ? 'hover:border-amber-500/50' : ''}`}
                    >
                      <Icon className={warn && value > 0 ? 'text-amber-500' : 'text-emerald-600'} size={22} />
                      <p className={`${ui.mutedXs} mt-2`}>{label}</p>
                      <p className="text-2xl font-black">{value}</p>
                    </button>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className={`${ui.card} p-5 space-y-3`}>
                    <p className={ui.panelTitle}>Ethiopian academic calendar</p>
                    {eth?.semesters?.map((s) => (
                      <div key={s.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-sm">
                        <p className="font-bold">{s.label}</p>
                        <p className={ui.muted}>{s.months} · {s.exams}</p>
                      </div>
                    ))}
                    <p className="text-sm">
                      <strong>{eth?.ca_weight_percent}%</strong> CA + <strong>{eth?.final_exam_weight_percent}%</strong> semester final
                    </p>
                  </div>
                  <div className={`${ui.card} p-5 space-y-3`}>
                    <p className={ui.panelTitle}>MoE period reference</p>
                    {(overview?.period_configs || []).map((c) => (
                      <div key={c.level_key} className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold capitalize">{c.level_key}</span>
                        <span className={ui.muted}>{c.periods_per_week}×{c.period_duration_minutes}min · {c.weeks_per_year} wks</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'behind' && (
              <BehindSchedulePanel academicYearId={yearId} termId={termId} />
            )}

            {tab === 'annual' && (
              <div className={`${ui.card} overflow-hidden`}>
                <table className="w-full text-sm">
                  <thead className={ui.tableHead}>
                    <tr>
                      <th className="px-4 py-3 text-left">Teacher / class</th>
                      <th className="px-4 py-3 text-left">Subject</th>
                      <th className="px-4 py-3">Term</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annualPlans.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={`px-4 py-12 text-center ${ui.muted}`}>
                          No annual plans submitted yet.
                        </td>
                      </tr>
                    ) : annualPlans.map((p) => (
                      <tr key={p.id} className={ui.tableRowHover}>
                        <td className="px-4 py-3">
                          <p className="font-bold">{p.teacher_first_name} {p.teacher_last_name}</p>
                          <p className="text-xs text-slate-500">{p.grade_name} · {p.section_name}</p>
                        </td>
                        <td className="px-4 py-3">{p.subject_name}</td>
                        <td className="px-4 py-3">{p.semester_label || p.term_name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${PLAN_STATUS_COLORS[p.status] || PLAN_STATUS_COLORS.draft}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="secondary" onClick={() => openReview(p)}>View</Button>
                          {p.status === 'submitted' && (
                            <>
                              <Button size="sm" className="ml-1" onClick={() => doReview(p.id, 'approved')}>
                                <CheckCircle2 size={14} />
                              </Button>
                              <Button size="sm" variant="secondary" className="ml-1" onClick={() => doReview(p.id, 'rejected')}>
                                <XCircle size={14} />
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'daily' && (
              <div className={`${ui.card} overflow-hidden`}>
                <table className="w-full text-sm">
                  <thead className={ui.tableHead}>
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Class</th>
                      <th className="px-4 py-3 text-left">Topic</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyPlans.length === 0 ? (
                      <tr><td colSpan={4} className={`px-4 py-12 text-center ${ui.muted}`}>No daily plans.</td></tr>
                    ) : dailyPlans.map((p) => (
                      <tr key={p.id} className={ui.tableRowHover}>
                        <td className="px-4 py-3">{p.plan_date?.slice?.(0, 10)}</td>
                        <td className="px-4 py-3">
                          {p.grade_name} {p.section_name} · {p.subject_name}
                          <span className="block text-xs text-slate-500">{p.teacher_first_name} {p.teacher_last_name}</span>
                        </td>
                        <td className="px-4 py-3">{p.topic}</td>
                        <td className="px-4 py-3 uppercase text-xs font-bold">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'ca' && (
              <div className="space-y-6">
                <div className={`${ui.card} p-4 grid sm:grid-cols-3 gap-3`}>
                  <Select
                    label="Grade"
                    value={caGradeId}
                    onChange={(e) => { setCaGradeId(e.target.value); setCaSectionId(''); }}
                    options={grades.map((g) => ({ value: g.id, label: g.name }))}
                  />
                  <Select
                    label="Section"
                    value={caSectionId}
                    onChange={(e) => setCaSectionId(e.target.value)}
                    options={sections.map((s) => ({ value: s.id, label: s.name }))}
                  />
                  <Select
                    label="Subject"
                    value={caSubjectId}
                    onChange={(e) => setCaSubjectId(e.target.value)}
                    options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </div>
                <ContinuousAssessmentGrid
                  termId={termId}
                  sectionId={caSectionId}
                  subjectId={caSubjectId}
                  readOnly
                />
                <div className={ui.panel}>
                  <p className={ui.panelTitle}>Term report cards (40% + 60%)</p>
                  <TermReportCardTable
                    termId={termId}
                    sectionId={caSectionId}
                    subjectId={caSubjectId}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={!!reviewPlan}
        onClose={() => setReviewPlan(null)}
        title="Annual plan review"
        size="lg"
      >
        {reviewPlan && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <AnnualPlanWizard
              assignment={{
                academic_year_id: reviewPlan.academic_year_id,
                section_id: reviewPlan.section_id,
                subject_id: reviewPlan.subject_id,
                section_name: reviewPlan.section_name,
                subject_name: reviewPlan.subject_name,
                grade_name: '',
              }}
              termId={reviewPlan.term_id}
              teacherId={reviewPlan.teacher_id}
              readOnly
            />
            <label className="block">
              <span className={ui.fieldLabel}>Director notes</span>
              <textarea
                className={`${ui.input} mt-1`}
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </label>
            {reviewPlan.status === 'submitted' && (
              <div className="flex gap-2">
                <Button onClick={() => doReview(reviewPlan.id, 'approved')}>Approve</Button>
                <Button variant="secondary" onClick={() => doReview(reviewPlan.id, 'rejected')}>Reject</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
