import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileBarChart, Users } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/enterprise/DataTable';
import { teacherPortalApi } from '../../api/services';

export default function TeacherClassReportPage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    teacherPortalApi.getClassReport(sectionId)
      .then((r) => setData(r.data.data))
      .catch((e) => setError(e.response?.data?.message || 'Could not load results'))
      .finally(() => setLoading(false));
  }, [sectionId]);

  const columns = useMemo(() => [
    {
      key: 'student',
      label: 'Student',
      render: (r) => (
        <span className="font-bold">{r.last_name}, {r.first_name}</span>
      ),
    },
    { key: 'admission_number', label: 'ID' },
    { key: 'subject_name', label: 'Subject' },
    { key: 'exam_name', label: 'Exam' },
    { key: 'letter_grade', label: 'Grade', render: (r) => <Badge color="blue">{r.letter_grade || '—'}</Badge> },
    { key: 'percentage_score', label: '%' },
    { key: 'rank_in_class', label: 'Rank' },
  ], []);

  if (loading) {
    return <TeacherLayout><div className="h-48 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 animate-pulse" /></TeacherLayout>;
  }

  if (error || !data) {
    return (
      <TeacherLayout title="Class results preview">
        <p className="text-rose-700 bg-rose-50 px-4 py-3 rounded-xl text-sm">{error || 'No data available.'}</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(`/teachers/classes/${sectionId}`)}>
          <ArrowLeft size={16} /> Back to class
        </Button>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout
      title="Class results preview"
      subtitle={`${data.section?.grade_name} ${data.section?.section_name} · ${data.term?.name || 'Current term'}`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate(`/teachers/classes/${sectionId}`)}>
            <ArrowLeft size={16} /> Back to class
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/teachers/classes/${sectionId}/guardians`)}>
            <Users size={16} /> Guardian directory
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400 uppercase font-bold">Students with results</p>
            <p className="text-2xl font-black">{data.summary?.students_with_results ?? 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400 uppercase font-bold">Result rows</p>
            <p className="text-2xl font-black">{data.summary?.result_rows ?? 0}</p>
          </div>
        </div>

        {data.results?.length === 0 ? (
          <p className="text-sm text-slate-500 bg-slate-50 p-6 rounded-2xl">
            No computed results yet. Admin must lock marks after verification to generate grades.
          </p>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-x-auto">
            <DataTable
              columns={columns}
              rows={data.results.map((r, i) => ({ ...r, id: `${r.student_id}-${i}` }))}
              loading={false}
              emptyMessage="No results"
            />
          </div>
        )}

        <p className="text-xs text-slate-400 flex items-center gap-2">
          <FileBarChart size={14} /> Preview from locked exam computation — not an official report card PDF.
        </p>
      </div>
    </TeacherLayout>
  );
}
