import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { 
  Save, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  User,
  Activity
} from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';

const GET_MARK_ENTRY_DATA = gql`
  query GetMarkEntryData($examSubjectId: uuid!, $sectionId: uuid!) {
    operations_examsubjects_by_pk(id: $examSubjectId) {
      id
      max_score
      subject { name }
      exam { name }
    }
    student_studentenrollments(where: {section_id: {_eq: $sectionId}}) {
      student {
        id
        first_name
        last_name
        admission_number
        examresults(where: {exam_subject_id: {_eq: $examSubjectId}}) {
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

const MarkEntryPage = () => {
  const { examSubjectId, sectionId } = useParams();
  const navigate = useNavigate();
  const [marks, setMarks] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const { data, loading, refetch } = useQuery(GET_MARK_ENTRY_DATA, {
    variables: { examSubjectId, sectionId },
    fetchPolicy: 'network-only',
  });

  // Sync state whenever data changes (Crucial for page refreshes)
  useEffect(() => {
    if (data?.student_studentenrollments) {
      const initialMarks = {};
      data.student_studentenrollments.forEach(({ student }) => {
        const existingScore = student.examresults[0]?.score;
        initialMarks[student.id] = (existingScore !== undefined && existingScore !== null) 
          ? existingScore 
          : '';
      });
      setMarks(initialMarks);
      setIsDirty(false);
    }
  }, [data]);

  const [submitMarks, { loading: saving }] = useMutation(SUBMIT_MARKS);

  const handleScoreChange = (studentId, value, maxScore) => {
    if (value !== '' && (parseFloat(value) > maxScore || parseFloat(value) < 0)) return;
    setMarks(prev => ({ ...prev, [studentId]: value }));
    setIsDirty(true);
  };

  const onSave = async () => {
    const results = Object.entries(marks)
      .filter(([_, score]) => score !== '')
      .map(([studentId, score]) => ({
        student_id: studentId,
        score: parseFloat(score)
      }));

    try {
      await submitMarks({ variables: { examSubjectId, results } });
      setIsDirty(false);
      await refetch();
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  if (loading) return <AdminLayout><div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-900" size={32} /></div></AdminLayout>;

  const info = data?.operations_examsubjects_by_pk;
  const students = data?.student_studentenrollments || [];

  return (
    <AdminLayout>
      <div className="bg-white min-h-screen">
        {/* SUB-HEADER / ACTION BAR */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-5">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />
              <div>
                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                   {info?.subject.name} 
                   <span className="text-slate-300 font-normal">/</span>
                   <span className="text-slate-500 font-medium">{info?.exam.name}</span>
                </h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={12} />
                   Max Possible Score: {info?.max_score}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isDirty && (
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md flex items-center gap-1.5 animate-pulse">
                  <AlertCircle size={14} /> Unsaved Changes
                </span>
              )}
              <button 
                disabled={!isDirty || saving}
                onClick={onSave}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm ${
                  isDirty 
                  ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95' 
                  : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : isDirty ? <Save size={16} /> : <CheckCircle2 size={16} />}
                {saving ? 'Saving...' : 'Publish Marks'}
              </button>
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="max-w-[1600px] mx-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="pl-12 pr-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-16 text-center">
                  <Hash size={14} className="mx-auto" />
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  <div className="flex items-center gap-2"><User size={14}/> Student Detail</div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">ID Number</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-center w-64">Assessment Score</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Performance Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(({ student }, index) => {
                const score = marks[student.id];
                const hasMark = score !== '' && score !== undefined;
                const percentage = hasMark ? (parseFloat(score) / info.max_score) * 100 : 0;
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="pl-12 pr-6 py-4 text-xs font-bold text-slate-300 group-hover:text-slate-500 text-center">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {student.first_name} {student.last_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-mono font-bold rounded border border-slate-200">
                        {student.admission_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-3">
                        <input 
                          type="number"
                          step="0.5"
                          value={score}
                          onChange={(e) => handleScoreChange(student.id, e.target.value, info.max_score)}
                          className={`w-24 text-center py-2 rounded-md font-bold text-sm outline-none transition-all border-2 ${
                            hasMark 
                              ? 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600 shadow-sm' 
                              : 'bg-slate-50 border-slate-100 text-slate-400 focus:border-indigo-600 focus:bg-white'
                          }`}
                          placeholder="--"
                        />
                        <span className="text-[11px] font-bold text-slate-300">/ {info.max_score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 max-w-[120px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 rounded-full ${
                              percentage >= 75 ? 'bg-emerald-500' : percentage >= 40 ? 'bg-slate-900' : 'bg-rose-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-bold ${hasMark ? 'text-slate-900' : 'text-slate-300'}`}>
                          {hasMark ? `${Math.round(percentage)}%` : '--'}
                        </span>
                        
                        {hasMark && (
                          <div className={`w-2 h-2 rounded-full ${
                            percentage >= 75 ? 'bg-emerald-500' : percentage >= 40 ? 'bg-slate-300' : 'bg-rose-500'
                          }`} />
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
              <Loader2 className="mx-auto text-slate-200 animate-spin mb-4" size={40} />
              <p className="text-slate-400 font-medium">No students enrolled in this section.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default MarkEntryPage;