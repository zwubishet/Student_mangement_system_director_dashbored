import { useCallback, useEffect, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { lessonPlansApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

export default function TermReportCardTable({ termId, sectionId, subjectId }) {
  const { toast } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!termId || !sectionId || !subjectId) return;
    setLoading(true);
    try {
      const res = await lessonPlansApi.termReport({
        term_id: termId,
        section_id: sectionId,
        subject_id: subjectId,
      });
      setReport(res.data.data);
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to load report cards', 'error');
    } finally {
      setLoading(false);
    }
  }, [termId, sectionId, subjectId, toast]);

  useEffect(() => { load(); }, [load]);

  if (!termId || !sectionId || !subjectId) {
    return (
      <p className={ui.muted}>
        Select term, section, and subject to preview Ethiopia term grades (40% CA + 60% final exam).
      </p>
    );
  }

  if (loading) {
    return <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />;
  }

  const w = report?.weights || { ca: 40, final_exam: 60 };
  const students = report?.students || [];

  return (
    <div className="space-y-4">
      <div className={`${ui.alertInfo} flex flex-wrap gap-4 justify-between`}>
        <div>
          <p className="font-bold text-sm flex items-center gap-2">
            <FileSpreadsheet size={16} /> Term report preview
          </p>
          <p className="text-xs mt-1">
            Formula: CA ({w.ca}%) + Final exam ({w.final_exam}%)
            {report?.final_exam_name ? ` · Final: ${report.final_exam_name}` : ''}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className={ui.mutedXs}>Class average</p>
          <p className="text-xl font-black">{report?.summary?.class_average ?? '—'}%</p>
        </div>
      </div>

      <div className={`${ui.card} overflow-x-auto`}>
        <table className="w-full text-sm min-w-[720px]">
          <thead className={ui.tableHead}>
            <tr>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-right">CA %</th>
              <th className="px-4 py-3 text-right">Final %</th>
              <th className="px-4 py-3 text-right">Term %</th>
              <th className="px-4 py-3 text-center">Grade</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className={ui.tableRow}>
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className={`px-4 py-8 text-center ${ui.muted}`}>No students found.</td>
              </tr>
            ) : students.map((s) => (
              <tr key={s.student_id} className={ui.tableRowHover}>
                <td className="px-4 py-3 font-medium">
                  {s.first_name} {s.last_name}
                  <span className="block text-xs text-slate-500">{s.admission_number}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono">{s.ca_percent ?? '—'}</td>
                <td className="px-4 py-3 text-right font-mono">{s.final_percent ?? '—'}</td>
                <td className="px-4 py-3 text-right font-mono font-bold">{s.term_percent ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex min-w-[2rem] justify-center font-black text-lg">
                    {s.letter_grade}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{s.grade_label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={`text-xs ${ui.muted}`}>
        A: 90–100 · B: 80–89 · C: 70–79 · D: 60–69 · F: below 60. Record CA in this module; enter final exam marks in Grading.
      </p>
    </div>
  );
}
