import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_ACADEMIC_CYCLES, CREATE_ACADEMIC_YEAR, CREATE_TERM } from '../api/academicCycleGql';
import AdminLayout from '../components/layouts/AdminLayout';
import { Calendar, Plus, ChevronRight, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { AddYearModal, AddTermModal } from '../components/modals/AcademicModals';

const AcademicSettings = () => {
  const { data, loading, refetch } = useQuery(GET_ACADEMIC_CYCLES);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [selectedYearId, setSelectedYearId] = useState(null);

  const handleOpenTermModal = (yearId) => {
    setSelectedYearId(yearId);
    setIsTermModalOpen(true);
  };

  const years = data?.academic_academicyears || [];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Cycle</h1>
            <p className="text-slate-500 font-medium mt-1">Define years and seasonal terms for enrollment.</p>
          </div>
          <button 
            onClick={() => setIsYearModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20} /> New Academic Year
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : (
          <div className="grid gap-6">
            {years.map((year) => (
              <div key={year.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  
                  {/* Year Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        year.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                        {year.status}
                      </div>
                      <h2 className="text-2xl font-black text-slate-900">{year.name}</h2>
                    </div>
                    
                    <div className="flex items-center gap-6 text-slate-400 text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-indigo-500" />
                        {new Date(year.start_date).toLocaleDateString()} — {new Date(year.end_date).toLocaleDateString()}
                      </div>
                    </div>

                    {/* NEW: Bulk Action Trigger */}
                    <button className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-indigo-600 transition-colors">
                      <School size={14} /> Generate Classes for this Year
                    </button>
                  </div>

                  {/* Terms List */}
                  <div className="flex-[2] bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Academic Terms</h3>
                      {/* FIXED BUTTON LOCATION */}
                      <button 
                        onClick={() => handleOpenTermModal(year.id)}
                        className="text-indigo-600 font-bold text-xs flex items-center gap-1 hover:underline"
                      >
                        <Plus size={14} /> Add Term
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {year.terms.length > 0 ? (
                        year.terms.map(term => (
                          <div key={term.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="font-black text-slate-800 text-sm">{term.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">
                              {new Date(term.start_date).getMonth() + 1}/{new Date(term.start_date).getFullYear()} Start
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-4 text-center text-slate-400 text-xs font-medium italic">
                          No terms defined for this year yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddYearModal 
        isOpen={isYearModalOpen} 
        onClose={() => setIsYearModalOpen(false)} 
        onRefresh={refetch} 
      />

      <AddTermModal 
        isOpen={isTermModalOpen} 
        onClose={() => setIsTermModalOpen(false)} 
        academicYearId={selectedYearId}
        onRefresh={refetch} 
      />
    </AdminLayout>
  );
};

export default AcademicSettings;