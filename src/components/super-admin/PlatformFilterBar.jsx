import { Search } from 'lucide-react';
import { usePlatformSchools } from './usePlatformSchools';

export default function PlatformFilterBar({
  search,
  onSearchChange,
  schoolId,
  onSchoolChange,
  extraSelect,
  placeholder = 'Search…',
  showSearch = true,
  showSchool = true,
}) {
  const { schools, loading } = usePlatformSchools();

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
      {showSearch && onSearchChange && (
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
      )}
      {showSchool && onSchoolChange && (
        <select
          value={schoolId}
          onChange={(e) => onSchoolChange(e.target.value)}
          disabled={loading}
          className="min-w-[180px] px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="">All schools</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}
      {extraSelect}
    </div>
  );
}
