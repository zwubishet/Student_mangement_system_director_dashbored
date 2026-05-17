import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ParentLayout from '../../components/layouts/ParentLayout';
import Button from '../../components/ui/Button';
import { parentPortalApi } from '../../api/services';

export default function ParentChildPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parentPortalApi.childDetail(studentId)
      .then((r) => setDetail(r.data.data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <ParentLayout>
        <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
      </ParentLayout>
    );
  }

  if (!detail?.student) {
    return (
      <ParentLayout>
        <p className="text-slate-500">Unable to load student details.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/parent/dashboard')}>Back</Button>
      </ParentLayout>
    );
  }

  const { student, attendance_summary, recent_exams } = detail;

  return (
    <ParentLayout>
      <Button variant="secondary" className="mb-6" onClick={() => navigate('/parent/dashboard')}>
        <ArrowLeft size={16} /> Back
      </Button>
      <h1 className="text-2xl font-black text-slate-900 mb-1">{student.first_name} {student.last_name}</h1>
      <p className="text-slate-500 text-sm mb-8">{student.admission_number} · {student.email}</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-400 uppercase">30-day attendance</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {attendance_summary?.rate != null ? `${attendance_summary.rate}%` : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-1">{attendance_summary?.present || 0} / {attendance_summary?.total || 0} days</p>
        </div>
      </div>

      <section className="bg-white border border-slate-100 rounded-2xl p-5">
        <h2 className="font-black text-slate-800 mb-4">Recent exam results</h2>
        {recent_exams?.length ? (
          <ul className="space-y-3">
            {recent_exams.map((ex, i) => (
              <li key={i} className="flex justify-between text-sm border-b border-slate-50 pb-2">
                <span className="font-bold text-slate-700">{ex.exam_name}</span>
                <span className="text-slate-500">{ex.score ?? '—'} · {ex.recorded_at}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400 text-sm">No recent exam results.</p>
        )}
      </section>
    </ParentLayout>
  );
}
