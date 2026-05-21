import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, Edit3, RefreshCw } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import TeacherTableSection from '../../components/teacher/TeacherTableSection';
import SearchBar from '../../components/ui/SearchBar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/enterprise/DataTable';
import { teacherPortalApi } from '../../api/services';

const WORKFLOW_COLORS = {
  not_started: 'gray',
  draft: 'amber',
  submitted: 'yellow',
  rejected: 'red',
  approved: 'green',
};

const WORKFLOW_LABELS = {
  not_started: 'Not started',
  draft: 'Draft',
  submitted: 'Submitted',
  rejected: 'Rejected — fix',
  approved: 'With admin',
};

export default function TeacherExamsPage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    teacherPortalApi.listExams(sectionId ? { section_id: sectionId } : {})
      .then((r) => setRows(r.data.data || []))
      .catch((e) => setError(e.response?.data?.message || 'Failed to load exams'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [sectionId]);

  const filtered = useMemo(() => rows.filter((r) =>
    `${r.exam_name} ${r.subject_name} ${r.class_name} ${r.grade_name}`.toLowerCase().includes(search.toLowerCase())
  ), [rows, search]);

  const columns = useMemo(() => [
    { key: 'exam_name', label: 'Exam' },
    { key: 'term_name', label: 'Term' },
    { key: 'subject_name', label: 'Subject' },
    {
      key: 'class',
      label: 'Class',
      render: (r) => `${r.grade_name} ${r.section_name}`,
    },
    {
      key: 'exam_status',
      label: 'Exam',
      render: (r) => <Badge color="blue">{r.exam_status}</Badge>,
    },
    {
      key: 'mark_workflow',
      label: 'Marks',
      render: (r) => (
        <Badge color={WORKFLOW_COLORS[r.mark_workflow] || 'gray'}>
          {WORKFLOW_LABELS[r.mark_workflow] || r.mark_workflow}
        </Badge>
      ),
    },
    {
      key: 'entries',
      label: 'Entered',
      render: (r) => `${r.entries_count ?? 0}`,
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Button
          size="sm"
          disabled={!r.can_edit}
          onClick={() => navigate(`/teachers/exams/${r.exam_id}/mark/${r.schedule_id}`)}
        >
          <Edit3 size={14} /> Enter marks
        </Button>
      ),
    },
  ], [navigate]);

  return (
    <TeacherLayout
      title="Exams & marks"
      subtitle={sectionId ? 'Schedules for this class' : 'All exams for your assigned subjects'}
    >
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="text-emerald-600" size={26} /> Exams & marks
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Marks are saved as draft, then submit for admin verification (same workflow as school admin).
          </p>
        </header>

        {error && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-xl">{error}</p>}

        {!loading && filtered.length === 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-sm text-amber-900">
            <p className="font-bold mb-1">No exam schedules for you yet</p>
            <p>Ask the school admin to create an exam, add a schedule for your class + subject, and activate the exam.</p>
          </div>
        )}

        <TeacherTableSection
          toolbar={(
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchBar value={search} onChange={setSearch} placeholder="Search exam, subject, class..." className="flex-1" />
              <Button variant="secondary" onClick={load}><RefreshCw size={16} /> Refresh</Button>
            </div>
          )}
        >
          <DataTable
            columns={columns}
            rows={filtered.map((r) => ({ ...r, id: `${r.exam_id}-${r.schedule_id}` }))}
            loading={loading}
            emptyMessage="No exams assigned to you."
          />
        </TeacherTableSection>
      </div>
    </TeacherLayout>
  );
}
