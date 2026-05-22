import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, School, Users, GraduationCap, UserCircle, Activity,
  Settings, LogOut, Shield, HeartPulse, ScrollText, Wallet,
} from 'lucide-react';

const NAV = [
  { section: 'Overview' },
  { name: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
  { name: 'Activity', path: '/super-admin/activity', icon: Activity },
  { section: 'Tenants' },
  { name: 'Schools', path: '/super-admin/schools', icon: School },
  { section: 'People' },
  { name: 'Users', path: '/super-admin/users', icon: Users },
  { name: 'Students', path: '/super-admin/students', icon: GraduationCap },
  { name: 'Teachers', path: '/super-admin/teachers', icon: UserCircle },
  { section: 'Finance' },
  { name: 'Platform finance', path: '/super-admin/finance', icon: Wallet },
  { section: 'System' },
  { name: 'Health', path: '/super-admin/health', icon: HeartPulse },
  { name: 'Audit log', path: '/super-admin/audit', icon: ScrollText },
  { name: 'Settings', path: '/super-admin/settings', icon: Settings },
];

export default function SuperAdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : 'Platform Admin';

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
            <Shield size={18} />
          </div>
          <div>
            <p className="font-black text-sm tracking-tight">EduManage</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Super Admin</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map((item, i) => {
            if (item.section) {
              return (
                <p key={`s-${i}`} className="px-3 pt-4 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {item.section}
                </p>
              );
            }
            const Icon = item.icon;
            const active = location.pathname === item.path
              || (item.path !== '/super-admin/dashboard' && location.pathname.startsWith(`${item.path}/`));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  active ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={17} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <p className="text-xs text-slate-500 px-3 mb-2 truncate">{displayName}</p>
          <button
            type="button"
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
