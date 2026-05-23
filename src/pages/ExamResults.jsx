import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';
import { Table } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import Badge from '../components/ui/Badge';
import { examsApi } from '../api/services';

const COLUMNS = [
  { key: 'admission_number', label: 'Admission #' },
  { key: 'student', label: 'Student', render: (r) => `${r.first_name} ${r.last_name}` },
  { key: 'subject_name', label: 'Subject' },
  { key: 'score', label: 'Score', render: (r) => `${r.score ?? '—'} / ${r.max_score ?? '—'}` },
  { key: 'grade', label: 'Grade', render: (r) => (r.grade ? <Badge color="green">{r.grade}</Badge> : '—') },
];

export default function ExamResults() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ rows: [], total: 0, page: 1, totalPages: 1 });
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      examsApi.getOne(examId),
      examsApi.getResults(examId, { page, limit: 30 }),
    ])
      .then(([examRes, resultsRes]) => {
        setExam(examRes.data.data);
        const d = resultsRes.data;
        setData({ rows: d.data, total: d.meta.total, page: d.meta.page, totalPages: d.meta.totalPages });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [examId, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/school-admin/grading')}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 dark:text-slate-100">{exam?.name || 'Exam Results'}</h1>
            <p className="text-slate-500 text-sm">{exam?.term_name} · {exam?.academic_year}</p>
          </div>
          {exam?.status && <Badge color="blue">{exam.status}</Badge>}
        </div>
        <Table columns={COLUMNS} data={data.rows} loading={loading} emptyMessage="No results recorded yet." />
        <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
      </div>
    </AdminLayout>
  );
}
