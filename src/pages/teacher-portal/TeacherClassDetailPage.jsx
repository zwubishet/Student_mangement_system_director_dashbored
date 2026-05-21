import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, Edit3, Users, Download, FileBarChart, Phone } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import TeacherTableSection from '../../components/teacher/TeacherTableSection';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/enterprise/DataTable';
import { teacherPortalApi } from '../../api/services';

export default function TeacherClassDetailPage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    teacherPortalApi.getClass(sectionId).then((r) => setData(r.data.data)).finally(() => setLoading(false));
  }, [sectionId]);

  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Student',
      render: (r) => (
        <button
          type="button"
          className="font-bold text-slate-900 hover:text-emerald-600"
          onClick={() => navigate(`/teachers/students/${r.id}`)}
        >
          {r.first_name} {r.last_name}
        </button>
      ),
    },
    { key: 'admission_number', label: 'Admission #' },
    {
      key: 'attendance_status',
      label: 'Today',
      render: (r) => {
        if (!r.attendance_status) return '—';
        const color = r.attendance_status === 'present' ? 'green' : r.attendance_status === 'late' ? 'amber' : 'red';
        return <Badge color={color}>{r.attendance_status}</Badge>;
      },
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button
          type="button"
          className="text-xs font-bold text-emerald-600 hover:underline"
          onClick={() => navigate(`/teachers/students/${r.id}`)}
        >
          Profile
        </button>
      ),
    },
  ], [navigate]);

  if (loading || !data) {
    return <TeacherLayout><div className="h-48 bg-white rounded-3xl border animate-pulse" /></TeacherLayout>;
  }

  const { section, students, marked_count } = data;

  const handleExportRoster = async () => {
    setExporting(true);
    try {
      const res = await teacherPortalApi.exportRoster(sectionId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `roster-${section.name || sectionId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <TeacherLayout
      title={`${section.grade_name} · ${section.name}`}
      subtitle={`${students.length} students · ${marked_count} marked today`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/teachers/classes')}><ArrowLeft size={16} /> Back</Button>
          <Button onClick={() => navigate(`/teachers/attendance/${sectionId}`)}><ClipboardCheck size={16} /> Attendance</Button>
          <Button variant="secondary" onClick={() => navigate(`/teachers/exams/section/${sectionId}`)}><Edit3 size={16} /> Enter marks</Button>
          <Button variant="secondary" onClick={handleExportRoster} loading={exporting}><Download size={16} /> Export CSV</Button>
          <Button variant="secondary" onClick={() => navigate(`/teachers/classes/${sectionId}/report`)}><FileBarChart size={16} /> Results</Button>
          <Button variant="secondary" onClick={() => navigate(`/teachers/classes/${sectionId}/guardians`)}><Phone size={16} /> Guardians</Button>
        </div>

        <header>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="text-emerald-600" size={22} /> Class roster
          </h2>
        </header>

        <TeacherTableSection>
          <DataTable columns={columns} rows={students} loading={false} emptyMessage="No students enrolled." />
        </TeacherTableSection>
      </div>
    </TeacherLayout>
  );
}
