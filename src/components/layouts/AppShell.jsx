import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { ui } from '../../theme/tokens';
import BrandMark from '../brand/BrandMark';
import LanguageThemeBar from '../settings/LanguageThemeBar';
import { NavIcon } from '../../navigation/navIcons';
import MobileBottomNav from './MobileBottomNav';

/**
 * Shared app chrome: responsive sidebar (drawer on mobile), header, main area.
 * @param {Array} nav — from menuKeys (labelKey, path, icon) or sections (sectionKey)
 * @param {'emerald'|'violet'|'teal'|'amber'} accent
 * @param {boolean} [mobileBottomNav] — show bottom tab bar on phones when nav is short
 */
export default function AppShell({
  children,
  nav = [],
  accent = 'emerald',
  headerKicker,
  headerTitle,
  banner,
  sidebarFooter,
  mobileBottomNav,
}) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navLinks = nav.filter((item) => item.path);
  const hasSections = nav.some((item) => item.sectionKey);
  const showBottomNav = mobileBottomNav ?? (navLinks.length > 0 && navLinks.length <= 5 && !hasSections);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileNavOpen]);

  const activeClass = {
    emerald: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20',
    violet: 'bg-violet-600 text-white',
    teal: 'bg-amber-500 text-teal-950',
    amber: 'bg-amber-500 text-slate-900',
    sky: 'bg-sky-600 text-white shadow-lg shadow-sky-600/20',
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

  const isActive = (path) => location.pathname === path
    || (path !== '/super-admin/dashboard'
      && path !== '/school-admin/dashboard'
      && path !== '/finance/dashboard'
      && path !== '/parent/dashboard'
      && location.pathname.startsWith(`${path}/`));

  const renderNav = (onNavigate) => (
    <>
      <p className={`${ui.mutedXs} mb-3 ml-2 text-slate-500`}>{t('common.mainMenu')}</p>
      {nav.map((item, i) => {
        if (item.sectionKey) {
          return (
            <p
              key={`s-${i}`}
              className="px-3 pt-4 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-500"
            >
              {t(item.sectionKey)}
            </p>
          );
        }
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-3.5 min-h-[44px] rounded-2xl text-sm font-bold transition-all touch-manipulation ${
              active ? activeClass : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <NavIcon name={item.icon} size={20} />
            {item.label || t(item.labelKey)}
          </Link>
        );
      })}
    </>
  );

  const sidebarFooterBlock = (
    <>
      {sidebarFooter}
      <p className="text-xs text-slate-500 px-2 mb-3 truncate">{displayName}</p>
      <button
        type="button"
        onClick={() => { logout(); navigate('/login'); }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 min-h-[44px] bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest touch-manipulation"
      >
        <LogOut size={16} /> {t('common.logout')}
      </button>
    </>
  );

  return (
    <div className={`flex flex-col lg:flex-row h-[100dvh] max-h-[100dvh] ${ui.pageBg}`}>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex w-72 shrink-0 ${ui.sidebar} flex-col shadow-xl`}>
        <div className="p-6 border-b border-slate-800">
          <BrandMark size="md" variant="sidebar" />
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto overscroll-contain">
          {renderNav()}
        </nav>
        <div className="p-4 border-t border-slate-800">
          {sidebarFooterBlock}
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-label={t('common.close')}
            onClick={() => setMobileNavOpen(false)}
          />
          <aside
            className={`absolute inset-y-0 left-0 w-[min(100vw-2.5rem,20rem)] max-w-[85vw] ${ui.sidebar} flex flex-col shadow-2xl`}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
              <BrandMark size="sm" variant="sidebar" />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white touch-manipulation"
                aria-label={t('common.close')}
              >
                <X size={22} />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto overscroll-contain">
              {renderNav(() => setMobileNavOpen(false))}
            </nav>
            <div className="p-4 border-t border-slate-800 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {sidebarFooterBlock}
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {banner}
        <header className={`shrink-0 ${ui.header} flex items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 py-3 lg:py-0 lg:h-20 shadow-sm z-10`}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {!showBottomNav && (
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden shrink-0 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 touch-manipulation"
                aria-label={t('common.menu', 'Menu')}
              >
                <Menu size={22} />
              </button>
            )}
            <div className="min-w-0">
              <h2 className={`${ui.mutedXs} truncate`}>{headerKicker || t('common.institutionalTerminal')}</h2>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize truncate">
                {headerTitle || `${portalLabel} ${t('common.portal')}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <LanguageThemeBar className="hidden sm:flex" />
            <div className="text-right hidden md:block max-w-[140px]">
              <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">{displayName}</p>
              <p className={`${ui.mutedXs}`}>{t('common.verified')}</p>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0">
              {(user?.firstName?.[0] || 'U').toUpperCase()}
            </div>
          </div>
        </header>

        <div className="lg:hidden px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <LanguageThemeBar />
        </div>

        <section
          className={`flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 sm:p-6 lg:p-8 ${ui.mainBg} ${
            showBottomNav ? 'pb-24' : 'pb-6'
          } lg:pb-8`}
        >
          <div className="max-w-7xl mx-auto w-full min-w-0">{children}</div>
        </section>

        {showBottomNav && (
          <MobileBottomNav
            items={navLinks}
            accent={accent}
            onOpenMenu={() => setMobileNavOpen(true)}
          />
        )}
      </main>
    </div>
  );
}
