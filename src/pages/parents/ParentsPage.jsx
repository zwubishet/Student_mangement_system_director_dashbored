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
  const [studentSearch, setStudentSearch] = useState('');
  const [studentHits, setStudentHits] = useState([]);
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    parentsApi.list({ page, limit: 20, search: search || undefined })
      .then((r) => {
        const d = r.data;
        setData({
          rows: d.data,
          total: d.meta.total,
          page: d.meta.page,
          totalPages: d.meta.totalPages,
        });
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search]);

  useEffect(() => {
    if (!studentSearch.trim()) { setStudentHits([]); return undefined; }
    const t = setTimeout(() => {
      parentsApi.searchStudents(studentSearch).then((r) => setStudentHits(r.data.data || [])).catch(() => setStudentHits([]));
    }, 300);
    return () => clearTimeout(t);
  }, [studentSearch]);

  const columns = [
    {
      key: 'name',
      label: 'Contact',
      render: (r) => (
        <div>
          <span className="font-bold">{r.first_name} {r.last_name}</span>
          {r.record_type === 'guardian' && (
            <span className="ml-2 text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Guardian</span>
          )}
          {r.record_type === 'portal' && (
            <span className="ml-2 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Portal login</span>
          )}
        </div>
      ),
    },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'relationship', label: 'Relationship' },
    { key: 'linked_students', label: 'Students', render: (r) => <span className="font-bold text-emerald-600">{r.linked_students ?? 0}</span> },
  ];

  const field = (k) => ({ value: form[k] || '', onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })) });

  const addStudent = (s) => {
    if (linkedStudents.some((x) => x.id === s.id)) return;
    setLinkedStudents((list) => [...list, s]);
    setStudentSearch('');
    setStudentHits([]);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const student_ids = linkedStudents.map((s) => s.id);
      await parentsApi.register({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        email: form.email || undefined,
        relationship: form.relationship || 'parent',
        student_ids,
      });
      setShowModal(false);
      setForm({});
      setLinkedStudents([]);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2"><Users className="text-emerald-600" /> Parents</h1>
            <p className="text-slate-500 text-sm">Portal parent accounts and guardian contacts from student profiles appear here</p>
          </div>
          <Button onClick={() => { setShowModal(true); setError(''); }}><UserPlus size={16} /> Register parent</Button>
        </header>
        <section className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search parents by name, phone, email..." className="max-w-md" />
          <DataTable columns={columns} rows={data.rows} loading={loading} emptyMessage="No parent accounts yet." />
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </section>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Register parent" size="lg">
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" required {...field('first_name')} />
            <Input label="Last name" required {...field('last_name')} />
          </div>
          <Input label="Phone" required {...field('phone')} />
          <Input label="Email" {...field('email')} />
          <Input label="Relationship" placeholder="parent, mother, father..." {...field('relationship')} />

          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-sm font-bold text-slate-700">Link students now (optional)</p>
            <input
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
              placeholder="Search student by name or admission #..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            {studentHits.length > 0 && (
              <ul className="bg-white border rounded-xl divide-y max-h-36 overflow-y-auto">
                {studentHits.map((s) => (
                  <li key={s.id}>
                    <button type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50" onClick={() => addStudent(s)}>
                      {s.first_name} {s.last_name} · {s.admission_number} · {s.grade_name} {s.section_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {linkedStudents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {linkedStudents.map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                    {s.first_name} {s.last_name}
                    <button type="button" onClick={() => setLinkedStudents((l) => l.filter((x) => x.id !== s.id))}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}
          <Button type="submit" loading={saving}>Register parent</Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
