import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Chuyển hướng đến trang đăng nhập và lưu lại URL hiện tại
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra quyền truy cập dựa trên role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    toast.error('Bạn không có quyền truy cập trang này!');
    // Chuyển hướng về trang mặc định dựa trên role
    const defaultPath = user?.role === 'teacher' ? '/admin/categories' : '/';
    return <Navigate to={defaultPath} replace />;
  }

  return children;
};

export default RoleProtectedRoute; 