import { useCallback, useEffect, useState } from 'react';
import { Search, Wallet } from 'lucide-react';
import { financeApi, catalogApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ETB, unwrap } from './financeUi';
import { ui } from '../../theme/tokens';

const PAYMENT_STATUS = {
  paid: { label: 'Paid', color: 'green' },
  partial: { label: 'Partial', color: 'amber' },
  unpaid: { label: 'Unpaid', color: 'rose' },
  not_invoiced: { label: 'Ready to invoice', color: 'sky' },
  not_billable: { label: 'Not billable', color: 'slate' },
};

const SKIP_LABELS = {
  monthly_not_on_term: 'Monthly fee (not on term invoice)',
  no_priced_lines: 'No priced fees',
  no_subscriptions: 'No subscription',
};

export default function StudentFeeRosterPanel({ academicYear, term, gradeId: gradeIdProp }) {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [grades, setGrades] = useState([]);
  const [gradeId, setGradeId] = useState(gradeIdProp || '');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!academicYear) return;
    setLoading(true);
    try {
      const [roster, gr] = await Promise.all([
        financeApi.getStudentBillingRoster({
          academic_year: academicYear,
          term: term ? Number(term) : 1,
          grade_id: gradeId || undefined,
        }),
        catalogApi.getGrades(),
      ]);
      setData(unwrap(roster));
      setGrades(unwrap(gr) || []);
    } catch (e) {
      setData(null);
      toast(e.response?.data?.message || 'Failed to load billing roster', 'error');
    } finally {
      setLoading(false);
    }
  }, [academicYear, term, gradeId, toast]);

  useEffect(() => { load(); }, [load]);

  const summary = data?.summary;
  const filtered = (data?.students || []).filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.first_name?.toLowerCase().includes(q)
      || s.last_name?.toLowerCase().includes(q)
      || s.admission_number?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard label="Billable" value={summary.billable} />
          <SummaryCard label="Projected term" value={ETB.format(Number(summary.projected_term_total))} />
          <SummaryCard label="Invoiced" value={ETB.format(Number(summary.invoiced_total))} />
          <SummaryCard label="Collected" value={ETB.format(Number(summary.collected_total))} highlight />
          <SummaryCard label="Outstanding" value={ETB.format(Number(summary.outstanding))} warn />
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search student…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm ${ui.input}`}
          />
        </div>
        <select
          value={gradeId}
          onChange={(e) => setGradeId(e.target.value)}
          className={`rounded-xl border px-3 py-2 text-sm ${ui.input}`}
        >
          <option value="">All grades</option>
          {grades.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div className={`${ui.card} overflow-hidden`}>
        {loading ? (
          <p className="p-8 text-center text-slate-400">Loading roster…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${ui.tableHead} text-[10px] uppercase`}>
                <tr>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Class</th>
                  <th className="px-4 py-3 text-right">Term fee</th>
                  <th className="px-4 py-3 text-right">Invoiced</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className={ui.tableRow}>
                {filtered.map((s) => {
                  const ps = PAYMENT_STATUS[s.payment_status] || PAYMENT_STATUS.not_billable;
                  const inv = s.invoice;
                  return (
                    <tr key={s.student_id} className={ui.tableRowHover}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {s.first_name} {s.last_name}
                        </p>
                        <p className="text-xs text-slate-400">{s.admission_number}</p>
                        {!s.billable && s.skip_reason && (
                          <p className="text-[10px] text-amber-600 mt-0.5">
                            {SKIP_LABELS[s.skip_reason] || s.skip_reason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {s.grade_name} · {s.section_name}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {s.billable ? ETB.format(Number(s.projected_term_total)) : '—'}
                        {s.fee_lines?.length > 0 && (
                          <p className="text-[10px] font-normal text-slate-400">
                            {s.fee_lines.map((l) => l.category_name).join(', ')}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {inv ? ETB.format(inv.amount) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600">
                        {inv ? ETB.format(inv.total_paid) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-amber-600">
                        {inv ? ETB.format(inv.balance) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          ps.color === 'green' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : ps.color === 'amber' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : ps.color === 'sky' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {ps.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="p-8 text-center text-slate-400">No students match.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, highlight, warn }) {
  return (
    <div className={`rounded-xl border p-3 ${
      highlight ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
        : warn ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
    }`}>
      <p className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
        <Wallet size={12} /> {label}
      </p>
      <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">{value}</p>
    </div>
  );
}
