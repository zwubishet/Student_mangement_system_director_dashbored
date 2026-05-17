const colors = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  red: 'bg-rose-50 text-rose-700 border-rose-100',
  yellow: 'bg-amber-50 text-amber-700 border-amber-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  gray: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function Badge({ children, color = 'gray' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${colors[color]}`}>
      {children}
    </span>
  );
}
