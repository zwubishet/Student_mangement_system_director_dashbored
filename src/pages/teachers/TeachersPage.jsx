import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, GraduationCap, RefreshCw, Upload, UserPlus } from 'lucide-react';
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
import { teachersApi } from '../../api/services';
import { useCatalog } from '../../hooks/useCatalog';
import { parseSpreadsheetFile } from '../../utils/spreadsheetParse';

export default function TeachersPage() {
  const navigate = useNavigate();
  const { subjects } = useCatalog();

  const [stats, setStats] = useState(null);
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

  const queryParams = useMemo(() => ({ page, limit: 20, search, sort, order, ...filters }), [page, search, sort, order, filters]);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([teachersApi.stats(), teachersApi.list(queryParams)])
      .then(([sRes, lRes]) => {
        setStats(sRes.data.data);
        const d = lRes.data;
        setData({ rows: d.data, total: d.meta.total, page: d.meta.page, totalPages: d.meta.totalPages });
      })
      .finally(() => setLoading(false));
  }, [queryParams]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, filters]);

  const statCards = stats ? [
    { label: 'Total', value: stats.total },
    { label: 'Active', value: stats.active },
    { label: 'Archived', value: stats.archived },
    { label: 'On leave', value: stats.on_leave },
    { label: 'Full-time', value: stats.full_time },
  ] : [];

  const columns = [
    {
      key: 'name',
      label: 'Teacher',
      sortable: true,
      render: (r) => (
        <button type="button" className="font-bold text-slate-900 hover:text-emerald-600" onClick={() => navigate(`/school-admin/teachers/${r.id}`)}>
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
      key: 'status',
      label: 'Status',
      render: (r) => <Badge color={r.status === 'active' ? 'green' : 'amber'}>{r.status}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button type="button" className="p-2 hover:bg-slate-100 rounded-lg" onClick={async () => {
          const res = await teachersApi.getOne(r.id);
          setDrawer(res.data.data);
        }}><Eye size={16} /></button>
      ),
    },
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await teachersApi.create(form);
      setShowModal(false);
      setForm({});
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
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
            <p className="text-slate-500 text-sm">Faculty management & workload</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={load}><RefreshCw size={16} /></Button>
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
            <SearchBar value={search} onChange={setSearch} placeholder="Search teachers..." className="flex-1" />
            <Select placeholder="Department" value={filters.department || ''} onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value || undefined }))} options={[...new Set(data.rows.map((r) => r.department).filter(Boolean))].map((d) => ({ value: d, label: d }))} />
            <Select placeholder="Employment" value={filters.employment_type || ''} onChange={(e) => setFilters((f) => ({ ...f, employment_type: e.target.value || undefined }))} options={[{ value: 'full_time', label: 'Full-time' }, { value: 'part_time', label: 'Part-time' }, { value: 'contract', label: 'Contract' }]} />
            <Select placeholder="Subject" value={filters.subject_id || ''} onChange={(e) => setFilters((f) => ({ ...f, subject_id: e.target.value || undefined }))} options={subjects.map((s) => ({ value: s.id, label: s.name }))} />
          </div>
          {importResult && (
            <p className="text-sm font-medium text-emerald-700">
              Imported {importResult.imported}. {importResult.failed?.length ? `${importResult.failed.length} failed.` : ''}
            </p>
          )}
          <DataTable
            columns={columns}
            rows={data.rows}
            loading={loading}
            selectedIds={selected}
            onSelectAll={(c) => setSelected(c ? data.rows.map((r) => r.id) : [])}
            onSelectRow={(id, c) => setSelected((s) => (c ? [...s, id] : s.filter((x) => x !== id)))}
            sortKey={sort}
            sortOrder={order}
            onSort={(k) => { if (sort === k) setOrder(order === 'asc' ? 'desc' : 'asc'); else { setSort(k); setOrder('asc'); } }}
          />
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </section>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer ? `${drawer.first_name} ${drawer.last_name}` : ''} subtitle={drawer?.department}>
        {drawer && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">{drawer.email}</p>
            <p className="text-sm">Sections: {drawer.workload?.sections ?? drawer.assignments?.length}</p>
            <Button className="w-full" onClick={() => navigate(`/school-admin/teachers/${drawer.id}`)}>Full profile</Button>
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
          <Input label="Phone" {...field('phone')} />
          <Input label="Department" {...field('department')} />
          <Select label="Employment" value={form.employment_type || 'full_time'} onChange={(e) => setForm((f) => ({ ...f, employment_type: e.target.value }))} options={[{ value: 'full_time', label: 'Full-time' }, { value: 'part_time', label: 'Part-time' }]} />
          {error && <p className="text-rose-500 text-sm">{error}</p>}
          <Button type="submit" loading={saving}>Create</Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
