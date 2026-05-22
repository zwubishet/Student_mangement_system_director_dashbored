import { useState } from 'react';
import {
  ClipboardCheck, Layers, ScrollText, Wallet, Users,
} from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';
import SchoolFinanceContent from '../components/finance/SchoolFinanceContent';
import FinanceTeamPanel from '../components/finance/FinanceTeamPanel';
import PayrollPanel from '../components/finance/PayrollPanel';
import FinanceApprovalsPanel from '../components/finance/FinanceApprovalsPanel';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Wallet },
  { id: 'fees', label: 'Student fees', icon: Layers },
  { id: 'payroll', label: 'Payroll', icon: Users },
  { id: 'approvals', label: 'Approvals', icon: ClipboardCheck },
  { id: 'ledger', label: 'Ledger', icon: ScrollText },
];

export default function Finance() {
  const [tab, setTab] = useState('overview');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">School finance</p>
          <h1 className="text-3xl font-black text-slate-900">Billing, payroll & approvals</h1>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-bold ${
                tab === id ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <SchoolFinanceContent
            mode="overview"
            accent="emerald"
            kicker=""
            title=""
            subtitle=""
            showHeader={false}
          />
        )}
        {tab === 'fees' && (
          <SchoolFinanceContent
            mode="student-fees"
            accent="emerald"
            feeWorkflow="direct"
            kicker=""
            title=""
            subtitle=""
            showHeader={false}
          />
        )}
        {tab === 'payroll' && <PayrollPanel mode="admin" accent="emerald" />}
        {tab === 'approvals' && <FinanceApprovalsPanel />}
        {tab === 'ledger' && (
          <SchoolFinanceContent
            mode="ledger"
            accent="emerald"
            kicker=""
            title=""
            subtitle=""
            showHeader={false}
          />
        )}

        <FinanceTeamPanel />
      </div>
    </AdminLayout>
  );
}
