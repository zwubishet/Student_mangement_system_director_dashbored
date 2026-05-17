import { useCallback, useEffect, useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import DataTable from '../../components/enterprise/DataTable';
import { parentsApi } from '../../api/services';

export default function ParentsPage() {
  const [data, setData] = useState({ rows: [], total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    parentsApi.list({ page, limit: 20, search: search || undefined })
      .then((r) => {
        const d = r.data;
        setData({ rows: d.data, total: d.meta.total, page: d.meta.page, totalPages: d.meta.totalPages });
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search]);

  const columns = [
    { key: 'name', label: 'Parent', render: (r) => <span className="font-bold">{r.first_name} {r.last_name}</span> },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'relationship', label: 'Relationship' },
    { key: 'linked_students', label: 'Students' },
  ];

  const field = (k) => ({ value: form[k] || '', onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })) });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2"><Users className="text-emerald-600" /> Parents</h1>
            <p className="text-slate-500 text-sm">Parent accounts & student linkage (Ethiopian KG–12)</p>
          </div>
          <Button onClick={() => setShowModal(true)}><UserPlus size={16} /> Register parent</Button>
        </header>
        <section className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search parents..." className="max-w-md" />
          <DataTable columns={columns} rows={data.rows} loading={loading} emptyMessage="No parent accounts yet." />
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </section>
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Register parent">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const student_ids = (form.student_ids_raw || '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            await parentsApi.register({ ...form, student_ids });
            setShowModal(false);
            setForm({});
            load();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" required {...field('first_name')} />
            <Input label="Last name" required {...field('last_name')} />
          </div>
          <Input label="Phone" required {...field('phone')} />
          <Input label="Email" {...field('email')} />
          <Input label="Relationship" {...field('relationship')} />
          <Input label="Student IDs (comma-separated UUIDs)" {...field('student_ids_raw')} />
          <Button type="submit">Register</Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
