import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive, Columns3, Download, Eye, Filter, MoreHorizontal, RefreshCw, Upload, UserPlus, Users,
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
import Drawer from '../../components/enterprise/Drawer';
import { studentsApi } from '../../api/services';
import { useCatalog } from '../../hooks/useCatalog';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { parseSpreadsheetFile } from '../../utils/spreadsheetParse';

const STATUS_COLORS = { active: 'green', archived: 'amber', suspended: 'red', deleted: 'red' };

export default function StudentsPage() {
  const navigate = useNavigate();
  const { years, grades, loading: catalogLoading, error: catalogError, loadCatalog, loadSections } = useCatalog();

  const [stats, setStats] = useState(null);
  const [data, setData] = useState({ rows: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [drawerStudent, setDrawerStudent] = useState(null);
  const [showEnroll, setShowEnroll] = useState(false);
  const [form, setForm] = useState({});
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [actionOpen, setActionOpen] = useState(null);
  const [filterSections, setFilterSections] = useState([]);
  const [showColumns, setShowColumns] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [filterName, setFilterName] = useState('');

  const queryParams = useMemo(
    () => ({ page, limit: 20, search, sort, order, ...filters }),
    [page, search, sort, order, filters]
  );

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([studentsApi.stats(), studentsApi.list(queryParams)])
      .then(([statsRes, listRes]) => {
        setStats(statsRes.data.data);
        const d = listRes.data;
        setData({ rows: d.data, total: d.meta.total, page: d.meta.page, totalPages: d.meta.totalPages });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [queryParams]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, filters]);
  useEffect(() => {
    if (!form.grade_id) {
      setSections([]);
      return undefined;
    }
    let cancelled = false;
    loadSections(form.grade_id).then((rows) => {
      if (!cancelled) setSections(rows);
    });
    return () => { cancelled = true; };
  }, [form.grade_id, loadSections]);

  useEffect(() => {
    if (!filters.grade_id) {
      setFilterSections([]);
      return undefined;
    }
    let cancelled = false;
    loadSections(filters.grade_id).then((rows) => {
      if (!cancelled) setFilterSections(rows);
    });
    return () => { cancelled = true; };
  }, [filters.grade_id, loadSections]);

  const openQuickView = async (id) => {
    const res = await studentsApi.getOne(id);
    setDrawerStudent(res.data.data);
  };

  const allColumns = useMemo(() => [
    {
      key: 'name',
      label: 'Student',
      sortable: true,
      render: (r) => (
        <button type="button" className="text-left font-bold text-slate-900 hover:text-emerald-600" onClick={() => navigate(`/school-admin/students/${r.id}`)}>
          {r.first_name} {r.last_name}
        </button>
      ),
    },
    { key: 'admission_number', label: 'Admission #', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'grade_name', label: 'Grade' },
    { key: 'section_name', label: 'Section' },
    {
      key: 'lifecycle_status',
      label: 'Status',
      render: (r) => <Badge color={STATUS_COLORS[r.lifecycle_status] || 'green'}>{r.lifecycle_status || r.account_status}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="relative flex justify-end gap-1">
          <button type="button" className="p-2 rounded-lg hover:bg-slate-100" onClick={() => openQuickView(r.id)} title="Quick view"><Eye size={16} /></button>
          <button type="button" className="p-2 rounded-lg hover:bg-slate-100" onClick={() => setActionOpen(actionOpen === r.id ? null : r.id)}><MoreHorizontal size={16} /></button>
          {actionOpen === r.id && (
            <div className="absolute right-0 top-9 z-20 bg-white border border-slate-100 rounded-xl shadow-lg py-1 min-w-[140px]">
              <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50" onClick={() => navigate(`/school-admin/students/${r.id}`)}>Full profile</button>
              <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50" onClick={() => studentsApi.archive(r.id).then(load)}>Archive</button>
            </div>
          )}
        </div>
      ),
    },
  ], [actionOpen, navigate]);

  const { toggleColumn, filterColumns, savedFilters, saveFilter, deleteFilter } = useTablePreferences('students-table', allColumns);
  const columns = filterColumns(allColumns);

  const statCards = stats ? [
    { label: 'Total', value: stats.total },
    { label: 'Active', value: stats.active },
    { label: 'Archived', value: stats.archived },
    { label: 'Male', value: stats.male },
    { label: 'Female', value: stats.female },
    { label: 'New this month', value: stats.new_this_month },
  ] : [];

  const handleSort = (key) => {
    if (sort === key) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSort(key); setOrder('asc'); }
  };

  const handleBulk = async (action) => {
    if (!selected.length) return;
    await studentsApi.bulk({ ids: selected, action });
    setSelected([]);
    load();
  };

  const handleExport = async () => {
    const res = await studentsApi.exportCsv({ ...filters, search });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await studentsApi.create(form);
      setShowEnroll(false);
      setForm({});
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll student');
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseSpreadsheetFile(file);
      const res = await studentsApi.importRows(rows);
      setImportResult(res.data.data);
      load();
    } catch (err) {
      setImportResult({ imported: 0, failed: [{ row: 0, message: err.message }] });
    }
    e.target.value = '';
  };

  const field = (key) => ({ value: form[key] || '', onChange: (ev) => setForm((f) => ({ ...f, [key]: ev.target.value })) });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="text-emerald-600" size={28} /> Students
            </h1>
            <p className="text-slate-500 text-sm mt-1">Enterprise student registry & enrollment</p>
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
            <Button onClick={() => { loadCatalog(); setShowEnroll(true); }}><UserPlus size={16} /> Enroll Student</Button>
          </div>
        </header>

        {statCards.length > 0 && <StatsGrid stats={statCards} />}

        <section className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <SearchBar value={search} onChange={setSearch} placeholder="Search name, admission #, email..." className="flex-1" />
            <Select label="" value={filters.status || ''} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))} options={[{ value: 'active', label: 'Active' }, { value: 'archived', label: 'Archived' }, { value: 'suspended', label: 'Suspended' }]} placeholder="Status" />
            <Select label="" value={filters.gender || ''} onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value || undefined }))} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} placeholder="Gender" />
            <Select label="" value={filters.academic_year_id || ''} onChange={(e) => setFilters((f) => ({ ...f, academic_year_id: e.target.value || undefined }))} options={years.map((y) => ({ value: y.id, label: y.name }))} placeholder="Academic year" />
            <Select label="" value={filters.grade_id || ''} onChange={(e) => setFilters((f) => ({ ...f, grade_id: e.target.value || undefined, section_id: undefined }))} options={grades.map((g) => ({ value: g.id, label: g.name }))} placeholder="Grade" />
            <Select label="" value={filters.section_id || ''} onChange={(e) => setFilters((f) => ({ ...f, section_id: e.target.value || undefined }))} options={filterSections.map((s) => ({ value: s.id, label: s.name }))} placeholder="Section" disabled={!filters.grade_id} />
            <Button variant="secondary" type="button" onClick={() => setShowColumns((v) => !v)}><Columns3 size={16} /></Button>
          </div>
          {showColumns && (
            <div className="flex flex-wrap gap-3 p-3 bg-slate-50 rounded-xl">
              {allColumns.filter((c) => c.key !== 'actions').map((c) => (
                <label key={c.key} className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={columns.some((col) => col.key === c.key)} onChange={() => toggleColumn(c.key)} />
                  {c.label}
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
              <Button size="sm" variant="secondary" onClick={() => setSelected([])}>Clear</Button>
            </div>
          )}

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
          />
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </section>
      </div>

      <Drawer open={!!drawerStudent} onClose={() => setDrawerStudent(null)} title={drawerStudent ? `${drawerStudent.first_name} ${drawerStudent.last_name}` : ''} subtitle={drawerStudent?.admission_number}>
        {drawerStudent && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{drawerStudent.email}</p>
            <Button className="w-full" onClick={() => navigate(`/school-admin/students/${drawerStudent.id}`)}>Open full profile</Button>
          </div>
        )}
      </Drawer>

      <Modal open={showEnroll} onClose={() => setShowEnroll(false)} title="Enroll New Student">
        <form onSubmit={handleEnroll} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {catalogError && (
            <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-xl">
              Catalog issue: {catalogError}. <button type="button" className="underline font-bold" onClick={loadCatalog}>Retry</button>
            </p>
          )}
          {!years.length && !catalogLoading && (
            <p className="text-sm text-amber-700">No academic years — add one under Academic Cycle first.</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" required {...field('first_name')} />
            <Input label="Last Name" required {...field('last_name')} />
          </div>
          <Input label="Email" type="email" required {...field('email')} />
          <Input label="Admission Number" required {...field('admission_number')} />
          <Select label="Academic Year" required disabled={catalogLoading} value={form.academic_year_id || ''} onChange={(e) => setForm((f) => ({ ...f, academic_year_id: e.target.value }))} options={years.map((y) => ({ value: y.id, label: y.name }))} />
          <Select label="Grade" required value={form.grade_id || ''} onChange={(e) => setForm((f) => ({ ...f, grade_id: e.target.value, section_id: '' }))} options={grades.map((g) => ({ value: g.id, label: g.name }))} />
          <Select
            label="Section"
            required
            disabled={!form.grade_id}
            value={form.section_id || ''}
            onChange={(e) => setForm((f) => ({ ...f, section_id: e.target.value }))}
            options={sections.map((s) => ({ value: s.id, label: s.name }))}
            placeholder={form.grade_id && !sections.length ? 'No sections — create a class for this grade first' : 'Select section'}
          />
          <Input label="Emergency contact" {...field('emergency_contact_name')} />
          <Input label="Emergency phone" {...field('emergency_contact_phone')} />
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>Enroll</Button>
            <Button type="button" variant="secondary" onClick={() => setShowEnroll(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
