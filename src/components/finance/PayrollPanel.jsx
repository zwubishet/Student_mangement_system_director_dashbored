import { useCallback, useEffect, useMemo, useState } from 'react';
import StaffHrReviewButton from './StaffHrReviewButton';
import {
  Banknote, Calendar, CheckCircle2, ChevronRight, Clock,
  Loader2, Plus, RefreshCw, Search, Send, Users, Wallet, XCircle,
} from 'lucide-react';
import { financeApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ETB, unwrap, Field } from './financeUi';

const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-700',
  pending_approval: 'bg-amber-100 text-amber-800',
  approved: 'bg-sky-100 text-sky-800',
  paid: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
};

function calcLocalNet(row) {
  const gross = Number(row.base_salary || 0)
    + Number(row.housing_allowance || 0)
    + Number(row.transport_allowance || 0)
    + Number(row.other_allowances || 0);
  const ded = Number(row.tax_withheld || 0)
    + Number(row.pension_employee || 0)
    + Number(row.other_deductions || 0);
  return Math.max(0, gross - ded);
}

export default function PayrollPanel({ mode = 'admin', accent = 'emerald' }) {
  const { toast } = useToast();
  const isAdmin = mode === 'admin';
  const btnPrimary = accent === 'teal' ? 'bg-amber-500 text-teal-950' : 'bg-emerald-600 text-white';
  const accentText = accent === 'teal' ? 'text-teal-600' : 'text-emerald-600';

  const [view, setView] = useState('runs');
  const [overview, setOverview] = useState(null);
  const [runs, setRuns] = useState([]);
  const [roster, setRoster] = useState([]);
  const [rosterSearch, setRosterSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editLines, setEditLines] = useState({});
  const [form, setForm] = useState({
    period_label: '', period_start: '', period_end: '', pay_date: '', academic_year: '',
  });
  const [lineItems, setLineItems] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, r, ros] = await Promise.all([
        financeApi.getPayrollOverview(),
        financeApi.listPayrollRuns(),
        financeApi.listPayrollStaffRoster(),
      ]);
      setOverview(unwrap(ov));
      setRuns(unwrap(r) || []);
      setRoster(unwrap(ros) || []);
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to load payroll', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const filteredRoster = useMemo(() => {
    const q = rosterSearch.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter((s) =>
      `${s.first_name} ${s.last_name} ${s.staff_id_number} ${s.department || ''}`.toLowerCase().includes(q));
  }, [roster, rosterSearch]);

  const openDetail = async (id) => {
    try {
      const res = await financeApi.getPayrollRun(id);
      const d = unwrap(res);
      setDetail(d);
      setView('runs');
      const edits = {};
      (d.entries || []).forEach((e) => {
        edits[e.id] = { ...e };
      });
      setEditLines(edits);
    } catch (e) {
      toast(e.response?.data?.message || 'Load failed', 'error');
    }
  };

  const initCreateFromRoster = () => {
    setLineItems(
      roster.map((s) => ({
        staff_id: s.staff_id,
        teacher_id: s.teacher_id,
        employee_name: `${s.first_name} ${s.last_name}`,
        staff_id_number: s.staff_id_number,
        department: s.staff_department || s.teacher_department,
        base_salary: Number(s.contract_salary || 0),
        housing_allowance: Math.round(Number(s.contract_salary || 0) * 0.1 * 100) / 100,
        transport_allowance: 0,
        other_allowances: 0,
        tax_withheld: 0,
        pension_employee: 0,
        other_deductions: 0,
        selected: Number(s.contract_salary) > 0,
      }))
    );
    setShowCreate(true);
  };

  const createRun = async (e) => {
    e.preventDefault();
    const entries = lineItems
      .filter((l) => l.selected)
      .map(({ selected, ...rest }) => rest);
    if (!entries.length) {
      toast('Select at least one employee', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await financeApi.createPayrollRun({ ...form, entries });
      toast('Payroll period created with detailed lines', 'success');
      setShowCreate(false);
      await load();
      const created = unwrap(res);
      openDetail(created?.run?.id);
    } catch (err) {
      toast(err.response?.data?.message || 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveEntryEdit = async (entryId) => {
    if (!detail?.run?.id || detail.run.status !== 'draft') return;
    setSaving(true);
    try {
      const patch = editLines[entryId];
      const res = await financeApi.updatePayrollEntry(detail.run.id, entryId, {
        base_salary: Number(patch.base_salary),
        housing_allowance: Number(patch.housing_allowance),
        transport_allowance: Number(patch.transport_allowance),
        tax_withheld: Number(patch.tax_withheld),
        pension_employee: Number(patch.pension_employee),
        other_deductions: Number(patch.other_deductions),
        notes: patch.notes,
      });
      setDetail(unwrap(res));
      toast('Line updated', 'success');
      await load();
    } catch (e) {
      toast(e.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const act = async (fn, msg) => {
    setSaving(true);
    try {
      await fn();
      toast(msg, 'success');
      await load();
      if (detail?.run?.id) await openDetail(detail.run.id);
    } catch (e) {
      toast(e.response?.data?.message || 'Action failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const run = detail?.run;
  const entries = detail?.entries || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest ${accentText}`}>
            {isAdmin ? 'School admin · Payroll' : 'Finance office · Payroll'}
          </p>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 dark:text-slate-100">Staff compensation</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Real payslips from active contracts: base salary, allowances, tax, pension, bank details,
            who is paid, when, and YTD totals. Draft → submit → admin approve → disburse to ledger.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={load} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white dark:bg-slate-900 text-sm font-bold">
            <RefreshCw size={16} /> Refresh
          </button>
          <button type="button" onClick={initCreateFromRoster} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${btnPrimary}`}>
            <Plus size={16} /> New pay period
          </button>
        </div>
      </div>

      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Active staff on payroll" value={overview.active_staff} icon={Users} />
          <StatCard label="YTD disbursed" value={ETB.format(Number(overview.ytd_disbursed))} icon={Banknote} />
          <StatCard label="Awaiting approval" value={overview.pending_approval} icon={Clock} />
          <StatCard label="Draft periods" value={overview.draft_runs} icon={Calendar} />
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'runs', label: 'Pay periods' },
          { id: 'roster', label: 'Staff & contracts' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setView(t.id)}
            className={`px-4 py-2 text-sm font-bold border-b-2 -mb-px ${
              view === t.id ? `border-current ${accentText}` : 'border-transparent text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" size={36} /></div>
      ) : view === 'roster' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm"
                placeholder="Search name, ID, department…"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
              />
            </div>
            <p className="text-xs text-slate-500 font-medium">{filteredRoster.length} employees</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">ID / Dept</th>
                  <th className="px-4 py-3 text-left">Contract</th>
                  <th className="px-4 py-3 text-right">Monthly salary</th>
                  <th className="px-4 py-3 text-right">YTD paid</th>
                  <th className="px-4 py-3 text-left">Bank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 dark:divide-slate-800">
                {filteredRoster.map((s) => (
                  <tr key={s.staff_id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <p className="font-bold">{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-slate-400">{s.email}</p>
                      {s.teacher_id && (
                        <StaffHrReviewButton
                          teacherId={s.teacher_id}
                          employeeName={`${s.first_name} ${s.last_name}`}
                          mode={mode}
                          compact
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs">{s.staff_id_number}</p>
                      <p className="text-xs text-slate-500">{s.staff_department || s.teacher_department || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p>{s.contract_type || '—'}</p>
                      <p className="text-slate-400">{s.contract_academic_year || 'No contract'}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-black">{ETB.format(Number(s.contract_salary || 0))}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">{ETB.format(Number(s.ytd_net_paid || 0))}</td>
                    <td className="px-4 py-3 text-xs">
                      <p>{s.bank_name || '—'}</p>
                      <p className="font-mono text-slate-400">{s.bank_account_number || ''}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRoster.length === 0 && (
            <p className="p-12 text-center text-slate-400">No active teachers with staff profiles. Link teachers to staff contracts first.</p>
          )}
        </div>
      ) : (
        <>
          {showCreate && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-5">
              <p className="font-black text-lg">New pay period — line-by-line</p>
              <form onSubmit={createRun} className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Field label="Period name" value={form.period_label} onChange={(v) => setForm((f) => ({ ...f, period_label: v }))} placeholder="April 2026" />
                  <Field label="Period start" type="date" value={form.period_start} onChange={(v) => setForm((f) => ({ ...f, period_start: v }))} />
                  <Field label="Period end" type="date" value={form.period_end} onChange={(v) => setForm((f) => ({ ...f, period_end: v }))} />
                  <Field label="Pay date" type="date" value={form.pay_date} onChange={(v) => setForm((f) => ({ ...f, pay_date: v }))} />
                  <Field label="Academic year" value={form.academic_year} onChange={(v) => setForm((f) => ({ ...f, academic_year: v }))} placeholder="2017/2018" />
                </div>
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
                      <tr>
                        <th className="px-2 py-2 w-8" />
                        <th className="px-2 py-2 text-left">Employee</th>
                        <th className="px-2 py-2 text-right">Base</th>
                        <th className="px-2 py-2 text-right">Housing</th>
                        <th className="px-2 py-2 text-right">Transport</th>
                        <th className="px-2 py-2 text-right">Tax</th>
                        <th className="px-2 py-2 text-right">Pension</th>
                        <th className="px-2 py-2 text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {lineItems.map((line, idx) => (
                        <tr key={line.staff_id} className={line.selected ? '' : 'opacity-40'}>
                          <td className="px-2 py-2">
                            <input
                              type="checkbox"
                              checked={line.selected}
                              onChange={() => setLineItems((items) => items.map((it, i) => (
                                i === idx ? { ...it, selected: !it.selected } : it
                              )))}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <p className="font-bold">{line.employee_name}</p>
                            <p className="text-slate-400">{line.staff_id_number}</p>
                            {line.teacher_id && (
                              <StaffHrReviewButton
                                teacherId={line.teacher_id}
                                employeeName={line.employee_name}
                                mode={mode}
                                compact
                              />
                            )}
                          </td>
                          {['base_salary', 'housing_allowance', 'transport_allowance', 'tax_withheld', 'pension_employee'].map((field) => (
                            <td key={field} className="px-1 py-1">
                              <input
                                type="number"
                                className="w-20 rounded border px-1 py-1 text-right"
                                value={line[field]}
                                disabled={!line.selected}
                                onChange={(e) => setLineItems((items) => items.map((it, i) => (
                                  i === idx ? { ...it, [field]: e.target.value } : it
                                )))}
                              />
                            </td>
                          ))}
                          <td className="px-2 py-2 text-right font-bold">{ETB.format(calcLocalNet(line))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className={`px-5 py-2.5 rounded-xl text-sm font-bold ${btnPrimary}`}>
                    {saving ? '…' : 'Create draft period'}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2.5 rounded-xl border text-sm font-bold">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <p className="px-5 py-3 font-black border-b">Pay periods</p>
              <ul className="divide-y max-h-[520px] overflow-y-auto">
                {runs.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => openDetail(r.id)}
                      className={`w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:bg-slate-800 ${run?.id === r.id ? 'bg-slate-50' : ''}`}
                    >
                      <div className="flex justify-between gap-2">
                        <p className="font-bold">{r.period_label}</p>
                        <ChevronRight size={16} className="text-slate-300 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {r.period_start} → {r.period_end} · {r.employee_count ?? 0} staff
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>
                          {r.status?.replace(/_/g, ' ')}
                        </span>
                        <span className="font-black text-sm">{ETB.format(Number(r.total_net))}</span>
                      </div>
                    </button>
                  </li>
                ))}
                {runs.length === 0 && <p className="p-8 text-center text-slate-400 text-sm">No pay periods yet.</p>}
              </ul>
            </div>

            <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 min-h-[400px]">
              {!run ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                  <Wallet size={40} className="opacity-30 mb-3" />
                  <p>Select a pay period to view payslips</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black">{run.period_label}</h3>
                      <p className="text-sm text-slate-500">
                        Pay window {run.period_start} – {run.period_end}
                        {run.pay_date && ` · Pay date ${run.pay_date}`}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                        <span>{run.employee_count} employees</span>
                        <span>Gross {ETB.format(Number(run.total_gross))}</span>
                        <span>Deductions {ETB.format(Number(run.total_deductions))}</span>
                        <span className="font-bold text-slate-800">Net {ETB.format(Number(run.total_net))}</span>
                      </div>
                      {run.submitted_by_first && (
                        <p className="text-xs text-slate-400 mt-1">
                          Submitted by {run.submitted_by_first} {run.submitted_by_last}
                          {run.submitted_at && ` · ${new Date(run.submitted_at).toLocaleString()}`}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {run.status === 'draft' && (
                        <button type="button" disabled={saving} onClick={() => act(() => financeApi.submitPayrollRun(run.id), 'Submitted for approval')} className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold ${isAdmin ? 'bg-slate-900 text-white' : btnPrimary}`}>
                          <Send size={14} /> {isAdmin ? 'Send for approval' : 'Submit'}
                        </button>
                      )}
                      {isAdmin && run.status === 'pending_approval' && (
                        <>
                          <button type="button" disabled={saving} onClick={() => act(() => financeApi.approvePayrollRun(run.id), 'Approved')} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button type="button" disabled={saving} onClick={() => { const reason = window.prompt('Reason?') || ''; act(() => financeApi.rejectPayrollRun(run.id, { reason }), 'Rejected'); }} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-bold text-rose-700">
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
                      {!isAdmin && run.status === 'approved' && (
                        <button type="button" disabled={saving} onClick={() => { if (window.confirm('Disburse all lines to ledger?')) act(() => financeApi.payPayrollRun(run.id), 'Disbursed'); }} className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold ${btnPrimary}`}>
                          <CheckCircle2 size={14} /> Disburse all
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto border rounded-xl">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
                        <tr>
                          <th className="px-3 py-2 text-left">Who</th>
                          <th className="px-3 py-2 text-right">Base</th>
                          <th className="px-3 py-2 text-right">Allow.</th>
                          <th className="px-3 py-2 text-right">Gross</th>
                          <th className="px-3 py-2 text-right">Ded.</th>
                          <th className="px-3 py-2 text-right">Net</th>
                          <th className="px-3 py-2 text-left">Bank / Status</th>
                          {run.status === 'draft' && <th className="px-3 py-2" />}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {entries.map((e) => {
                          const ed = editLines[e.id] || e;
                          const allow = Number(ed.housing_allowance || 0) + Number(ed.transport_allowance || 0) + Number(ed.other_allowances || 0);
                          return (
                            <tr key={e.id}>
                              <td className="px-3 py-3">
                                <p className="font-bold">{e.employee_name}</p>
                                <p className="text-slate-400">{e.staff_id_number} · {e.department || '—'}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{e.payslip_ref}</p>
                                {e.teacher_id && (
                                  <StaffHrReviewButton
                                    teacherId={e.teacher_id}
                                    employeeName={e.employee_name}
                                    mode={mode}
                                    compact
                                  />
                                )}
                              </td>
                              <td className="px-3 py-3 text-right">
                                {run.status === 'draft' ? (
                                  <input type="number" className="w-20 border rounded px-1 py-0.5 text-right" value={ed.base_salary} onChange={(ev) => setEditLines((m) => ({ ...m, [e.id]: { ...ed, base_salary: ev.target.value } }))} />
                                ) : ETB.format(Number(e.base_salary))}
                              </td>
                              <td className="px-3 py-3 text-right">{ETB.format(allow || Number(e.allowances))}</td>
                              <td className="px-3 py-3 text-right font-medium">{ETB.format(Number(e.gross_pay))}</td>
                              <td className="px-3 py-3 text-right">{ETB.format(Number(e.deductions))}</td>
                              <td className="px-3 py-3 text-right font-black">{ETB.format(Number(e.net_pay))}</td>
                              <td className="px-3 py-3">
                                <p className="truncate max-w-[140px]">{e.bank_name || '—'}</p>
                                <p className="font-mono text-[10px] text-slate-400">{e.bank_account_number || ''}</p>
                                <span className={`text-[10px] font-bold uppercase ${e.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{e.status}</span>
                              </td>
                              {run.status === 'draft' && !isAdmin && (
                                <td className="px-3 py-3">
                                  <button type="button" className="text-[10px] font-bold text-teal-700" onClick={() => saveEntryEdit(e.id)}>Save</button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 border-slate-100 p-4">
      <Icon className="text-slate-400 mb-2" size={18} />
      <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
      <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
    </div>
  );
}
