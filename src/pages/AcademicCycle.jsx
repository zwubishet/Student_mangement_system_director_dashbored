import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import AdminLayout from '../components/layouts/AdminLayout';
import { 
  Calendar, Plus, Clock, CheckCircle2, Archive, 
  ChevronRight, CalendarDays, Users, Loader2, AlertCircle
} from 'lucide-react';

// --- GQL DEFINITIONS ---
const GET_ACADEMIC_CYCLES = gql`
  query GetAcademicCycles {
    academic_academicyears(order_by: { start_date: desc }) {
      id
      name
      start_date
      end_date
      status
      terms {
        id
        name
        start_date
        end_date
      }
      studentenrollments_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

const CREATE_CYCLE = gql`
  mutation CreateCycle($name: String!, $start: date!, $end: date!) {
    CreateAcademicYearAction(object: {name: $name, start_date: $start, end_date: $end}) {
      id
      name
      status
    }
  }
`;

const AcademicCycle = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, loading, refetch } = useQuery(GET_ACADEMIC_CYCLES);
  
  // Modal Form State
  const [formData, setFormData] = useState({ name: '', start: '', end: '' });

  const [createCycle, { loading: creating }] = useMutation(CREATE_CYCLE, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createCycle({ variables: { name: formData.name, start: formData.start, end: formData.end } });
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-300">SYNCHRONIZING TIMELINES...</div>;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-10 p-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Academic Cycles</h1>
            <p className="text-slate-500 font-medium text-lg">Manage institutional periods and rollover terms.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl"
          >
            <Plus size={18} /> New Academic Year
          </button>
        </div>

        {/* CYCLES LIST */}
        <div className="space-y-6">
          {data?.academic_academicyears.map((year) => (
            <div key={year.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                
                {/* Status & Name */}
                <div className="flex items-center gap-6 min-w-[300px]">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${
                    year.status === 'active' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {year.status === 'active' ? <Clock size={28} /> : <Archive size={28} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                        year.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {year.status}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{year.name}</h2>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Duration</p>
                    <p className="text-sm font-bold text-slate-700">{year.start_date} <span className="text-slate-300 mx-1">/</span> {year.end_date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Students</p>
                    <div className="flex items-center gap-2 font-black text-slate-900">
                      <Users size={14} className="text-indigo-500" />
                      {year.studentenrollments_aggregate.aggregate.count} Enrollments
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Configuration</p>
                    <p className="text-sm font-bold text-slate-700">{year.terms.length} Academic Terms</p>
                  </div>
                </div>

                <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all group">
                  <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Nested Terms Timeline */}
              {year.terms.length > 0 && (
                <div className="bg-slate-50/50 p-6 border-t border-slate-50 flex gap-4 overflow-x-auto">
                  {year.terms.map((term) => (
                    <div key={term.id} className="min-w-[200px] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">{term.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{term.start_date} - {term.end_date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-black text-slate-900 mb-2">Initialize Year</h3>
            <p className="text-slate-500 font-medium mb-8">Establish the boundaries for the new academic cycle.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Year Display Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2026/2027"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Start Date</label>
                  <input type="date" className="w-full px-5 py-4 rounded-2xl border border-slate-100 font-bold" onChange={e => setFormData({...formData, start: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">End Date</label>
                  <input type="date" className="w-full px-5 py-4 rounded-2xl border border-slate-100 font-bold" onChange={e => setFormData({...formData, end: e.target.value})} required />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={creating} className="flex-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2">
                  {creating ? <Loader2 size={16} className="animate-spin" /> : 'Create Cycle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AcademicCycle;