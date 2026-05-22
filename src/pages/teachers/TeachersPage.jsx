import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive, Columns3, Download, Eye, Filter, GraduationCap, MoreHorizontal, RefreshCw, Upload, UserPlus,
} from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import StatsGrid from '../../components/enterprise/StatsGrid';
import DataTable from '../../components/enterprise/DataTable';
import VirtualizedDataTable from '../../components/enterprise/VirtualizedDataTable';
import Drawer from '../../components/enterprise/Drawer';
import { teachersApi } from '../../api/services';
import { useCatalog } from '../../hooks/useCatalog';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { parseSpreadsheetFile } from '../../utils/spreadsheetParse';

const STATUS_COLORS = { active: 'green', archived: 'amber', suspended: 'red' };

export default function TeachersPage() {
  const navigate = useNavigate();
  const { subjects } = useCatalog();

  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState({ rows: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [drawer, setDrawer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [actionOpen, setActionOpen] = useState(null);
  const [showColumns, setShowColumns] = useState(false);
  const [filterName, setFilterName] = useState('');

  const queryParams = useMemo(
    () => ({ page, limit: 20, search, sort, order, ...filters }),
    [page, search, sort, order, filters]
  );

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([teachersApi.stats(), teachersApi.list(queryParams), teachersApi.departments()])
      .then(([sRes, lRes, dRes]) => {
        setStats(sRes.data.data);
        const d = lRes.data;
        setData({ rows: d.data, total: d.meta.total, page: d.meta.page, totalPages: d.meta.totalPages });
        setDepartments(dRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [queryParams]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, filters]);

  const allColumns = useMemo(() => [
    {
      key: 'name',
      label: 'Teacher',
      sortable: true,
      render: (r) => (
        <button type="button" className="text-left font-bold text-slate-900 hover:text-emerald-600" onClick={() => navigate(`/school-admin/teachers/${r.id}`)}>
          {r.first_name} {r.last_name}
        </button>
      ),
    },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'employment_type', label: 'Type' },
    { key: 'assigned_sections', label: 'Sections' },
    { key: 'subject_names', label: 'Subjects' },
    {
      key: 'leave_status',
      label: 'Leave',
      render: (r) => (r.leave_status === 'on_leave' ? <Badge color="amber">On leave</Badge> : '—'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge color={STATUS_COLORS[r.status] || 'green'}>{r.status}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="relative flex justify-end gap-1">
          <button type="button" className="p-2 rounded-lg hover:bg-slate-100" onClick={async () => {
            const res = await teachersApi.getOne(r.id);
            setDrawer(res.data.data);
          }} title="Quick view"><Eye size={16} /></button>
          <button type="button" className="p-2 rounded-lg hover:bg-slate-100" onClick={() => setActionOpen(actionOpen === r.id ? null : r.id)}><MoreHorizontal size={16} /></button>
          {actionOpen === r.id && (
            <div className="absolute right-0 top-9 z-20 bg-white border border-slate-100 rounded-xl shadow-lg py-1 min-w-[140px]">
              <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50" onClick={() => navigate(`/school-admin/teachers/${r.id}`)}>Full profile</button>
              <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50" onClick={() => navigate(`/school-admin/teachers/${r.id}?tab=hr`)}>HR & payroll</button>
              <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50" onClick={() => teachersApi.archive(r.id).then(load)}>Archive</button>
              {r.status === 'archived' && (
                <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50" onClick={() => teachersApi.restore(r.id).then(load)}>Restore</button>
              )}
            </div>
          )}
        </div>
      ),
    },
  ], [actionOpen, navigate]);

  const { toggleColumn, toggleSticky, stickyKeys, filterColumns, savedFilters, saveFilter, deleteFilter } = useTablePreferences('teachers-table', allColumns, ['name']);
  const columns = filterColumns(allColumns);

  const statCards = stats ? [
    { label: 'Total', value: stats.total },
    { label: 'Active', value: stats.active },
    { label: 'Archived', value: stats.archived },
    { label: 'On leave', value: stats.on_leave },
    { label: 'Full-time', value: stats.full_time },
  ] : [];

  const handleSort = (key) => {
    if (sort === key) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSort(key); setOrder('asc'); }
  };

  const handleBulk = async (action) => {
    if (!selected.length) return;
    await teachersApi.bulk({ ids: selected, action });
    setSelected([]);
    load();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      ['licence_expiry_date', 'hire_date', 'date_of_birth'].forEach((k) => {
        if (!payload[k]) delete payload[k];
      });
      await teachersApi.create(payload);
      setShowModal(false);
      setForm({});
      load();
    } catch (err) {
      const details = err.response?.data?.details;
      setError(
        details?.length
          ? details.map((d) => `${d.field}: ${d.message}`).join('; ')
          : (err.response?.data?.message || 'Failed to create teacher')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    const res = await teachersApi.exportCsv({ ...filters, search });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teachers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseSpreadsheetFile(file);
      const res = await teachersApi.importRows(rows);
      setImportResult(res.data.data);
      load();
    } catch (err) {
      setImportResult({ imported: 0, failed: [{ row: 0, message: err.message }] });
    }
    e.target.value = '';
  };

  const field = (k) => ({ value: form[k] || '', onChange: (ev) => setForm((f) => ({ ...f, [k]: ev.target.value })) });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2"><GraduationCap className="text-emerald-600" /> Teachers</h1>
            <p className="text-slate-500 text-sm mt-1">Enterprise faculty registry & workload</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={load}><RefreshCw size={16} /> Refresh</Button>
            <Button variant="secondary" onClick={handleExport}><Download size={16} /> Export</Button>
            <label className="inline-flex">
              <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImport} />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
                <Upload size={16} /> Import CSV/Excel
              </span>
            </label>
            <Button onClick={() => setShowModal(true)}><UserPlus size={16} /> Add Teacher</Button>
          </div>
        </header>

        {statCards.length > 0 && <StatsGrid stats={statCards} />}

        <section className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <SearchBar value={search} onChange={setSearch} placeholder="Search name, email, department..." className="flex-1" />
            <Select placeholder="Status" value={filters.status || ''} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))} options={[{ value: 'active', label: 'Active' }, { value: 'archived', label: 'Archived' }, { value: 'suspended', label: 'Suspended' }]} />
            {filters.status === 'archived' && (
              <p className="text-xs text-amber-700 font-medium lg:col-span-4">Showing archived teachers only. Archive hides them from daily lists; use Restore on a profile to reactivate.</p>
            )}
            <Select placeholder="Department" value={filters.department || ''} onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value || undefined }))} options={departments.map((d) => ({ value: d, label: d }))} />
            <Select placeholder="Employment" value={filters.employment_type || ''} onChange={(e) => setFilters((f) => ({ ...f, employment_type: e.target.value || undefined }))} options={[{ value: 'full_time', label: 'Full-time' }, { value: 'part_time', label: 'Part-time' }, { value: 'contract', label: 'Contract' }]} />
            <Select placeholder="Leave" value={filters.leave_status || ''} onChange={(e) => setFilters((f) => ({ ...f, leave_status: e.target.value || undefined }))} options={[{ value: 'on_leave', label: 'On leave' }, { value: 'active', label: 'Available' }]} />
            <Select placeholder="Subject" value={filters.subject_id || ''} onChange={(e) => setFilters((f) => ({ ...f, subject_id: e.target.value || undefined }))} options={subjects.map((s) => ({ value: s.id, label: s.name }))} />
            <Button variant="secondary" type="button" onClick={() => setShowColumns((v) => !v)}><Columns3 size={16} /></Button>
          </div>
          {showColumns && (
            <div className="flex flex-wrap gap-3 p-3 bg-slate-50 rounded-xl">
              {allColumns.filter((c) => c.key !== 'actions').map((c) => (
                <label key={c.key} className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={columns.some((col) => col.key === c.key)} onChange={() => toggleColumn(c.key)} />
                  {c.label}
                  <input type="checkbox" title="Pin column" checked={stickyKeys.includes(c.key)} onChange={() => toggleSticky(c.key)} className="ml-1 accent-amber-500" />
                  <span className="text-[10px] text-slate-400">pin</span>
                </label>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Input value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="Filter preset name" />
            <Button size="sm" variant="secondary" type="button" onClick={() => filterName && saveFilter(filterName, filters)}><Filter size={14} /> Save</Button>
            {savedFilters.map((sf) => (
              <span key={sf.name} className="inline-flex items-center gap-1">
                <button type="button" className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg" onClick={() => setFilters(sf.filters)}>{sf.name}</button>
                <button type="button" className="text-xs text-rose-500 px-1" onClick={() => deleteFilter(sf.name)}>×</button>
              </span>
            ))}
          </div>
          {importResult && (
            <p className="text-sm font-medium text-emerald-700">
              Imported {importResult.imported}. {importResult.failed?.length ? `${importResult.failed.length} row(s) failed.` : ''}
            </p>
          )}
          {selected.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-sm font-bold text-emerald-800">{selected.length} selected</span>
              <Button size="sm" variant="secondary" onClick={() => handleBulk('archive')}><Archive size={14} /> Archive</Button>
              <Button size="sm" variant="secondary" onClick={() => handleBulk('restore')}>Restore</Button>
              <Button size="sm" variant="secondary" onClick={() => handleBulk('activate')}>Activate</Button>
              <Button size="sm" variant="secondary" onClick={() => setSelected([])}>Clear</Button>
            </div>
          )}
          {data.rows.length > 40 ? (
            <VirtualizedDataTable
              columns={columns}
              rows={data.rows}
              loading={loading}
              selectedIds={selected}
              onSelectAll={(checked) => setSelected(checked ? data.rows.map((r) => r.id) : [])}
              onSelectRow={(id, checked) => setSelected((s) => (checked ? [...s, id] : s.filter((x) => x !== id)))}
              sortKey={sort}
              sortOrder={order}
              onSort={handleSort}
              stickyColumnKeys={stickyKeys}
            />
          ) : (
            <DataTable
              columns={columns}
              rows={data.rows}
              loading={loading}
              selectedIds={selected}
              onSelectAll={(checked) => setSelected(checked ? data.rows.map((r) => r.id) : [])}
              onSelectRow={(id, checked) => setSelected((s) => (checked ? [...s, id] : s.filter((x) => x !== id)))}
              sortKey={sort}
              sortOrder={order}
              onSort={handleSort}
              stickyColumnKeys={stickyKeys}
            />
          )}
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </section>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer ? `${drawer.first_name} ${drawer.last_name}` : ''} subtitle={drawer?.department}>
        {drawer && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">{drawer.email}</p>
            <p className="text-sm">Sections: {drawer.workload?.sections ?? drawer.assignments?.length ?? 0}</p>
            <p className="text-sm">Subjects: {drawer.workload?.subjects ?? 0}</p>
            <Button className="w-full" onClick={() => navigate(`/school-admin/teachers/${drawer.id}`)}>Full profile</Button>
            <Button className="w-full" variant="secondary" onClick={() => navigate(`/school-admin/teachers/${drawer.id}?tab=hr`)}>HR & payroll</Button>
          </div>
        )}
      </Drawer>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Teacher">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" required {...field('first_name')} />
            <Input label="Last name" required {...field('last_name')} />
          </div>
          <Input label="Email" type="email" required {...field('email')} />
          <Input label="Staff ID" {...field('staff_id_number')} placeholder="Auto-generated if empty" />
          <Input label="Hire date" type="date" {...field('hire_date')} />
          <Input label="Phone" {...field('phone')} />
          <Input label="Department" {...field('department')} />
          <Input label="Teaching licence #" {...field('teaching_licence_number')} />
          <Input label="Licence expiry" type="date" {...field('licence_expiry_date')} />
          <Select label="Employment" value={form.employment_type || 'permanent'} onChange={(e) => setForm((f) => ({ ...f, employment_type: e.target.value }))} options={[
            { value: 'permanent', label: 'Permanent' }, { value: 'part_time', label: 'Part-time' },
            { value: 'contract', label: 'Contract' }, { value: 'substitute', label: 'Substitute' },
          ]} />
          {error && <p className="text-rose-500 text-sm">{error}</p>}
          <Button type="submit" loading={saving}>Create</Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
