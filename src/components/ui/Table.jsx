export function Table({ columns, data, loading, emptyMessage = 'No records found.' }) {
  if (loading) return <TableSkeleton cols={columns.length} />;
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3.5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400 text-sm">{emptyMessage}</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id ?? i} className="bg-white hover:bg-slate-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4 text-slate-700">
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function TableSkeleton({ cols }) {
  return (
    <div className="rounded-2xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 h-12 border-b border-slate-100" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-4 border-b border-slate-50 bg-white">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="h-4 bg-slate-100 rounded-lg animate-pulse flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
