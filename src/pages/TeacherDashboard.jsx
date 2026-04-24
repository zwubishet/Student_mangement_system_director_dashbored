import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@apollo/client/react';
import AdminLayout from '../components/layouts/AdminLayout';
import { TEACHER_DASHBOARD_SUBSCRIPTION } from '../api/teacherGql';
import { 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  Clock, 
  ArrowRight, 
  Calendar, 
  MessageSquare,
  Star,
  Layout,
  Loader2
} from 'lucide-react';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const teacherId = localStorage.getItem('userId'); 

  const { data, loading, error } = useSubscription(TEACHER_DASHBOARD_SUBSCRIPTION, {
    variables: { teacherId }
  });

  // --- SAFE DATA PARSING ---
  // academic_teachers is an array; we need the first element.
  const teacherRecord = data?.academic_teachers?.[0];
  const userData = teacherRecord?.user;
  const assignments = userData?.teacherassignments || [];
  
  // Calculate total students across all assigned sections
  const totalStudents = assignments.reduce((acc, curr) => 
    acc + (curr.section?.studentenrollments_aggregate?.aggregate?.count || 0), 0
  );

  const stats = [
    { 
      label: 'My Students', 
      value: loading ? '...' : totalStudents, 
      icon: <Users className="text-indigo-600" size={24} />,
      bgColor: 'bg-indigo-50'
    },
    { 
      label: 'Active Sections', 
      value: loading ? '...' : userData?.teacherassignments_aggregate?.aggregate?.count || 0, 
      icon: <Layout className="text-blue-600" size={24} />,
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Performance', 
      value: '92%', 
      icon: <Star className="text-amber-600" size={24} />,
      bgColor: 'bg-amber-50'
    },
    { 
      label: 'New Messages', 
      value: '4', 
      icon: <MessageSquare className="text-emerald-600" size={24} />,
      bgColor: 'bg-emerald-50'
    },
  ];

  if (error) return <div className="p-10 text-rose-500 font-bold">Error: {error.message}</div>;

  return (
    <AdminLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              {loading ? 'Welcome back...' : `Hi, ${teacherRecord?.first_name || 'Teacher'}!`}
            </h1>
            <p className="text-slate-500 font-medium text-lg mt-2">
              You are currently managing <span className="text-indigo-600 font-bold">{assignments.length} sections</span> for the current term.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Employee Status</p>
              <p className="text-sm font-bold text-emerald-600 capitalize">{teacherRecord?.status || 'Active'}</p>
            </div>
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-200">
              {teacherRecord?.first_name?.[0] || 'T'}
            </div>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- LEFT: CLASS LIST (8 COLS) --- */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-end px-2">
              <h3 className="text-2xl font-black text-slate-900">Academic Load</h3>
              <button onClick={() => navigate('/teachers/classes')} className="text-[10px] font-black uppercase text-indigo-600 tracking-widest hover:text-slate-900 transition-colors">
                Manage All Classes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-[2.5rem]" />
                ))
              ) : assignments.length > 0 ? (
                assignments.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => navigate(`/teachers/attendance/${item.section.id}`)}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-indigo-600 transition-colors">
                        <BookOpen size={20} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled</p>
                        <p className="text-xl font-black text-slate-900">{item.section?.studentenrollments_aggregate?.aggregate?.count || 0}</p>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.subject?.name || 'Unassigned Subject'}
                    </h4>
                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                      Grade {item.section?.grade?.name} — {item.section?.name}
                    </p>

                    <div className="mt-8 flex items-center justify-between">
                       <span className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600">
                         Take Attendance <ArrowRight size={14} />
                       </span>
                       <div className="flex -space-x-3">
                         {[1,2,3].map(i => (
                           <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                             S{i}
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No assignments found</p>
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT: ACTIONS & TOOLS (4 COLS) --- */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-2xl font-black mb-2">Teacher Toolkit</h3>
                 <p className="text-slate-400 text-sm font-medium mb-8">Quick access to daily operations.</p>
                 
                 <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group">
                      <div onClick={() => navigate('/teachers/classes')} className="flex items-center gap-4">
                        <ClipboardCheck className="text-indigo-400" />
                        <span className="font-bold text-sm">Bulk Mark Entry</span>
                      </div>
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                    <button className="w-full flex items-center justify-between p-5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group">
                      <div className="flex items-center gap-4">
                        <Calendar className="text-blue-400" />
                        <span className="font-bold text-sm">Exam Schedule</span>
                      </div>
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                    <button className="w-full flex items-center justify-between p-5 bg-rose-500/20 hover:bg-rose-500/40 rounded-2xl transition-all group">
                      <div className="flex items-center gap-4">
                        <Clock className="text-rose-400" />
                        <span className="font-bold text-sm">Request Leave</span>
                      </div>
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                 </div>
               </div>
               {/* Decorative Background Shape */}
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600 rounded-full blur-[80px] opacity-20" />
            </div>

            <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm">
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6">Upcoming Events</h4>
               <div className="space-y-6">
                  {[
                    { title: 'Parent-Teacher Meeting', time: 'Friday, 2:00 PM', color: 'bg-amber-400' },
                    { title: 'Curriculum Review', time: 'Monday, 8:00 AM', color: 'bg-indigo-400' },
                  ].map((event, i) => (
                    <div key={i} className="flex gap-4">
                       <div className={`w-1 h-10 ${event.color} rounded-full`} />
                       <div>
                          <p className="font-bold text-slate-900 text-sm">{event.title}</p>
                          <p className="text-xs text-slate-400 font-medium">{event.time}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default TeacherDashboard;