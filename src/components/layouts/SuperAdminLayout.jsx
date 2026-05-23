import AppShell from './AppShell';
import { superAdminNav } from '../../navigation/menuKeys';

export default function SuperAdminLayout({ children }) {
  return (
    <AppShell nav={superAdminNav} accent="violet" headerKicker="Platform">
      {children}
    </AppShell>
  );
}
