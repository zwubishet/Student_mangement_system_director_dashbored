import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
// ... other imports

const MarkEntry = ({ examSubjectId, students }) => {
  const [scores, setScores] = useState({}); // { student_id: score }

  const [submitMarks, { loading }] = useMutation(SUBMIT_RESULTS_MUTATION);

  const handleSave = () => {
    const formattedResults = Object.entries(scores).map(([id, val]) => ({
      student_id: id,
      score: parseFloat(val)
    }));

    submitMarks({
      variables: {
        exam_subject_id: examSubjectId,
        results: formattedResults
      }
    });
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-900 text-white">
          <tr>
            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Student Name</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Adm No</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest w-40">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {students.map(student => (
            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-8 py-4 font-bold text-slate-800">{student.first_name} {student.last_name}</td>
              <td className="px-8 py-4 font-mono text-xs text-slate-400">{student.admission_number}</td>
              <td className="px-8 py-4">
                <input 
                  type="number"
                  className="w-full bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2 font-black outline-none transition-all"
                  placeholder="0.0"
                  onChange={(e) => setScores({...scores, [student.id]: e.target.value})}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
        <button 
          onClick={handleSave}
          className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
        >
          {loading ? 'Saving Marks...' : 'Save & Publish Marks'}
        </button>
      </div>
    </div>
  );
};


export default MarkEntry;