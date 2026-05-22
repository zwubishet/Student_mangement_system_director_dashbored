import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, ScrollText, Wallet, LogOut, Receipt,
} from 'lucide-react';

const NAV = [
  { name: 'Overview', path: '/finance/dashboard', icon: LayoutDashboard },
  { name: 'Student fees', path: '/finance/student-fees', icon: Receipt },
  { name: 'Payroll', path: '/finance/payroll', icon: Users },
  { name: 'Ledger', path: '/finance/ledger', icon: ScrollText },
];

export default function FinanceOfficerLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const name = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : 'Finance Officer';

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 shrink-0 bg-teal-950 text-white flex flex-col">
        <div className="p-5 border-b border-teal-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
            <Wallet size={18} className="text-teal-950" />
          </div>
          <div>
            <p className="font-black text-sm">Finance Office</p>
            <p className="text-[10px] text-teal-400 uppercase tracking-widest">School portal</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ name: label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold ${
                  active ? 'bg-amber-500 text-teal-950' : 'text-teal-300 hover:bg-teal-900 hover:text-white'
                }`}
              >
                <Icon size={17} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-teal-800">
          <p className="text-xs text-teal-500 px-3 mb-2 truncate">{name}</p>
          <button
            type="button"
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-bold text-teal-400 hover:bg-teal-900"
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
