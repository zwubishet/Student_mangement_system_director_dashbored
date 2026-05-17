import { useEffect, useMemo, useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Plus,
  Receipt,
  RefreshCw,
  Send,
} from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';
import { apiRequest } from '../api/restClient';

const GET_FINANCE_SETUP = gql`
  query FinanceSetup {
    academic_grades(order_by: { name: asc }) {
      id
      name
      sections(order_by: { name: asc }) {
        id
        name
      }
    }
  }
`;

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const Finance = () => {
  const { data } = useQuery(GET_FINANCE_SETUP);
  const [feeStructures, setFeeStructures] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [feeForm, setFeeForm] = useState({ gradeId: '', name: '', itemName: 'Tuition', amount: '' });
  const [bulkForm, setBulkForm] = useState({ feeStructureId: '', scope: 'grade', gradeId: '', sectionId: '', dueDate: '' });

  const grades = data?.academic_grades || [];
  const sections = useMemo(
    () => grades.flatMap((grade) => grade.sections.map((section) => ({ ...section, gradeName: grade.name, gradeId: grade.id }))),
    [grades]
  );

  const loadFinance = async () => {
    setLoading(true);
    const [fees, bills] = await Promise.all([
      apiRequest('/finance/fee-structures'),
      apiRequest('/finance/invoices'),
    ]);
    setFeeStructures(fees.feeStructures || []);
    setInvoices(bills.invoices || []);
    setLoading(false);
  };

  useEffect(() => {
    loadFinance().catch((err) => {
      setMessage(err.message);
      setLoading(false);
    });
  }, []);

  const createFeeStructure = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await apiRequest('/finance/fee-structures', {
        method: 'POST',
        body: JSON.stringify({
          gradeId: feeForm.gradeId,
          name: feeForm.name,
          items: [{ name: feeForm.itemName, amount: Number(feeForm.amount) }],
        }),
      });
      setFeeForm({ gradeId: '', name: '', itemName: 'Tuition', amount: '' });
      setMessage('Fee structure created.');
      await loadFinance();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const generateInvoices = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const body = {
        feeStructureId: bulkForm.feeStructureId,
        dueDate: bulkForm.dueDate,
        ...(bulkForm.scope === 'grade' ? { gradeId: bulkForm.gradeId } : { sectionId: bulkForm.sectionId }),
      };
      const result = await apiRequest('/finance/invoices/generate', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setMessage(`${result.total} invoices prepared. ${result.generated} new, ${result.reused} refreshed.`);
      await loadFinance();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const capturePayment = async (invoice) => {
    setSaving(true);
    setMessage('');
    try {
      await apiRequest('/finance/payments', {
        method: 'POST',
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: Number(invoice.balance),
          paymentMethod: 'gateway',
          gatewayTransactionId: `sim-${invoice.id}-${Date.now()}`,
        }),
      });
      setMessage('Payment captured and ledger updated.');
      await loadFinance();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const totals = invoices.reduce((acc, invoice) => {
    acc.billed += Number(invoice.amount || 0);
    acc.paid += Number(invoice.paid_amount || 0);
    acc.balance += Number(invoice.balance || 0);
    return acc;
  }, { billed: 0, paid: 0, balance: 0 });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Finance</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Billing & Ledger</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Generate invoices in bulk and capture idempotent payments.</p>
          </div>
          <button
            onClick={loadFinance}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {message && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {message}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Total billed" value={currency.format(totals.billed)} icon={<Receipt size={18} />} />
          <Metric label="Collected" value={currency.format(totals.paid)} icon={<CheckCircle2 size={18} />} />
          <Metric label="Outstanding" value={currency.format(totals.balance)} icon={<Banknote size={18} />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <div className="space-y-6">
            <form onSubmit={createFeeStructure} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Plus className="text-emerald-600" size={18} />
                <h2 className="font-black text-slate-900">Fee Structure</h2>
              </div>
              <div className="space-y-3">
                <Select label="Grade" value={feeForm.gradeId} onChange={(gradeId) => setFeeForm((prev) => ({ ...prev, gradeId }))} required>
                  <option value="">Select grade</option>
                  {grades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}
                </Select>
                <TextInput label="Name" value={feeForm.name} onChange={(name) => setFeeForm((prev) => ({ ...prev, name }))} placeholder="Grade 10 Tuition" required />
                <TextInput label="Item" value={feeForm.itemName} onChange={(itemName) => setFeeForm((prev) => ({ ...prev, itemName }))} required />
                <TextInput label="Amount" type="number" value={feeForm.amount} onChange={(amount) => setFeeForm((prev) => ({ ...prev, amount }))} placeholder="5000" required />
                <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-600 disabled:opacity-60">
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Create
                </button>
              </div>
            </form>

            <form onSubmit={generateInvoices} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Send className="text-emerald-600" size={18} />
                <h2 className="font-black text-slate-900">Bulk Generator</h2>
              </div>
              <div className="space-y-3">
                <Select label="Fee structure" value={bulkForm.feeStructureId} onChange={(feeStructureId) => setBulkForm((prev) => ({ ...prev, feeStructureId }))} required>
                  <option value="">Select structure</option>
                  {feeStructures.map((fee) => <option key={fee.id} value={fee.id}>{fee.grade_name} / {fee.name}</option>)}
                </Select>
                <Select label="Scope" value={bulkForm.scope} onChange={(scope) => setBulkForm((prev) => ({ ...prev, scope }))}>
                  <option value="grade">Grade</option>
                  <option value="section">Section</option>
                </Select>
                {bulkForm.scope === 'grade' ? (
                  <Select label="Grade" value={bulkForm.gradeId} onChange={(gradeId) => setBulkForm((prev) => ({ ...prev, gradeId }))} required>
                    <option value="">Select grade</option>
                    {grades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}
                  </Select>
                ) : (
                  <Select label="Section" value={bulkForm.sectionId} onChange={(sectionId) => setBulkForm((prev) => ({ ...prev, sectionId }))} required>
                    <option value="">Select section</option>
                    {sections.map((section) => <option key={section.id} value={section.id}>{section.gradeName} / {section.name}</option>)}
                  </Select>
                )}
                <TextInput label="Due date" type="date" value={bulkForm.dueDate} onChange={(dueDate) => setBulkForm((prev) => ({ ...prev, dueDate }))} required />
                <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60">
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />} Generate
                </button>
              </div>
            </form>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="font-black text-slate-900">Recent Invoices</h2>
              <span className="text-xs font-bold text-slate-400">{invoices.length} records</span>
            </div>
            {loading ? (
              <div className="flex h-72 items-center justify-center text-slate-400"><Loader2 className="animate-spin" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Student</th>
                      <th className="px-5 py-3">Fee</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Balance</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{invoice.first_name} {invoice.last_name}</p>
                          <p className="font-mono text-xs text-slate-400">{invoice.admission_number}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{invoice.fee_structure_name || 'General invoice'}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">{currency.format(Number(invoice.amount))}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">{currency.format(Number(invoice.balance))}</td>
                        <td className="px-5 py-4"><StatusPill status={invoice.status} /></td>
                        <td className="px-5 py-4 text-right">
                          <button
                            disabled={saving || Number(invoice.balance) <= 0}
                            onClick={() => capturePayment(invoice)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <CreditCard size={14} /> Pay
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const Metric = ({ label, value, icon }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">{icon}</div>
    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
  </div>
);

const TextInput = ({ label, value, onChange, ...props }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
    <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" {...props} />
  </label>
);

const Select = ({ label, value, onChange, children, ...props }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" {...props}>
      {children}
    </select>
  </label>
);

const StatusPill = ({ status }) => {
  const theme = status === 'paid'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
    : status === 'partial'
      ? 'bg-amber-50 text-amber-700 border-amber-100'
      : 'bg-slate-50 text-slate-600 border-slate-200';
  return <span className={`rounded-md border px-2 py-1 text-[10px] font-black uppercase tracking-widest ${theme}`}>{status}</span>;
};

export default Finance;
