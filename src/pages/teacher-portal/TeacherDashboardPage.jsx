import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, BookOpen, ClipboardCheck, LayoutDashboard } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import TeacherTableSection from '../../components/teacher/TeacherTableSection';
import StatsGrid from '../../components/enterprise/StatsGrid';
import DataTable from '../../components/enterprise/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { teacherPortalApi } from '../../api/services';

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    teacherPortalApi.dashboard()
      .then((r) => setData(r.data.data))
      .catch((e) => setError(e.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const classColumns = useMemo(() => [
    { key: 'subject_name', label: 'Subject' },
    { key: 'grade_name', label: 'Grade' },
    { key: 'section_name', label: 'Section' },
    { key: 'student_count', label: 'Students' },
    {
      key: 'marked',
      label: 'Marked today',
      render: (r) => `${r.marked_today ?? 0} / ${r.student_count ?? 0}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => {
        const done = r.student_count > 0 && r.marked_today >= r.student_count;
        return <Badge color={done ? 'green' : 'amber'}>{done ? 'Complete' : 'Due'}</Badge>;
      },
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate(`/teachers/attendance/${r.section_id}`)}>
            <ClipboardCheck size={14} /> Attendance
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/teachers/classes/${r.section_id}`)}>
            Roster
          </Button>
        </div>
      ),
    },
  ], [navigate]);

  if (loading) {
    return (
      <TeacherLayout>
        <div className="h-64 bg-white rounded-3xl border animate-pulse" />
      </TeacherLayout>
    );
  }

  if (error) {
    return (
      <TeacherLayout title="Dashboard">
        <p className="text-rose-600 font-medium">{error}</p>
      </TeacherLayout>
    );
  }

  const stats = [
    { label: 'My Students', value: data.stats.total_students },
    { label: 'Sections', value: data.stats.active_sections },
    { label: 'Marked Today', value: data.stats.attendance_marked_today },
    { label: 'Pending Roll Call', value: data.stats.sections_pending_attendance },
  ];

  const classRows = data.classes.map((c) => ({ ...c, id: `${c.section_id}-${c.subject_id}` }));

  return (
    <TeacherLayout
      title={`Hi, ${data.teacher.first_name}`}
      subtitle={`${data.stats.active_sections} teaching assignments · ${data.today}`}
    >
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="text-emerald-600" size={26} /> Dashboard
          </h1>
        </header>

        <StatsGrid stats={stats} />

        {data.sections_pending?.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="text-amber-600 shrink-0" size={22} />
            <div>
              <p className="font-bold text-amber-900 text-sm">Attendance due</p>
              <p className="text-amber-800/80 text-sm">{data.sections_pending.length} section(s) need roll call today.</p>
            </div>
          </div>
        )}

        <TeacherTableSection
          toolbar={(
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BookOpen size={20} className="text-emerald-600" /> Today&apos;s classes
              </h2>
              <Button variant="secondary" size="sm" onClick={() => navigate('/teachers/classes')}>View all</Button>
            </div>
          )}
        >
          <DataTable
            columns={classColumns}
            rows={classRows}
            loading={false}
            emptyMessage="No class assignments yet. Contact your school admin."
          />
        </TeacherTableSection>
      </div>
    </TeacherLayout>
  );
}
