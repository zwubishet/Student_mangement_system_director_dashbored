import { useCallback, useEffect, useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { lessonPlansApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';
import { CA_TYPES } from './planningConstants';

export default function ContinuousAssessmentGrid({
  termId,
  sectionId,
  subjectId,
  readOnly = false,
}) {
  const { toast } = useToast();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entryForm, setEntryForm] = useState({
    assessment_type: 'quiz',
    title: '',
    max_score: 100,
    assessed_at: new Date().toISOString().slice(0, 10),
  });
  const [scores, setScores] = useState({});

  const load = useCallback(async () => {
    if (!termId || !sectionId || !subjectId) return;
    setLoading(true);
    try {
      const res = await lessonPlansApi.sectionCaSheet({ term_id: termId, section_id: sectionId, subject_id: subjectId });
      setSheet(res.data.data);
      const init = {};
      for (const s of res.data.data?.students || []) {
        init[s.student_id] = '';
      }
      setScores(init);
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to load CA sheet', 'error');
    } finally {
      setLoading(false);
    }
  }, [termId, sectionId, subjectId, toast]);

  useEffect(() => { load(); }, [load]);

  const bulkSave = async () => {
    const entries = Object.entries(scores)
      .filter(([, v]) => v !== '' && v != null)
      .map(([student_id, score]) => ({ student_id, score: Number(score) }));
    if (!entries.length) {
      toast('Enter at least one score', 'error');
      return;
    }
    setSaving(true);
    try {
      await lessonPlansApi.bulkCa({
        term_id: termId,
        section_id: sectionId,
        subject_id: subjectId,
        assessment_type: entryForm.assessment_type,
        title: entryForm.title || `${entryForm.assessment_type} — ${entryForm.assessed_at}`,
        max_score: Number(entryForm.max_score) || 100,
        assessed_at: entryForm.assessed_at,
        entries,
      });
      toast(`Recorded ${entries.length} scores`, 'success');
      load();
    } catch (e) {
      toast(e.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const removeEntry = async (id) => {
    try {
      await lessonPlansApi.deleteCa(id);
      toast('Entry removed', 'success');
      load();
    } catch (e) {
      toast(e.response?.data?.message || 'Delete failed', 'error');
    }
  };

  if (!termId || !sectionId || !subjectId) {
    return <p className={ui.muted}>Select term, section, and subject to record continuous assessment (40% of term grade).</p>;
  }

  if (loading) {
    return <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />;
  }

  const students = sheet?.students || [];

  return (
    <div className="space-y-6">
      <div className={`${ui.alertInfo}`}>
        <p className="font-bold text-sm">Continuous Assessment (AfL / CCA) — 40% of term grade</p>
        <p className="text-xs mt-1">
          Class CA average: <strong>{sheet?.summary?.class_ca_average ?? '—'}%</strong>
          {' · '}
          {sheet?.summary?.total_entries ?? 0} entries recorded
        </p>
      </div>

      {!readOnly && (
        <div className={`${ui.panel} grid sm:grid-cols-2 lg:grid-cols-4 gap-3`}>
          <Select
            label="Type"
            value={entryForm.assessment_type}
            onChange={(e) => setEntryForm((f) => ({ ...f, assessment_type: e.target.value }))}
            options={CA_TYPES}
          />
          <Input
            label="Assessment title"
            value={entryForm.title}
            onChange={(e) => setEntryForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Quiz 3 — Unit 2"
          />
          <Input
            label="Max score"
            type="number"
            value={entryForm.max_score}
            onChange={(e) => setEntryForm((f) => ({ ...f, max_score: e.target.value }))}
          />
          <Input
            label="Date"
            type="date"
            value={entryForm.assessed_at}
            onChange={(e) => setEntryForm((f) => ({ ...f, assessed_at: e.target.value }))}
          />
        </div>
      )}

      <div className={`${ui.card} overflow-x-auto`}>
        <table className="w-full text-sm min-w-[640px]">
          <thead className={ui.tableHead}>
            <tr>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-right">CA avg %</th>
              {!readOnly && <th className="px-4 py-3 text-right">New score</th>}
              <th className="px-4 py-3 text-left">Recent entries</th>
            </tr>
          </thead>
          <tbody className={ui.tableRow}>
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className={`px-4 py-8 text-center ${ui.muted}`}>No students in this section.</td>
              </tr>
            ) : students.map((s) => (
              <tr key={s.student_id} className={ui.tableRowHover}>
                <td className="px-4 py-3">
                  <p className="font-bold">{s.first_name} {s.last_name}</p>
                  <p className="text-xs text-slate-500">{s.admission_number}</p>
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold">
                  {s.ca_average_percent != null ? `${s.ca_average_percent}%` : '—'}
                </td>
                {!readOnly && (
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      max={entryForm.max_score}
                      className={`${ui.input} w-24 ml-auto`}
                      placeholder="Score"
                      value={scores[s.student_id] ?? ''}
                      onChange={(e) => setScores((sc) => ({ ...sc, [s.student_id]: e.target.value }))}
                    />
                  </td>
                )}
                <td className="px-4 py-3">
                  <ul className="text-xs space-y-1 max-w-xs">
                    {(s.assessments || []).slice(0, 3).map((a) => (
                      <li key={a.id} className="flex justify-between gap-2">
                        <span>{a.title} ({a.score}/{a.max_score})</span>
                        {!readOnly && (
                          <button type="button" className="text-rose-500" onClick={() => removeEntry(a.id)}>
                            <Trash2 size={12} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <Button onClick={bulkSave} loading={saving}>
          <Save size={16} /> Record scores for this assessment
        </Button>
      )}
    </div>
  );
}
