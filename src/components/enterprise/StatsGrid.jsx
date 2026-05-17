export default function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{s.value ?? '—'}</p>
          {s.hint && <p className="text-xs text-slate-500 mt-0.5">{s.hint}</p>}
        </div>
      ))}
    </div>
  );
}
