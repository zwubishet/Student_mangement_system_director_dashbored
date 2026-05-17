import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardCheck, Edit3, Eye, RefreshCw } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import TeacherTableSection from '../../components/teacher/TeacherTableSection';
import SearchBar from '../../components/ui/SearchBar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/enterprise/DataTable';
import { teacherPortalApi } from '../../api/services';

export default function TeacherClassesPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    teacherPortalApi.getClasses()
      .then((r) => setClasses(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => classes.filter((c) =>
    `${c.subject_name} ${c.grade_name} ${c.section_name}`.toLowerCase().includes(search.toLowerCase())
  ), [classes, search]);

  const columns = useMemo(() => [
    { key: 'subject_name', label: 'Subject' },
    { key: 'grade_name', label: 'Grade' },
    { key: 'section_name', label: 'Section' },
    { key: 'academic_year', label: 'Year', render: (r) => r.academic_year || '—' },
    { key: 'student_count', label: 'Students' },
    {
      key: 'marked_today',
      label: 'Marked today',
      render: (r) => `${r.marked_today ?? 0} / ${r.student_count ?? 0}`,
    },
    {
      key: 'status',
      label: 'Roll call',
      render: (r) => (
        <Badge color={r.attendance_complete ? 'green' : 'amber'}>
          {r.attendance_complete ? 'Complete' : 'Due'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className="px-2 py-1.5 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-50"
            onClick={() => navigate(`/teachers/attendance/${r.section_id}`)}
          >
            <ClipboardCheck size={14} className="inline mr-1" /> Attendance
          </button>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-slate-100"
            title="Class roster"
            onClick={() => navigate(`/teachers/classes/${r.section_id}`)}
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-slate-100"
            title="Marks"
            onClick={() => navigate(`/teachers/exams/${r.section_id}`)}
          >
            <Edit3 size={16} />
          </button>
        </div>
      ),
    },
  ], [navigate]);

  return (
    <TeacherLayout title="My Classes" subtitle="Sections and subjects assigned to you">
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-emerald-600" size={26} /> My Classes
          </h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} assignment(s)</p>
        </header>

        <TeacherTableSection
          toolbar={(
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchBar value={search} onChange={setSearch} placeholder="Search subject, grade, section..." className="flex-1" />
              <Button variant="secondary" onClick={load}><RefreshCw size={16} /> Refresh</Button>
            </div>
          )}
        >
          <DataTable columns={columns} rows={filtered} loading={loading} emptyMessage="No class assignments yet." />
        </TeacherTableSection>
      </div>
    </TeacherLayout>
  );
}
