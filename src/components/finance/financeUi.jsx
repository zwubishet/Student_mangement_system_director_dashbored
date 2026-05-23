import { Loader2, Plus } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { ui } from '../../theme/tokens';

export const ETB = new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 2 });

export const unwrap = (res) => res.data?.data ?? res.data;

export const ACCENTS = {
  emerald: {
    label: 'text-emerald-600 dark:text-emerald-400',
    tabActive: 'bg-emerald-600 text-white dark:bg-emerald-600',
    btn: 'bg-emerald-600 text-white',
    icon: 'text-emerald-600 dark:text-emerald-400',
    amount: 'text-emerald-700 dark:text-emerald-300',
    hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
    spin: 'text-emerald-600',
  },
  teal: {
    label: 'text-teal-600 dark:text-amber-400',
    tabActive: 'bg-amber-500 text-teal-950',
    btn: 'bg-amber-500 text-teal-950',
    icon: 'text-teal-600 dark:text-teal-400',
    amount: 'text-teal-700 dark:text-teal-300',
    hover: 'hover:bg-amber-50 dark:hover:bg-amber-950/30',
    spin: 'text-amber-500',
  },
};

export function StatCard({ label, value, icon: Icon, accent = 'emerald' }) {
  const a = ACCENTS[accent] || ACCENTS.emerald;
  return (
    <div className={ui.panel}>
      <Icon className={`${a.icon} mb-2`} size={22} />
      <p className={ui.mutedXs}>{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 dark:text-slate-100 mt-1">{value}</p>
    </div>
  );
}

export function Panel({ title, children }) {
  return (
    <div className={ui.panel}>
      <p className={ui.panelTitle}>{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function SetupForm({ title, icon: Icon, children, onSubmit, saving, accent = 'emerald' }) {
  const { t } = useI18n();
  const a = ACCENTS[accent] || ACCENTS.emerald;
  return (
    <form onSubmit={onSubmit} className={`${ui.panel} space-y-3`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={a.icon} size={18} />
        <p className={ui.panelTitle}>{title}</p>
      </div>
      {children}
      <button type="submit" disabled={saving} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold ${ui.btnPrimary}`}>
        {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} {t('common.save')}
      </button>
    </form>
  );
}

export function Field({ label, value, onChange, as, type, placeholder, children }) {
  const cls = `${ui.select} font-medium mt-1 block w-full`;
  return (
    <label className="block min-w-[140px] flex-1">
      <span className={ui.fieldLabel}>{label}</span>
      {as === 'select' ? (
        <select className={cls} value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
      ) : (
        <input
          className={cls}
          type={type || 'text'}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export function StatusPill({ status }) {
  const ok = status === 'paid';
  const partial = status === 'partial';
  return (
    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
      ok ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
        : partial ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
    }`}>
      {status}
    </span>
  );
}
