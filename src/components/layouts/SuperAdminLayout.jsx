import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, School, Activity, ScrollText, Settings, LogOut, Shield,
} from 'lucide-react';

const NAV = [
  { name: 'Overview', path: '/super-admin/dashboard', icon: LayoutDashboard },
  { name: 'Schools', path: '/super-admin/schools', icon: School },
  { name: 'Health', path: '/super-admin/health', icon: Activity },
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
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-8 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight">Control Plane</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Super Admin</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ name, path, icon: Icon }) => {
            const active = location.pathname === path || location.pathname.startsWith(`${path}/`);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs font-bold text-slate-400 px-4 mb-2">{displayName}</p>
          <button
            type="button"
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-50 text-slate-900">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
