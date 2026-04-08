import React from 'react';
import { 
  X, Mail, Phone, Calendar, Hash, MapPin, 
  UserCheck, ShieldAlert, GraduationCap, Clock, 
  ExternalLink, Edit3, Trash2
} from 'lucide-react';

const StudentDetailDrawer = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const enrollment = student.studentenrollments?.[0];
  const guardian = student.parentstudents?.[0]?.parent;

  const StatusBadge = ({ status }) => {
    const styles = {
      active: "bg-emerald-100 text-emerald-700 border-emerald-200",
      suspended: "bg-amber-100 text-amber-700 border-amber-200",
      withdrawn: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${styles[status] || styles.active}`}>
        {status || 'Active'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto border-l border-slate-100">
        
        {/* HEADER / COVER */}
        <div className="relative h-40 bg-indigo-600 p-8 flex items-end">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-xl backdrop-blur-md transition-all"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4 translate-y-12">
            <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-xl">
              <div className="w-full h-full rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-3xl font-black text-indigo-600 uppercase">
                {student.first_name[0]}{student.last_name[0]}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 pt-16 space-y-8">
          {/* Identity Section */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-black text-slate-900">{student.first_name} {student.last_name}</h2>
              <p className="text-slate-400 font-bold text-sm flex items-center gap-2">
                <Hash size={14} /> ADM: {student.admission_number || 'N/A'}
              </p>
            </div>
            <StatusBadge status={student.status} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button className="flex items-center justify-center gap-2 p-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">
               <Edit3 size={14} /> Edit Profile
             </button>
             <button className="flex items-center justify-center gap-2 p-3 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-rose-200 hover:text-rose-500 transition-all">
               <ShieldAlert size={14} /> Flag Record
             </button>
          </div>

          <hr className="border-slate-50" />

          {/* Academic Info */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Academic Placement</h3>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-slate-400"><GraduationCap size={18}/></div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{enrollment?.section?.name || 'Not Enrolled'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Current Section</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-xs font-black text-indigo-600">{enrollment?.academicyear?.name}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Cycle</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Details */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Communication</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Mail size={18} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{student.user?.email || 'No Email'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Institutional Email</p>
                </div>
              </div>

              {guardian && (
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Phone size={18} /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{guardian.phone || 'N/A'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Guardian: {guardian.email}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* History / Logs Placeholder */}
          <section className="space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Activity Log</h3>
                <Clock size={14} className="text-slate-300" />
             </div>
             <div className="border-l-2 border-slate-100 ml-4 pl-6 space-y-6">
                <div className="relative">
                   <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-4 ring-white" />
                   <p className="text-xs font-bold text-slate-800">Enrolled into {enrollment?.section?.name}</p>
                   <p className="text-[10px] text-slate-400">Automated System • Today</p>
                </div>
                <div className="relative">
                   <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 bg-slate-200 rounded-full ring-4 ring-white" />
                   <p className="text-xs font-bold text-slate-500 italic">Record created</p>
                   <p className="text-[10px] text-slate-400">Admin Portal • Today</p>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailDrawer;