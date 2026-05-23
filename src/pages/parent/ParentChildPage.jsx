import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Banknote } from 'lucide-react';
import ParentLayout from '../../components/layouts/ParentLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { parentPortalApi } from '../../api/services';
import { ui } from '../../theme/tokens';

const ETB = new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 2 });

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
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </ParentLayout>
    );
  }

  if (!detail?.student) {
    return (
      <ParentLayout>
        <p className={ui.muted}>Unable to load student details.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/parent/dashboard')}>Back</Button>
      </ParentLayout>
    );
  }

  const { student, attendance_summary, recent_exams, invoices } = detail;

  return (
    <ParentLayout>
      <Button variant="secondary" className="mb-6" onClick={() => navigate('/parent/dashboard')}>
        <ArrowLeft size={16} /> Back
      </Button>
      <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">{student.first_name} {student.last_name}</h1>
      <p className={`${ui.muted} text-sm mb-8`}>{student.admission_number}</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className={`${ui.card} p-5`}>
          <p className={ui.mutedXs}>30-day attendance</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {attendance_summary?.rate != null ? `${attendance_summary.rate}%` : '—'}
          </p>
          <p className={`text-xs ${ui.muted} mt-1`}>{attendance_summary?.present || 0} / {attendance_summary?.total || 0} days present</p>
        </div>
        <div className={`${ui.card} p-5`}>
          <p className={ui.mutedXs}>Open invoices</p>
          <p className="text-3xl font-black text-amber-600 mt-2">
            {invoices?.length || 0}
          </p>
          <p className={`text-xs ${ui.muted} mt-1`}>Recent school fee bills</p>
        </div>
      </div>

      {invoices?.length > 0 && (
        <section className={`${ui.card} p-5 mb-6`}>
          <h2 className={`font-black mb-4 flex items-center gap-2 ${ui.panelTitle}`}>
            <Banknote size={18} className="text-amber-500" /> Fee invoices
          </h2>
          <ul className="space-y-3">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex flex-wrap justify-between gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-sm">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {inv.academic_year} {inv.term ? `· Term ${inv.term}` : ''}
                  </p>
                  <p className={ui.muted}>Due {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</p>
                </div>
                <div className="text-right">
                  <p className="font-black">{ETB.format(Number(inv.amount))}</p>
                  <p className="text-xs text-amber-600 font-bold">Balance {ETB.format(Number(inv.balance))}</p>
                  <Badge color={inv.status === 'paid' ? 'green' : 'amber'}>{inv.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={`${ui.card} p-5`}>
        <h2 className={`font-black mb-4 ${ui.panelTitle}`}>Recent exam results</h2>
        {recent_exams?.length ? (
          <ul className="space-y-3">
            {recent_exams.map((ex, i) => (
              <li key={i} className="flex justify-between text-sm border-b border-slate-50 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">{ex.exam_name}</span>
                <span className={ui.muted}>{ex.score ?? '—'} · {ex.recorded_at}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`text-sm ${ui.muted}`}>No recent exam results.</p>
        )}
      </section>
    </ParentLayout>
  );
}
