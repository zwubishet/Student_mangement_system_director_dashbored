import React, { useState, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, BookOpen, Calendar, Settings2, Trash2,
  Loader2, ChevronRight, Filter, MoreVertical, X,
  FileEdit, CheckCircle, Eye, Archive
} from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';

const GET_EXAMS = gql`
  query GetExams {
    operations_exams(order_by: { created_at: desc }) {
      id
      name
      status
      weightage
      created_at
      examsubjects_aggregate { aggregate { count } }
    }
  }
`;

const CREATE_EXAM = gql`
  mutation CreateExam($name: String!) {
    CreateExamAction(object: { name: $name }) { id name }
  }
`;

const UPDATE_EXAM_STATUS = gql`
  mutation UpdateExamStatus($id: uuid!, $status: String!) {
    update_operations_exams_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id status
    }
  }
`;

const DELETE_EXAM = gql`
  mutation DeleteExam($id: uuid!) {
    delete_operations_exams_by_pk(id: $id) { id }
  }
`;

const STATUS_CONFIG = {
  DRAFT:     { label: 'Draft',     color: 'bg-slate-100 text-slate-500',   dot: 'bg-slate-400',   next: 'ACTIVE',     nextLabel: 'Activate',  icon: FileEdit },
  ACTIVE:    { label: 'Active',    color: 'bg-blue-50 text-blue-600',      dot: 'bg-blue-500',    next: 'COMPLETED',  nextLabel: 'Complete',  icon: CheckCircle },
  COMPLETED: { label: 'Completed', color: 'bg-amber-50 text-amber-600',    dot: 'bg-amber-500',   next: 'PUBLISHED',  nextLabel: 'Publish',   icon: Archive },
  PUBLISHED: { label: 'Published', color: 'bg-emerald-50 text-emerald-600',dot: 'bg-emerald-500', next: null,         nextLabel: null,        icon: Eye },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const FILTER_OPTIONS = ['ALL', 'DRAFT', 'ACTIVE', 'COMPLETED', 'PUBLISHED'];

export default function ExamManagement() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examName, setExamName] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);

  const { data, loading, refetch } = useQuery(GET_EXAMS);
  const [createExam, { loading: creating }] = useMutation(CREATE_EXAM);
  const [updateStatus] = useMutation(UPDATE_EXAM_STATUS);
  const [deleteExam] = useMutation(DELETE_EXAM);

  const exams = useMemo(() => {
    const all = data?.operations_exams || [];
    return all.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'ALL' || e.status === filter;
      return matchSearch && matchFilter;
    });
  }, [data, search, filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!examName.trim()) return;
    try {
      await createExam({ variables: { name: examName.trim() } });
      setIsModalOpen(false);
      setExamName('');
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusAdvance = async (exam) => {
    const cfg = STATUS_CONFIG[exam.status];
    if (!cfg?.next) return;
    try {
      await updateStatus({ variables: { id: exam.id, status: cfg.next } });
      refetch();
    } catch (err) {
      alert(err.message);
    }
    setMenuOpen(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this exam? This cannot be undone.')) return;
    try {
      await deleteExam({ variables: { id } });
      refetch();
    } catch (err) {
      alert(err.message);
    }
    setMenuOpen(null);
  };

  const counts = useMemo(() => {
    const all = data?.operations_exams || [];
    return FILTER_OPTIONS.reduce((acc, s) => {
      acc[s] = s === 'ALL' ? all.length : all.filter(e => e.status === s).length;
      return acc;
    }, {});
  }, [data]);

  return (
    <AdminLayout>
      <div className="bg-white min-h-screen">
        {/* STICKY HEADER */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Examination Engine</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Manage exam cycles, status, and subjects
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-sm"
            >
              <Plus size={15} /> New Exam
            </button>
          </div>

          {/* FILTER TABS */}
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 pb-0 overflow-x-auto">
            {FILTER_OPTIONS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                  filter === f
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {f} <span className="ml-1 text-slate-300">{counts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* SEARCH */}
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search exams..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-400 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* TABLE */}
          {loading ? (
            <div className="py-24 flex justify-center">
              <Loader2 className="animate-spin text-slate-300" size={32} />
            </div>
          ) : exams.length === 0 ? (
            <div className="py-24 text-center">
              <BookOpen className="mx-auto text-slate-200 mb-4" size={40} />
              <p className="text-slate-400 font-medium">No exams found.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Exam Name</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Subjects</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Weightage</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Created</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exams.map(exam => {
                    const cfg = STATUS_CONFIG[exam.status] || STATUS_CONFIG.DRAFT;
                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                              <BookOpen size={16} className="text-slate-500" />
                            </div>
                            <span className="font-bold text-slate-900 text-sm">{exam.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={exam.status} />
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-bold text-slate-700">
                            {exam.examsubjects_aggregate.aggregate.count}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">configured</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-bold text-slate-700">
                            {exam.weightage != null ? `${exam.weightage}%` : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400 font-medium">
                          {new Date(exam.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* Advance status button */}
                            {cfg.next && (
                              <button
                                onClick={() => handleStatusAdvance(exam)}
                                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-slate-200 rounded-md text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                              >
                                {cfg.nextLabel}
                              </button>
                            )}
                            {/* Configure subjects */}
                            <button
                              onClick={() => navigate(`/school-admin/exams/${exam.id}/config`)}
                              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                              title="Configure subjects"
                            >
                              <Settings2 size={16} />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(exam.id)}
                              className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                              title="Delete exam"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CREATE MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-base font-black text-slate-900">Create Exam Cycle</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Exam Title
                  </label>
                  <input
                    autoFocus
                    required
                    value={examName}
                    onChange={e => setExamName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm outline-none focus:border-slate-900 transition-colors"
                    placeholder="e.g. 2024 Midterm One"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Starts as <strong>DRAFT</strong>. Activate it when ready for mark entry.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={creating}
                    className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
