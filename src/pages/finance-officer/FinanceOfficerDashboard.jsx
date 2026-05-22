import { Link } from 'react-router-dom';
import { Receipt, Users, ScrollText, ArrowRight } from 'lucide-react';
import FinanceOfficerLayout from '../../components/layouts/FinanceOfficerLayout';
import SchoolFinanceContent from '../../components/finance/SchoolFinanceContent';

const LINKS = [
  { to: '/finance/student-fees', label: 'Student fees', desc: 'Fee setup, invoicing & collections', icon: Receipt },
  { to: '/finance/payroll', label: 'Teacher payroll', desc: 'Pay runs, approve & disburse salaries', icon: Users },
  { to: '/finance/ledger', label: 'Ledger', desc: 'All payments, payroll & adjustments', icon: ScrollText },
];

export default function FinanceOfficerDashboard() {
  return (
    <FinanceOfficerLayout>
      <SchoolFinanceContent
        mode="overview"
        accent="teal"
        kicker="Finance office"
        title="Financial overview"
        subtitle="Collections, outstanding fees, and open invoices for your school."
      />
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {LINKS.map(({ to, label, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group bg-white rounded-2xl border border-slate-100 p-5 hover:border-amber-300 hover:shadow-md transition-all"
          >
            <Icon className="text-teal-600 mb-3" size={24} />
            <p className="font-black text-slate-900">{label}</p>
            <p className="text-sm text-slate-500 mt-1">{desc}</p>
            <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-amber-600 group-hover:gap-2 transition-all">
              Open <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </FinanceOfficerLayout>
  );
}
