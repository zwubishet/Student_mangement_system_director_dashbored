export default function Timeline({ items = [], empty = 'No activity yet.' }) {
  if (!items.length) {
    return <p className="text-sm text-slate-400 text-center py-8">{empty}</p>;
  }
  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={item.id ?? i} className="flex gap-3">
          <span className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0" />
          <div className="flex-1 pb-4 border-b border-slate-50 last:border-0">
            <p className="text-sm font-bold text-slate-800">{item.action}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {item.first_name ? `${item.first_name} ${item.last_name || ''} · ` : ''}
              {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
