import AppShell from './AppShell';
import { studentNav } from '../../navigation/menuKeys';

export default function StudentLayout({ children }) {
  return (
    <AppShell nav={studentNav} accent="sky" mobileBottomNav>
      {children}
    </AppShell>
  );
}
