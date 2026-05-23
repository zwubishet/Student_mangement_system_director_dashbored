import AppShell from './AppShell';
import { parentNav } from '../../navigation/menuKeys';

export default function ParentLayout({ children }) {
  return (
    <AppShell nav={parentNav} accent="emerald">
      {children}
    </AppShell>
  );
}
