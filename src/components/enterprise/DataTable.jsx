import { ChevronDown, ChevronUp } from 'lucide-react';

const stickyClass = 'sticky left-0 z-10 bg-white shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)]';
const stickyHeaderClass = 'sticky left-0 z-20 bg-slate-50 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)]';

export default function DataTable({
  columns,
  rows,
  loading,
  emptyMessage = 'No records found.',
  selectedIds = [],
  onSelectAll,
  onSelectRow,
  sortKey,
  sortOrder,
  onSort,
  stickyColumnKeys = [],
}) {
  const isSticky = (key) => stickyColumnKeys.includes(key);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-50 border-b border-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {onSelectRow && (
              <th className={`w-10 px-4 py-3 ${stickyHeaderClass}`}>
                <input type="checkbox" checked={allSelected} onChange={(e) => onSelectAll?.(e.target.checked)} />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap ${
                  isSticky(col.key) ? stickyHeaderClass : ''
                }`}
              >
                {col.sortable && onSort ? (
                  <button type="button" className="inline-flex items-center gap-1 hover:text-slate-700" onClick={() => onSort(col.key)}>
                    {col.label}
                    {sortKey === col.key && (sortOrder === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                  </button>
                ) : col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onSelectRow ? 1 : 0)} className="px-4 py-16 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                {onSelectRow && (
                  <td className={`px-4 py-3 ${stickyClass} group-hover:bg-slate-50`}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={(e) => onSelectRow(row.id, e.target.checked)}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-slate-700 ${isSticky(col.key) ? `${stickyClass} group-hover:bg-slate-50` : ''}`}
                  >
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
