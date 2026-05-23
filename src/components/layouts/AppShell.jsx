import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { ui } from '../../theme/tokens';
import BrandMark from '../brand/BrandMark';
import LanguageThemeBar from '../settings/LanguageThemeBar';
import { NavIcon } from '../../navigation/navIcons';

/**
 * Shared app chrome: sidebar, header, theme-aware main area.
 * @param {Array} nav — from menuKeys (labelKey, path, icon) or sections (sectionKey)
 * @param {'emerald'|'violet'|'teal'|'amber'} accent
 */
export default function AppShell({
  children,
  nav = [],
  accent = 'emerald',
  headerKicker,
  headerTitle,
  banner,
  sidebarFooter,
}) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const activeClass = {
    emerald: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20',
    violet: 'bg-violet-600 text-white',
    teal: 'bg-amber-500 text-teal-950',
    amber: 'bg-amber-500 text-slate-900',
  }[accent] || 'bg-emerald-600 text-white';

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.role?.replace('_', ' ') || 'User';

  const roleSlug = {
    SCHOOL_ADMIN: 'schoolAdmin',
    FINANCE: 'finance',
    TEACHER: 'teacher',
    PARENT: 'parent',
    SUPER_ADMIN: 'superAdmin',
  }[user?.role] || 'schoolAdmin';
  const portalLabel = t(`roles.${roleSlug}`, user?.role?.replace('_', ' '));

  return (
    <div className={`flex h-screen ${ui.pageBg}`}>
      <aside className={`w-72 shrink-0 ${ui.sidebar} flex flex-col shadow-xl`}>
        <div className="p-6 border-b border-slate-800">
          <BrandMark size="md" variant="sidebar" />
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className={`${ui.mutedXs} mb-3 ml-2 text-slate-500`}>{t('common.mainMenu')}</p>
          {nav.map((item, i) => {
            if (item.sectionKey) {
              return (
                <p key={`s-${i}`} className="px-3 pt-4 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {t(item.sectionKey)}
                </p>
              );
            }
            const active = location.pathname === item.path
              || (item.path !== '/super-admin/dashboard' && item.path !== '/school-admin/dashboard'
                && item.path !== '/finance/dashboard' && location.pathname.startsWith(`${item.path}/`));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  active ? activeClass : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <NavIcon name={item.icon} size={20} />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          {sidebarFooter}
          <p className="text-xs text-slate-500 px-2 mb-3 truncate">{displayName}</p>
          <button
            type="button"
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest"
          >
            <LogOut size={16} /> {t('common.logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {banner}
        <header className={`h-20 shrink-0 ${ui.header} flex items-center justify-between px-8 shadow-sm z-10`}>
          <div>
            <h2 className={ui.mutedXs}>{headerKicker || t('common.institutionalTerminal')}</h2>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">
              {headerTitle || `${portalLabel} ${t('common.portal')}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageThemeBar />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">{displayName}</p>
              <p className={`${ui.mutedXs}`}>{t('common.verified')}</p>
            </div>
            <div className="w-11 h-11 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-sm">
              {(user?.firstName?.[0] || 'U').toUpperCase()}
            </div>
          </div>
        </header>
        <section className={`flex-1 overflow-y-auto p-8 ${ui.mainBg}`}>
          <div className="max-w-7xl mx-auto">{children}</div>
        </section>
      </main>
    </div>
  );
}
