import FinanceOfficerLayout from '../../components/layouts/FinanceOfficerLayout';
import SchoolFinanceContent from '../../components/finance/SchoolFinanceContent';

export default function FinanceLedgerPage() {
  return (
    <FinanceOfficerLayout>
      <SchoolFinanceContent
        mode="ledger"
        accent="teal"
        kicker="Finance office"
        title="Transaction ledger"
        subtitle="Immutable record of every payment, payroll disbursement, and adjustment."
      />
    </FinanceOfficerLayout>
  );
}
