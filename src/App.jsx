import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react'; 

import { client } from './api/client';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import SchoolAdminDashboard from './pages/SchoolAdminDashboard';
import Students from './pages/Students'; // ✅ New Student Page

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
          
          {/* ✅ New Student Management Route */}
          <Route
            path="/school-admin/students"
            element={
              <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
                <Students />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;