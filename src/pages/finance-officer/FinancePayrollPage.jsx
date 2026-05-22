import FinanceOfficerLayout from '../../components/layouts/FinanceOfficerLayout';
import PayrollPanel from '../../components/finance/PayrollPanel';

export default function FinancePayrollPage() {
  return (
    <FinanceOfficerLayout>
      <PayrollPanel mode="finance" accent="teal" />
    </FinanceOfficerLayout>
  );
}
