import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  ArrowLeft, Loader2, Cloud, CloudOff, CheckCircle2,
  AlertCircle, Hash, User, BarChart2, TrendingUp
} from 'lucide-react';
import TeacherLayout from '../components/layouts/TeacherLayout';

const GET_MARK_ENTRY_DATA = gql`
  query GetMarkEntryData($examSubjectId: uuid!, $sectionId: uuid!) {
    operations_examsubjects_by_pk(id: $examSubjectId) {
      id max_score passing_score
      subject { name }
      exam { name status }
    }
    student_studentenrollments(
      where: { section_id: { _eq: $sectionId }, status: { _eq: "ACTIVE" } }
      order_by: { student: { last_name: asc } }
    ) {
      student {
        id first_name last_name admission_number
        examresults(where: { exam_subject_id: { _eq: $examSubjectId } }) {
          score
        }
      }
    }
  }
`;

const SUBMIT_MARKS = gql`
  mutation SubmitMarks($examSubjectId: uuid!, $results: [ExamResultInput!]!) {
    SubmitExamResultsAction(exam_subject_id: $examSubjectId, results: $results) {
      status
    }
  }
`;

// Sync status indicator
const SyncIndicator = ({ status }) => {
  if (status === 'saving') return (
    <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-md">
      <Loader2 size={12} className="animate-spin" /> Saving...
    </span>
  );
  if (status === 'saved') return (
    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-md">
      <Cloud size={12} /> All saved
    </span>
  );
  if (status === 'error') return (
    <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-md">
      <CloudOff size={12} /> Save failed
    </span>
  );
  if (status === 'dirty') return (
    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-md animate-pulse">
      <AlertCircle size={12} /> Unsaved changes
    </span>
  );
  return null;
};

// Mini bar chart for score distribution
const DistributionChart = ({ scores, maxScore }) => {
  if (scores.length === 0) return null;
  const buckets = [0, 0, 0, 0, 0]; // <40, 40-59, 60-74, 75-89, 90+
  scores.forEach(s => {
    const pct = (s / maxScore) * 100;
    if (pct < 40) buckets[0]++;
    else if (pct < 60) buckets[1]++;
    else if (pct < 75) buckets[2]++;
    else if (pct < 90) buckets[3]++;
    else buckets[4]++;
  });
  const max = Math.max(...buckets, 1);
  const labels = ['<40%', '40-59%', '60-74%', '75-89%', '90%+'];
  const colors = ['bg-rose-400', 'bg-amber-400', 'bg-yellow-400', 'bg-amber-400', 'bg-emerald-400'];

  return (
    <div className="flex items-end gap-1.5 h-10">
      {buckets.map((count, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5" title={`${labels[i]}: ${count} students`}>
          <div
            className={`w-5 rounded-sm transition-all ${colors[i]}`}
            style={{ height: `${(count / max) * 36}px`, minHeight: count > 0 ? '4px' : '0' }}
          />
        </div>
      ))}
    </div>
  );
};

export default function MarkEntryPage() {
  const { examSubjectId, sectionId } = useParams();
  const navigate = useNavigate();
  const [marks, setMarks] = useState({});
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | dirty | saving | saved | error
  const inputRefs = useRef({});
  const saveTimerRef = useRef(null);

  const { data, loading, refetch } = useQuery(GET_MARK_ENTRY_DATA, {
    variables: { examSubjectId, sectionId },
    fetchPolicy: 'network-only',
  });

  const [submitMarks] = useMutation(SUBMIT_MARKS);

  // Initialize marks from fetched data
  useEffect(() => {
    if (!data?.student_studentenrollments) return;
    const initial = {};
    data.student_studentenrollments.forEach(({ student }) => {
      const existing = student.examresults[0]?.score;
      initial[student.id] = existing != null ? String(existing) : '';
    });
    setMarks(initial);
    setSyncStatus('idle');
  }, [data]);

  const info = data?.operations_examsubjects_by_pk;
  const students = data?.student_studentenrollments || [];
  const maxScore = info?.max_score ?? 100;
  const passingScore = info?.passing_score;
  const isReadOnly = info?.exam?.status === 'PUBLISHED';

  // Save a single student's mark
  const saveMark = useCallback(async (studentId, value) => {
    if (value === '') return; // don't save empty
    const score = parseFloat(value);
    if (isNaN(score)) return;
    setSyncStatus('saving');
    try {
      await submitMarks({
        variables: {
          examSubjectId,
          results: [{ student_id: studentId, score }]
        }
      });
      setSyncStatus('saved');
      // Reset to idle after 2s
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSyncStatus('idle'), 2000);
    } catch {
      setSyncStatus('error');
    }
  }, [examSubjectId, submitMarks]);

  const handleChange = (studentId, value) => {
    if (value !== '' && (parseFloat(value) > maxScore || parseFloat(value) < 0)) return;
    setMarks(prev => ({ ...prev, [studentId]: value }));
    setSyncStatus('dirty');
  };

  const handleBlur = (studentId, value) => {
    saveMark(studentId, value);
  };

  // Keyboard navigation: ArrowUp/ArrowDown between rows
  const handleKeyDown = (e, studentId, index) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      const nextId = students[index + 1]?.student?.id;
      if (nextId) inputRefs.current[nextId]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevId = students[index - 1]?.student?.id;
      if (prevId) inputRefs.current[prevId]?.focus();
    }
  };

  // Analytics
  const analytics = useMemo(() => {
    const scores = Object.values(marks)
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));
    if (scores.length === 0) return null;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passing = passingScore != null
      ? scores.filter(s => s >= passingScore).length
      : null;
    return { avg, highest, lowest, count: scores.length, passing, scores };
  }, [marks, passingScore]);

  if (loading) return (
    <TeacherLayout>
      <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <Loader2 className="animate-spin text-slate-300" size={32} />
      </div>
    </TeacherLayout>
  );

  return (
    <TeacherLayout>
      <div className="bg-white dark:bg-slate-950 min-h-screen">
        {/* STICKY HEADER */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-black text-slate-900 dark:text-slate-100 truncate">
                {info?.subject?.name}
                <span className="text-slate-300 font-normal mx-2">/</span>
                <span className="text-slate-500 font-medium">{info?.exam?.name}</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Max: {maxScore}{passingScore != null ? ` · Pass: ${passingScore}` : ''}
                {isReadOnly && ' · READ ONLY (Published)'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SyncIndicator status={syncStatus} />
              {isReadOnly && (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-md uppercase tracking-wider">
                  Published
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ANALYTICS BAR */}
        {analytics && (
          <div className="border-b border-slate-100 dark:border-slate-800 dark:border-slate-800 bg-slate-50/50">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Avg</span>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">{analytics.avg.toFixed(1)}</span>
                <span className="text-xs text-slate-400">/ {maxScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High</span>
                <span className="text-sm font-black text-emerald-600">{analytics.highest}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low</span>
                <span className="text-sm font-black text-rose-500">{analytics.lowest}</span>
              </div>
              {analytics.passing != null && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passing</span>
                  <span className="text-sm font-black text-amber-600">
                    {analytics.passing}/{analytics.count}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distribution</span>
                <DistributionChart scores={analytics.scores} maxScore={maxScore} />
              </div>
            </div>
          </div>
        )}

        {/* MARK ENTRY TABLE */}
        <div className="max-w-6xl mx-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-12 text-center">
                  <Hash size={13} className="mx-auto" />
                </th>
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-2"><User size={13} /> Student</div>
                </th>
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">ID</th>
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center w-52">Score</th>
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-2"><BarChart2 size={13} /> Performance</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:divide-slate-800">
              {students.map(({ student }, index) => {
                const raw = marks[student.id];
                const score = raw !== '' && raw !== undefined ? parseFloat(raw) : null;
                const pct = score != null ? (score / maxScore) * 100 : 0;
                const hasMark = score != null && !isNaN(score);
                const isPassing = passingScore != null && hasMark && score >= passingScore;
                const isFailing = passingScore != null && hasMark && score < passingScore;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Row number */}
                    <td className="px-6 py-3.5 text-xs font-bold text-slate-300 group-hover:text-slate-400 text-center">
                      {String(index + 1).padStart(2, '0')}
                    </td>

                    {/* Student name */}
                    <td className="px-6 py-3.5">
                      <p className="font-bold text-slate-900 text-sm">
                        {student.last_name}, {student.first_name}
                      </p>
                    </td>

                    {/* Admission number */}
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-mono font-bold rounded border border-slate-200">
                        {student.admission_number}
                      </span>
                    </td>

                    {/* Score input */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          ref={el => { inputRefs.current[student.id] = el; }}
                          type="number"
                          step="0.5"
                          min="0"
                          max={maxScore}
                          value={raw ?? ''}
                          disabled={isReadOnly}
                          onChange={e => handleChange(student.id, e.target.value)}
                          onBlur={e => handleBlur(student.id, e.target.value)}
                          onKeyDown={e => handleKeyDown(e, student.id, index)}
                          className={`w-20 text-center py-2 rounded-md font-bold text-sm outline-none transition-all border-2 ${
                            isReadOnly
                              ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                              : hasMark
                                ? isFailing
                                  ? 'bg-white dark:bg-slate-900 border-rose-200 text-rose-700 focus:border-rose-400'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-900 focus:border-emerald-500 shadow-sm'
                                : 'bg-slate-50 border-slate-100 text-slate-400 focus:border-emerald-500 focus:bg-white dark:bg-slate-900'
                          }`}
                          placeholder="—"
                        />
                        <span className="text-[11px] font-bold text-slate-300">/ {maxScore}</span>
                      </div>
                    </td>

                    {/* Performance bar */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct >= 75 ? 'bg-emerald-500' :
                              pct >= 50 ? 'bg-amber-500' :
                              pct >= 40 ? 'bg-amber-400' :
                              hasMark ? 'bg-rose-400' : ''
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-bold w-8 ${
                          hasMark
                            ? isFailing ? 'text-rose-500' : 'text-slate-700'
                            : 'text-slate-300'
                        }`}>
                          {hasMark ? `${Math.round(pct)}%` : '—'}
                        </span>
                        {hasMark && passingScore != null && (
                          <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isPassing ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                          }`}>
                            {isPassing ? 'Pass' : 'Fail'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {students.length === 0 && (
            <div className="py-20 text-center">
              <User className="mx-auto text-slate-200 mb-4" size={40} />
              <p className="text-slate-400 font-medium">No active students enrolled in this section.</p>
            </div>
          )}

          {/* KEYBOARD HINT */}
          {students.length > 0 && !isReadOnly && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 dark:border-slate-800 flex items-center gap-4 text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono">↑↓</kbd>
                Navigate rows
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono">Enter</kbd>
                Next student
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono">Tab</kbd>
                Move focus
              </span>
              <span className="ml-auto">Auto-saves on blur</span>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
