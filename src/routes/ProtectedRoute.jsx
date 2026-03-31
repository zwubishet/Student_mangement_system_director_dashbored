import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('role');
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!allowedRoles.includes(userRole)) return <Navigate to="/unauthorized" />;

  return children;
};

export default ProtectedRoute;