import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Save, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';

// 1. QUERY: Get students and their current marks for a specific exam subject
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

// 2. MUTATION: Using your SubmitExamResultsAction [cite: 38]
const SUBMIT_MARKS = gql`
  mutation SubmitMarks($examSubjectId: uuid!, $results: [ExamResultInput!]!) {
    SubmitExamResultsAction(exam_subject_id: $examSubjectId, results: $results) {
      status
    }
  }
`;

const MarkEntryPage = ({ examSubjectId, sectionId }) => {
  const [marks, setMarks] = useState({}); // { studentId: score }
  const [isDirty, setIsDirty] = useState(false);

  const { data, loading } = useQuery(GET_MARK_ENTRY_DATA, {
    variables: { examSubjectId, sectionId },
    onCompleted: (data) => {
      // Pre-fill existing marks
      const initialMarks = {};
      data.student_studentenrollments.forEach(({ student }) => {
        initialMarks[student.id] = student.examresults[0]?.score || '';
      });
      setMarks(initialMarks);
    }
  });

  const [submitMarks, { loading: saving }] = useMutation(SUBMIT_MARKS);

  const handleScoreChange = (studentId, value, maxScore) => {
    const numValue = parseFloat(value);
    // Real-time validation: Don't allow marks > max_score 
    if (numValue > maxScore) return; 
    
    setMarks(prev => ({ ...prev, [studentId]: value }));
    setIsDirty(true);
  };

  const onSave = async () => {
    const results = Object.entries(marks).map(([studentId, score]) => ({
      student_id: studentId,
      score: parseFloat(score) || 0
    }));

    try {
      await submitMarks({ variables: { examSubjectId, results } });
      setIsDirty(false);
      alert("Marks saved successfully!");
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  const info = data.operations_examsubjects_by_pk;

  return (
    <AdminLayout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">{info.subject.name} Marks</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              {info.exam.name} • Max Score: {info.max_score}
            </p>
          </div>
          <button 
            disabled={!isDirty || saving}
            onClick={onSave}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all ${
              isDirty ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            SAVE CHANGES
          </button>
        </div>

        {/* SPREADSHEET UI */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Student</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-center w-40">Score</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.student_studentenrollments.map(({ student }) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{student.first_name} {student.last_name}</p>
                    <p className="text-[10px] font-mono text-slate-400">{student.admission_number}</p>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number"
                      value={marks[student.id] || ''}
                      onChange={(e) => handleScoreChange(student.id, e.target.value, info.max_score)}
                      className="w-full text-center py-2 bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-lg font-black text-slate-700 outline-none transition-all"
                      placeholder="--"
                    />
                  </td>
                  <td className="px-6 py-4">
                    {/* Visual progress bar based on Max Score */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${(marks[student.id] / info.max_score) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MarkEntryPage;