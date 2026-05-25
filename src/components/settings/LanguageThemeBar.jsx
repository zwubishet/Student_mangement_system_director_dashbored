import { Moon, Sun, Languages } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';

export default function LanguageThemeBar({ className = '' }) {
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5">
        <Languages size={14} className="text-slate-400 ml-2" />
        {['en', 'am', 'om'].map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={`px-3 py-2 min-h-[36px] sm:px-2.5 sm:py-1 sm:min-h-0 rounded-lg text-xs font-bold touch-manipulation ${
              locale === code
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {t(`language.${code}`, code)}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        className="flex items-center gap-1.5 px-3 py-2.5 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 touch-manipulation"
        title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
      >
        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        {theme === 'dark' ? t('theme.light') : t('theme.dark')}
      </button>
    </div>
  );
}
