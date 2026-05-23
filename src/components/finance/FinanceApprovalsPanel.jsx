import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Loader2, Receipt, RefreshCw, Users, XCircle } from 'lucide-react';
import { financeApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ETB, unwrap } from './financeUi';

export default function FinanceApprovalsPanel() {
  const { toast } = useToast();
  const [data, setData] = useState({ payroll: [], fee_requests: [], hr_reviews: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await financeApi.getPendingApprovals();
      setData(unwrap(res) || { payroll: [], fee_requests: [], hr_reviews: [] });
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to load approvals', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const approvePayroll = async (id) => {
    setSaving(true);
    try {
      await financeApi.approvePayrollRun(id);
      toast('Payroll approved — finance can disburse', 'success');
      await load();
    } catch (e) {
      toast(e.response?.data?.message || 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const rejectPayroll = async (id) => {
    const reason = window.prompt('Rejection reason (optional)') || '';
    setSaving(true);
    try {
      await financeApi.rejectPayrollRun(id, { reason });
      toast('Payroll rejected', 'success');
      await load();
    } catch (e) {
      toast(e.response?.data?.message || 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const approveFee = async (id) => {
    setSaving(true);
    try {
      const res = await financeApi.approveFeeRequest(id);
      const gen = unwrap(res)?.generation;
      toast(
        gen
          ? `Invoices generated: ${gen.generated} for ${gen.students} students`
          : 'Fee generation approved',
        'success'
      );
      await load();
    } catch (e) {
      toast(e.response?.data?.message || 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const rejectFee = async (id) => {
    const reason = window.prompt('Rejection reason (optional)') || '';
    setSaving(true);
    try {
      await financeApi.rejectFeeRequest(id, { reason });
      toast('Fee request rejected', 'success');
      await load();
    } catch (e) {
      toast(e.response?.data?.message || 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resolveHr = async (id, status) => {
    setSaving(true);
    try {
      await financeApi.resolveHrReviewRequest(id, { status });
      toast(status === 'reviewed' ? 'Marked as reviewed' : 'Dismissed', 'success');
      await load();
    } catch (e) {
      toast(e.response?.data?.message || 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = (data.payroll?.length || 0) + (data.fee_requests?.length || 0) + (data.hr_reviews?.length || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">School admin</p>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 dark:text-slate-100">Pending approvals</h2>
          <p className="text-sm text-slate-500 mt-1">
            Finance office submissions waiting for your sign-off ({pendingCount} pending).
          </p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white dark:bg-slate-900 text-sm font-bold">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>
      ) : pendingCount === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center text-slate-400">
          No items awaiting approval.
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center gap-2 font-black">
              <Users size={18} className="text-emerald-600" /> Payroll ({data.payroll?.length || 0})
            </div>
            <ul className="divide-y">
              {(data.payroll || []).map((p) => (
                <li key={p.id} className="p-5 space-y-3">
                  <div>
                    <p className="font-bold">{p.period_label}</p>
                    <p className="text-xs text-slate-500">
                      {p.period_start} → {p.period_end} · {p.employee_count ?? 0} staff · {ETB.format(Number(p.total_net))} net
                    </p>
                    <p className="text-xs text-slate-400">
                      By {p.created_by_first} {p.created_by_last}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => approvePayroll(p.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => rejectPayroll(p.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold text-rose-700"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center gap-2 font-black">
              <Receipt size={18} className="text-emerald-600" /> Term invoices ({data.fee_requests?.length || 0})
            </div>
            <ul className="divide-y">
              {(data.fee_requests || []).map((f) => (
                <li key={f.id} className="p-5 space-y-3">
                  <div>
                    <p className="font-bold">{f.academic_year} {f.term ? `· Term ${f.term}` : ''}</p>
                    <p className="text-xs text-slate-500">
                      Grade: {f.grade_name || 'All'} · Due: {f.due_date || '—'}
                    </p>
                    <p className="text-xs text-slate-400">
                      By {f.created_by_first} {f.created_by_last}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => approveFee(f.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                    >
                      <CheckCircle2 size={14} /> Approve & generate
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => rejectFee(f.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold text-rose-700"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center gap-2 font-black">
              <ClipboardList size={18} className="text-amber-600" /> Staff HR ({data.hr_reviews?.length || 0})
            </div>
            <ul className="divide-y">
              {(data.hr_reviews || []).map((r) => (
                <li key={r.id} className="p-5 space-y-3">
                  <div>
                    <p className="font-bold">{r.teacher_first} {r.teacher_last}</p>
                    <p className="text-xs text-slate-500">{r.message || 'Payroll/HR review requested'}</p>
                    <p className="text-xs text-slate-400">
                      From {r.requester_first} {r.requester_last} · {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    to={`/school-admin/teachers/${r.teacher_id}?tab=hr`}
                    className="text-xs font-bold text-emerald-600 hover:underline block"
                  >
                    Open HR profile →
                  </Link>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => resolveHr(r.id, 'reviewed')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                    >
                      <CheckCircle2 size={14} /> Reviewed
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => resolveHr(r.id, 'dismissed')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold"
                    >
                      <XCircle size={14} /> Dismiss
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
