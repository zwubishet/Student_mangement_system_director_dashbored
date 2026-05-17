import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, XCircle, Clock } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import TeacherTableSection from '../../components/teacher/TeacherTableSection';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import DataTable from '../../components/enterprise/DataTable';
import { teacherPortalApi } from '../../api/services';

const STATUSES = [
  { id: 'present', label: 'Present', icon: CheckCircle2, active: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'absent', label: 'Absent', icon: XCircle, active: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 'late', label: 'Late', icon: Clock, active: 'bg-amber-100 text-amber-700 border-amber-200' },
];

export default function TeacherSectionAttendancePage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    teacherPortalApi.getClass(sectionId).then((r) => {
      const d = r.data.data;
      setClassData(d);
      const initial = {};
      d.students.forEach((s) => {
        if (s.attendance_status) initial[s.id] = s.attendance_status;
      });
      setStatusMap(initial);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [sectionId]);

  const setStatus = (studentId, status) => {
    setStatusMap((m) => ({ ...m, [studentId]: status }));
  };

  const markAll = (status) => {
    if (!classData) return;
    const next = {};
    classData.students.forEach((s) => { next[s.id] = status; });
    setStatusMap(next);
  };

  const handleSave = async () => {
    const records = Object.entries(statusMap).map(([student_id, status]) => ({ student_id, status }));
    if (!records.length) return;
    setSaving(true);
    try {
      await teacherPortalApi.markAttendance(sectionId, { date: classData?.date, records });
      load();
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    if (!classData?.students) return [];
    return classData.students.filter((s) =>
      `${s.first_name} ${s.last_name} ${s.admission_number || ''}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [classData, search]);

  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Student',
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900">{r.first_name} {r.last_name}</p>
          <p className="text-xs text-slate-500">{r.admission_number}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(({ id, label, icon: Icon, active }) => (
            <button
              key={id}
              type="button"
              onClick={() => setStatus(r.id, id)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                statusMap[r.id] === id ? active : 'bg-slate-50 text-slate-400 border-slate-100'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      ),
    },
  ], [statusMap]);

  if (loading) {
    return <TeacherLayout><div className="h-64 bg-white rounded-3xl border animate-pulse" /></TeacherLayout>;
  }

  return (
    <TeacherLayout
      title="Roll call"
      subtitle={classData ? `${classData.section.grade_name} · ${classData.section.name} · ${classData.date}` : ''}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/teachers/attendance')}><ArrowLeft size={16} /> Back</Button>
          <Button onClick={handleSave} loading={saving}><Save size={16} /> Save attendance</Button>
          <Button variant="secondary" size="sm" onClick={() => markAll('present')}>All present</Button>
          <Button variant="secondary" size="sm" onClick={() => markAll('absent')}>All absent</Button>
        </div>

        <TeacherTableSection
          toolbar={(
            <SearchBar value={search} onChange={setSearch} placeholder="Filter students..." className="max-w-md" />
          )}
        >
          <DataTable columns={columns} rows={filtered} loading={false} emptyMessage="No students in this section." />
        </TeacherTableSection>
      </div>
    </TeacherLayout>
  );
}
