import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Sparkles, Users } from 'lucide-react';
import { financeApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ETB, unwrap } from './financeUi';
import Button from '../ui/Button';

const REASON_LABELS = {
  no_fee_categories: 'No fee categories',
  no_schedules_for_year: 'No schedules for this year',
  no_subscriptions: 'Not subscribed (run sync mandatory)',
  no_priced_lines: 'Subscriptions exist but amounts are zero',
  monthly_not_on_term: 'Tuition/fees set to Monthly — excluded from term invoices',
  frequency_not_applicable: 'Fee frequency does not apply to this term',
};

export default function FeeBillingReadiness({
  academicYear,
  term,
  gradeId,
  onBootstrapped,
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [repairing, setRepairing] = useState(false);

  const loadPreview = useCallback(async () => {
    if (!academicYear) return;
    setLoading(true);
    try {
      const res = await financeApi.previewTermInvoices({
        academic_year: academicYear,
        term: term ? Number(term) : null,
        grade_id: gradeId || undefined,
      });
      setPreview(unwrap(res));
    } catch (e) {
      setPreview(null);
      toast(e.response?.data?.message || 'Could not load billing preview', 'error');
    } finally {
      setLoading(false);
    }
  }, [academicYear, term, gradeId, toast]);

  useEffect(() => { loadPreview(); }, [loadPreview]);

  const repairTermBilling = async () => {
    setRepairing(true);
    try {
      const res = await financeApi.repairTermBilling();
      const d = unwrap(res);
      toast(`Updated ${d.updated?.length ?? 0} fee category(ies) to term billing`, 'success');
      await loadPreview();
      onBootstrapped?.();
    } catch (e) {
      toast(e.response?.data?.message || 'Repair failed', 'error');
    } finally {
      setRepairing(false);
    }
  };

  const bootstrap = async () => {
    setBootstrapping(true);
    try {
      const res = await financeApi.bootstrapFeeBilling({
        academic_year: academicYear,
        term: term ? Number(term) : 1,
      });
      const d = unwrap(res);
      toast(`Billing ready: ${d.schedules_created} schedule(s), ${d.sync?.students} students synced`, 'success');
      await loadPreview();
      onBootstrapped?.();
    } catch (e) {
      toast(e.response?.data?.message || 'Bootstrap failed', 'error');
    } finally {
      setBootstrapping(false);
    }
  };

  if (!academicYear) return null;

  const setup = preview?.setup;
  const ready = preview?.ready;

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-2xl border text-sm ${
        ready
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
      }`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
              {ready ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertTriangle size={18} className="text-amber-600" />}
              Billing readiness · {academicYear}{term ? ` · Term ${term}` : ''}
            </p>
            {loading && <p className="text-slate-500 mt-2 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Checking roster…</p>}
            {!loading && preview && (
              <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat label="Billable students" value={preview.billable} highlight />
                <Stat label="Would skip" value={preview.skipped} />
                <Stat label="Projected term total" value={ETB.format(Number(preview.projected_total || 0))} />
                <Stat label="Roster" value={preview.roster} icon={Users} />
              </div>
            )}
            {setup && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                {setup.category_count} categories · {setup.schedule_count} schedules ({ETB.format(Number(setup.schedule_total_amount))} configured)
                · {setup.subscribed_students} students subscribed
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {(setup?.monthly_mandatory_count > 0 || preview?.skip_reasons?.monthly_not_on_term) && (
              <Button variant="secondary" disabled={repairing} onClick={repairTermBilling}>
                {repairing ? <Loader2 size={16} className="animate-spin" /> : null}
                Fix: Tuition → Term billing
              </Button>
            )}
            {!ready && (
              <Button variant="primary" disabled={bootstrapping} onClick={bootstrap}>
                {bootstrapping ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Quick setup (Tuition + schedules)
              </Button>
            )}
          </div>
        </div>

        {!loading && setup?.warnings?.length > 0 && (
          <ul className="mt-3 text-xs text-amber-800 dark:text-amber-200 space-y-1">
            {setup.warnings.map((w) => (
              <li key={w.code}>· {w.message}</li>
            ))}
          </ul>
        )}

        {!loading && preview?.skipped > 0 && Object.keys(preview.skip_reasons || {}).length > 0 && (
          <ul className="mt-3 text-xs space-y-1 text-amber-900 dark:text-amber-100">
            {Object.entries(preview.skip_reasons).map(([k, n]) => (
              <li key={k}>· {n} students: {REASON_LABELS[k] || k}</li>
            ))}
          </ul>
        )}

        {!loading && preview?.samples?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Sample billable</p>
            <ul className="text-xs space-y-1">
              {preview.samples.map((s) => (
                <li key={s.student_id} className="flex justify-between gap-2">
                  <span>{s.name} ({s.grade_name})</span>
                  <span className="font-bold">{ETB.format(Number(s.total))}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight, icon: Icon }) {
  return (
    <div className={`rounded-xl px-3 py-2 ${highlight ? 'bg-white/80 dark:bg-slate-900/50' : ''}`}>
      <p className="text-[10px] uppercase font-bold text-slate-500">{label}</p>
      <p className={`text-lg font-black flex items-center gap-1 ${highlight ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
        {Icon && <Icon size={16} />}
        {value}
      </p>
    </div>
  );
}
