import { useState } from 'react';
import {
  ClipboardCheck, Layers, ScrollText, Wallet, Users,
} from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';
import SchoolFinanceContent from '../components/finance/SchoolFinanceContent';
import FinanceTeamPanel from '../components/finance/FinanceTeamPanel';
import PayrollPanel from '../components/finance/PayrollPanel';
import FinanceApprovalsPanel from '../components/finance/FinanceApprovalsPanel';
import PageHeader from '../components/ui/PageHeader';
import { useI18n } from '../context/I18nContext';
import { ui } from '../theme/tokens';

const TABS = [
  { id: 'overview', labelKey: 'finance.overview', icon: Wallet },
  { id: 'fees', labelKey: 'nav.studentFees', icon: Layers },
  { id: 'payroll', labelKey: 'nav.payroll', icon: Users },
  { id: 'approvals', labelKey: 'finance.approvals', icon: ClipboardCheck },
  { id: 'ledger', labelKey: 'finance.ledger', icon: ScrollText },
];

export default function Finance() {
  const { t } = useI18n();
  const [tab, setTab] = useState('overview');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          kicker={t('finance.kicker')}
          title={t('finance.title')}
          subtitle={t('finance.subtitle')}
        />

        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
          {TABS.map(({ id, labelKey, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-bold ${
                tab === id ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={16} /> {t(labelKey)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <SchoolFinanceContent mode="overview" accent="emerald" showHeader={false} />
        )}
        {tab === 'fees' && (
          <SchoolFinanceContent mode="student-fees" accent="emerald" feeWorkflow="direct" showHeader={false} />
        )}
        {tab === 'payroll' && <PayrollPanel mode="admin" accent="emerald" />}
        {tab === 'approvals' && (
          <div className={ui.panel}>
            <FinanceApprovalsPanel />
          </div>
        )}
        {tab === 'ledger' && (
          <SchoolFinanceContent mode="ledger" accent="emerald" showHeader={false} />
        )}

        <FinanceTeamPanel />
      </div>
    </AdminLayout>
  );
}
