import { ui } from '../../theme/tokens';

export default function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`${ui.card} p-4 shadow-sm`}>
          <p className={ui.mutedXs}>{s.label}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 dark:text-slate-100 mt-1">{s.value ?? '—'}</p>
          {s.hint && <p className={`text-xs ${ui.muted} mt-0.5`}>{s.hint}</p>}
        </div>
      ))}
    </div>
  );
}
