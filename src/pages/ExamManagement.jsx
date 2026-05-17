import { useState, useEffect, useCallback } from 'react';
import { Plus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layouts/AdminLayout';
import { Table } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { examsApi } from '../api/services';
import { useCatalog } from '../hooks/useCatalog';

const COLUMNS = [
  { key: 'name', label: 'Exam Name' },
  { key: 'term_name', label: 'Term' },
  { key: 'academic_year', label: 'Academic Year' },
  { key: 'status', label: 'Status', render: (r) => <Badge color="blue">{r.status || 'DRAFT'}</Badge> },
  { key: 'weightage', label: 'Weight %' },
  { key: 'subject_count', label: 'Subjects' },
  { key: 'actions', label: '', render: (r) => <ViewBtn id={r.id} /> },
];

function ViewBtn({ id }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/school-admin/exams/${id}/results`)}
      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
    >
      <FileText size={13} /> Results
    </button>
  );
}

export default function ExamManagement() {
  const { years, loading: catalogLoading, loadTerms } = useCatalog();
  const [terms, setTerms] = useState([]);
  const [data, setData] = useState({ rows: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ weightage: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    examsApi.list({ page, limit: 20 })
      .then((res) => {
        const d = res.data;
        setData({ rows: d.data, total: d.meta.total, page: d.meta.page, totalPages: d.meta.totalPages });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!form.academic_year_id) { setTerms([]); return; }
    loadTerms(form.academic_year_id).then(setTerms);
  }, [form.academic_year_id, loadTerms]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await examsApi.create({
        name: form.name,
        term_id: form.term_id,
        weightage: Number(form.weightage) || 0,
      });
      setShowModal(false);
      setForm({ weightage: 0 });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setSaving(false);
    }
  };

  const field = (key) => ({
    value: form[key] ?? '',
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Exams & Grading</h1>
            <p className="text-slate-500 text-sm mt-0.5">{data.total} exams</p>
          </div>
          <Button onClick={() => setShowModal(true)}><Plus size={16} /> New Exam</Button>
        </div>
        <Table columns={COLUMNS} data={data.rows} loading={loading} emptyMessage="No exams found." />
        <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Exam">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Exam Name" required {...field('name')} />
          <Select
            label="Academic Year"
            required
            disabled={catalogLoading}
            value={form.academic_year_id || ''}
            onChange={(e) => setForm((f) => ({ ...f, academic_year_id: e.target.value, term_id: '' }))}
            options={years.map((y) => ({ value: y.id, label: y.name }))}
          />
          <Select
            label="Term"
            required
            disabled={!form.academic_year_id}
            value={form.term_id || ''}
            onChange={(e) => setForm((f) => ({ ...f, term_id: e.target.value }))}
            options={terms.map((t) => ({ value: t.id, label: t.name }))}
          />
          <Input label="Weightage (%)" type="number" min={0} max={100} {...field('weightage')} />
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>Create Exam</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
