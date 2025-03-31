import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const UserDashboard = () => {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`flex h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? "w-64" : "w-20"} ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } p-4 transition-all duration-300 shadow-lg`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className={`font-bold text-xl ${sidebarOpen ? "" : "hidden"}`}>Hệ Thống Học Tập</h2>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full hover:bg-gray-200 hover:bg-opacity-20"
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        <nav className="space-y-2">
          <NavLink 
            to="/user" 
            end
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg transition-colors ${
                sidebarOpen ? "justify-start" : "justify-center"
              } ${
                isActive 
                  ? theme === "dark" 
                    ? "bg-blue-600 text-white" 
                    : "bg-blue-100 text-blue-800" 
                  : "hover:bg-gray-200 hover:bg-opacity-20"
              }`
            }
          >
            <span className="material-icons mr-2">dashboard</span>
            {sidebarOpen && <span>Bảng Điều Khiển</span>}
          </NavLink>
          
          <NavLink 
            to="/user/lectures" 
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg transition-colors ${
                sidebarOpen ? "justify-start" : "justify-center"
              } ${
                isActive 
                  ? theme === "dark" 
                    ? "bg-blue-600 text-white" 
                    : "bg-blue-100 text-blue-800" 
                  : "hover:bg-gray-200 hover:bg-opacity-20"
              }`
            }
          >
            <span className="material-icons mr-2">video_library</span>
            {sidebarOpen && <span>Bài Giảng & Tài Liệu</span>}
          </NavLink>
          
          <NavLink 
            to="/user/quizzes" 
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg transition-colors ${
                sidebarOpen ? "justify-start" : "justify-center"
              } ${
                isActive 
                  ? theme === "dark" 
                    ? "bg-blue-600 text-white" 
                    : "bg-blue-100 text-blue-800" 
                  : "hover:bg-gray-200 hover:bg-opacity-20"
              }`
            }
          >
            <span className="material-icons mr-2">quiz</span>
            {sidebarOpen && <span>Bài Kiểm Tra & Đánh Giá</span>}
          </NavLink>
          
          {/* <NavLink 
            to="/user/certifications" 
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg transition-colors ${
                sidebarOpen ? "justify-start" : "justify-center"
              } ${
                isActive 
                  ? theme === "dark" 
                    ? "bg-blue-600 text-white" 
                    : "bg-blue-100 text-blue-800" 
                  : "hover:bg-gray-200 hover:bg-opacity-20"
              }`
            }
          >
            <span className="material-icons mr-2">workspace_premium</span>
            {sidebarOpen && <span>Chứng Chỉ</span>}
          </NavLink> */}
          
          {/* <NavLink 
            to="/user/forum" 
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg transition-colors ${
                sidebarOpen ? "justify-start" : "justify-center"
              } ${
                isActive 
                  ? theme === "dark" 
                    ? "bg-blue-600 text-white" 
                    : "bg-blue-100 text-blue-800" 
                  : "hover:bg-gray-200 hover:bg-opacity-20"
              }`
            }
          >
            <span className="material-icons mr-2">forum</span>
            {sidebarOpen && <span>Diễn Đàn Thảo Luận</span>}
          </NavLink> */}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className={`p-4 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-md flex justify-between items-center`}>
          <h1 className="text-2xl font-bold">Bảng Điều Khiển Học Tập</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-200 hover:bg-opacity-20">
              <span className="material-icons">notifications</span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200 hover:bg-opacity-20">
              <span className="material-icons">account_circle</span>
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserDashboard; 