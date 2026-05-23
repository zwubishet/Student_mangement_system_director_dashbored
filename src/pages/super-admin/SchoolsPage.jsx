import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import { platformApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Loader2, Users, LayoutDashboard } from 'lucide-react';

const STATUS_OPTIONS = ['', 'pending', 'active', 'suspended', 'inactive', 'trial_expired'];

export default function SchoolsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { enterSchoolWorkspace } = useAuth();
  const [schools, setSchools] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [toggling, setToggling] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    school_name: '',
    slug: '',
    address: '',
    email: '',
    phone: '',
    city: '',
    region: '',
    plan: 'trial',
    admin_email: '',
    admin_password: '',
    first_name: '',
    last_name: '',
  });

  const load = useCallback(() => {
    setLoading(true);
    platformApi.listSchools({ search: search || undefined, status: status || undefined, limit: 100 })
      .then((res) => {
        setSchools(res.data.data || []);
        setTotal(res.data.meta?.total ?? res.data.data?.length ?? 0);
      })
      .catch(() => toast('Failed to load schools', 'error'))
      .finally(() => setLoading(false));
  }, [search, status, toast]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (school) => {
    const newStatus = school.status === 'active' ? 'suspended' : 'active';
    setToggling(school.id);
    try {
      await platformApi.updateSchoolStatus({ school_id: school.id, status: newStatus });
      toast(`${school.name} is now ${newStatus}`, 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setToggling(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await platformApi.createSchool(form);
      toast('School provisioned', 'success');
      setShowCreate(false);
      setForm({
        school_name: '', slug: '', address: '', email: '', phone: '', city: '', region: '',
        plan: 'trial', admin_email: '', admin_password: '', first_name: '', last_name: '',
      });
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Create failed', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">Schools</h1>
            <p className="text-slate-500 font-medium">{total} tenants on the platform</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-700"
          >
            <Plus size={16} /> Provision school
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or address…"
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-3 rounded-2xl border border-slate-200 font-bold text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt || 'all'} value={opt}>{opt || 'All statuses'}</option>
            ))}
          </select>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800 dark:divide-slate-800">
              {schools.map((school) => (
                <div key={school.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 hover:bg-slate-50/80">
                  <Link to={`/super-admin/schools/${school.id}`} className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center font-black text-violet-700 shrink-0">
                      {school.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 dark:text-slate-100 truncate">{school.name}</p>
                      <p className="text-sm text-slate-400 truncate">{school.school_address || '—'}</p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Users size={12} /> {school.user_count ?? 0} users · {school.student_count ?? 0} students
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full border bg-slate-50 text-slate-600 dark:text-slate-400">
                      {school.plan || 'standard'}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                      school.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {school.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        enterSchoolWorkspace(school.id, school.name);
                        navigate('/school-admin/dashboard');
                      }}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-black uppercase bg-violet-600 text-white hover:bg-violet-700"
                    >
                      <LayoutDashboard size={14} /> Manage
                    </button>
                    <button
                      type="button"
                      disabled={toggling === school.id}
                      onClick={() => handleToggle(school)}
                      className="px-4 py-2 rounded-xl text-xs font-black uppercase bg-slate-900 text-white hover:bg-slate-600 disabled:opacity-50"
                    >
                      {toggling === school.id ? '…' : school.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
              {schools.length === 0 && (
                <p className="py-16 text-center text-slate-400">No schools match your filters.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 mb-6">Provision new school</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                ['school_name', 'School name', 'text'],
                ['slug', 'Slug (optional)', 'text'],
                ['address', 'Address', 'text'],
                ['email', 'School email', 'email'],
                ['phone', 'Phone', 'text'],
                ['city', 'City', 'text'],
                ['region', 'Region', 'text'],
                ['admin_email', 'Admin email', 'email'],
                ['admin_password', 'Admin password', 'password'],
                ['first_name', 'Admin first name', 'text'],
                ['last_name', 'Admin last name', 'text'],
              ].map(([key, label, type]) => (
                <div key={key}>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
                  <input
                    type={type}
                    required={!['slug', 'address', 'email', 'phone', 'city', 'region'].includes(key)}
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 font-medium"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 py-3 rounded-xl font-black bg-violet-600 text-white">
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
