import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { NavIcon } from '../../navigation/navIcons';

/**
 * Primary navigation for small screens when menu has few items (parent, finance).
 */
export default function MobileBottomNav({ items, accent = 'emerald', onOpenMenu }) {
  const { t } = useI18n();
  const location = useLocation();

  const activeClass = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    violet: 'text-violet-600 dark:text-violet-400',
    teal: 'text-amber-600 dark:text-amber-400',
    amber: 'text-amber-600 dark:text-amber-400',
    sky: 'text-sky-600 dark:text-sky-400',
  }[accent] || 'text-emerald-600';

  const isActive = (path) => location.pathname === path
    || (path !== '/super-admin/dashboard'
      && path !== '/school-admin/dashboard'
      && path !== '/finance/dashboard'
      && path !== '/parent/dashboard'
      && location.pathname.startsWith(`${path}/`));

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)]"
      aria-label={t('common.mainMenu')}
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[3.25rem] py-2 px-1 text-[10px] font-bold transition-colors touch-manipulation ${
                active ? activeClass : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <NavIcon name={item.icon} size={22} />
              <span className="truncate max-w-[4.5rem] text-center leading-tight">
                {item.label || t(item.labelKey)}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[3.25rem] py-2 px-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 touch-manipulation"
        >
          <Menu size={22} />
          <span>{t('common.menu', 'Menu')}</span>
        </button>
      </div>
    </nav>
  );
}
