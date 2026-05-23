import { ChevronDown, ChevronUp } from 'lucide-react';
import { ui } from '../../theme/tokens';
import { useI18n } from '../../context/I18nContext';

const stickyClass = 'sticky left-0 z-10 bg-white dark:bg-slate-900 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)]';
const stickyHeaderClass = 'sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)]';

export default function DataTable({
  columns,
  rows,
  loading,
  emptyMessage,
  selectedIds = [],
  onSelectAll,
  onSelectRow,
  sortKey,
  sortOrder,
  onSort,
  stickyColumnKeys = [],
}) {
  const { t } = useI18n();
  const empty = emptyMessage ?? t('common.noData');
  const isSticky = (key) => stickyColumnKeys.includes(key);

  if (loading) {
    return (
      <div className={`rounded-2xl border overflow-hidden ${ui.card}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 dark:border-slate-800 dark:border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));

  return (
    <div className={`overflow-x-auto rounded-2xl border ${ui.card}`}>
      <table className={`${ui.table} border-separate border-spacing-0`}>
        <thead>
          <tr className={`${ui.tableHead} border-b border-slate-100 dark:border-slate-800 dark:border-slate-800 dark:border-slate-800`}>
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
                  <button type="button" className="inline-flex items-center gap-1 hover:text-slate-700 dark:text-slate-300" onClick={() => onSort(col.key)}>
                    {col.label}
                    {sortKey === col.key && (sortOrder === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                  </button>
                ) : col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={ui.tableRow}>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onSelectRow ? 1 : 0)} className={`px-4 py-16 text-center ${ui.muted}`}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className={`${ui.tableRowHover} transition-colors group`}>
                {onSelectRow && (
                  <td className={`px-4 py-3 ${stickyClass} group-hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:bg-slate-800 dark:group-hover:bg-slate-800`}>
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
                    className={`px-4 py-3 text-slate-700 dark:text-slate-300 ${isSticky(col.key) ? `${stickyClass} group-hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:bg-slate-800 dark:group-hover:bg-slate-800` : ''}`}
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
