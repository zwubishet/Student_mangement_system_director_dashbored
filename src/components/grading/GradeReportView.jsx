import { useMemo, useState } from 'react';
import { Award, BarChart3, BookOpen, Download, TrendingUp } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { ui } from '../../theme/tokens';

function ScoreBar({ percent, passed }) {
  if (percent == null) return null;
  const tone = passed === false ? 'bg-rose-500' : passed === true ? 'bg-emerald-500' : 'bg-sky-500';
  return (
    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone = 'sky' }) {
  const bg = {
    sky: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600',
    violet: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600',
  }[tone];
  return (
    <div className={`${ui.card} p-4`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${bg}`}>
        <Icon size={18} />
      </div>
      <p className={ui.mutedXs}>{label}</p>
      <p className="text-xl font-black text-slate-900 dark:text-slate-100">{value}</p>
      {sub && <p className={`text-xs ${ui.muted} mt-0.5`}>{sub}</p>}
    </div>
  );
}

/** Shared grade report UI for student and parent portals. */
export default function GradeReportView({ data, loading, showStudentName, onDownloadPdf, downloadingPdf }) {
  const [view, setView] = useState('by_exam');
  const [termId, setTermId] = useState('');

  const filtered = useMemo(() => {
    if (!data) return null;
    if (!termId) return data;
    const marks = (data.exam_marks || []).filter((m) => m.term_id === termId);
    const computed = (data.computed_results || []).filter((r) => r.term_id === termId);
    const byExam = (data.by_exam || []).filter((e) => e.term_id === termId);
    const bySubject = {};
    for (const m of marks) {
      const key = m.subject_id || m.subject_name;
      if (!bySubject[key]) {
        bySubject[key] = { subject_id: m.subject_id, subject_name: m.subject_name, marks: [], avg_percent: null };
      }
      bySubject[key].marks.push(m);
    }
    for (const sub of Object.values(bySubject)) {
      const pcts = sub.marks.filter((m) => m.percent != null).map((m) => m.percent);
      sub.avg_percent = pcts.length
        ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length * 10) / 10
        : null;
    }
    return {
      ...data,
      exam_marks: marks,
      computed_results: computed,
      by_exam: byExam,
      by_subject: Object.values(bySubject),
    };
  }, [data, termId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const d = filtered;
  const summary = d?.summary || {};
  const terms = d?.terms || [];

  if (!d?.exam_marks?.length && !d?.computed_results?.length) {
    return (
      <div className={`${ui.card} p-10 text-center`}>
        <Award className="mx-auto text-slate-300 mb-3" size={40} />
        <p className="font-bold text-slate-700 dark:text-slate-200">No published results yet</p>
        <p className={`text-sm ${ui.muted} mt-2 max-w-md mx-auto`}>
          Grades appear here after teachers submit marks, admin verifies and locks them, and the exam is published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showStudentName && (
        <p className={`text-sm ${ui.muted}`}>
          Report for{' '}
          <span className="font-bold text-slate-800 dark:text-slate-200">{showStudentName}</span>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Published marks" value={summary.total_marks ?? 0} tone="sky" />
        <StatCard
          icon={TrendingUp}
          label="Average"
          value={summary.average_percent != null ? `${summary.average_percent}%` : '—'}
          sub={`${summary.passed_count ?? 0} passed · ${summary.failed_count ?? 0} below pass`}
          tone="emerald"
        />
        <StatCard icon={BarChart3} label="Subjects" value={d.by_subject?.length ?? 0} tone="violet" />
        <StatCard
          icon={Award}
          label="Term results"
          value={d.term_results?.length ?? d.computed_results?.length ?? 0}
          tone="sky"
        />
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        {onDownloadPdf && (
          <Button variant="secondary" size="sm" onClick={() => onDownloadPdf(termId || undefined)} loading={downloadingPdf}>
            <Download size={16} /> Download PDF
          </Button>
        )}
        {terms.length > 1 && (
          <div className="min-w-[180px]">
            <Select
              label="Term"
              value={termId}
              onChange={(e) => setTermId(e.target.value)}
              options={[
                { value: '', label: 'All terms' },
                ...terms.map((t) => ({
                  value: t.id,
                  label: `${t.name}${t.academic_year ? ` (${t.academic_year})` : ''}`,
                })),
              ]}
            />
          </div>
        )}
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 ml-auto">
          {[
            { id: 'by_exam', label: 'By exam' },
            { id: 'by_subject', label: 'By subject' },
            { id: 'term_report', label: 'Term report' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                view === tab.id
                  ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'by_exam' && (
        <div className="space-y-4">
          {(d.by_exam || []).map((exam) => (
            <div key={exam.exam_id} className={`${ui.card} overflow-hidden`}>
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-black text-slate-900 dark:text-slate-100">{exam.exam_name}</p>
                  <p className={`text-xs ${ui.muted}`}>
                    {exam.term_name} · {exam.exam_type}
                    {exam.exam_date && ` · ${new Date(exam.exam_date).toLocaleDateString()}`}
                  </p>
                </div>
                <Badge color="green">Published</Badge>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {exam.subjects.map((m) => (
                  <div key={m.id} className="px-4 py-3 flex flex-wrap justify-between gap-3">
                    <div className="flex-1 min-w-[140px]">
                      <p className="font-bold text-sm">{m.subject_name}</p>
                      {m.is_absent ? (
                        <Badge color="amber">Absent</Badge>
                      ) : (
                        <>
                          <p className="text-lg font-black mt-0.5">
                            {m.score}/{m.max_score}
                            {m.percent != null && (
                              <span className={`text-sm ${ui.muted} ml-2`}>({m.percent}%)</span>
                            )}
                          </p>
                          <ScoreBar percent={m.percent} passed={m.passed} />
                        </>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {m.letter_grade && <Badge color="green">{m.letter_grade}</Badge>}
                      {m.passed === false && !m.is_absent && <Badge color="red">Below pass</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'by_subject' && (
        <div className="grid gap-4 md:grid-cols-2">
          {(d.by_subject || []).map((sub) => (
            <div key={sub.subject_id || sub.subject_name} className={`${ui.card} p-4`}>
              <div className="flex justify-between items-start mb-3">
                <p className="font-black">{sub.subject_name}</p>
                {sub.avg_percent != null && (
                  <span className="text-sm font-bold text-emerald-600">{sub.avg_percent}% avg</span>
                )}
              </div>
              <div className="space-y-2">
                {sub.marks.map((m) => (
                  <div
                    key={m.id}
                    className="flex justify-between text-sm border-b border-slate-50 dark:border-slate-800 pb-2 last:border-0"
                  >
                    <span className={ui.muted}>{m.exam_name}</span>
                    <span className="font-bold">
                      {m.is_absent ? 'Absent' : `${m.score}/${m.max_score}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'term_report' && (
        <div className={`${ui.card} overflow-hidden`}>
          {(d.term_results?.length || d.computed_results?.length) ? (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3 text-left">Subject</th>
                  <th className="p-3 text-center">Grade</th>
                  <th className="p-3 text-center">%</th>
                  <th className="p-3 text-center">GPA</th>
                  <th className="p-3 text-center">Rank</th>
                </tr>
              </thead>
              <tbody>
                {(d.term_results?.length ? d.term_results : d.computed_results).map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-3">
                      <p className="font-bold">{r.subject_name || 'Overall'}</p>
                      <p className={`text-xs ${ui.muted}`}>{r.exam_name || r.term_name || ''}</p>
                    </td>
                    <td className="p-3 text-center">
                      <Badge color="blue">{r.grade_letter || '—'}</Badge>
                    </td>
                    <td className="p-3 text-center font-bold">
                      {r.percentage != null ? `${Number(r.percentage).toFixed(1)}%` : '—'}
                    </td>
                    <td className="p-3 text-center">{r.gpa_points ?? '—'}</td>
                    <td className="p-3 text-center">{r.rank_in_class ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={`p-6 text-sm ${ui.muted}`}>
              Term report will appear after admin locks marks and runs computation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
