import { useCallback, useEffect, useState } from 'react';
import {
  Banknote, BookOpen, CheckCircle2, CreditCard, FileText, Layers, Loader2,
  Percent, Receipt, RefreshCw, ScrollText, Wallet,
} from 'lucide-react';
import { financeApi, catalogApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import {
  ETB, unwrap, ACCENTS, StatCard, Panel, SetupForm, Field, StatusPill,
} from './financeUi';

const ALL_TABS = [
  { id: 'overview', label: 'Overview', icon: Wallet },
  { id: 'setup', label: 'Fee setup', icon: Layers },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'ledger', label: 'Ledger', icon: ScrollText },
];

/**
 * @param {'full'|'overview'|'student-fees'|'ledger'} mode
 * @param {'emerald'|'teal'} accent
 */
export default function SchoolFinanceContent({
  mode = 'full',
  accent = 'emerald',
  title = 'Billing & collections',
  subtitle = 'Configure fees per grade/term, invoice students, record cash or Chapa — immutable ledger.',
  kicker = 'School finance',
  defaultTab,
  feeWorkflow = 'direct',
  showHeader = true,
}) {
  const a = ACCENTS[accent] || ACCENTS.emerald;
  const visibleTabs = mode === 'full'
    ? ALL_TABS
    : mode === 'student-fees'
      ? ALL_TABS.filter((t) => t.id === 'setup' || t.id === 'invoices')
      : [];

  const initialTab = defaultTab
    || (mode === 'overview' ? 'overview' : mode === 'ledger' ? 'ledger' : visibleTabs[0]?.id || 'overview');

  const { toast } = useToast();
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [categories, setCategories] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [grades, setGrades] = useState([]);
  const [years, setYears] = useState([]);
  const [saving, setSaving] = useState(false);

  const [catForm, setCatForm] = useState({ name: '', frequency: 'term', is_mandatory: true });
  const [schedForm, setSchedForm] = useState({
    fee_category_id: '', grade_id: '', academic_year: '2017/2018', term: '1', amount: '',
  });
  const [discForm, setDiscForm] = useState({ name: '', type: 'percentage', value: '' });
  const [genForm, setGenForm] = useState({
    academic_year: '2017/2018', term: '1', grade_id: '', due_date: '', discount_rule_id: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const needDash = mode === 'full' || mode === 'overview';
      const needSetup = mode === 'full' || mode === 'student-fees';
      const needLedger = mode === 'full' || mode === 'ledger';

      const [dash, cats, scheds, discs, inv, led, gr, yr] = await Promise.all([
        needDash ? financeApi.getDashboard().catch(() => ({ data: {} })) : Promise.resolve({ data: {} }),
        needSetup ? financeApi.listCategories().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
        needSetup ? financeApi.listSchedules({}).catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
        needSetup ? financeApi.listDiscounts().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
        needSetup ? financeApi.listInvoices({}).catch(() => ({ data: { invoices: [] } })) : Promise.resolve({ data: { invoices: [] } }),
        needLedger ? financeApi.getLedger({ limit: 80 }).catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
        needSetup ? catalogApi.getGrades().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
        needSetup ? catalogApi.getYears().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
      ]);
      if (needDash) setDashboard(unwrap(dash));
      if (needSetup) {
        setCategories(unwrap(cats) || []);
        setSchedules(unwrap(scheds) || []);
        setDiscounts(unwrap(discs) || []);
        setInvoices(inv.data?.invoices ?? unwrap(inv) ?? []);
        setGrades(unwrap(gr) || []);
        const yList = unwrap(yr) || [];
        setYears(yList);
        if (yList[0]?.name) {
          setSchedForm((f) => ({ ...f, academic_year: yList[0].name }));
          setGenForm((f) => ({ ...f, academic_year: yList[0].name }));
        }
      }
      if (needLedger) setLedger(unwrap(led) || []);
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to load finance', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast, mode]);

  useEffect(() => { load(); }, [load]);

  const recordPayment = async (invoice) => {
    setSaving(true);
    try {
      await financeApi.recordPayment({
        invoiceId: invoice.id,
        amount: Number(invoice.balance || invoice.amount),
        paymentMethod: 'cash',
        notes: 'Recorded by finance office',
      });
      toast('Payment recorded in ledger', 'success');
      await load();
    } catch (e) {
      toast(e.response?.data?.message || 'Payment failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showTab = (id) => mode === 'full' || tab === id || (mode === 'student-fees' && (id === 'setup' || id === 'invoices'));

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {kicker && <p className={`text-xs font-bold uppercase tracking-widest ${a.label}`}>{kicker}</p>}
            {title && <h1 className="text-3xl font-black text-slate-900">{title}</h1>}
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      )}
      {!showHeader && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      )}

      {visibleTabs.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
          {visibleTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-bold transition-colors ${
                tab === id ? a.tabActive : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className={`animate-spin ${a.spin}`} size={36} /></div>
      ) : (
        <>
          {showTab('overview') && (mode === 'overview' || tab === 'overview') && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total billed" value={ETB.format(dashboard?.billed ?? 0)} icon={Receipt} accent={accent} />
                <StatCard label="Collected" value={ETB.format(dashboard?.collected ?? 0)} icon={CheckCircle2} accent={accent} />
                <StatCard label="Outstanding" value={ETB.format(dashboard?.outstanding ?? 0)} icon={Banknote} accent={accent} />
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <Panel title="Collections by method">
                  {(dashboard?.collections_by_method || []).length === 0 ? (
                    <p className="text-sm text-slate-400">No payments yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {dashboard.collections_by_method.map((m) => (
                        <li key={m.method} className="flex justify-between text-sm font-medium">
                          <span className="capitalize">{m.method}</span>
                          <span className="font-bold">{ETB.format(Number(m.total))}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
                <Panel title="Open invoices">
                  <p className="text-3xl font-black text-slate-900">{dashboard?.open_invoices ?? 0}</p>
                  <p className="text-xs text-slate-500">Pending or partial</p>
                </Panel>
              </div>
            </div>
          )}

          {showTab('setup') && tab === 'setup' && (
            <div className="grid xl:grid-cols-3 gap-6">
              <SetupForm
                title="Fee category"
                icon={BookOpen}
                accent={accent}
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    await financeApi.createCategory(catForm);
                    toast('Category created', 'success');
                    setCatForm({ name: '', frequency: 'term', is_mandatory: true });
                    await load();
                  } catch (err) {
                    toast(err.response?.data?.message || 'Failed', 'error');
                  } finally { setSaving(false); }
                }}
                saving={saving}
              >
                <Field label="Name" value={catForm.name} onChange={(v) => setCatForm((f) => ({ ...f, name: v }))} placeholder="Tuition" />
                <Field label="Frequency" as="select" value={catForm.frequency} onChange={(v) => setCatForm((f) => ({ ...f, frequency: v }))}>
                  <option value="term">Per term</option>
                  <option value="annual">Annual</option>
                  <option value="monthly">Monthly</option>
                  <option value="one_time">One-time</option>
                </Field>
              </SetupForm>

              <SetupForm
                title="Fee schedule (amount)"
                icon={Layers}
                accent={accent}
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    await financeApi.createSchedule({
                      ...schedForm,
                      term: schedForm.term ? Number(schedForm.term) : null,
                      amount: Number(schedForm.amount),
                      grade_id: schedForm.grade_id || null,
                    });
                    toast('Schedule saved', 'success');
                    await load();
                  } catch (err) {
                    toast(err.response?.data?.message || 'Failed', 'error');
                  } finally { setSaving(false); }
                }}
                saving={saving}
              >
                <Field label="Category" as="select" value={schedForm.fee_category_id} onChange={(v) => setSchedForm((f) => ({ ...f, fee_category_id: v }))}>
                  <option value="">Select</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Field>
                <Field label="Grade" as="select" value={schedForm.grade_id} onChange={(v) => setSchedForm((f) => ({ ...f, grade_id: v }))}>
                  <option value="">All grades</option>
                  {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </Field>
                <Field label="Academic year" value={schedForm.academic_year} onChange={(v) => setSchedForm((f) => ({ ...f, academic_year: v }))} />
                <Field label="Term" as="select" value={schedForm.term} onChange={(v) => setSchedForm((f) => ({ ...f, term: v }))}>
                  <option value="">Annual</option>
                  <option value="1">Term 1</option>
                  <option value="2">Term 2</option>
                  <option value="3">Term 3</option>
                </Field>
                <Field label="Amount (ETB)" type="number" value={schedForm.amount} onChange={(v) => setSchedForm((f) => ({ ...f, amount: v }))} />
              </SetupForm>

              <SetupForm
                title="Discount rule"
                icon={Percent}
                accent={accent}
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    await financeApi.createDiscount({ ...discForm, value: Number(discForm.value) });
                    toast('Discount created', 'success');
                    await load();
                  } catch (err) {
                    toast(err.response?.data?.message || 'Failed', 'error');
                  } finally { setSaving(false); }
                }}
                saving={saving}
              >
                <Field label="Name" value={discForm.name} onChange={(v) => setDiscForm((f) => ({ ...f, name: v }))} />
                <Field label="Type" as="select" value={discForm.type} onChange={(v) => setDiscForm((f) => ({ ...f, type: v }))}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed ETB</option>
                </Field>
                <Field label="Value" type="number" value={discForm.value} onChange={(v) => setDiscForm((f) => ({ ...f, value: v }))} />
              </SetupForm>

              <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <p className="px-5 py-3 font-black text-slate-900 border-b">Active schedules</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
                      <tr>
                        <th className="px-4 py-2 text-left">Category</th>
                        <th className="px-4 py-2 text-left">Grade</th>
                        <th className="px-4 py-2 text-left">Year / Term</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {schedules.map((s) => (
                        <tr key={s.id}>
                          <td className="px-4 py-3 font-medium">{s.category_name}</td>
                          <td className="px-4 py-3">{s.grade_name || 'All'}</td>
                          <td className="px-4 py-3">{s.academic_year} {s.term ? `· T${s.term}` : ''}</td>
                          <td className="px-4 py-3 text-right font-bold">{ETB.format(Number(s.amount))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {showTab('invoices') && tab === 'invoices' && (
            <div className="space-y-6">
              <form
                className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-wrap gap-3 items-end"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const res = await financeApi.generateTermInvoices({
                      academic_year: genForm.academic_year,
                      term: genForm.term ? Number(genForm.term) : null,
                      grade_id: genForm.grade_id || null,
                      due_date: genForm.due_date || undefined,
                      discount_rule_id: genForm.discount_rule_id || null,
                    });
                    const d = unwrap(res);
                    toast(`Generated ${d.generated} invoices for ${d.students} students`, 'success');
                    await load();
                  } catch (err) {
                    toast(err.response?.data?.message || 'Generate failed', 'error');
                  } finally { setSaving(false); }
                }}
              >
                <Field label="Academic year" value={genForm.academic_year} onChange={(v) => setGenForm((f) => ({ ...f, academic_year: v }))} />
                <Field label="Term" as="select" value={genForm.term} onChange={(v) => setGenForm((f) => ({ ...f, term: v }))}>
                  <option value="1">1</option><option value="2">2</option><option value="3">3</option>
                </Field>
                <Field label="Grade (optional)" as="select" value={genForm.grade_id} onChange={(v) => setGenForm((f) => ({ ...f, grade_id: v }))}>
                  <option value="">All</option>
                  {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </Field>
                <Field label="Due date" type="date" value={genForm.due_date} onChange={(v) => setGenForm((f) => ({ ...f, due_date: v }))} />
                <Field label="Discount" as="select" value={genForm.discount_rule_id} onChange={(v) => setGenForm((f) => ({ ...f, discount_rule_id: v }))}>
                  <option value="">None</option>
                  {discounts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Field>
                <button type="submit" disabled={saving} className={`px-5 py-2.5 rounded-xl text-sm font-bold ${a.btn}`}>
                  {saving ? '…' : (feeWorkflow === 'approval' ? 'Submit for approval' : 'Generate term invoices')}
                </button>
              </form>

              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
                    <tr>
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-left">Year</th>
                      <th className="px-4 py-3 text-right">Due</th>
                      <th className="px-4 py-3 text-right">Balance</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3">
                          <p className="font-bold">{inv.first_name} {inv.last_name}</p>
                          <p className="text-xs text-slate-400">{inv.admission_number}</p>
                        </td>
                        <td className="px-4 py-3">{inv.academic_year || '—'} {inv.term ? `T${inv.term}` : ''}</td>
                        <td className="px-4 py-3 text-right font-bold">{ETB.format(Number(inv.amount))}</td>
                        <td className="px-4 py-3 text-right">{ETB.format(Number(inv.balance ?? 0))}</td>
                        <td className="px-4 py-3"><StatusPill status={inv.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            disabled={saving || Number(inv.balance ?? inv.amount) <= 0}
                            onClick={() => recordPayment(inv)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold ${a.hover} disabled:opacity-40`}
                          >
                            <CreditCard size={14} /> Record cash
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(mode === 'ledger' || (showTab('ledger') && tab === 'ledger')) && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <p className="px-5 py-4 font-black border-b text-slate-900">Immutable transaction ledger</p>
              <ul className="divide-y divide-slate-50">
                {ledger.map((tx) => (
                  <li key={tx.id} className="flex flex-wrap justify-between gap-2 px-5 py-4 text-sm">
                    <div>
                      <p className="font-bold text-slate-900 capitalize">{tx.type} · {tx.method}</p>
                      <p className="text-slate-500">
                        {tx.first_name ? `${tx.first_name} ${tx.last_name}` : '—'}
                        {tx.chapa_tx_ref && <span className="font-mono text-xs ml-2">{tx.chapa_tx_ref}</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-black ${a.amount}`}>{ETB.format(Number(tx.amount))}</p>
                      <p className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
                {ledger.length === 0 && <p className="p-12 text-center text-slate-400">No ledger entries yet.</p>}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
