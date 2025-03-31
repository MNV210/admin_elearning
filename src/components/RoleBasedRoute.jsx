import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra xem user có role hợp lệ không
  if (!allowedRoles.includes(user.role)) {
    toast.error('Bạn không có quyền truy cập trang này!');
    
    // Redirect based on role
    let redirectPath = '/';
    if (user.role === 'teacher') {
      redirectPath = '/admin/categories';
    } else if (user.role === 'student') {
      redirectPath = '/';
    } else if (user.role === 'admin') {
      redirectPath = '/admin';
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default RoleBasedRoute; 