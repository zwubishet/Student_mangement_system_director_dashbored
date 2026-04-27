import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom'; // Added for cleaner navigation
import { 
  Plus, Search, MoreVertical, BookOpen, 
  Calendar, ChevronRight, Settings2, Trash2,
  Loader2 // Added missing icon
} from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';

const GET_EXAMS = gql`
  query GetExams {
    operations_exams(order_by: {created_at: desc}) {
      id
      name
      created_at
      examsubjects_aggregate {
        aggregate { count }
      }
    }
  }
`;

const CREATE_EXAM = gql`
  mutation CreateExam($name: String!) {
    CreateExamAction(object: { name: $name }) {
      id
      name
    }
  }
`;

const ExamManagement = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examName, setExamName] = useState('');
  
  const { data, loading, refetch } = useQuery(GET_EXAMS);
  const [createExam, { loading: creating }] = useMutation(CREATE_EXAM);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createExam({ variables: { name: examName } });
      setIsModalOpen(false);
      setExamName('');
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white min-h-screen">
        {/* HEADER */}
        <div className="border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Examination Engine</h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage cycles, subjects, and grading</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
            >
              <Plus size={16} /> Create New Exam
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* SEARCH & FILTERS */}
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search exam cycles..." 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
              />
            </div>
          </div>

          {/* EXAM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-20 text-center">
                <Loader2 className="animate-spin mx-auto text-slate-300" size={32}/>
              </div>
            ) : data?.operations_exams.map(exam => (
              <div key={exam.id} className="group border border-slate-200 rounded-2xl hover:border-slate-900 transition-all hover:shadow-xl hover:shadow-slate-100 overflow-hidden bg-white">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <BookOpen size={20} />
                    </div>
                    <button className="text-slate-300 hover:text-slate-900"><MoreVertical size={20}/></button>
                  </div>
                  
                  <h3 className="text-lg font-black text-slate-900 mb-1">{exam.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">
                    <Calendar size={14} />
                    {new Date(exam.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Subjects</p>
                      <p className="text-sm font-black text-slate-900">{exam.examsubjects_aggregate.aggregate.count} Configured</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>
                </div>

                <div className="border-t border-slate-100 p-4 flex gap-2">
                  <button 
                    onClick={() => navigate(`/admin/exams/${exam.id}/config`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Settings2 size={14} /> Configure
                  </button>
                  <button className="px-3 py-2.5 rounded-lg border border-slate-100 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CREATE MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in duration-200">
              <div className="p-8">
                <h2 className="text-xl font-black text-slate-900 mb-2">Initialize Exam Cycle</h2>
                <p className="text-sm text-slate-500 mb-6">Give this exam a clear name (e.g., 2024 Midterm One).</p>
                
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Exam Title</label>
                    <input 
                      autoFocus
                      required
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-slate-900 transition-all"
                      placeholder="Enter name..."
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 font-bold text-slate-400 text-xs uppercase tracking-widest hover:text-slate-600 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={creating}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
                    >
                      {creating ? 'Initializing...' : 'Create Cycle'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ExamManagement;