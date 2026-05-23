import { useCallback, useEffect, useState } from 'react';
import { Edit3, Users, UserPlus } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import DataTable from '../../components/enterprise/DataTable';
import ListFilterCard from '../../components/ui/ListFilterCard';
import ParentManageModal from '../../components/parents/ParentManageModal';
import { parentsApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

export default function ParentsPage() {
  const { toast } = useToast();
  const [data, setData] = useState({ rows: [], total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [manageId, setManageId] = useState(null);
  const [form, setForm] = useState({ password: '' });
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
          <span className="font-bold text-slate-900 dark:text-slate-100">{r.first_name} {r.last_name}</span>
          {r.record_type === 'guardian' && (
            <span className="ml-2 text-[10px] font-black uppercase text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">Contact only</span>
          )}
          {r.record_type === 'portal' && (
            <span className="ml-2 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">Portal login</span>
          )}
        </div>
      ),
    },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'relationship', label: 'Relationship' },
    { key: 'linked_students', label: 'Students', render: (r) => <span className="font-bold text-emerald-600">{r.linked_students ?? 0}</span> },
    {
      key: 'actions',
      label: '',
      render: (r) => r.record_type === 'portal' ? (
        <Button size="sm" variant="secondary" onClick={() => setManageId(r.id)}>
          <Edit3 size={14} /> Manage
        </Button>
      ) : (
        <span className={`text-xs ${ui.muted}`}>Add via student profile</span>
      ),
    },
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
      const res = await parentsApi.register({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        relationship: form.relationship || 'parent',
        student_ids: linkedStudents.map((s) => s.id),
      });
      const loginEmail = res.data.data?.login_email || form.email;
      toast(`Parent registered. Login: ${loginEmail}`, 'success');
      setShowModal(false);
      setForm({ password: '' });
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
        <header className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Users className="text-emerald-600" /> Parents
            </h1>
            <p className={`${ui.muted} text-sm mt-1 max-w-xl`}>
              Portal parents sign in with email and password. Guardian contacts (no login) appear from student profiles — create a portal account to link them.
            </p>
          </div>
          <Button onClick={() => { setShowModal(true); setError(''); setForm({ password: '' }); }}>
            <UserPlus size={16} /> Register parent
          </Button>
        </header>

        <ListFilterCard>
          <SearchBar value={search} onChange={setSearch} placeholder="Search parents by name, phone, email..." className="max-w-md" />
          <DataTable columns={columns} rows={data.rows} loading={loading} emptyMessage="No parent accounts yet." />
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </ListFilterCard>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Register parent portal account" size="lg">
        <form onSubmit={handleRegister} className="space-y-5">
          <div className={ui.alertInfo}>
            <p className="text-sm">Parents log in with <strong>email + password</strong>. Phone must be unique.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" required {...field('first_name')} />
            <Input label="Last name" required {...field('last_name')} />
          </div>
          <Input label="Phone" required {...field('phone')} />
          <Input label="Login email" type="email" required {...field('email')} />
          <Input label="Password" type="password" required minLength={6} {...field('password')} placeholder="Min. 6 characters" />
          <Input label="Relationship" placeholder="parent, mother, father..." {...field('relationship')} />

          <div className={`${ui.panel} space-y-3`}>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Link students (optional)</p>
            <input
              className={ui.input}
              placeholder="Search student by name or admission #..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            {studentHits.length > 0 && (
              <ul className={`${ui.card} divide-y max-h-36 overflow-y-auto`}>
                {studentHits.map((s) => (
                  <li key={s.id}>
                    <button type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/40" onClick={() => addStudent(s)}>
                      {s.first_name} {s.last_name} · {s.admission_number} · {s.grade_name} {s.section_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {linkedStudents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {linkedStudents.map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs font-bold">
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

      <ParentManageModal
        open={!!manageId}
        parentId={manageId}
        onClose={() => setManageId(null)}
        onSaved={load}
      />
    </AdminLayout>
  );
}
