import { ui } from '../../theme/tokens';

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className={ui.inputLabel}>{label}</label>}
      <input
        {...props}
        className={`${ui.input} ${error ? 'border-rose-400 dark:border-rose-600' : ''} ${className}`}
      />
      {error && <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>}
    </div>
  );
}
