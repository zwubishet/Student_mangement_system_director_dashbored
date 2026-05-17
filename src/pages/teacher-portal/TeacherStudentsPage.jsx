import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, RefreshCw, Users } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import TeacherTableSection from '../../components/teacher/TeacherTableSection';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/enterprise/DataTable';
import { teacherPortalApi } from '../../api/services';

export default function TeacherStudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectionId, setSectionId] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    teacherPortalApi.getStudents({ search: search || undefined, section_id: sectionId || undefined })
      .then((r) => setStudents(r.data.data || []))
      .finally(() => setLoading(false));
  }, [search, sectionId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    teacherPortalApi.getClasses().then((r) => {
      const rows = r.data.data || [];
      const map = new Map();
      rows.forEach((c) => {
        if (!map.has(c.section_id)) {
          map.set(c.section_id, { value: c.section_id, label: `${c.grade_name} · ${c.section_name}` });
        }
      });
      setSections(Array.from(map.values()));
    });
  }, []);

  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Student',
      render: (r) => (
        <button
          type="button"
          className="text-left font-bold text-slate-900 hover:text-emerald-600"
          onClick={() => navigate(`/teachers/students/${r.id}`)}
        >
          {r.first_name} {r.last_name}
        </button>
      ),
    },
    { key: 'admission_number', label: 'Admission #' },
    { key: 'grade_name', label: 'Grade' },
    { key: 'section_name', label: 'Section' },
    { key: 'subject_name', label: 'Subject' },
    {
      key: 'gender',
      label: 'Gender',
      render: (r) => (r.gender ? <Badge color="green">{r.gender}</Badge> : '—'),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          title="View profile"
          onClick={() => navigate(`/teachers/students/${r.id}`)}
        >
          <Eye size={16} />
        </button>
      ),
    },
  ], [navigate]);

  return (
    <TeacherLayout title="My Students" subtitle="Students across your assigned sections">
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-emerald-600" size={26} /> Students
          </h1>
          <p className="text-slate-500 text-sm mt-1">{students.length} student(s) in your sections</p>
        </header>

        <TeacherTableSection
          toolbar={(
            <div className="flex flex-col lg:flex-row gap-3">
              <SearchBar value={search} onChange={setSearch} placeholder="Search name or admission #..." className="flex-1" />
              <Select
                label=""
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                options={sections}
                placeholder="All sections"
              />
              <Button variant="secondary" onClick={load}><RefreshCw size={16} /> Refresh</Button>
            </div>
          )}
        >
          <DataTable columns={columns} rows={students} loading={loading} emptyMessage="No students in your sections." />
        </TeacherTableSection>
      </div>
    </TeacherLayout>
  );
}
