import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import AdminLayout from '../components/layouts/AdminLayout';
import { useToast } from '../context/ToastContext';
import { 
  Trophy, BookOpen, Calculator, Plus, Loader2, X, Target, Percent, Equal
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

const CREATE_EXAM = gql`
  mutation CreateExam($name: String!, $term_id: uuid!, $weightage: numeric!) {
    CreateExamAction(object: { name: $name, term_id: $term_id, weightage: $weightage }) {
      id
      name
    }
  }
`;

const GPAVisualizer = ({ exam }) => {
  if (!exam) return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10 min-h-[200px] flex flex-col items-center justify-center text-center">
      <BookOpen size={40} className="text-slate-300 mb-4" />
      <p className="font-black uppercase tracking-widest text-xs text-slate-400">Hover an exam card to see GPA math</p>
    </div>
  );

  const maxScore = exam.examsubjects[0]?.max_score || 100;
  const contribution = ((maxScore / 100) * exam.weightage).toFixed(2);

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900">GPA Visualizer — {exam.name}</h2>
          <p className="text-slate-500 mt-1">Real-time calculation for this exam</p>
        </div>
        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Calculator size={24} /></div>
      </div>
      <div className="flex items-center gap-6 justify-center bg-slate-50 p-8 rounded-3xl flex-wrap">
        <div className="flex flex-col items-center gap-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-w-[130px]">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Target size={20} /></div>
          <p className="text-[10px] font-black uppercase text-slate-400">Max Score</p>
          <p className="text-3xl font-black text-slate-900">{maxScore}</p>
        </div>
        <div className="text-3xl font-black text-slate-300">/</div>
        <div className="text-3xl font-black text-slate-300">100</div>
        <div className="text-3xl font-black text-slate-300"><X size={24} /></div>
        <div className="flex flex-col items-center gap-2 bg-white p-6 rounded-3xl border border-rose-100 shadow-sm min-w-[130px]">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Percent size={20} /></div>
          <p className="text-[10px] font-black uppercase text-rose-400">Weightage</p>
          <p className="text-3xl font-black text-rose-900">{exam.weightage}%</p>
        </div>
        <div className="text-3xl font-black text-slate-300"><Equal size={24} /></div>
        <div className="flex flex-col items-center gap-2 bg-slate-900 text-white p-6 rounded-3xl min-w-[160px]">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl"><Trophy size={20} /></div>
          <p className="text-[10px] font-black uppercase text-indigo-300">GPA Contribution</p>
          <p className="text-3xl font-black">{contribution} pts</p>
        </div>
      </div>
    </div>
  );
};

const GradingEngine = () => {
  const { data, loading, refetch } = useQuery(GET_EXAMS);
  const { toast } = useToast();
  const [activeTerm, setActiveTerm] = useState('');
  const [hoveredExam, setHoveredExam] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newExam, setNewExam] = useState({ name: '', term_id: '', weightage: '' });

  const [calculateResults, { loading: isCalculating }] = useMutation(PROCESS_GPA, {
    onCompleted: (d) => toast(d.CalculateTermResults.message, 'success'),
    onError: (e) => toast(e.message, 'error'),
  });

  const [createExam, { loading: isCreating }] = useMutation(CREATE_EXAM, {
    onCompleted: () => { toast('Exam created!', 'success'); setShowCreateForm(false); refetch(); },
    onError: (e) => toast(e.message, 'error'),
  });

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Assessment Center</h1>
            <p className="text-slate-500 font-medium mt-1">Manage exams, GPA weightage, and result processing.</p>
          </div>
          <div className="flex items-center bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-sm gap-2">
            <select
              className="bg-slate-50 border-none rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest outline-none"
              onChange={(e) => setActiveTerm(e.target.value)}
            >
              <option value="">Select Term to Finalize</option>
              {data?.academic_terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button
              disabled={!activeTerm || isCalculating}
              onClick={() => calculateResults({ variables: { term_id: activeTerm } })}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-indigo-600 transition-all disabled:bg-slate-200"
            >
              {isCalculating ? <Loader2 className="animate-spin" size={16} /> : <Trophy size={16} />}
              Compute Rankings
            </button>
          </div>
        </div>

        <GPAVisualizer exam={hoveredExam} />

        {/* Create Exam Form */}
        {showCreateForm && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 space-y-4">
            <h3 className="text-xl font-black text-slate-900">New Exam</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                placeholder="Exam name (e.g. Midterm)"
                className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                value={newExam.name}
                onChange={e => setNewExam(p => ({ ...p, name: e.target.value }))}
              />
              <select
                className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                value={newExam.term_id}
                onChange={e => setNewExam(p => ({ ...p, term_id: e.target.value }))}
              >
                <option value="">Select Term</option>
                {data?.academic_terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input
                type="number" placeholder="Weightage %" min="1" max="100"
                className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                value={newExam.weightage}
                onChange={e => setNewExam(p => ({ ...p, weightage: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <button
                disabled={isCreating || !newExam.name || !newExam.term_id || !newExam.weightage}
                onClick={() => createExam({ variables: { ...newExam, weightage: parseFloat(newExam.weightage) } })}
                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:bg-slate-200"
              >
                {isCreating ? <Loader2 className="animate-spin" size={16} /> : 'Create Exam'}
              </button>
              <button onClick={() => setShowCreateForm(false)} className="px-6 py-3 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
          ) : (
            <>
              {data?.operations_exams.map((exam) => (
                <div
                  key={exam.id}
                  onMouseEnter={() => setHoveredExam(exam)}
                  onMouseLeave={() => setHoveredExam(null)}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 hover:border-indigo-300 hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{exam.name}</h3>
                      <p className="text-slate-400 text-sm font-medium mt-1">
                        {exam.examsubjects.length} subject(s) configured
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-black">
                      {exam.weightage}% weight
                    </div>
                  </div>
                  {exam.examsubjects[0] && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs font-bold text-slate-500">
                        {exam.examsubjects[0].subject?.name} — Max: {exam.examsubjects[0].max_score}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => setShowCreateForm(true)}
                className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 hover:border-indigo-200 transition-all group"
              >
                <div className="w-16 h-16 bg-slate-50 group-hover:bg-indigo-50 rounded-3xl flex items-center justify-center transition-colors">
                  <Plus size={28} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
                <p className="font-black text-slate-400 group-hover:text-indigo-600 text-sm uppercase tracking-widest transition-colors">
                  Add New Exam
                </p>
              </button>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default GradingEngine;
