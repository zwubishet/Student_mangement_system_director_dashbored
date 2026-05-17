import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Enterprise table with row virtualization for large datasets (500+ rows).
 */
export default function VirtualizedDataTable({
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
  rowHeight = 52,
  stickyColumnKeys = [],
}) {
  const isSticky = (key) => stickyColumnKeys.includes(key);
  const stickyCell = 'sticky left-0 z-10 bg-white shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)]';
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 8,
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-50 border-b border-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));
  const colSpan = columns.length + (onSelectRow ? 1 : 0);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {onSelectRow && (
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={(e) => onSelectAll?.(e.target.checked)} />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
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
        </table>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-16 text-center text-slate-400">{emptyMessage}</p>
      ) : (
        <div ref={parentRef} className="max-h-[min(70vh,560px)] overflow-auto border-t border-slate-100">
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
            {virtualizer.getVirtualItems().map((vRow) => {
              const row = rows[vRow.index];
              return (
                <div
                  key={row.id ?? vRow.index}
                  className="absolute left-0 w-full flex items-center border-b border-slate-50 hover:bg-slate-50/80 text-sm text-slate-700"
                  style={{ height: vRow.size, transform: `translateY(${vRow.start}px)` }}
                >
                  {onSelectRow && (
                    <div className="w-10 shrink-0 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={(e) => onSelectRow(row.id, e.target.checked)}
                      />
                    </div>
                  )}
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className={`flex-1 min-w-[100px] px-4 py-3 truncate ${isSticky(col.key) ? stickyCell : ''}`}
                      style={{ flex: col.flex || 1 }}
                    >
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
