import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import PlatformPageHeader from '../../components/super-admin/PlatformPageHeader';
import PlatformFilterBar from '../../components/super-admin/PlatformFilterBar';
import PlatformStatusBadge from '../../components/super-admin/PlatformStatusBadge';
import DataTable from '../../components/enterprise/DataTable';
import { platformApi } from '../../api/services';

export default function PlatformTeachersPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const [schoolId, setSchoolId] = useState(searchParams.get('school_id') || '');

  const load = useCallback(() => {
    setLoading(true);
    platformApi.listTeachers({
      search: search || undefined,
      school_id: schoolId || undefined,
      limit: 100,
    })
      .then((res) => {
        setRows(res.data.data || []);
        setTotal(res.data.meta?.total ?? 0);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [search, schoolId]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const columns = [
    {
      key: 'teacher',
      label: 'Teacher',
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
    { key: 'dept', label: 'Department', render: (r) => <span className="text-sm">{r.department || '—'}</span> },
    { key: 'sections', label: 'Sections', render: (r) => <span className="text-sm font-bold">{r.sections ?? 0}</span> },
    { key: 'status', label: 'Status', render: (r) => <PlatformStatusBadge status={r.status} /> },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <PlatformPageHeader title="All teachers" subtitle={`${total} staff across every school`} />
        <PlatformFilterBar
          search={search}
          onSearchChange={setSearch}
          schoolId={schoolId}
          onSchoolChange={setSchoolId}
          placeholder="Name, email, or school…"
        />
        <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No teachers found." />
      </div>
    </SuperAdminLayout>
  );
}
