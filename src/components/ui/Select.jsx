import { ui } from '../../theme/tokens';
import { useI18n } from '../../context/I18nContext';

export default function Select({ label, options = [], placeholder, className = '', ...props }) {
  const { t } = useI18n();
  const ph = placeholder ?? t('common.select');
  return (
    <div className={className}>
      {label && <label className={`block ${ui.inputLabel} mb-1.5`}>{label}</label>}
      <select className={`${ui.select} w-full px-4 py-2.5 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30`} {...props}>
        <option value="">{ph}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
