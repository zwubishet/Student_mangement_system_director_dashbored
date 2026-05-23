import { ui } from '../../theme/tokens';

export default function StatCard({ label, value, icon, loading }) {
  return (
    <div className={`${ui.card} p-6 rounded-3xl hover:shadow-lg transition-all duration-300 group`}>
      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 rounded-2xl flex items-center justify-center mb-4 transition-colors">
        {icon}
      </div>
      <p className={ui.mutedXs}>{label}</p>
      {loading
        ? <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse mt-1" />
        : <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 dark:text-slate-100 leading-none mt-1">{value ?? '—'}</h3>
      }
    </div>
  );
}
