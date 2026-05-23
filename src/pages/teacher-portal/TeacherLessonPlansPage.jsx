import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, FileText, BookOpen, Calendar, ClipboardList, Layers, FileSpreadsheet } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import DailyLessonPlanForm from '../../components/planning/DailyLessonPlanForm';
import AnnualPlanWizard from '../../components/planning/AnnualPlanWizard';
import WeeklyPlansEditor from '../../components/planning/WeeklyPlansEditor';
import ContinuousAssessmentGrid from '../../components/planning/ContinuousAssessmentGrid';
import TermReportCardTable from '../../components/planning/TermReportCardTable';
import PlanningContextBar from '../../components/planning/PlanningContextBar';
import { lessonPlansApi, catalogApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCatalog } from '../../hooks/useCatalog';
import { pickCurrentYear } from '../../utils/academicYear';
import { ui } from '../../theme/tokens';

const TABS = [
  { id: 'annual', label: 'Annual & units', icon: Calendar },
  { id: 'weekly', label: 'Weekly', icon: Layers },
  { id: 'daily', label: 'Daily plans', icon: FileText },
  { id: 'ca', label: 'CA marks', icon: ClipboardList },
  { id: 'report', label: 'Term report', icon: FileSpreadsheet },
];

export default function TeacherLessonPlansPage() {
  const { user } = useAuth();
  const teacherUserId = user?.userId;
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { years, loadCatalog } = useCatalog();
  const tabFromUrl = searchParams.get('tab');
  const validTabs = ['annual', 'weekly', 'daily', 'ca', 'report'];
  const [tab, setTab] = useState(validTabs.includes(tabFromUrl) ? tabFromUrl : 'annual');
  const [yearId, setYearId] = useState('');
  const [termId, setTermId] = useState('');
  const [terms, setTerms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignmentKey, setAssignmentKey] = useState('');
  const [annualPlan, setAnnualPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  const assignment = assignments.find(
    (a) => `${a.section_id}:${a.subject_id}` === assignmentKey
  );

  useEffect(() => {
    if (validTabs.includes(tabFromUrl)) setTab(tabFromUrl);
  }, [tabFromUrl]);

  useEffect(() => { loadCatalog(); }, [loadCatalog]);
  useEffect(() => {
    const current = pickCurrentYear(years);
    if (current?.id && !yearId) setYearId(current.id);
  }, [years, yearId]);

  useEffect(() => {
    if (!yearId) {
      setTerms([]);
      setTermId('');
      return;
    }
    catalogApi.getTerms(yearId).then((r) => {
      const t = r.data.data || [];
      setTerms(t);
      const current = t.find((x) => x.is_current) || t[0];
      setTermId(current?.id || '');
    }).catch(() => {
      setTerms([]);
      setTermId('');
    });
  }, [yearId]);

  const handleYearChange = (id) => {
    setYearId(id);
    setAssignmentKey('');
  };

  const loadAssignments = useCallback(async () => {
    if (!teacherUserId || !yearId) {
      setAssignments([]);
      setAssignmentKey('');
      setAssignmentsLoading(false);
      return;
    }
    setAssignmentsLoading(true);
    try {
      const res = await lessonPlansApi.assignments({
        teacher_id: teacherUserId,
        academic_year_id: yearId,
      });
      const rows = res.data.data || [];
      setAssignments(rows);
      setAssignmentKey((prev) => {
        if (prev && rows.some((r) => `${r.section_id}:${r.subject_id}` === prev)) return prev;
        return rows[0] ? `${rows[0].section_id}:${rows[0].subject_id}` : '';
      });
    } catch (e) {
      setAssignments([]);
      setAssignmentKey('');
      toast(e.response?.data?.message || 'Failed to load assignments', 'error');
    } finally {
      setAssignmentsLoading(false);
    }
  }, [teacherUserId, yearId, toast]);

  useEffect(() => { loadAssignments(); }, [loadAssignments]);

  const loadAnnual = useCallback(async () => {
    if (!assignment || !termId || !teacherUserId) {
      setAnnualPlan(null);
      return;
    }
    try {
      const list = await lessonPlansApi.listAnnual({
        academic_year_id: assignment.academic_year_id,
        teacher_id: teacherUserId,
        section_id: assignment.section_id,
        subject_id: assignment.subject_id,
      });
      const match = (list.data.data || []).find((p) => p.term_id === termId);
      if (match) {
        const full = await lessonPlansApi.getAnnual(match.id);
        setAnnualPlan(full.data.data);
      } else setAnnualPlan(null);
    } catch {
      setAnnualPlan(null);
    }
  }, [assignment, termId, teacherUserId]);

  useEffect(() => { loadAnnual(); }, [loadAnnual]);

  const loadDaily = useCallback(async () => {
    if (!teacherUserId) return;
    try {
      const res = await lessonPlansApi.listDaily({
        teacher_id: teacherUserId,
        section_id: assignment?.section_id,
        subject_id: assignment?.subject_id,
      });
      setPlans(res.data.data || []);
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to load daily plans', 'error');
    }
  }, [teacherUserId, assignment, toast]);

  useEffect(() => {
    if (tab === 'daily') loadDaily();
  }, [tab, loadDaily]);

  const savePlan = async (payload) => {
    setSaving(true);
    try {
      await lessonPlansApi.saveDaily({
        ...payload,
        id: editPlan?.id,
        teacher_id: teacherUserId,
        academic_year_id: assignment?.academic_year_id || yearId,
        term_id: termId,
        section_id: assignment?.section_id,
        subject_id: assignment?.subject_id,
      });
      toast('Lesson plan saved', 'success');
      setShowForm(false);
      setEditPlan(null);
      loadDaily();
    } catch (e) {
      toast(e.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const markTaught = async (id) => {
    setSaving(true);
    try {
      await lessonPlansApi.markTaught(id);
      toast('Marked as taught', 'success');
      loadDaily();
    } catch (e) {
      toast(e.response?.data?.message || 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const assignmentOptions = assignments.map((a) => ({
    value: `${a.section_id}:${a.subject_id}`,
    label: `${a.grade_name} ${a.section_name} — ${a.subject_name}`,
  }));

  return (
    <TeacherLayout>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="text-emerald-600" /> Lesson planning
        </h1>
        <p className={`${ui.muted} text-sm mt-1`}>
          Ethiopia MoE: Annual → Unit → Weekly → Daily · CA 40% + Final 60%
        </p>
      </header>

      <PlanningContextBar
        years={years}
        terms={terms}
        yearId={yearId}
        termId={termId}
        onYearChange={handleYearChange}
        onTermChange={setTermId}
        extra={
          <Select
            label="My class & subject"
            value={assignmentKey}
            onChange={(e) => setAssignmentKey(e.target.value)}
            options={assignmentOptions}
            disabled={assignmentsLoading || assignmentOptions.length === 0}
            placeholder={
              assignmentsLoading
                ? 'Loading…'
                : assignmentOptions.length === 0
                  ? 'No subjects for this year'
                  : undefined
            }
            className="min-w-[280px]"
          />
        }
      />

      {assignmentsLoading ? (
        <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse mt-6" />
      ) : assignments.length === 0 ? (
        <div className={`${ui.card} p-8 mt-6 text-center ${ui.muted}`}>
          <p className="font-bold text-slate-700 dark:text-slate-200">No subjects found for this academic year</p>
          <p className="text-sm mt-2">
            For {years.find((y) => y.id === yearId)?.name || 'this year'}, you need a class instance plus either
            an admin assignment (Class → Assign teacher) or timetable periods with your name.
            Try the current year ({pickCurrentYear(years)?.name || 'marked current'}) if you teach this year only.
          </p>
        </div>
      ) : !assignment ? (
        <div className={`${ui.card} p-8 mt-6 text-center ${ui.muted}`}>
          Select a class and subject above to start lesson planning.
        </div>
      ) : (
        <>
          <nav className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 mt-6">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-bold ${
                  tab === id ? 'bg-emerald-600 text-white' : `${ui.muted} hover:bg-slate-100 dark:hover:bg-slate-800`
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>

          <div className="mt-6">
            {tab === 'annual' && (
              <AnnualPlanWizard
                assignment={assignment}
                termId={termId}
                teacherId={teacherUserId}
                onSaved={(p) => setAnnualPlan(p)}
              />
            )}
            {tab === 'weekly' && (
              <WeeklyPlansEditor annualPlan={annualPlan} />
            )}
            {tab === 'daily' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={() => { setEditPlan(null); setShowForm(true); }}
                    disabled={!assignment || !termId}
                  >
                    <Plus size={16} /> New daily plan
                  </Button>
                </div>
                <ul className="space-y-3">
                  {plans.length === 0 ? (
                    <li className={`${ui.card} p-8 text-center ${ui.muted}`}>No daily plans yet.</li>
                  ) : plans.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={async () => {
                          const full = await lessonPlansApi.getDaily(p.id);
                          setEditPlan(full.data.data);
                          setShowForm(true);
                        }}
                        className={`w-full text-left ${ui.card} p-4 hover:border-emerald-500/40 transition-all`}
                      >
                        <p className="font-bold">{p.topic}</p>
                        <p className={`text-sm ${ui.muted}`}>
                          {p.plan_date?.slice?.(0, 10)} · {p.status}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tab === 'ca' && (
              <ContinuousAssessmentGrid
                termId={termId}
                sectionId={assignment?.section_id}
                subjectId={assignment?.subject_id}
              />
            )}
            {tab === 'report' && (
              <TermReportCardTable
                termId={termId}
                sectionId={assignment?.section_id}
                subjectId={assignment?.subject_id}
              />
            )}
          </div>
        </>
      )}

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditPlan(null); }}
        title={editPlan ? 'Edit daily lesson plan' : 'New daily lesson plan'}
        size="xl"
      >
        {assignment ? (
          <DailyLessonPlanForm
            initial={editPlan}
            meta={{
              academic_year_id: assignment.academic_year_id,
              section_id: assignment.section_id,
              subject_id: assignment.subject_id,
              teacher_id: teacherUserId,
              term_id: termId,
            }}
            onSave={savePlan}
            onMarkTaught={markTaught}
            saving={saving}
          />
        ) : (
          <p className={ui.muted}>Select a class assignment first.</p>
        )}
      </Modal>
    </TeacherLayout>
  );
}
