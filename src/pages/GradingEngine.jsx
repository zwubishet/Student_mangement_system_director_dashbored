import React, { useState } from 'react';
import { gql} from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client/react';
import AdminLayout from '../components/layouts/AdminLayout';
import { 
  Trophy, BookOpen, Calculator, Plus, 
  CheckCircle2, AlertCircle, Loader2, ChevronRight, X, Edit3, MapPin, Layers
} from 'lucide-react';

const GET_EXAMS = gql`
  query GetExams {
    operations_exams(order_by: {created_at: desc}) {
      id
      name
      weightage
      term_id
      examsubjects(limit: 1, order_by: {max_score: desc}) {
        id
        max_score
        subject { name }
      }
    }
    academic_terms(where: {academicyear: {status: {_eq: "active"}}}) {
      id
      name
    }
  }
`;

const PROCESS_GPA = gql`
  mutation ProcessGPA($term_id: uuid!) {
    CalculateTermResults(term_id: $term_id) {
      processed_students
      message
    }
  }
`;

// GPA Visualizer Component (added above)
const GPAMathDiagram = ({ hoveredExam }) => {
  const calculateResult = hoveredExam ? ((hoveredExam.examsubjects[0]?.max_score || 100) / 100 * hoveredExam.weightage) : 0;
  
  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10 space-y-8 animate-in zoom-in-95 duration-500 min-h-[400px]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active GPA Visualizer</h2>
          <p className="text-slate-500 font-medium text-lg mt-1">Real-time calculation logic for your current examination context.</p>
        </div>
        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
           <Calculator size={24}/>
        </div>
      </div>

      {!hoveredExam ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <BookOpen size={40} className="text-slate-300"/>
          <p className="font-black uppercase tracking-widest text-xs text-slate-400 mt-4">Hover over an examination card <br /> to see the mathematical DNA.</p>
        </div>
      ) : (
        <div className="flex items-center gap-6 justify-center bg-slate-50/50 p-10 rounded-3xl border border-slate-100">
          {/* STEP 1: MAX SCORE */}
          <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-w-[150px]">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Target size={20}/></div>
             <p className="text-[10px] font-black uppercase text-slate-400">Max Score</p>
             <p className="text-3xl font-black text-slate-900">{hoveredExam.examsubjects[0]?.max_score || 100}</p>
          </div>

          <div className="text-4xl font-black text-slate-200 group-hover:text-indigo-600 transition-colors">/</div>
          
          <div className="text-4xl font-black text-slate-200">100</div>

          <div className="text-4xl font-black text-slate-200 flex flex-col items-center gap-1 group-hover:text-indigo-600 transition-colors">
            <X size={24}/>
          </div>

          {/* STEP 2: WEIGHTAGE */}
          <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-3xl border border-rose-100 shadow-sm min-w-[150px]">
             <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Percentage size={20}/></div>
             <p className="text-[10px] font-black uppercase text-rose-400">Weightage</p>
             <p className="text-3xl font-black text-rose-900">{hoveredExam.weightage}%</p>
          </div>

          <div className="text-4xl font-black text-slate-200 group-hover:text-indigo-600 transition-colors">
            <Equal size={24}/>
          </div>

          {/* FINAL STEP: GPA CONTRIBUTION */}
          <div className="flex flex-col items-center gap-3 bg-slate-900 text-white p-6 rounded-3xl border border-slate-700 shadow-xl shadow-slate-200 min-w-[180px]">
             <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl"><Trophy size={20}/></div>
             <p className="text-[10px] font-black uppercase text-indigo-300">GPA Contribution</p>
             <p className="text-3xl font-black text-white">{calculateResult.toFixed(2)} Points</p>
          </div>
        </div>
      )}
    </div>
  );
};

const GradingEngine = () => {
  const { data, loading, error, refetch } = useQuery(GET_EXAMS);
  const [activeTerm, setActiveTerm] = useState('');
  const [hoveredExam, setHoveredExam] = useState(null); // New state for diagram

  const [calculateResults, { loading: isCalculating }] = useMutation(PROCESS_GPA, {
    onCompleted: (data) => alert(data.CalculateTermResults.message),
    onError: (err) => alert(err.message)
  });

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto p-6 space-y-10 animate-in fade-in duration-700">
        
        {/* ACTION HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Assessment Center</h1>
            <p className="text-slate-500 font-medium mt-2 text-lg">Manage examination context, GPA weightage, and result processing.</p>
          </div>
          
          <div className="flex items-center bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-sm gap-2">
            <select 
              className="bg-slate-50 border-none rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setActiveTerm(e.target.value)}
            >
              <option value="">Select Term to Finalize</option>
              {data?.academic_terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button 
              disabled={!activeTerm || isCalculating}
              onClick={() => calculateResults({ variables: { term_id: activeTerm } })}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-indigo-600 transition-all disabled:bg-slate-200"
            >
              {isCalculating ? <Loader2 className="animate-spin" size={16} /> : <Trophy size={16} />}
              Compute Rankings
            </button>
          </div>
        </div>

        {/* GPA VISUALIZER DIAGRAM (Integrated above) */}
        <GPAMathDiagram hoveredExam={hoveredExam} />

        {/* EXAM CONFIGURATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data?.operations_exams.map((exam) => (
            <div 
              key={exam.id} 
              onMouseEnter={() => setHoveredExam(exam)} // Trigger Diagram update
              onMouseLeave={() => setHoveredExam(null)}    // Reset Diagram
              className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all"
            >
              {/* ... exam card implementation remains the same ... */}
            </div>
          ))}

          {/* ADD EXAM PLACEHOLDER */}
          <button className="border-4 border-dashed border-slate-100 rounded-[3.5rem] p-12 flex flex-col items-center justify-center gap-4 group hover:border-indigo-200 transition-all">
             {/* ... existing implementation ... */}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default GradingEngine;