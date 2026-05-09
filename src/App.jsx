import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './api/client';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import SchoolAdminDashboard from './pages/SchoolAdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import AcademicCycle from './pages/AcademicCycle';
import GradingEngine from './pages/GradingEngine';
import MarkEntryWrapper from './pages/MarkEntry';
import TeacherClasses from './pages/TeacherClasses';
import TeacherStudents from './pages/TeacherStudents';
import Attendance from './pages/Attendance';
import AttendancePage from './pages/AttendancePage';
import TeacherRoster from './pages/TeacherRoster';
import ExamSelection from './pages/ExamSelection';
import MarkEntryPage from './pages/MarkEntryPage';
import ExamManagement from './pages/ExamManagement';
import SubjectConfigurator from './pages/SubjectConfigurator';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Super Admin */}
          <Route path="/super-admin/dashboard" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/schools" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />

          {/* School Admin */}
          <Route path="/school-admin/dashboard" element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
              <SchoolAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/school-admin/students" element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
              <Students />
            </ProtectedRoute>
          } />
          <Route path="/school-admin/teachers" element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
              <Teachers />
            </ProtectedRoute>
          } />
          <Route path="/school-admin/classes" element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
              <Classes />
            </ProtectedRoute>
          } />
          <Route path="/school-admin/academic-cycle" element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
              <AcademicCycle />
            </ProtectedRoute>
          } />
          <Route path="/school-admin/settings" element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
              <AcademicCycle />
            </ProtectedRoute>
          } />
          <Route path="/school-admin/grading" element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
              <ExamManagement />
            </ProtectedRoute>
          } />
          <Route path="/school-admin/exams/:examId/config" element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
              <SubjectConfigurator />
            </ProtectedRoute>
          } />
          <Route path="/school-admin/grading/:examId" element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
              <MarkEntryWrapper />
            </ProtectedRoute>
          } />

          {/* Teacher */}
          <Route path="/teachers/dashboard" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/teachers/classes" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherClasses />
            </ProtectedRoute>
          } />
          <Route path="/teachers/my-students" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherStudents />
            </ProtectedRoute>
          } />
          <Route path="/teachers/attendance" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <Attendance />
            </ProtectedRoute>
          } />
          <Route path="/teachers/attendance/:sectionId" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <AttendancePage />
            </ProtectedRoute>
          } />
          <Route path="/teachers/roster/:sectionId" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherRoster />
            </ProtectedRoute>
          } />
          <Route path="/teachers/exams/:sectionId" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <ExamSelection />
            </ProtectedRoute>
          } />
          <Route path="/teachers/mark-entry/:examSubjectId/:sectionId" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <MarkEntryPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
