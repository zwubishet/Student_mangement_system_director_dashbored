import { Search } from 'lucide-react';
import { useRef } from 'react';
import { ui } from '../../theme/tokens';
import { useI18n } from '../../context/I18nContext';

export default function SearchBar({ value, onChange, placeholder, className = '' }) {
  const { t } = useI18n();
  const ref = useRef();
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t('common.searchPlaceholder')}
        className={`${ui.input} pl-10`}
      />
    </div>
  );
}
