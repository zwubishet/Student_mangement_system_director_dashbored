import { gql } from '@apollo/client';
import { useSubscription } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layouts/AdminLayout';
import { 
  Users, 
  GraduationCap, 
  School, 
  Activity, 
  ArrowRight, 
  UserPlus, 
  CalendarDays,
  Megaphone,
  Settings,
  Shield
} from 'lucide-react';

// Using your real Subscription definition
const DASHBOARD_SUBSCRIPTION = gql`
  subscription GetDashboardStats {
    dashboard_stats {
      student_count
      teacher_count
      class_count
    }
  }
`;

const SchoolAdminDashboard = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useSubscription(DASHBOARD_SUBSCRIPTION);

  // Safely extract data from the dashboard_stats array
  const statsData = data?.dashboard_stats?.[0];

  const stats = [
    { 
      label: 'Total Students', 
      value: loading ? '...' : statsData?.student_count || 0, 
      icon: <Users className="text-blue-600" size={24} />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    { 
      label: 'Faculty Members', 
      value: loading ? '...' : statsData?.teacher_count || 0, 
      icon: <GraduationCap className="text-indigo-600" size={24} />,
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100'
    },
    { 
      label: 'Active Classes', 
      value: loading ? '...' : statsData?.class_count || 0, 
      icon: <School className="text-emerald-600" size={24} />,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    },
    { 
      label: 'Security Status', 
      value: 'Identity Active', 
      icon: <Shield className="text-amber-600" size={24} />,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
  ];

  if (error) return (
    <AdminLayout>
      <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600 flex items-center gap-3">
        <Activity size={20} />
        <p className="font-bold">Subscription Error: {error.message}</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">
              Real-time synchronization with institutional records.
            </p>
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            Live Sync: Active
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className={`bg-white p-6 rounded-[2.5rem] border ${stat.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 group`}>
              <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 leading-none">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* QUICK ACTIONS MAPPED TO MUTATIONS */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xl font-bold text-slate-800 ml-1">Administrative Actions</h3>
            <div className="grid gap-4">
              
              {/* Trigger for RegisterStudentEnrollment */}
              <button 
                onClick={() => navigate('/school-admin/students')}
                className="group flex items-center justify-between p-6 bg-slate-900 text-white rounded-[2rem] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="p-3 bg-white/10 rounded-xl"><UserPlus size={22} /></div>
                  <div>
                    <p className="font-bold text-sm">Enroll Student</p>
                    <p className="text-[10px] text-white/50">Register to academic year</p>
                  </div>
                </div>
                <ArrowRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" size={20} />
              </button>

              {/* Trigger for CreateAcademicYearAction */}
              <button 
                onClick={() => navigate('/school-admin/settings')}
                className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] hover:border-indigo-600 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="p-3 bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 rounded-xl transition-colors">
                    <CalendarDays size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">Academic Cycle</p>
                    <p className="text-[10px] text-slate-400">Initialize New Year/Term</p>
                  </div>
                </div>
                <Settings className="text-slate-200 group-hover:rotate-90 transition-all duration-500" size={18} />
              </button>

              {/* Trigger for CreateAnnouncementAction */}
              <button className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] hover:border-indigo-600 transition-all shadow-sm">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-3 bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 rounded-xl transition-colors">
                    <Megaphone size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">Announcements</p>
                    <p className="text-[10px] text-slate-400">Broadcast to all roles</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-rose-500 rounded-full group-hover:animate-ping" />
              </button>

            </div>
          </div>

          {/* SYSTEM INSIGHTS */}
          <div className="lg:col-span-2 bg-indigo-600 rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col justify-between border-4 border-white shadow-2xl shadow-indigo-100">
            <div className="relative z-10 space-y-6">
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">System Intelligence</span>
              <h2 className="text-4xl font-black leading-tight">
                Structure your <br /> school's digital DNA.
              </h2>
              <p className="text-indigo-100 font-medium max-w-md">
                Initialize grade sections, assign lead teachers, and establish academic terms to begin enrollment.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => navigate('/school-admin/classes')}
                  className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-transform active:scale-95"
                >
                  Manage Classrooms
                </button>
              </div>
            </div>

            {/* Background Decoration */}
            <Activity className="absolute -right-20 -bottom-20 size-80 text-white/5 opacity-20 rotate-12" />
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default SchoolAdminDashboard;