const STYLES = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  suspended: 'bg-rose-50 text-rose-700 border-rose-100',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  trial_expired: 'bg-orange-50 text-orange-700 border-orange-100',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function PlatformStatusBadge({ status }) {
  const key = (status || 'inactive').toLowerCase();
  return (
    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${STYLES[key] || STYLES.inactive}`}>
      {status || '—'}
    </span>
  );
}
