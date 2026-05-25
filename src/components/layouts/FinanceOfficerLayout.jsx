import AppShell from './AppShell';
import { financeNav } from '../../navigation/menuKeys';

export default function FinanceOfficerLayout({ children }) {
  return (
    <AppShell nav={financeNav} accent="teal" mobileBottomNav>
      {children}
    </AppShell>
  );
}
