import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user?.token) return <Navigate to="/login" replace />;

  const managingSchoolId = user.managingSchool?.id || sessionStorage.getItem('managingSchoolId');
  const isSuperManaging = user.role === 'SUPER_ADMIN' && managingSchoolId;
  const roleOk = allowedRoles.includes(user.role)
    || (isSuperManaging && allowedRoles.includes('SCHOOL_ADMIN'));

  if (!roleOk) {
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/super-admin/dashboard" replace />;
    if (user.role === 'FINANCE') return <Navigate to="/finance/dashboard" replace />;
    if (user.role === 'SCHOOL_ADMIN') return <Navigate to="/school-admin/dashboard" replace />;
    if (user.role === 'TEACHER') return <Navigate to="/teachers/dashboard" replace />;
    if (user.role === 'PARENT') return <Navigate to="/parent/dashboard" replace />;
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
