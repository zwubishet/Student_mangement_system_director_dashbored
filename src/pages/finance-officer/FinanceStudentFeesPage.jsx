import FinanceOfficerLayout from '../../components/layouts/FinanceOfficerLayout';
import SchoolFinanceContent from '../../components/finance/SchoolFinanceContent';

export default function FinanceStudentFeesPage() {
  return (
    <FinanceOfficerLayout>
      <SchoolFinanceContent
        mode="student-fees"
        accent="teal"
        feeWorkflow="approval"
        defaultTab="invoices"
        kicker="Finance office"
        title="Student fees"
        subtitle="Configure fees and submit term invoice batches for school admin approval."
      />
    </FinanceOfficerLayout>
  );
}
