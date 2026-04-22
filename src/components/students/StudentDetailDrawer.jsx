import React, { useState } from 'react';
import { 
  X, Mail, Phone, Hash, GraduationCap, Edit3, 
  ShieldAlert, Calculator, BookOpen, FileText, History
} from 'lucide-react';

const StudentDetailDrawer = ({ isOpen, onClose, student }) => {
  const [activeTab, setActiveTab] = useState('profile');

  if (!isOpen || !student) return null;

  const enrollment = student.studentenrollments?.[0];
  const guardian = student.parentstudents?.[0]?.parent;

  const tabs = [
    { id: 'profile', label: 'Identity', icon: Hash },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'history', label: 'Activity', icon: History },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        
        {/* COVER HEADER */}
        <div className="h-40 bg-slate-900 relative p-8 flex items-end">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-xl hover:bg-rose-500 transition-all"><X size={20}/></button>
          <div className="w-24 h-24 bg-white rounded-[2rem] p-1 shadow-2xl translate-y-12">
             <div className="w-full h-full bg-indigo-50 rounded-[1.8rem] flex items-center justify-center text-3xl font-black text-indigo-600">{student.first_name[0]}</div>
          </div>
        </div>

        {/* IDENTITY INFO */}
        <div className="p-8 pt-16">
          <h2 className="text-3xl font-black text-slate-900">{student.first_name} {student.last_name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-100">{student.status}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined {new Date().getFullYear()}</span>
          </div>
        </div>

        {/* TAB NAV */}
        <div className="px-8 flex gap-8 border-b border-slate-50">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-4 text-[10px] font-black uppercase tracking-widest relative transition-all ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-300'}`}>
              <div className="flex items-center gap-2">
                <tab.icon size={14}/> {tab.label}
              </div>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full" />}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-2">
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Details</h4>
                <div className="grid gap-3">
                  <div className="p-4 rounded-2xl border border-slate-50 flex items-center gap-4 bg-slate-50/50">
                    <div className="p-2 bg-white rounded-lg text-indigo-500 shadow-sm"><Mail size={18}/></div>
                    <div><p className="text-sm font-bold text-slate-800">{student.user?.email}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Institutional Email</p></div>
                  </div>
                  {guardian && (
                    <div className="p-4 rounded-2xl border border-slate-50 flex items-center gap-4 bg-slate-50/50">
                      <div className="p-2 bg-white rounded-lg text-emerald-500 shadow-sm"><Phone size={18}/></div>
                      <div><p className="text-sm font-bold text-slate-800">{guardian.phone || 'N/A'}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Guardian Contact</p></div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2">
               <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Calculator size={24}/></div>
                  <div><p className="text-xl font-black text-slate-900">3.82 GPA</p><p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Weighted Academic Index</p></div>
               </div>
               
               <div className="space-y-3">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Enrollment</h4>
                 <div className="p-5 border border-slate-100 rounded-3xl space-y-3">
                   <div className="flex justify-between items-center">
                      <p className="text-sm font-black text-slate-800">{enrollment?.section?.grade?.name} {enrollment?.section?.name}</p>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">PRIMARY</span>
                   </div>
                   <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-3/4 rounded-full"/>
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Attendance: 85% Attendance</p>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* ACTIONS FOOTER */}
        <div className="p-8 border-t border-slate-50 grid grid-cols-2 gap-4">
           <button className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all"><Edit3 size={16}/> Edit Record</button>
           <button className="py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-rose-200 hover:text-rose-500 transition-all flex items-center justify-center gap-2"><ShieldAlert size={16}/> Suspend</button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailDrawer;