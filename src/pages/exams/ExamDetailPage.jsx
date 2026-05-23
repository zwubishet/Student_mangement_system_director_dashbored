import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Calendar, ClipboardList, BarChart3, Plus, Trash2, Save, Upload,
  ShieldCheck, Lock, Send, XCircle, CheckCircle2,
} from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { examsApi, classesApi, gradingApi } from '../../api/services';
import { useCatalog } from '../../hooks/useCatalog';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'schedules', label: 'Exam schedules', icon: Calendar },
  { id: 'marks', label: 'Mark entry', icon: ClipboardList },
  { id: 'review', label: 'Review & lock', icon: ShieldCheck },
  { id: 'results', label: 'Results', icon: BarChart3 },
];

const errMsg = (e) => e.response?.data?.message || 'Request failed';
const STATUS_COLORS = { DRAFT: 'gray', ACTIVE: 'green', COMPLETED: 'blue', PUBLISHED: 'yellow' };
const MARK_STATUS_COLORS = {
  draft: 'gray', submitted: 'yellow', verified: 'blue', locked: 'green', rejected: 'red',
};

const CSV_TEMPLATE = `admission_number,score,is_absent,notes
STU001,85,false,
STU002,,true,`;

export default function ExamDetailPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || (location.pathname.endsWith('/config') ? 'schedules' : 'overview');
  const isAdmin = useMemo(() => localStorage.getItem('role') === 'SCHOOL_ADMIN', []);

  const { subjects, loadCatalog } = useCatalog();
  const [exam, setExam] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(searchParams.get('scheduleId') || '');
  const [markSheet, setMarkSheet] = useState(null);
  const [markSheetLoading, setMarkSheetLoading] = useState(false);
  const [marks, setMarks] = useState({});
  const [absent, setAbsent] = useState({});
  const [progress, setProgress] = useState(null);
  const [reviewRows, setReviewRows] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [computedResults, setComputedResults] = useState([]);
  const [bulkCsv, setBulkCsv] = useState('');
  const [bulkPreview, setBulkPreview] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, scheduleId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [lockResult, setLockResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [exRes, schRes] = await Promise.all([
        examsApi.getOne(examId),
        examsApi.listSchedules(examId),
      ]);
      setExam(exRes.data.data);
      setSchedules(schRes.data.data || []);
      if (exRes.data.data?.academic_year_id) {
        const cl = await classesApi.list({ academic_year_id: exRes.data.data.academic_year_id, limit: 200 });
        setClasses(cl.data.data || []);
      }
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => { load(); loadCatalog(); }, [load, loadCatalog]);

  useEffect(() => {
    if (tab === 'marks' && schedules.length > 0 && !selectedScheduleId) {
      setSelectedScheduleId(schedules[0].id);
    }
  }, [tab, schedules, selectedScheduleId]);

  useEffect(() => {
    const p = new URLSearchParams(searchParams);
    p.set('tab', tab);
    if (selectedScheduleId) p.set('scheduleId', selectedScheduleId);
    else p.delete('scheduleId');
    setSearchParams(p, { replace: true });
  }, [tab, selectedScheduleId, setSearchParams]);

  const loadMarkSheet = useCallback(async () => {
    if (!selectedScheduleId) {
      setMarkSheet(null);
      return;
    }
    setMarkSheetLoading(true);
    setError('');
    try {
      const [sheetRes, progRes] = await Promise.all([
        examsApi.getMarkSheet(examId, selectedScheduleId),
        gradingApi.markEntryProgress(examId, selectedScheduleId).catch(() => null),
      ]);
      const sheet = sheetRes.data.data;
      setMarkSheet(sheet);
      setProgress(progRes?.data?.data || null);
      const initial = {};
      const abs = {};
      (sheet.students || []).forEach((s) => {
        if (s.score != null) initial[s.id] = String(s.score);
        if (s.is_absent) abs[s.id] = true;
      });
      setMarks(initial);
      setAbsent(abs);
    } catch (e) {
      setMarkSheet(null);
      setError(errMsg(e));
    } finally {
      setMarkSheetLoading(false);
    }
  }, [examId, selectedScheduleId]);

  const loadReview = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const [ov, ready] = await Promise.all([
        gradingApi.markReviewOverview(examId),
        gradingApi.markReviewReadiness(examId),
      ]);
      setReviewRows(ov.data.data || []);
      setReadiness(ready.data.data || null);
    } catch (e) {
      setError(errMsg(e));
    }
  }, [examId, isAdmin]);

  const loadComputedResults = useCallback(async () => {
    try {
      const res = await gradingApi.listComputedResults(examId, { limit: 200 });
      const data = res.data.data;
      setComputedResults(data?.rows || data || []);
    } catch (e) {
      setError(errMsg(e));
    }
  }, [examId]);

  useEffect(() => {
    if (tab === 'marks' && selectedScheduleId) loadMarkSheet();
  }, [tab, selectedScheduleId, loadMarkSheet]);

  useEffect(() => {
    if (tab === 'review') loadReview();
  }, [tab, loadReview]);

  useEffect(() => {
    if (tab === 'results') loadComputedResults();
  }, [tab, loadComputedResults]);

  const flash = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleAddSchedule = async () => {
    setSaving(true);
    setError('');
    try {
      await examsApi.addSchedule(examId, scheduleForm);
      setScheduleModal(false);
      setScheduleForm({});
      flash('Class schedule added successfully.');
      await load();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    setError('');
    try {
      const results = (markSheet?.students || []).map((s) => ({
        student_id: s.id,
        score: absent[s.id] ? null : (marks[s.id] !== undefined && marks[s.id] !== '' ? Number(marks[s.id]) : null),
        is_absent: !!absent[s.id],
      })).filter((r) => r.is_absent || r.score != null);
      await examsApi.submitMarks(examId, selectedScheduleId, { results });
      await loadMarkSheet();
      await load();
      flash('Marks saved as draft.');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitSchedule = async (scheduleId) => {
    setSaving(true);
    setError('');
    try {
      const res = await gradingApi.submitMarksGroup(examId, scheduleId);
      flash(`Submitted ${res.data.data?.submitted_count ?? 0} mark(s).`);
      await loadReview();
      await load();
      if (scheduleId === selectedScheduleId) await loadMarkSheet();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleVerifySchedule = async (scheduleId) => {
    setSaving(true);
    try {
      const res = await gradingApi.verifyMarksGroup(examId, scheduleId);
      flash(`Verified ${res.data.data?.verified_count ?? 0} mark(s).`);
      await loadReview();
      await load();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleRejectSchedule = async () => {
    if (!rejectModal.scheduleId || !rejectReason.trim()) return;
    setSaving(true);
    try {
      await gradingApi.rejectMarksGroup(examId, rejectModal.scheduleId, rejectReason.trim());
      setRejectModal({ open: false, scheduleId: null });
      setRejectReason('');
      flash('Marks rejected — teachers can edit and resubmit.');
      await loadReview();
      await load();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleLockAll = async () => {
    if (!window.confirm('Lock all verified marks and run grade computation? This cannot be undone easily.')) return;
    setSaving(true);
    setError('');
    try {
      const res = await gradingApi.lockExamMarks(examId);
      setLockResult(res.data.data);
      flash(`Locked ${res.data.data?.locked_count ?? 0} marks. Computation: ${res.data.data?.computation?.status || 'queued'}.`);
      await loadReview();
      await load();
      if (tab === 'results') await loadComputedResults();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleBulkPreview = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await gradingApi.bulkPreview(examId, selectedScheduleId, bulkCsv);
      setBulkPreview(res.data.data);
    } catch (e) {
      setError(errMsg(e));
      setBulkPreview(null);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkCommit = async () => {
    setSaving(true);
    setError('');
    try {
      await gradingApi.bulkCommit(examId, selectedScheduleId, bulkCsv);
      setBulkCsv('');
      setBulkPreview(null);
      await loadMarkSheet();
      await load();
      flash('Bulk marks imported.');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (status) => {
    await examsApi.update(examId, { status });
    await load();
  };

  const setTab = (id) => setSearchParams({ tab: id, ...(selectedScheduleId ? { scheduleId: selectedScheduleId } : {}) });

  if (loading && !exam) {
    return <AdminLayout><div className="h-64 bg-slate-100 rounded-3xl animate-pulse" /></AdminLayout>;
  }

  if (!exam) {
    return (
      <AdminLayout>
        <p className="text-rose-600">{error || 'Exam not found'}</p>
        <Button variant="secondary" onClick={() => navigate('/school-admin/grading')}><ArrowLeft size={16} /> Back</Button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <header className="flex flex-wrap items-start gap-4">
          <Button variant="secondary" onClick={() => navigate('/school-admin/grading')}><ArrowLeft size={16} /></Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black">{exam.name}</h1>
              <Badge color={STATUS_COLORS[exam.status] || 'gray'}>{exam.status}</Badge>
              <Badge color="gray">{exam.exam_type || 'midterm'}</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {exam.term_name} · {exam.academic_year} · Weight {exam.weightage ?? 0}%
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {exam.status === 'DRAFT' && <Button size="sm" onClick={() => handleStatus('ACTIVE')}>Activate</Button>}
            {exam.status === 'ACTIVE' && <Button size="sm" variant="secondary" onClick={() => handleStatus('COMPLETED')}>Mark complete</Button>}
            {exam.status === 'COMPLETED' && <Button size="sm" onClick={() => handleStatus('PUBLISHED')}>Publish</Button>}
            <Link to={`/school-admin/exams/${examId}/results`}><Button size="sm" variant="secondary">Full results</Button></Link>
          </div>
        </header>

        {exam.stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
              <p className="text-xs text-slate-400 uppercase font-bold">Schedules</p>
              <p className="text-xl font-black">{schedules.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
              <p className="text-xs text-slate-400 uppercase font-bold">Students graded</p>
              <p className="text-xl font-black">{exam.stats.students_graded ?? 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
              <p className="text-xs text-slate-400 uppercase font-bold">Avg %</p>
              <p className="text-xl font-black">{exam.stats.avg_percentage ?? '—'}</p>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-xl">{error}</p>}
        {success && <p className="text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl">{success}</p>}

        <nav className="flex gap-2 border-b pb-2 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
                tab === t.id ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </nav>

        {tab === 'overview' && (
          <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-4 grid md:grid-cols-2 gap-4">
            <div><p className="text-xs text-slate-400 font-bold">Max score</p><p className="font-black">{exam.max_score}</p></div>
            <div><p className="text-xs text-slate-400 font-bold">Pass score</p><p className="font-black">{exam.pass_score}</p></div>
            <div><p className="text-xs text-slate-400 font-bold">Exam date</p><p className="font-black">{exam.exam_date?.slice?.(0, 10) || '—'}</p></div>
            <div className="md:col-span-2">
              <p className="text-xs text-slate-400 font-bold mb-2">Workflow</p>
              <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                <li>Enter marks (draft) per schedule</li>
                <li>Submit marks for admin review</li>
                <li>Admin verifies each schedule</li>
                <li>Lock all & compute grades</li>
              </ol>
            </div>
            <div className="md:col-span-2"><p className="text-xs text-slate-400 font-bold">Instructions</p><p className="text-sm">{exam.instructions || '—'}</p></div>
          </section>
        )}

        {tab === 'schedules' && (
          <section className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { setScheduleForm({}); setScheduleModal(true); }} disabled={!['DRAFT', 'ACTIVE'].includes(exam.status)}>
                <Plus size={16} /> Add class schedule
              </Button>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                  <tr>
                    <th className="text-left p-3">Class</th>
                    <th className="text-left p-3">Subject</th>
                    <th className="text-left p-3">Max / Pass</th>
                    <th className="text-left p-3">Enrolled</th>
                    <th className="text-left p-3">Marked</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-3 font-bold">{s.class_name}</td>
                      <td className="p-3">{s.subject_name}</td>
                      <td className="p-3">{s.max_score} / {s.pass_score}</td>
                      <td className="p-3">{s.enrolled_count ?? '—'}</td>
                      <td className="p-3">{s.entries_count ?? 0}</td>
                      <td className="p-3 text-right space-x-2">
                        <button type="button" className="text-emerald-600 font-bold text-xs" onClick={() => { setSelectedScheduleId(s.id); setTab('marks'); }}>Enter marks</button>
                        {isAdmin && (
                          <button type="button" className="text-blue-600 font-bold text-xs" onClick={() => { setSelectedScheduleId(s.id); setTab('review'); }}>Review</button>
                        )}
                        {['DRAFT', 'ACTIVE'].includes(exam.status) && (
                          <button type="button" onClick={async () => { await examsApi.deleteSchedule(examId, s.id); load(); }}><Trash2 size={14} className="text-rose-500 inline" /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!schedules.length && <p className="p-6 text-slate-400 text-sm">No schedules. Add class + subject pairs for this exam.</p>}
            </div>
          </section>
        )}

        {tab === 'marks' && (
          <section className="space-y-4">
            {schedules.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center space-y-4">
                <p className="font-black text-amber-900">No schedules yet — students appear after you add one</p>
                <p className="text-sm text-amber-800 max-w-lg mx-auto">
                  Each schedule links a <strong>class</strong> and <strong>subject</strong>. Marks load from students enrolled in that class for the exam&apos;s academic year.
                </p>
                <Button onClick={() => setTab('schedules')}><Plus size={16} /> Add class schedule</Button>
              </div>
            ) : (
            <>
            <Select
              label="Schedule (class + subject)"
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              options={schedules.map((s) => ({
                value: s.id,
                label: `${s.class_name} — ${s.subject_name} (${s.enrolled_count ?? 0} students)`,
              }))}
              placeholder="Select schedule"
            />
            {schedules.find((s) => s.id === selectedScheduleId)?.enrolled_count === 0 && (
              <p className="text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl">
                This class has <strong>0 enrolled students</strong> for {exam.academic_year}. Go to{' '}
                <Link to="/school-admin/students" className="font-bold underline">Students</Link>
                {' '}and enroll learners in a class under that year, or pick another class in{' '}
                <button type="button" className="font-bold underline" onClick={() => setTab('schedules')}>Schedules</button>.
              </p>
            )}
            {markSheetLoading && (
              <p className="text-sm text-slate-400 animate-pulse">Loading students…</p>
            )}
            {progress && (
              <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                <span>Enrolled: {progress.total_enrolled}</span>
                <span>Draft: {progress.drafted}</span>
                <span>Submitted: {progress.submitted}</span>
                <span>Verified: {progress.verified}</span>
                <span>Locked: {progress.locked}</span>
              </div>
            )}
            {markSheet && !markSheetLoading && markSheet.students?.length === 0 && (
              <div className="bg-slate-50 border rounded-3xl p-6 text-sm text-slate-600 dark:text-slate-400">
                <p className="font-bold text-slate-800 mb-2">No students to mark</p>
                <p>{markSheet.enrollment_hint || 'Enroll students in this class for the exam academic year.'}</p>
              </div>
            )}
            {markSheet && markSheet.students?.length > 0 && (
              <>
                <p className="text-sm text-slate-500">
                  Max score: <strong>{markSheet.max_score}</strong>
                  {' · '}{markSheet.students.length} student(s)
                </p>
                {markSheet.enrollment_hint && (
                  <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">{markSheet.enrollment_hint}</p>
                )}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900 text-white text-xs uppercase">
                      <tr>
                        <th className="p-3 text-left">Student</th>
                        <th className="p-3 text-center w-20">Status</th>
                        <th className="p-3 text-center w-24">Absent</th>
                        <th className="p-3 text-center w-32">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {markSheet.students.map((s) => (
                        <tr key={s.id} className="border-t">
                          <td className="p-3">
                            <span className="font-bold">{s.last_name}, {s.first_name}</span>
                            <span className="block text-xs text-slate-400">{s.admission_number}</span>
                          </td>
                          <td className="p-3 text-center">
                            <Badge color={MARK_STATUS_COLORS[s.mark_status] || 'gray'}>{s.mark_status || 'draft'}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={!!absent[s.id]}
                              disabled={s.mark_status === 'locked'}
                              onChange={(e) => setAbsent((a) => ({ ...a, [s.id]: e.target.checked }))}
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              disabled={!!absent[s.id] || s.mark_status === 'locked'}
                              max={markSheet.max_score}
                              className="w-full text-center border rounded-lg py-2"
                              value={marks[s.id] ?? ''}
                              onChange={(e) => setMarks((m) => ({ ...m, [s.id]: e.target.value }))}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleSaveMarks} loading={saving} disabled={markSheet.students.some((s) => s.mark_status === 'locked')}>
                    <Save size={16} /> Save draft
                  </Button>
                  <Button variant="secondary" onClick={() => handleSubmitSchedule(selectedScheduleId)} loading={saving}>
                    <Send size={16} /> Submit for review
                  </Button>
                </div>

                <div className="bg-slate-50 border rounded-3xl p-5 space-y-3">
                  <h3 className="font-black text-sm flex items-center gap-2"><Upload size={16} /> Bulk CSV import</h3>
                  <p className="text-xs text-slate-500">Columns: admission_number (or student_id), score, is_absent, notes</p>
                  <textarea
                    className="w-full font-mono text-xs border rounded-xl p-3 h-32"
                    value={bulkCsv}
                    onChange={(e) => setBulkCsv(e.target.value)}
                    placeholder={CSV_TEMPLATE}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setBulkCsv(CSV_TEMPLATE)}>Load template</Button>
                    <Button size="sm" variant="secondary" onClick={handleBulkPreview} loading={saving}>Preview</Button>
                    <Button size="sm" onClick={handleBulkCommit} loading={saving} disabled={!bulkCsv.trim()}>Import</Button>
                  </div>
                  {bulkPreview && (
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-emerald-700">Valid: {bulkPreview.valid?.length ?? 0} rows</p>
                      {(bulkPreview.errors || []).map((err, i) => (
                        <p key={i} className="text-rose-600">Line {err.line}: {err.message}</p>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            </>
            )}
          </section>
        )}

        {tab === 'review' && (
          <section className="space-y-4">
            {!isAdmin ? (
              <p className="text-sm text-slate-500">Mark review and locking require a school admin account.</p>
            ) : (
              <>
                {readiness && (
                  <div className={`p-4 rounded-2xl border ${readiness.ready_to_lock ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className="text-sm font-bold">
                      {readiness.ready_to_lock
                        ? 'All schedules verified — ready to lock and compute.'
                        : 'Pending: ensure all marks are submitted and verified before locking.'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Draft {readiness.draft_marks} · Submitted {readiness.submitted_marks} · Verified {readiness.verified_marks} · Locked {readiness.locked_marks}
                    </p>
                  </div>
                )}
                {lockResult && (
                  <p className="text-xs text-slate-600 bg-slate-100 p-3 rounded-xl">
                    Last lock: {lockResult.locked_count} marks · run {lockResult.computation_run_id} · {lockResult.computation?.status}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={loadReview}>Refresh</Button>
                  <Button size="sm" onClick={handleLockAll} loading={saving} disabled={!readiness?.ready_to_lock}>
                    <Lock size={16} /> Lock all & compute
                  </Button>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                      <tr>
                        <th className="p-3 text-left">Schedule</th>
                        <th className="p-3 text-center">Draft</th>
                        <th className="p-3 text-center">Submitted</th>
                        <th className="p-3 text-center">Verified</th>
                        <th className="p-3 text-center">Locked</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewRows.map((row) => (
                        <tr key={row.schedule_id} className="border-t">
                          <td className="p-3 font-bold">{row.class_name} — {row.subject_name}</td>
                          <td className="p-3 text-center">{row.drafts ?? 0}</td>
                          <td className="p-3 text-center">{row.submitted ?? 0}</td>
                          <td className="p-3 text-center">{row.verified ?? 0}</td>
                          <td className="p-3 text-center">{row.locked ?? 0}</td>
                          <td className="p-3 text-right space-x-2">
                            {(row.submitted > 0 || row.drafts > 0) && (
                              <button type="button" className="text-xs font-bold text-emerald-600" onClick={() => handleSubmitSchedule(row.schedule_id)}>Submit</button>
                            )}
                            {row.submitted > 0 && (
                              <button type="button" className="text-xs font-bold text-blue-600" onClick={() => handleVerifySchedule(row.schedule_id)}>
                                <CheckCircle2 size={12} className="inline" /> Verify
                              </button>
                            )}
                            {(row.submitted > 0 || row.verified > 0) && (
                              <button
                                type="button"
                                className="text-xs font-bold text-rose-600"
                                onClick={() => setRejectModal({ open: true, scheduleId: row.schedule_id })}
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!reviewRows.length && <p className="p-6 text-slate-400 text-sm">No mark entries yet.</p>}
                </div>
              </>
            )}
          </section>
        )}

        {tab === 'results' && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500">Computed grades after lock (Ethiopian scale).</p>
              <Button size="sm" variant="secondary" onClick={loadComputedResults}>Refresh</Button>
            </div>
            {computedResults.length === 0 ? (
              <p className="text-sm text-slate-400">
                No computed results yet. Lock marks on the Review tab to trigger computation, or run{' '}
                <code className="text-xs">npm run worker:compute</code>.
              </p>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="p-3 text-left">Student</th>
                      <th className="p-3 text-left">Class / Subject</th>
                      <th className="p-3 text-center">Score</th>
                      <th className="p-3 text-center">Grade</th>
                      <th className="p-3 text-center">GPA</th>
                      <th className="p-3 text-center">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computedResults.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="p-3">
                          <span className="font-bold">{r.last_name}, {r.first_name}</span>
                          <span className="block text-xs text-slate-400">{r.admission_number}</span>
                        </td>
                        <td className="p-3">{r.class_name || '—'} / {r.subject_name || '—'}</td>
                        <td className="p-3 text-center">{r.raw_score ?? r.percentage_score ?? '—'}</td>
                        <td className="p-3 text-center"><Badge color="blue">{r.letter_grade || '—'}</Badge></td>
                        <td className="p-3 text-center">{r.grade_points ?? '—'}</td>
                        <td className="p-3 text-center">{r.rank_in_class ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-sm">
              <Link to={`/school-admin/exams/${examId}/results`} className="text-emerald-600 font-bold hover:underline">
                Open legacy full results report →
              </Link>
            </p>
          </section>
        )}
      </div>

      <Modal open={scheduleModal} onClose={() => setScheduleModal(false)} title="Add exam schedule">
        <div className="space-y-4">
          <Select
            label="Class"
            required
            value={scheduleForm.class_id || ''}
            onChange={(e) => setScheduleForm((f) => ({ ...f, class_id: e.target.value }))}
            options={classes.map((c) => ({ value: c.id, label: `${c.name} (${c.section_name})` }))}
          />
          <Select
            label="Subject"
            required
            value={scheduleForm.subject_id || ''}
            onChange={(e) => setScheduleForm((f) => ({ ...f, subject_id: e.target.value }))}
            options={subjects.map((s) => ({ value: s.id, label: s.name }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Max score" type="number" value={scheduleForm.max_score ?? exam.max_score} onChange={(e) => setScheduleForm((f) => ({ ...f, max_score: e.target.value }))} />
            <Input label="Pass score" type="number" value={scheduleForm.pass_score ?? exam.pass_score} onChange={(e) => setScheduleForm((f) => ({ ...f, pass_score: e.target.value }))} />
          </div>
          <Button onClick={handleAddSchedule} loading={saving}>Add schedule</Button>
        </div>
      </Modal>

      <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false, scheduleId: null })} title="Reject marks" size="sm">
        <p className="text-sm text-slate-500 mb-3">Marks return to draft for the teacher to correct.</p>
        <Input label="Reason" required value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
        <div className="flex gap-2 mt-4">
          <Button onClick={handleRejectSchedule} loading={saving}><XCircle size={16} /> Reject</Button>
          <Button variant="secondary" onClick={() => setRejectModal({ open: false, scheduleId: null })}>Cancel</Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
