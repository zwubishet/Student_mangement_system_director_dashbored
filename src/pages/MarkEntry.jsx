import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const SUBMIT_MARKS = gql`
  mutation SubmitMarks($examSubjectId: uuid!, $results: [ExamResultInput!]!) {
    SubmitExamResultsAction(exam_subject_id: $examSubjectId, results: $results) {
      status
    }
  }
`;

const MarkEntry = ({ examSubjectId, students, maxScore = 100 }) => {
  const [scores, setScores] = useState({}); 
  const [isSuccess, setIsSuccess] = useState(false);

  const [submitMarks, { loading }] = useMutation(SUBMIT_MARKS, {
    onCompleted: () => {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }
  });

  const handleScoreChange = (studentId, value) => {
    // 1. Prevent entering scores higher than maxScore
    if (parseFloat(value) > maxScore) return;
    
    setScores(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSave = () => {
    const formattedResults = Object.entries(scores)
      .filter(([_, val]) => val !== '') // Don't send empty strings
      .map(([id, val]) => ({
        student_id: id,
        score: parseFloat(val)
      }));

    if (formattedResults.length === 0) return;

    submitMarks({
      variables: {
        exam_subject_id: examSubjectId,
        results: formattedResults
      }
    });
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-900 text-white">
          <tr>
            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Student Name</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Adm No</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest w-40 text-center">Score / {maxScore}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {students.map((student, index) => (
            <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
              <td className="px-8 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-white transition-colors">
                        {index + 1}
                    </div>
                    <span className="font-bold text-slate-800">{student.first_name} {student.last_name}</span>
                </div>
              </td>
              <td className="px-8 py-4 font-mono text-xs text-slate-400 font-bold">{student.admission_number}</td>
              <td className="px-8 py-4">
                <div className="relative">
                    <input 
                    type="number"
                    max={maxScore}
                    className={`w-full text-center bg-slate-50 border-2 rounded-xl px-4 py-3 font-black outline-none transition-all ${
                        parseFloat(scores[student.id]) > maxScore 
                        ? 'border-rose-500 text-rose-600' 
                        : 'border-transparent focus:border-indigo-500 focus:bg-white'
                    }`}
                    placeholder="--"
                    value={scores[student.id] || ''}
                    onChange={(e) => handleScoreChange(student.id, e.target.value)}
                    // Professional touch: handle "Enter" to go to next student
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const form = e.target.form;
                            const index = Array.prototype.indexOf.call(form, e.target);
                            form.elements[index + 1]?.focus();
                            e.preventDefault();
                        }
                    }}
                    />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FOOTER ACTIONS */}
      <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400">
            <AlertCircle size={16} />
            <p className="text-[10px] font-bold uppercase tracking-tight">Auto-saving is disabled. Please manual save.</p>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading || Object.keys(scores).length === 0}
          className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${
            isSuccess 
            ? 'bg-emerald-500 text-white shadow-emerald-100' 
            : 'bg-indigo-600 text-white shadow-indigo-100 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale'
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : isSuccess ? (
            <CheckCircle2 size={18} />
          ) : (
            <Save size={18} />
          )}
          {loading ? 'Processing...' : isSuccess ? 'Marks Published' : 'Save & Publish'}
        </button>
      </div>
    </div>
  );
};

export default MarkEntry;