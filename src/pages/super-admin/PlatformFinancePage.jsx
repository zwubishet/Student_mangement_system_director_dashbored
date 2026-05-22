import { useCallback, useEffect, useState } from 'react';
import {
  Banknote, Building2, Loader2, RefreshCw, ScrollText, Percent, Receipt,
} from 'lucide-react';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import PlatformPageHeader from '../../components/super-admin/PlatformPageHeader';
import { platformApi } from '../../api/services';
import { ETB } from '../../components/finance/financeUi';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Banknote },
  { id: 'transactions', label: 'Transactions', icon: ScrollText },
  { id: 'commissions', label: 'Commissions', icon: Percent },
  { id: 'billing', label: 'School billing', icon: Receipt },
];

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export default function PlatformFinancePage() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schoolFilter, setSchoolFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = schoolFilter ? { schoolId: schoolFilter } : {};
      const [ov, tx, cm, bi] = await Promise.all([
        platformApi.getFinanceOverview(),
        platformApi.listFinanceTransactions({ ...params, type: typeFilter || undefined, limit: 150 }),
        platformApi.listFinanceCommissions({ ...params, limit: 100 }),
        platformApi.listFinanceBilling({ limit: 80 }),
      ]);
      setOverview(ov.data?.data ?? null);
      setTransactions(unwrap(tx));
      setCommissions(unwrap(cm));
      setBilling(unwrap(bi));
    } finally {
      setLoading(false);
    }
  }, [schoolFilter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <PlatformPageHeader
          title="Platform finance"
          subtitle="Cross-tenant payments, commissions, and subscription billing."
        />

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-bold ${
                  tab === id ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white text-sm font-bold"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {(tab === 'transactions' || tab === 'commissions') && (
          <div className="flex flex-wrap gap-3">
            <input
              className="rounded-lg border px-3 py-2 text-sm font-medium min-w-[200px]"
              placeholder="Filter by school UUID (optional)"
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
            />
            {tab === 'transactions' && (
              <select
                className="rounded-lg border px-3 py-2 text-sm font-medium"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All types</option>
                <option value="payment">Payment</option>
                <option value="payroll">Payroll</option>
                <option value="refund">Refund</option>
                <option value="adjustment">Adjustment</option>
              </select>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin text-violet-600" size={36} /></div>
        ) : (
          <>
            {tab === 'overview' && overview && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat label="30-day payment volume" value={ETB.format(Number(overview.payment_volume_30d ?? 0))} />
                <Stat label="Commission (total)" value={ETB.format(Number(overview.commissions?.total ?? 0))} />
                <Stat label="Pending commission" value={ETB.format(Number(overview.commissions?.pending ?? 0))} />
                <Stat
                  label="Schools by plan"
                  value={(overview.schools_by_plan || []).map((p) => `${p.plan}: ${p.count}`).join(' · ') || '—'}
                />
              </div>
            )}

            {tab === 'transactions' && (
              <TxTable
                rows={transactions}
                cols={['school_name', 'type', 'method', 'amount', 'student', 'created_at']}
                renderRow={(tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <p className="font-bold flex items-center gap-1"><Building2 size={14} className="text-violet-500" />{tx.school_name}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{tx.type}</td>
                    <td className="px-4 py-3 capitalize">{tx.method}</td>
                    <td className="px-4 py-3 text-right font-black text-violet-700">{ETB.format(Number(tx.amount))}</td>
                    <td className="px-4 py-3 text-sm">
                      {tx.student_first_name ? `${tx.student_first_name} ${tx.student_last_name}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(tx.created_at).toLocaleString()}</td>
                  </tr>
                )}
              />
            )}

            {tab === 'commissions' && (
              <TxTable
                rows={commissions}
                cols={['school', 'amount', 'rate', 'settled', 'date']}
                renderRow={(c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-bold">{c.school_name}</td>
                    <td className="px-4 py-3 text-right font-black">{ETB.format(Number(c.commission_etb))}</td>
                    <td className="px-4 py-3">{c.rate_percent != null ? `${c.rate_percent}%` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${c.settled ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {c.settled ? 'settled' : 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(c.created_at).toLocaleString()}</td>
                  </tr>
                )}
              />
            )}

            {tab === 'billing' && (
              <TxTable
                rows={billing}
                cols={['school', 'period', 'total', 'status', 'due']}
                renderRow={(b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-bold">{b.school_name}</td>
                    <td className="px-4 py-3">{b.billing_period || '—'}</td>
                    <td className="px-4 py-3 text-right font-black">{ETB.format(Number(b.total))}</td>
                    <td className="px-4 py-3 capitalize">{b.status}</td>
                    <td className="px-4 py-3 text-sm">{b.due_date || '—'}</td>
                  </tr>
                )}
              />
            )}
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
      <p className="text-lg font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function TxTable({ rows, cols, renderRow }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
            <tr>
              {cols.map((c) => (
                <th key={c} className="px-4 py-3 text-left">{c.replace('_', ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map(renderRow)}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="p-12 text-center text-slate-400">No records.</p>}
    </div>
  );
}
