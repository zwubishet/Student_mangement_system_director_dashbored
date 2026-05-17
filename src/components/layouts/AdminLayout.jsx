import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, UserSquare2, Users, School, Settings, LogOut, 
  ClipboardCheck, BookOpen, GraduationCap, Trophy, Calendar, Receipt, FolderOpen
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenu = [
    { name: 'Dashboard', path: '/school-admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Students', path: '/school-admin/students', icon: <GraduationCap size={20} /> },
    { name: 'Teachers', path: '/school-admin/teachers', icon: <UserSquare2 size={20} /> },
    { name: 'Parents', path: '/school-admin/parents', icon: <Users size={20} /> },
    { name: 'Classes', path: '/school-admin/classes', icon: <School size={20} /> },
    { name: 'Grading', path: '/school-admin/grading', icon: <Trophy size={20} /> },
    { name: 'Finance', path: '/school-admin/finance', icon: <Receipt size={20} /> },
    { name: 'Files', path: '/school-admin/files', icon: <FolderOpen size={20} /> },
    { name: 'Academic Cycle', path: '/school-admin/academic-cycle', icon: <Calendar size={20} /> },
    { name: 'Settings', path: '/school-admin/settings', icon: <Settings size={20} /> },

  ];

  const teacherMenu = [
    { name: 'My Dashboard', path: '/teachers/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Classes', path: '/teachers/classes', icon: <BookOpen size={20} /> },
    { name: 'Attendance', path: '/teachers/attendance', icon: <ClipboardCheck size={20} /> },
    { name: 'Students', path: '/teachers/my-students', icon: <Users size={20} /> },
  ];

  const superAdminMenu = [
    { name: 'Dashboard', path: '/super-admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Schools', path: '/super-admin/schools', icon: <School size={20} /> },
  ];

  const parentMenu = [
    { name: 'My children', path: '/parent/dashboard', icon: <Users size={20} /> },
  ];

  const menuMap = {
    TEACHER: teacherMenu,
    SCHOOL_ADMIN: adminMenu,
    SUPER_ADMIN: superAdminMenu,
    PARENT: parentMenu,
  };
  const menuItems = menuMap[user?.role] || adminMenu;

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.role?.replace('_', ' ') || 'User';

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-8 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
            E
          </div>
          <span className="text-2xl font-black tracking-tighter">EduManage</span>
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-4 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-4">Main Menu</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                  isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'}`}>{item.icon}</span>
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
              {(user?.firstName?.[0] || user?.role?.[0] || 'U').toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shadow-sm z-10">
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Terminal</h2>
            <p className="text-sm font-bold text-slate-900 capitalize">
              {user?.role?.toLowerCase().replace('_', ' ')} Portal
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-black text-slate-900">{displayName}</p>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Verified</p>
            </div>
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black shadow-sm">
              {(user?.firstName?.[0] || 'U').toUpperCase()}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
