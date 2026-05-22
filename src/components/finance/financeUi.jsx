import { Loader2, Plus } from 'lucide-react';

export const ETB = new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 2 });

export const unwrap = (res) => res.data?.data ?? res.data;

export const ACCENTS = {
  emerald: {
    label: 'text-emerald-600',
    tabActive: 'bg-emerald-600 text-white',
    btn: 'bg-emerald-600 text-white',
    icon: 'text-emerald-600',
    amount: 'text-emerald-700',
    hover: 'hover:bg-emerald-50',
    spin: 'text-emerald-600',
  },
  teal: {
    label: 'text-teal-600',
    tabActive: 'bg-amber-500 text-teal-950',
    btn: 'bg-amber-500 text-teal-950',
    icon: 'text-teal-600',
    amount: 'text-teal-700',
    hover: 'hover:bg-amber-50',
    spin: 'text-amber-500',
  },
};

export function StatCard({ label, value, icon: Icon, accent = 'emerald' }) {
  const a = ACCENTS[accent] || ACCENTS.emerald;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <Icon className={`${a.icon} mb-2`} size={22} />
      <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}

export function Panel({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <p className="font-black text-slate-900 mb-3">{title}</p>
      {children}
    </div>
  );
}

export function SetupForm({ title, icon: Icon, children, onSubmit, saving, accent = 'emerald' }) {
  const a = ACCENTS[accent] || ACCENTS.emerald;
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={a.icon} size={18} />
        <p className="font-black text-slate-900">{title}</p>
      </div>
      {children}
      <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">
        {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Save
      </button>
    </form>
  );
}

export function Field({ label, value, onChange, as, type, placeholder, children }) {
  const cls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium';
  return (
    <label className="block min-w-[140px] flex-1">
      <span className="text-[10px] font-bold uppercase text-slate-400">{label}</span>
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
      ok ? 'bg-emerald-50 text-emerald-700' : partial ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
    }`}>
      {status}
    </span>
  );
}
