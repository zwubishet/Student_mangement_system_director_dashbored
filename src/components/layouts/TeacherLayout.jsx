import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, Users, ClipboardCheck, LogOut, GraduationCap, Trophy, Calendar, UserCircle,
} from 'lucide-react';

const NAV = [
  { name: 'Dashboard', path: '/teachers/dashboard', icon: LayoutDashboard },
  { name: 'My Classes', path: '/teachers/classes', icon: BookOpen },
  { name: 'Exams & marks', path: '/teachers/exams', icon: Trophy },
  { name: 'Attendance', path: '/teachers/attendance', icon: ClipboardCheck },
  { name: 'Students', path: '/teachers/students', icon: Users },
  { name: 'Timetable', path: '/teachers/timetable', icon: Calendar },
  { name: 'My profile', path: '/teachers/profile', icon: UserCircle },
];

export default function TeacherLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : 'Teacher';

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-72 bg-slate-900 text-white flex flex-col shrink-0 shadow-xl">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
              T
            </div>
            <div>
              <p className="font-black text-sm tracking-tight">Teacher Portal</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Faculty workspace</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-black">
              {(user?.firstName?.[0] || 'T').toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Teacher</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 text-xs font-bold"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div>
            {title && <h1 className="text-lg font-black text-slate-900">{title}</h1>}
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
            {!title && (
              <>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Teacher Portal</p>
                <p className="text-sm font-bold text-slate-800">Welcome, {user?.firstName || 'Teacher'}</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <GraduationCap size={16} className="text-emerald-500" />
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
