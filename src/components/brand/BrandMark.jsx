import { BRAND } from '../../config/brand';
import { useI18n } from '../../context/I18nContext';

/** Logo + product name + optional tagline (locale-aware) */
export default function BrandMark({ size = 'md', showTagline = true, variant = 'sidebar' }) {
  const { locale, t } = useI18n();
  const name = locale === 'am' ? BRAND.nameAm : locale === 'om' ? BRAND.nameOm : BRAND.name;
  const tagline = locale === 'am' ? BRAND.taglineAm : locale === 'om' ? BRAND.taglineOm : BRAND.tagline;
  const short = t('app.shortName', BRAND.shortName);

  const sizes = {
    sm: { img: 'w-8 h-8', name: 'text-sm', tag: 'text-[9px]' },
    md: { img: 'w-11 h-11', name: 'text-lg', tag: 'text-[10px]' },
    lg: { img: 'w-14 h-14', name: 'text-2xl', tag: 'text-xs' },
  };
  const s = sizes[size] || sizes.md;

  const nameClass = variant === 'sidebar'
    ? `${s.name} font-black tracking-tight block leading-tight text-white`
    : `${s.name} font-black tracking-tight text-slate-900 dark:text-white`;

  const tagClass = variant === 'sidebar'
    ? `${s.tag} text-slate-400 font-bold uppercase tracking-wider`
    : `${s.tag} text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider`;

  return (
    <div className="flex items-center gap-3 min-w-0">
      <img src="/brand/logo.svg" alt="" className={`${s.img} rounded-2xl shadow-lg shrink-0`} />
      <div className="min-w-0">
        <span className={`${nameClass} truncate`}>{name}</span>
        {showTagline && (
          <span className={`${tagClass} block truncate`}>{short || tagline}</span>
        )}
      </div>
    </div>
  );
}
