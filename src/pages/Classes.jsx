import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';
import { Table } from '../components/ui/Table';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { classesApi } from '../api/services';
import { useCatalog } from '../hooks/useCatalog';

const COLUMNS = [
  { key: 'name', label: 'Class Name' },
  { key: 'section_name', label: 'Section' },
  { key: 'grade_name', label: 'Grade' },
  { key: 'academic_year', label: 'Academic Year' },
  { key: 'teacher', label: 'Lead Teacher', render: (r) => r.teacher_first_name ? `${r.teacher_first_name} ${r.teacher_last_name}` : '—' },
  { key: 'capacity', label: 'Capacity', render: (r) => `${r.enrolled_count ?? 0} / ${r.capacity}` },
];

export default function Classes() {
  const navigate = useNavigate();
  const { years, grades, loading: catalogLoading, error: catalogError, loadCatalog } = useCatalog();
  const [data, setData] = useState({ rows: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ useExistingGrade: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    classesApi.list({ page, limit: 20, search })
      .then((res) => {
        const d = res.data;
        setData({ rows: d.data, total: d.meta.total, page: d.meta.page, totalPages: d.meta.totalPages });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search]);

  const openCreate = () => {
    loadCatalog();
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        section_name: form.section_name,
        academic_year_id: form.academic_year_id,
        capacity: Number(form.capacity),
      };
      if (form.useExistingGrade && form.grade_id) {
        payload.grade_id = form.grade_id;
      } else if (form.grade_name?.trim()) {
        payload.grade_name = form.grade_name.trim();
      } else {
        throw new Error('Select a grade or enter a grade name');
      }
      await classesApi.create(payload);
      setShowModal(false);
      setForm({ useExistingGrade: true });
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create class');
    } finally {
      setSaving(false);
    }
  };

  const field = (key) => ({ value: form[key] || '', onChange: (ev) => setForm((f) => ({ ...f, [key]: ev.target.value })) });

  const tableColumns = [
    ...COLUMNS,
    {
      key: 'view',
      label: '',
      render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => navigate(`/school-admin/classes/${r.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Classes</h1>
            <p className="text-slate-500 text-sm mt-0.5">{data.total} classes</p>
          </div>
          <Button onClick={openCreate}><Plus size={16} /> New Class</Button>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search classes..." className="max-w-md" />
        <Table
          columns={tableColumns}
          data={data.rows}
          loading={loading}
          emptyMessage="No classes found."
        />
        <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Class">
        <form onSubmit={handleCreate} className="space-y-4">
          {catalogError && (
            <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-xl">
              {catalogError}. <button type="button" className="underline font-bold" onClick={loadCatalog}>Retry</button>
              {' '}or create an academic year under Academic Cycle first.
            </p>
          )}
          <Input label="Class Name" required placeholder="e.g. Grade 10 - Section A" {...field('name')} />
          <Input label="Section Name" required placeholder="e.g. A, B, Morning" {...field('section_name')} />
          <Select
            label="Academic Year"
            required
            disabled={catalogLoading}
            value={form.academic_year_id || ''}
            onChange={(e) => setForm((f) => ({ ...f, academic_year_id: e.target.value }))}
            options={years.map((y) => ({ value: y.id, label: y.name }))}
            placeholder={years.length ? 'Select academic year' : 'No years — add under Academic Cycle'}
          />
          <div className="flex gap-4 text-sm font-bold">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.useExistingGrade !== false}
                onChange={() => setForm((f) => ({ ...f, useExistingGrade: true }))}
              />
              Existing grade
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.useExistingGrade === false}
                onChange={() => setForm((f) => ({ ...f, useExistingGrade: false, grade_id: '' }))}
              />
              New grade name
            </label>
          </div>
          {form.useExistingGrade !== false ? (
            <Select
              label="Grade"
              required
              disabled={catalogLoading}
              value={form.grade_id || ''}
              onChange={(e) => setForm((f) => ({ ...f, grade_id: e.target.value }))}
              options={grades.map((g) => ({ value: g.id, label: g.name }))}
              placeholder={grades.length ? 'Select grade' : 'No grades yet — use new grade name'}
            />
          ) : (
            <Input label="Grade Name" required placeholder="e.g. Grade 10" {...field('grade_name')} />
          )}
          <Input label="Capacity" type="number" required min={1} {...field('capacity')} />
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} disabled={!years.length}>Create Class</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
