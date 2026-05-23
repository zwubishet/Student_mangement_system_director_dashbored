import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, RefreshCw } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import TeacherTableSection from '../../components/teacher/TeacherTableSection';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/enterprise/DataTable';
import { teacherPortalApi } from '../../api/services';

export default function TeacherAttendanceHubPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    teacherPortalApi.getClasses()
      .then((r) => setClasses(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const rows = useMemo(
    () => classes.map((c) => ({ ...c, id: c.assignment_id })),
    [classes]
  );

  const columns = useMemo(() => [
    { key: 'subject_name', label: 'Subject' },
    { key: 'grade_name', label: 'Grade' },
    { key: 'section_name', label: 'Section' },
    {
      key: 'progress',
      label: 'Progress',
      render: (r) => `${r.marked_today ?? 0} / ${r.student_count ?? 0}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Badge color={r.attendance_complete ? 'green' : 'amber'}>
          {r.attendance_complete ? 'Complete' : 'Due'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Button size="sm" onClick={() => navigate(`/teachers/attendance/${r.section_id}`)}>
          <ClipboardCheck size={14} /> Take roll call
        </Button>
      ),
    },
  ], [navigate]);

  return (
    <TeacherLayout title="Attendance" subtitle="Select a section to take roll call">
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="text-emerald-600" size={26} /> Attendance
          </h1>
        </header>

        <TeacherTableSection
          toolbar={(
            <div className="flex justify-end">
              <Button variant="secondary" onClick={load}><RefreshCw size={16} /> Refresh</Button>
            </div>
          )}
        >
          <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No sections assigned." />
        </TeacherTableSection>
      </div>
    </TeacherLayout>
  );
}
