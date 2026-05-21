import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { teacherPortalApi } from '../../api/services';

const errMsg = (e) => e.response?.data?.message || 'Request failed';
const STATUS_COLORS = { draft: 'gray', submitted: 'yellow', verified: 'blue', locked: 'green', rejected: 'red' };

export default function TeacherMarkEntryPage() {
  const { examId, scheduleId } = useParams();
  const navigate = useNavigate();
  const [markSheet, setMarkSheet] = useState(null);
  const [marks, setMarks] = useState({});
  const [absent, setAbsent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await teacherPortalApi.getMarkSheet(examId, scheduleId);
      const sheet = res.data.data;
      setMarkSheet(sheet);
      const initial = {};
      const abs = {};
      (sheet.students || []).forEach((s) => {
        if (s.score != null) initial[s.id] = String(s.score);
        if (s.is_absent) abs[s.id] = true;
      });
      setMarks(initial);
      setAbsent(abs);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [examId, scheduleId]);

  useEffect(() => { load(); }, [load]);

  const flash = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const results = (markSheet?.students || []).map((s) => ({
        student_id: s.id,
        score: absent[s.id] ? null : (marks[s.id] !== undefined && marks[s.id] !== '' ? Number(marks[s.id]) : null),
        is_absent: !!absent[s.id],
      })).filter((r) => r.is_absent || r.score != null);
      await teacherPortalApi.saveMarks(examId, scheduleId, { results });
      await load();
      flash('Draft saved.');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await teacherPortalApi.submitMarks(examId, scheduleId);
      flash(`Submitted ${res.data.data?.submitted_count ?? 0} mark(s) for admin review.`);
      await load();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const locked = markSheet?.students?.some((s) => s.mark_status === 'locked');

  if (loading) {
    return <TeacherLayout><div className="h-64 bg-white rounded-3xl border animate-pulse" /></TeacherLayout>;
  }

  const title = markSheet?.schedule
    ? `${markSheet.schedule.class_name || ''} — ${markSheet.schedule.subject_name || 'Marks'}`
    : 'Mark entry';

  return (
    <TeacherLayout title={title} subtitle={`Max score: ${markSheet?.max_score ?? '—'}`}>
      <div className="space-y-4 max-w-5xl">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate('/teachers/exams')}><ArrowLeft size={16} /> Back</Button>
        </div>

        {error && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-xl">{error}</p>}
        {success && <p className="text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl">{success}</p>}

        {markSheet?.enrollment_hint && (
          <p className="text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl">{markSheet.enrollment_hint}</p>
        )}

        {markSheet?.students?.some((s) => s.mark_status === 'rejected') && (
          <div className="text-sm text-rose-800 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl space-y-1">
            <p className="font-bold">Admin rejected some marks — correct and resubmit.</p>
            {markSheet.students.filter((s) => s.mark_status === 'rejected' && s.rejection_reason).map((s) => (
              <p key={s.id} className="text-xs">
                {s.last_name}: {s.rejection_reason}
              </p>
            ))}
          </div>
        )}

        {!markSheet?.students?.length ? (
          <p className="text-slate-500 text-sm">No students enrolled for this class schedule.</p>
        ) : (
          <>
            <div className="bg-white border rounded-3xl overflow-x-auto">
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
                        <Badge color={STATUS_COLORS[s.mark_status] || 'gray'}>{s.mark_status || 'draft'}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!absent[s.id]}
                          disabled={s.mark_status === 'locked' || s.mark_status === 'verified'}
                          onChange={(e) => setAbsent((a) => ({ ...a, [s.id]: e.target.checked }))}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          disabled={!!absent[s.id] || s.mark_status === 'locked' || s.mark_status === 'verified'}
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
              <Button onClick={handleSave} loading={saving} disabled={locked}>
                <Save size={16} /> Save draft
              </Button>
              <Button variant="secondary" onClick={handleSubmit} loading={saving} disabled={locked}>
                <Send size={16} /> Submit for review
              </Button>
            </div>
            <p className="text-xs text-slate-400">
              After submit, the school admin verifies and locks marks. You cannot edit verified or locked rows.
            </p>
          </>
        )}
      </div>
    </TeacherLayout>
  );
}
