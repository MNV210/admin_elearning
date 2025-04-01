import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  UsersIcon, 
  BookOpenIcon, 
  ChartBarIcon, 
  BellIcon, 
  Cog6ToothIcon, 
  ArrowLeftOnRectangleIcon,
  TagIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

function AdminDashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminSidebarItems = [
    { id: 'dashboard', name: 'Bảng Điều Khiển', icon: <Cog6ToothIcon className="w-6 h-6" />, path: '/admin' },
    { id: 'users', name: 'Quản Lý Người Dùng', icon: <UsersIcon className="w-6 h-6" />, path: '/admin/users' },
    { id: 'categories', name: 'Quản Lý Danh Mục', icon: <TagIcon className="w-6 h-6" />, path: '/admin/categories' },
    { id: 'courses', name: 'Quản Lý Khóa Học', icon: <BookOpenIcon className="w-6 h-6" />, path: '/admin/courses' },
    // { id: 'analytics', name: 'Báo Cáo & Phân Tích', icon: <ChartBarIcon className="w-6 h-6" />, path: '/admin/analytics' },
    // { id: 'notifications', name: 'Thông Báo', icon: <BellIcon className="w-6 h-6" />, path: '/admin/notifications' },
  ];

  const teacherSidebarItems = [
    { id: 'categories', name: 'Quản Lý Danh Mục', icon: <TagIcon className="w-6 h-6" />, path: '/admin/categories' },
    { id: 'courses', name: 'Quản Lý Khóa Học', icon: <BookOpenIcon className="w-6 h-6" />, path: '/admin/courses' },
  ];

  const sidebarItems = user?.role === 'admin' ? adminSidebarItems : teacherSidebarItems;

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công!');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
      >
        {isSidebarOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-white shadow-md
      `}>
        <div className="p-6">
          <h1 className="text-xl lg:text-2xl font-bold text-blue-600">Quản Trị Học Trực Tuyến</h1>
        </div>
        <nav className="mt-6">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.id} className="px-2 py-1">
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-gray-700 rounded-lg ${
                    activePage === item.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsSidebarOpen(false); // Close sidebar on mobile after clicking
                  }}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-6">
          <button 
            className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100"
            onClick={handleLogout}
          >
            <ArrowLeftOnRectangleIcon className="w-6 h-6 mr-3" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-4 lg:px-8 py-4">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
              {sidebarItems.find(item => item.id === activePage)?.name || 'Quản Lý'}
            </h2>
            <div className="flex items-center">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <BellIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
              </button>
              <div className="ml-4 flex items-center">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm lg:text-base">
                  {user?.name?.[0] || 'U'}
                </div>
                <span className="ml-2 text-gray-700 text-sm lg:text-base hidden sm:block">{user?.name || 'User'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminDashboard; 