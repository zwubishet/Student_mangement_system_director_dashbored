import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import PlatformPageHeader from '../../components/super-admin/PlatformPageHeader';
import PlatformFilterBar from '../../components/super-admin/PlatformFilterBar';
import PlatformStatusBadge from '../../components/super-admin/PlatformStatusBadge';
import DataTable from '../../components/enterprise/DataTable';
import { platformApi } from '../../api/services';

const ROLES = ['', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'];

export default function PlatformUsersPage() {
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [schoolId, setSchoolId] = useState(searchParams.get('school_id') || '');
  const [role, setRole] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    platformApi.listUsers({
      search: search || undefined,
      school_id: schoolId || undefined,
      role: role || undefined,
      limit: 100,
    })
      .then((res) => {
        setRows(res.data.data || []);
        setTotal(res.data.meta?.total ?? 0);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [search, schoolId, role]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">{r.first_name} {r.last_name}</p>
          <p className="text-xs text-slate-400">{r.email}</p>
        </div>
      ),
    },
    {
      key: 'school',
      label: 'School',
      render: (r) => (
        <Link to={`/super-admin/schools/${r.school_id}`} className="text-violet-600 font-bold text-sm hover:underline">
          {r.school_name}
        </Link>
      ),
    },
    { key: 'roles', label: 'Roles', render: (r) => <span className="text-xs text-slate-600 dark:text-slate-400">{r.roles || '—'}</span> },
    { key: 'status', label: 'Status', render: (r) => <PlatformStatusBadge status={r.status} /> },
    {
      key: 'created',
      label: 'Joined',
      render: (r) => <span className="text-xs text-slate-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</span>,
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <PlatformPageHeader title="All users" subtitle={`${total} accounts across every school`} />
        <PlatformFilterBar
          search={search}
          onSearchChange={setSearch}
          schoolId={schoolId}
          onSchoolChange={setSchoolId}
          placeholder="Name, email, or school…"
          extraSelect={(
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="min-w-[140px] px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
            >
              {ROLES.map((r) => (
                <option key={r || 'all'} value={r}>{r || 'All roles'}</option>
              ))}
            </select>
          )}
        />
        <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No users match your filters." />
      </div>
    </SuperAdminLayout>
  );
}
