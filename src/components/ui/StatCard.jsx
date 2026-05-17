export default function StatCard({ label, value, icon, loading }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="w-12 h-12 bg-slate-50 group-hover:bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 transition-colors">
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      {loading
        ? <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
        : <h3 className="text-3xl font-black text-slate-900 leading-none">{value ?? '—'}</h3>
      }
    </div>
  );
}
