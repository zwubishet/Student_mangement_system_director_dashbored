import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import PlatformPageHeader from '../../components/super-admin/PlatformPageHeader';
import PlatformFilterBar from '../../components/super-admin/PlatformFilterBar';
import PlatformStatusBadge from '../../components/super-admin/PlatformStatusBadge';
import DataTable from '../../components/enterprise/DataTable';
import { platformApi } from '../../api/services';

export default function PlatformStudentsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const [schoolId, setSchoolId] = useState(searchParams.get('school_id') || '');

  const load = useCallback(() => {
    setLoading(true);
    platformApi.listStudents({
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
      key: 'student',
      label: 'Student',
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">{r.first_name} {r.last_name}</p>
          <p className="text-xs text-slate-400">{r.admission_number}</p>
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
    {
      key: 'class',
      label: 'Class',
      render: (r) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {[r.grade_name, r.section_name].filter(Boolean).join(' · ') || '—'}
        </span>
      ),
    },
    { key: 'status', label: 'Status', render: (r) => <PlatformStatusBadge status={r.lifecycle_status} /> },
    { key: 'email', label: 'Account', render: (r) => <span className="text-xs text-slate-500">{r.email || '—'}</span> },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <PlatformPageHeader title="All students" subtitle={`${total} learners on the platform`} />
        <PlatformFilterBar
          search={search}
          onSearchChange={setSearch}
          schoolId={schoolId}
          onSchoolChange={setSchoolId}
          placeholder="Name, ID, email, or school…"
        />
        <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No students found." />
      </div>
    </SuperAdminLayout>
  );
}
