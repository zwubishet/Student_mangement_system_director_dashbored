import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_TEACHER_SECTIONS } from '../api/teacherGql';
import AdminLayout from '../components/layouts/AdminLayout';
import { 
  BookOpen, Users, ArrowRight, Loader2, 
  Search, ClipboardCheck, GraduationCap, 
  CheckCircle2, Clock, AlertCircle
} from 'lucide-react';

const TeacherClasses = () => {
  const navigate = useNavigate();
  const teacherId = localStorage.getItem('userId');
  const [searchTerm, setSearchTerm] = useState('');

  // Use current date for the attendance filter
  const today = new Date().toISOString().split('T')[0];

  const { data, loading, error } = useQuery(GET_TEACHER_SECTIONS, {
    variables: { 
      teacherId,
      today // Ensure your GQL query uses this variable
    },
    fetchPolicy: 'cache-and-network'
  });

  // 1. Filter out duplicate sections from the assignments array
  const rawAssignments = data?.academic_teacherassignments || [];
  const uniqueSections = Array.from(new Map(rawAssignments.map(item => [item.section.id, item])).values());

  if (loading && !data) return (
    <AdminLayout>
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Syncing Classroom Data...</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">My Schedule</h1>
            <p className="text-slate-400 font-bold">Real-time attendance tracking for your assigned sections.</p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search subjects..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {uniqueSections
            .filter(a => a.subject.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((item) => {
              const section = item.section;
              const totalStudents = section.studentenrollments_aggregate.aggregate.count;
              const markedToday = section.attendances_aggregate.aggregate.count;
              
              // Logic: Marked if there are students AND they all have records
              const isFullyMarked = totalStudents > 0 && markedToday >= totalStudents;
              const isEmpty = totalStudents === 0;

              return (
                <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-500 group flex flex-col relative overflow-hidden">
                  
                  {/* Progress bar at the top of the card */}
                  <div className="absolute top-0 left-0 h-1 bg-indigo-600 transition-all duration-1000" 
                       style={{ width: `${(markedToday / (totalStudents || 1)) * 100}%` }} />

                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:rotate-3 transition-all duration-500">
                        <BookOpen size={24} />
                      </div>
                      
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-black text-[10px] uppercase tracking-widest ${
                        isFullyMarked 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : isEmpty ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {isFullyMarked ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {isEmpty ? 'No Students' : isFullyMarked ? 'Completed' : 'Action Required'}
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {item.subject.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                      <GraduationCap size={16} className="text-indigo-500" />
                      Grade {section.grade.name} — Section {section.name}
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Roster</p>
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-indigo-500" />
                          <span className="text-lg font-black text-slate-800">{totalStudents}</span>
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl border ${isFullyMarked ? 'bg-emerald-50/30 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Marked</p>
                        <span className={`text-lg font-black ${isFullyMarked ? 'text-emerald-600' : 'text-slate-800'}`}>
                          {markedToday}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 pt-0 mt-auto grid grid-cols-1 gap-3">
                    <button 
                      disabled={isEmpty}
                      onClick={() => navigate(`/teachers/attendance/${section.id}`)}
                      className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        isEmpty ? 'bg-slate-50 text-slate-300 cursor-not-allowed' :
                        isFullyMarked 
                        ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                        : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-indigo-100'
                      }`}
                    >
                      <ClipboardCheck size={14} /> 
                      {isFullyMarked ? 'Update Attendance' : 'Mark Attendance'}
                    </button>
                    <button 
                      onClick={() => navigate(`/teachers/roster/${section.id}`)}
                      className="flex items-center justify-center gap-2 py-4 border-2 border-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-100 hover:text-indigo-600 transition-all"
                    >
                      View Class Roster <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* FOOTER NOTICE */}
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2.5rem] flex items-start gap-4">
          <AlertCircle className="text-indigo-600 mt-1" size={24} />
          <div>
            <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest">Daily Reset Active</h4>
            <p className="text-indigo-700/80 text-sm font-medium mt-1">
              Data for <strong>{new Date().toDateString()}</strong> is currently being recorded. Attendance cycles reset at 00:00.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeacherClasses;