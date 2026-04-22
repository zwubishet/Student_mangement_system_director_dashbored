import React from 'react';
import { X, Mail, Phone, Calendar, BookOpen, Clock, Award, Briefcase } from 'lucide-react';

const TeacherDetailDrawer = ({ isOpen, onClose, teacher }) => {
  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        
        {/* HEADER */}
        <div className="h-48 bg-slate-900 relative p-8 flex items-end">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-xl hover:bg-rose-500 transition-all"><X size={20}/></button>
          <div className="flex items-center gap-6 translate-y-12">
            <div className="w-28 h-28 bg-white rounded-[2.5rem] p-1.5 shadow-2xl">
              <div className="w-full h-full bg-indigo-50 rounded-[2rem] flex items-center justify-center text-4xl font-black text-indigo-600">
                {teacher.first_name[0]}{teacher.last_name[0]}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 pt-16 flex-1 overflow-y-auto space-y-10">
          {/* TITLE */}
          <div>
            <h2 className="text-3xl font-black text-slate-900">{teacher.first_name} {teacher.last_name}</h2>
            <p className="text-indigo-600 font-bold text-sm flex items-center gap-2 mt-1">
              <Briefcase size={14} /> Senior Faculty Member
            </p>
          </div>

          {/* CONTACT GRID */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Email Address</p>
              <p className="text-sm font-bold text-slate-800 truncate">{teacher.email}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Phone Number</p>
              <p className="text-sm font-bold text-slate-800">{teacher.phone}</p>
            </div>
          </div>

          {/* WORKLOAD ANALYTICS */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Deployment</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-5 border border-slate-100 rounded-[2rem]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><BookOpen size={20}/></div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Advanced Mathematics</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Grade 10, Grade 12</p>
                  </div>
                </div>
                <Award size={20} className="text-amber-400" />
              </div>
              
              <div className="flex items-center justify-between p-5 border border-slate-100 rounded-[2rem]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Clock size={20}/></div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Physics Lab</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Grade 11-B</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STATS FOOTER */}
          <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white flex justify-around">
            <div className="text-center">
              <p className="text-2xl font-black">24</p>
              <p className="text-[9px] font-black uppercase text-slate-400">Periods/Wk</p>
            </div>
            <div className="w-[1px] bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-black">140</p>
              <p className="text-[9px] font-black uppercase text-slate-400">Students</p>
            </div>
            <div className="w-[1px] bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-black">4.8</p>
              <p className="text-[9px] font-black uppercase text-slate-400">Rating</p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="p-8 border-t border-slate-100 grid grid-cols-2 gap-4">
          <button className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">Edit Profile</button>
          <button className="py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all">Disable Access</button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailDrawer;