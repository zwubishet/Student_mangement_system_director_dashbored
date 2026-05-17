import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menu = [
  { name: 'My children', path: '/parent/dashboard', icon: <LayoutDashboard size={20} /> },
];

export default function ParentLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : 'Parent';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-slate-800">
          <GraduationCap className="text-emerald-400" size={24} />
          <span className="font-black text-lg">Family Portal</span>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {menu.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${
                  active ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-400 mb-2 truncate">{displayName}</p>
          <button
            type="button"
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center justify-center gap-2 py-2 text-rose-400 hover:text-rose-300 text-sm font-bold"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">{children}</main>
    </div>
  );
}
