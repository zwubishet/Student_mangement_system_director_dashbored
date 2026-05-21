import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, BookOpen, ClipboardCheck, LayoutDashboard, Trophy, Users, ArrowRight } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import TeacherTableSection from '../../components/teacher/TeacherTableSection';
import StatsGrid from '../../components/enterprise/StatsGrid';
import DataTable from '../../components/enterprise/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { teacherPortalApi } from '../../api/services';
import TeacherAlertsPanel from '../../components/teacher/TeacherAlertsPanel';

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
    { label: 'Attendance Today', value: data.stats.attendance_marked_today },
    { label: 'Roll Call Due', value: data.stats.sections_pending_attendance },
    { label: 'Marks to Submit', value: data.stats.marks_pending_submit },
    { label: 'Rejected Marks', value: data.stats.marks_rejected },
  ];

  const classRows = data.classes.map((c) => ({ ...c, id: `${c.section_id}-${c.subject_id}` }));

  const quickActions = [
    { label: 'My Classes', sub: 'Roster & subjects', path: '/teachers/classes', icon: BookOpen },
    { label: 'Attendance', sub: 'Take roll call', path: '/teachers/attendance', icon: ClipboardCheck },
    { label: 'Exams & marks', sub: 'Enter & submit scores', path: '/teachers/exams', icon: Trophy },
    { label: 'Students', sub: 'Search learners', path: '/teachers/students', icon: Users },
    { label: 'Timetable', sub: 'Weekly schedule', path: '/teachers/timetable', icon: LayoutDashboard },
    { label: 'My Profile', sub: 'Licence & leave', path: '/teachers/profile', icon: Users },
  ];

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

        <TeacherAlertsPanel
          licenceAlerts={data.licence_alerts}
          notifications={data.notifications}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.path}
                type="button"
                onClick={() => navigate(a.path)}
                className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-500 hover:shadow-sm transition-all text-left"
              >
                <div>
                  <p className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Icon size={16} className="text-emerald-600" /> {a.label}
                  </p>
                  <p className="text-xs text-slate-400">{a.sub}</p>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
              </button>
            );
          })}
        </div>

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
