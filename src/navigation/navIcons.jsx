import {
  Activity, BookOpen, Calendar, ClipboardCheck, FolderOpen, GraduationCap,
  HeartPulse, LayoutDashboard, Receipt, School, ScrollText, Settings, Trophy,
  UserCircle, UserSquare2, Users, Wallet,
} from 'lucide-react';

const MAP = {
  LayoutDashboard, BookOpen, Calendar, ClipboardCheck, FolderOpen, GraduationCap,
  HeartPulse, Receipt, School, ScrollText, Settings, Trophy, UserCircle, UserSquare2,
  Users, Wallet, Activity,
};

export function NavIcon({ name, size = 20 }) {
  const Icon = MAP[name] || LayoutDashboard;
  return <Icon size={size} />;
}
