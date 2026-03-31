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
  ClipboardCheck 
} from 'lucide-react';

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

  if (error) return (
    <AdminLayout>
      <div className="p-8 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600">
        <h2 className="font-bold">Sync Error</h2>
        <p className="text-sm">{error.message}</p>
      </div>
    </AdminLayout>
  );

  // Safely access the view data
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
      label: 'Active Teachers', 
      value: loading ? '...' : statsData?.teacher_count || 0, 
      icon: <GraduationCap className="text-indigo-600" size={24} />,
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100'
    },
    { 
      label: 'Total Classes', 
      value: loading ? '...' : statsData?.class_count || 0, 
      icon: <School className="text-emerald-600" size={24} />,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    },
    { 
      label: 'System Status', 
      value: 'Live', 
      icon: <Activity className="text-amber-600 animate-pulse" size={24} />,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* WELCOME HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">
              Real-time analytics from your institution.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            Live Sync Active
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div 
              key={stat.label} 
              className={`bg-white p-6 rounded-[2rem] border ${stat.borderColor} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
            >
              <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-900 leading-none">
                {stat.value}
              </h3>
              {loading && (
                <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-1/3 animate-progress" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QUICK ACTIONS */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xl font-bold text-slate-800 ml-1">Quick Actions</h3>
            <div className="grid gap-4">
              <button 
                onClick={() => navigate('/school-admin/students')}
                className="group flex items-center justify-between p-6 bg-slate-900 text-white rounded-[2rem] hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <UserPlus size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Enroll Student</p>
                    <p className="text-xs text-white/60">Add new registration</p>
                  </div>
                </div>
                <ArrowRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </button>

              <button className="group flex items-center justify-between p-6 bg-white border border-slate-100 text-slate-800 rounded-[2rem] hover:border-indigo-200 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                    <ClipboardCheck size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Mark Attendance</p>
                    <p className="text-xs text-slate-400">Daily check-in logs</p>
                  </div>
                </div>
                <ArrowRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-2 transition-all" />
              </button>
            </div>
          </div>

          {/* MAIN CALL TO ACTION / WELCOME AREA */}
          <div className="lg:col-span-2 relative overflow-hidden bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-200 flex flex-col justify-center border-4 border-white">
            <div className="relative z-10 space-y-4">
              <h2 className="text-3xl md:text-4xl font-black leading-tight">
                Manage your school <br /> ecosystem with ease.
              </h2>
              <p className="text-indigo-100 font-medium max-w-md">
                Access your student registry, faculty profiles, and classroom allocations all from one centralized hub.
              </p>
              <button 
                onClick={() => navigate('/school-admin/students')}
                className="mt-6 inline-flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all active:scale-95"
              >
                Go to Student Registry <ArrowRight size={20} />
              </button>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-10 right-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-progress {
          animation: progress 1.5s infinite linear;
        }
      `}} />
    </AdminLayout>
  );
};

export default SchoolAdminDashboard;