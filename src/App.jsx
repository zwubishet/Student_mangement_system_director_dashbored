import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react'; 

import { client } from './api/client';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import SchoolAdminDashboard from './pages/SchoolAdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard'
import Students from './pages/Students'; // ✅ New Student Page
import Teachers from './pages/Teachers'; 
import Classes from './pages/Classes'; // ✅ New import
import AcademicCycle from './pages/AcademicCycle'; 
import GradingEngine from './pages/GradingEngine'
import MarkEntryWrapper from './pages/MarkEntry'
import TeacherClasses from './pages/TeacherClasses'
import TeacherStudents from './pages/TeacherStudents'
import Attendance from './pages/Attendance'

const SuperAdminDashboard = () => (
  <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
    <h1 className="text-3xl font-bold">Welcome, Super Admin!</h1>
  </div>
);

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Super Admin Protected Routes */}
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* School Admin Protected Routes */}
          <Route
            path="/school-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
                <SchoolAdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path='/teachers/dashboard'
            element={
              <ProtectedRoute allowedRoles={['TEACHER']}>
                <TeacherDashboard/>
              </ProtectedRoute>
            }
          />
          <Route path="/school-admin/grading" element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
                <GradingEngine />
              </ProtectedRoute>
            } />
          <Route path="/school-admin/grading/:examId" element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
                <MarkEntryWrapper />
              </ProtectedRoute>
            } />
          
          {/* ✅ New Student Management Route */}
          <Route
            path="/school-admin/students"
            element={
              <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
                <Students />
              </ProtectedRoute>
            }
          />

          <Route
            path="/school-admin/teachers"
            element={
              <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
                <Teachers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/school-admin/classes"
            element={
              <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
                <Classes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/school-admin/academic-cycle"
            element={
              <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
                <AcademicCycle />
              </ProtectedRoute>
            }
          />

          {/* Update settings to point to academic-cycle if preferred, 
              or keep separate if you have other settings */}
          <Route
            path="/school-admin/settings"
            element={
              <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
                <AcademicCycle /> 
              </ProtectedRoute>
            }
          />


          <Route
            path="/teachers/classes"
            element={
              <ProtectedRoute allowedRoles={['TEACHER']}>
                <TeacherClasses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teachers/my-students"
            element={
              <ProtectedRoute allowedRoles={['TEACHER']}>
                <TeacherStudents />
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/teachers/attendance"
            element={
              <ProtectedRoute allowedRoles={['TEACHER']}>
                <Attendance />
              </ProtectedRoute>
            }
          /> */}
          <Route path="/teachers/attendance/" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <Attendance />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;