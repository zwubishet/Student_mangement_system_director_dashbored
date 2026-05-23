import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Calendar, BookOpen } from 'lucide-react';
import { lessonPlansApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

export default function BehindSchedulePanel({ academicYearId, termId }) {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await lessonPlansApi.behindSchedule({
        academic_year_id: academicYearId || undefined,
        term_id: termId || undefined,
      });
      setData(res.data.data);
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to load alerts', 'error');
    } finally {
      setLoading(false);
    }
  }, [academicYearId, termId, toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />;
  }

  const t = data?.totals || {};

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Overdue daily plans', value: t.overdue_daily ?? 0, icon: Calendar },
          { label: 'Syllabus behind', value: t.syllabus_gaps ?? 0, icon: BookOpen },
          { label: 'Overdue weekly plans', value: t.overdue_weekly ?? 0, icon: AlertTriangle },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className={`${ui.stat}`}>
            <Icon className={value > 0 ? 'text-amber-500' : 'text-emerald-600'} size={20} />
            <p className={`${ui.mutedXs} mt-2`}>{label}</p>
            <p className="text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <SectionTable
        title="Overdue daily lesson plans"
        empty="No overdue daily plans."
        rows={data?.overdue_daily}
        columns={[
          (r) => r.plan_date?.slice?.(0, 10),
          (r) => `${r.grade_name} ${r.section_name} — ${r.subject_name}`,
          (r) => r.topic,
          (r) => `${r.teacher_first_name} ${r.teacher_last_name}`,
          (r) => r.status,
        ]}
        headers={['Date', 'Class', 'Topic', 'Teacher', 'Status']}
      />

      <SectionTable
        title="Syllabus coverage gaps (planned vs taught periods)"
        empty="All approved plans are on track."
        rows={data?.syllabus_gaps}
        columns={[
          (r) => `${r.grade_name} ${r.section_name}`,
          (r) => r.subject_name,
          (r) => `${r.taught_periods} / ${r.planned_periods}`,
          (r) => r.periods_behind,
          (r) => `${r.teacher_first_name} ${r.teacher_last_name}`,
        ]}
        headers={['Class', 'Subject', 'Taught / Planned', 'Behind', 'Teacher']}
      />

      <SectionTable
        title="Overdue weekly plans"
        empty="No overdue weekly plans."
        rows={data?.overdue_weekly}
        columns={[
          (r) => r.week_start_date?.slice?.(0, 10),
          (r) => `Unit ${r.unit_number}: ${r.unit_title}`,
          (r) => r.topics_summary,
          (r) => `${r.teacher_first_name} ${r.teacher_last_name}`,
        ]}
        headers={['Week start', 'Unit', 'Topics', 'Teacher']}
      />
    </div>
  );
}

function SectionTable({ title, empty, rows = [], headers, columns }) {
  return (
    <div className={ui.card}>
      <p className={`px-4 py-3 font-black border-b border-slate-100 dark:border-slate-800 ${ui.panelTitle}`}>
        {title}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={ui.tableHead}>
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!rows?.length ? (
              <tr>
                <td colSpan={headers.length} className={`px-4 py-8 text-center ${ui.muted}`}>{empty}</td>
              </tr>
            ) : rows.map((r, i) => (
              <tr key={r.id || i} className={ui.tableRowHover}>
                {columns.map((col, j) => (
                  <td key={j} className="px-4 py-2">{col(r)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
