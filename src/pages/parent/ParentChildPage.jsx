import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, Banknote, CreditCard, Loader2 } from 'lucide-react';
import ParentLayout from '../../components/layouts/ParentLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { parentPortalApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

const ETB = new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 2 });

export default function ParentChildPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  const loadDetail = () => parentPortalApi.childDetail(studentId)
    .then((r) => setDetail(r.data.data))
    .catch(() => setDetail(null));

  useEffect(() => {
    loadDetail().finally(() => setLoading(false));
  }, [studentId]);

  const payWithChapa = async (inv) => {
    const balance = Number(inv.balance ?? 0);
    if (balance <= 0 || inv.status === 'paid') return;
    setPayingId(inv.id);
    try {
      const res = await parentPortalApi.payInvoiceChapa(inv.id);
      const url = res.data?.data?.checkout_url || res.data?.checkout_url;
      if (!url) throw new Error('No checkout URL');
      window.location.href = url;
    } catch (e) {
      toast(e.response?.data?.message || e.message || 'Could not start payment', 'error');
      setPayingId(null);
    }
  };

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

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className={`${ui.card} p-5`}>
          <p className={ui.mutedXs}>30-day attendance</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {attendance_summary?.rate != null ? `${attendance_summary.rate}%` : '—'}
          </p>
          <p className={`text-xs ${ui.muted} mt-1`}>{attendance_summary?.present || 0} / {attendance_summary?.total || 0} days present</p>
        </div>
        <div className={`${ui.card} p-5`}>
          <p className={ui.mutedXs}>Published grades</p>
          <p className="text-3xl font-black text-violet-600 mt-2">{recent_exams?.length || 0}</p>
          <button
            type="button"
            className="text-xs font-bold text-emerald-600 hover:underline mt-1 inline-flex items-center gap-1"
            onClick={() => navigate(`/parent/children/${studentId}/grades`)}
          >
            <Award size={12} /> Full grade report
          </button>
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
            {invoices.map((inv) => {
              const items = Array.isArray(inv.line_items) ? inv.line_items : [];
              const paid = Number(inv.total_paid ?? 0);
              const balance = Number(inv.balance ?? Math.max(Number(inv.amount) - paid, 0));
              return (
              <li key={inv.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-sm space-y-2">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {inv.academic_year} {inv.term ? `· Term ${inv.term}` : ''}
                    </p>
                    <p className={ui.muted}>Due {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-xs text-slate-500">Billed <span className="font-black text-slate-800 dark:text-slate-200">{ETB.format(Number(inv.amount))}</span></p>
                    <p className="text-xs text-emerald-600">Paid <span className="font-bold">{ETB.format(paid)}</span></p>
                    <p className="text-xs text-amber-600 font-bold">Balance {ETB.format(balance)}</p>
                    <Badge color={inv.status === 'paid' ? 'green' : 'amber'}>{inv.status}</Badge>
                  </div>
                </div>
                {items.length > 0 && (
                  <ul className="text-xs border-t border-slate-50 dark:border-slate-800 pt-2 space-y-0.5">
                    {items.map((li, idx) => (
                      <li key={idx} className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>{li.name}</span>
                        <span>{ETB.format(Number(li.amount))}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex justify-end pt-1">
                  {balance > 0 && inv.status !== 'paid' && (
                    <button
                      type="button"
                      disabled={payingId === inv.id}
                      onClick={() => payWithChapa(inv)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[44px] rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-60 touch-manipulation w-full sm:w-auto"
                    >
                      {payingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                      Pay {ETB.format(balance)} with Chapa
                    </button>
                  )}
                </div>
              </li>
            );})}
          </ul>
        </section>
      )}

      <section className={`${ui.card} p-5`}>
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <h2 className={`font-black ${ui.panelTitle}`}>Recent grades</h2>
          <button
            type="button"
            className="text-xs font-bold text-emerald-600 hover:underline"
            onClick={() => navigate(`/parent/children/${studentId}/grades`)}
          >
            View all →
          </button>
        </div>
        {recent_exams?.length ? (
          <ul className="space-y-3">
            {recent_exams.map((ex, i) => (
              <li key={i} className="flex flex-wrap justify-between gap-2 text-sm border-b border-slate-50 dark:border-slate-800 pb-2">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{ex.subject_name || ex.exam_name}</span>
                  {ex.subject_name && <span className={`block text-xs ${ui.muted}`}>{ex.exam_name}</span>}
                </div>
                <span className={ui.muted}>
                  {ex.is_absent ? 'Absent' : (
                    <>
                      {ex.score}/{ex.max_score}
                      {ex.percent != null && ` (${ex.percent}%)`}
                      {ex.letter_grade && ` · ${ex.letter_grade}`}
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`text-sm ${ui.muted}`}>No published results yet.</p>
        )}
      </section>
    </ParentLayout>
  );
}
