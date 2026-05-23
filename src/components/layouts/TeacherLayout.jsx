import AppShell from './AppShell';
import { teacherNav } from '../../navigation/menuKeys';

export default function TeacherLayout({ children, title, subtitle }) {
  return (
    <AppShell nav={teacherNav} accent="emerald" headerTitle={title} headerKicker={subtitle}>
      {children}
    </AppShell>
  );
}
