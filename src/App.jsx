import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './api/client';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import SchoolAdminDashboard from './pages/SchoolAdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentsPage from './pages/students/StudentsPage';
import StudentProfilePage from './pages/students/StudentProfilePage';
import TeachersPage from './pages/teachers/TeachersPage';
import TeacherProfilePage from './pages/teachers/TeacherProfilePage';
import ParentsPage from './pages/parents/ParentsPage';
import Classes from './pages/Classes';
import ClassDetailPage from './pages/classes/ClassDetailPage';
import AcademicStructurePage from './pages/academic/AcademicStructurePage';
import ExamManagement from './pages/ExamManagement';
import ExamDetailPage from './pages/exams/ExamDetailPage';
import ExamResults from './pages/ExamResults';
import Settings from './pages/Settings';
import SubjectConfigurator from './pages/SubjectConfigurator';
import TeacherClasses from './pages/TeacherClasses';
import TeacherClassDetailPage from './pages/teacher-portal/TeacherClassDetailPage';
import TeacherStudents from './pages/TeacherStudents';
import TeacherStudentDetailPage from './pages/teacher-portal/TeacherStudentDetailPage';
import Attendance from './pages/Attendance';
import TeacherSectionAttendancePage from './pages/teacher-portal/TeacherSectionAttendancePage';
import ExamSelection from './pages/ExamSelection';
import MarkEntryPage from './pages/MarkEntryPage';
import PlatformDashboard from './pages/super-admin/PlatformDashboard';
import SchoolsPage from './pages/super-admin/SchoolsPage';
import SchoolDetailPage from './pages/super-admin/SchoolDetailPage';
import PlatformHealthPage from './pages/super-admin/PlatformHealthPage';
import PlatformAuditPage from './pages/super-admin/PlatformAuditPage';
import PlatformSettingsPage from './pages/super-admin/PlatformSettingsPage';
import Finance from './pages/Finance';
import Files from './pages/Files';
import ParentDashboardPage from './pages/parent/ParentDashboardPage';
import ParentChildPage from './pages/parent/ParentChildPage';

const ADMIN = ['SCHOOL_ADMIN'];
const TEACHER = ['TEACHER'];
const SUPER = ['SUPER_ADMIN'];
const PARENT = ['PARENT'];

const guard = (roles, el) => <ProtectedRoute allowedRoles={roles}>{el}</ProtectedRoute>;

function GradingExamRedirect() {
  const { examId } = useParams();
  return <Navigate to={`/school-admin/exams/${examId}?tab=marks`} replace />;
}

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Super Admin — platform control plane */}
            <Route path="/super-admin/dashboard" element={guard(SUPER, <PlatformDashboard />)} />
            <Route path="/super-admin/schools" element={guard(SUPER, <SchoolsPage />)} />
            <Route path="/super-admin/schools/:id" element={guard(SUPER, <SchoolDetailPage />)} />
            <Route path="/super-admin/health" element={guard(SUPER, <PlatformHealthPage />)} />
            <Route path="/super-admin/audit" element={guard(SUPER, <PlatformAuditPage />)} />
            <Route path="/super-admin/settings" element={guard(SUPER, <PlatformSettingsPage />)} />

            {/* School Admin */}
            <Route path="/school-admin/dashboard" element={guard(ADMIN, <SchoolAdminDashboard />)} />
            <Route path="/school-admin/students" element={guard(ADMIN, <StudentsPage />)} />
            <Route path="/school-admin/students/:id" element={guard(ADMIN, <StudentProfilePage />)} />
            <Route path="/school-admin/teachers" element={guard(ADMIN, <TeachersPage />)} />
            <Route path="/school-admin/teachers/:id" element={guard(ADMIN, <TeacherProfilePage />)} />
            <Route path="/school-admin/parents" element={guard(ADMIN, <ParentsPage />)} />
            <Route path="/school-admin/classes" element={guard(ADMIN, <Classes />)} />
            <Route path="/school-admin/classes/:id" element={guard(ADMIN, <ClassDetailPage />)} />
            <Route path="/school-admin/academic-setup" element={guard(ADMIN, <AcademicStructurePage />)} />
            <Route path="/school-admin/academic-cycle" element={<Navigate to="/school-admin/academic-setup" replace />} />
            <Route path="/school-admin/grading" element={guard(ADMIN, <ExamManagement />)} />
            <Route path="/school-admin/exams/:examId" element={guard(ADMIN, <ExamDetailPage />)} />
            <Route path="/school-admin/exams/:examId/results" element={guard(ADMIN, <ExamResults />)} />
            <Route path="/school-admin/exams/:examId/config" element={guard(ADMIN, <ExamDetailPage />)} />
            <Route path="/school-admin/grading/:examId" element={guard(ADMIN, <GradingExamRedirect />)} />
            <Route path="/school-admin/settings" element={guard(ADMIN, <Settings />)} />
            <Route path="/school-admin/finance" element={guard(ADMIN, <Finance />)} />
            <Route path="/school-admin/files" element={guard(ADMIN, <Files />)} />

            {/* Teacher portal */}
            <Route path="/teachers/dashboard" element={guard(TEACHER, <TeacherDashboard />)} />
            <Route path="/teachers/classes" element={guard(TEACHER, <TeacherClasses />)} />
            <Route path="/teachers/classes/:sectionId" element={guard(TEACHER, <TeacherClassDetailPage />)} />
            <Route path="/teachers/students" element={guard(TEACHER, <TeacherStudents />)} />
            <Route path="/teachers/my-students" element={guard(TEACHER, <TeacherStudents />)} />
            <Route path="/teachers/students/:studentId" element={guard(TEACHER, <TeacherStudentDetailPage />)} />
            <Route path="/teachers/attendance" element={guard(TEACHER, <Attendance />)} />
            <Route path="/teachers/attendance/:sectionId" element={guard(TEACHER, <TeacherSectionAttendancePage />)} />
            <Route path="/teachers/roster/:sectionId" element={guard(TEACHER, <TeacherClassDetailPage />)} />
            <Route path="/teachers/exams/:sectionId" element={guard(TEACHER, <ExamSelection />)} />
            <Route path="/teachers/mark-entry/:examSubjectId/:sectionId" element={guard(TEACHER, <MarkEntryPage />)} />

            <Route path="/parent/dashboard" element={guard(PARENT, <ParentDashboardPage />)} />
            <Route path="/parent/children/:studentId" element={guard(PARENT, <ParentChildPage />)} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
