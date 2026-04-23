import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_CLASS_ROSTER } from '../api/teacherGql';
import AdminLayout from '../components/layouts/AdminLayout';
import { 
  Users, ArrowLeft, Search, Mail, 
  MoreVertical, ShieldCheck, GraduationCap,
  Calendar, Fingerprint, Loader2
} from 'lucide-react';

const TeacherRoster = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, error } = useQuery(GET_CLASS_ROSTER, {
    variables: { sectionId },
  });

  const section = data?.academic_sections_by_pk;
  const enrollments = section?.studentenrollments || [];

  if (loading) return (
    <AdminLayout>
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto">
        
        {/* TOP NAVIGATION */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Classes
        </button>

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Users size={24} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Class Roster</h1>
            </div>
            <p className="text-slate-500 font-bold">
              Grade {section?.grade?.name} — Section {section?.name} 
              <span className="mx-2 text-slate-300">|</span> 
              {enrollments.length} Students Enrolled
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="Search students..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-600 transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            />
          </div>
        </div>

        {/* ROSTER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments
            .filter(e => {
              const full = `${e.student.first_name} ${e.student.last_name}`.toLowerCase();
              return full.includes(searchTerm) || e.student.admission_number.toLowerCase().includes(searchTerm);
            })
            .map(({ student }) => (
              <div 
                key={student.id}
                className="bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <GraduationCap size={32} />
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800">
                    {student.first_name} {student.last_name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    <Fingerprint size={14} className="text-indigo-500" />
                    {student.admission_number}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                    <p className="text-sm font-bold text-slate-700 capitalize">{student.gender.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${student.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <p className="text-sm font-bold text-slate-700 capitalize">{student.status}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-slate-500 bg-slate-50 p-3 rounded-xl">
                  <Calendar size={14} />
                  <span className="text-xs font-bold">Born: {new Date(student.date_of_birth).toLocaleDateString()}</span>
                </div>

                <button className="w-full mt-6 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                  View Full Profile
                </button>
              </div>
            ))}
        </div>

        {enrollments.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Users className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-xl font-black text-slate-900">No Students Found</h3>
            <p className="text-slate-500 font-bold">This section currently has no active enrollments.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TeacherRoster;