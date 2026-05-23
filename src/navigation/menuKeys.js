/** Nav items use i18n keys — resolve with t(item.labelKey) in layouts */

export const schoolAdminNav = [
  { labelKey: 'nav.dashboard', path: '/school-admin/dashboard', icon: 'LayoutDashboard' },
  { labelKey: 'nav.students', path: '/school-admin/students', icon: 'GraduationCap' },
  { labelKey: 'nav.teachers', path: '/school-admin/teachers', icon: 'UserSquare2' },
  { labelKey: 'nav.parents', path: '/school-admin/parents', icon: 'Users' },
  { labelKey: 'nav.classes', path: '/school-admin/classes', icon: 'School' },
  { labelKey: 'nav.lessonPlanning', path: '/school-admin/lesson-planning', icon: 'BookOpen' },
  { labelKey: 'nav.grading', path: '/school-admin/grading', icon: 'Trophy' },
  { labelKey: 'nav.finance', path: '/school-admin/finance', icon: 'Receipt' },
  { labelKey: 'nav.files', path: '/school-admin/files', icon: 'FolderOpen' },
  { labelKey: 'nav.academicSetup', path: '/school-admin/academic-setup', icon: 'Calendar' },
  { labelKey: 'nav.settings', path: '/school-admin/settings', icon: 'Settings' },
];

export const teacherNav = [
  { labelKey: 'nav.myDashboard', path: '/teachers/dashboard', icon: 'LayoutDashboard' },
  { labelKey: 'nav.myClasses', path: '/teachers/classes', icon: 'BookOpen' },
  { labelKey: 'nav.examsMarks', path: '/teachers/exams', icon: 'Trophy' },
  { labelKey: 'nav.attendance', path: '/teachers/attendance', icon: 'ClipboardCheck' },
  { labelKey: 'nav.students', path: '/teachers/my-students', icon: 'Users' },
  { labelKey: 'nav.timetable', path: '/teachers/timetable', icon: 'Calendar' },
  { labelKey: 'nav.lessonPlans', path: '/teachers/lesson-plans', icon: 'FileText' },
  { labelKey: 'nav.myProfile', path: '/teachers/profile', icon: 'UserSquare2' },
];

export const financeNav = [
  { labelKey: 'nav.overview', path: '/finance/dashboard', icon: 'LayoutDashboard' },
  { labelKey: 'nav.studentFees', path: '/finance/student-fees', icon: 'Receipt' },
  { labelKey: 'nav.payroll', path: '/finance/payroll', icon: 'Users' },
  { labelKey: 'nav.ledger', path: '/finance/ledger', icon: 'ScrollText' },
];

export const superAdminNav = [
  { sectionKey: 'nav.sectionOverview' },
  { labelKey: 'nav.dashboard', path: '/super-admin/dashboard', icon: 'LayoutDashboard' },
  { labelKey: 'nav.activity', path: '/super-admin/activity', icon: 'Activity' },
  { sectionKey: 'nav.sectionTenants' },
  { labelKey: 'nav.schools', path: '/super-admin/schools', icon: 'School' },
  { sectionKey: 'nav.sectionPeople' },
  { labelKey: 'nav.users', path: '/super-admin/users', icon: 'Users' },
  { labelKey: 'nav.students', path: '/super-admin/students', icon: 'GraduationCap' },
  { labelKey: 'nav.teachers', path: '/super-admin/teachers', icon: 'UserCircle' },
  { sectionKey: 'nav.sectionFinance' },
  { labelKey: 'nav.platformFinance', path: '/super-admin/finance', icon: 'Wallet' },
  { sectionKey: 'nav.sectionSystem' },
  { labelKey: 'nav.health', path: '/super-admin/health', icon: 'HeartPulse' },
  { labelKey: 'nav.auditLog', path: '/super-admin/audit', icon: 'ScrollText' },
  { labelKey: 'nav.settings', path: '/super-admin/settings', icon: 'Settings' },
];

export const parentNav = [
  { labelKey: 'nav.myChildren', path: '/parent/dashboard', icon: 'Users' },
  { labelKey: 'nav.myAccount', path: '/parent/account', icon: 'Settings' },
];
