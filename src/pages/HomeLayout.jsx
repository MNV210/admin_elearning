import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const HomeLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-bold">Nền Tảng Học Trực Tuyến</h1>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-200"}`}
            >
              <span className="material-icons">
                {isDark ? "light_mode" : "dark_mode"}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link
              to="/user"
              className={`p-8 rounded-xl shadow-lg transition-all hover:shadow-xl ${
                isDark ? "bg-gray-800 hover:bg-gray-750" : "bg-white hover:bg-gray-50"
              }`}
            >
              <div className="mb-4 p-4 rounded-full inline-block bg-blue-100">
                <span className="material-icons text-blue-600 text-4xl">school</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Bảng Điều Khiển Học Viên</h2>
              <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Truy cập khóa học, bài giảng, bài kiểm tra, chứng chỉ và diễn đàn thảo luận của bạn.
              </p>
              <div className="flex items-center text-blue-600">
                <span>Vào bảng điều khiển</span>
                <span className="material-icons ml-2">arrow_forward</span>
              </div>
            </Link>

            <Link
              to="/admin"
              className={`p-8 rounded-xl shadow-lg transition-all hover:shadow-xl ${
                isDark ? "bg-gray-800 hover:bg-gray-750" : "bg-white hover:bg-gray-50"
              }`}
            >
              <div className="mb-4 p-4 rounded-full inline-block bg-purple-100">
                <span className="material-icons text-purple-600 text-4xl">admin_panel_settings</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Bảng Điều Khiển Quản Trị</h2>
              <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Quản lý người dùng, khóa học, xem phân tích và xử lý các nhiệm vụ quản trị.
              </p>
              <div className="flex items-center text-purple-600">
                <span>Vào bảng điều khiển</span>
                <span className="material-icons ml-2">arrow_forward</span>
              </div>
            </Link>
          </div>

          <div className={`mt-16 p-6 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} shadow-md`}>
            <h2 className="text-xl font-semibold mb-4">Giới Thiệu Về Nền Tảng</h2>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>
              Nền tảng học trực tuyến này cung cấp hệ thống quản lý học tập toàn diện với cả giao diện học viên và quản trị viên. Học viên có thể truy cập tài liệu khóa học, làm bài kiểm tra, nhận chứng chỉ và tham gia diễn đàn thảo luận. Quản trị viên có thể quản lý người dùng, khóa học và giám sát phân tích nền tảng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLayout; 