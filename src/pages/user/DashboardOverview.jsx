import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import userService from "../../services/userService";
import { courseService, quizService } from "../../services";
import LoadingSkeleton from "../../components/LoadingSkeleton";

const DashboardOverview = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [courseUserRegister, setCourseUserRegister] = useState([]);
  const [courseInfomation, setCourseInfomation] = useState([]);
  const [resultsQuizz,setResultsQuizz] = useState([])
  const [loading, setLoading] = useState(true);

  const getCourseUserRegister = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseUserRegister();
      console.log(response.data);
      setCourseUserRegister(response.data.courseUserRegister);
      setCourseInfomation(response.data.course);

      const response_quizz = await quizService.getQuizResulsByUserId();
      setResultsQuizz(response_quizz.data)

      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }

  useEffect(() => {
    getCourseUserRegister();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Chào mừng trở lại, Học viên!</h1>
        <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Đây là tổng quan về tiến độ học tập của bạn.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
          <div className="flex items-center mb-4">
            <span className="material-icons text-blue-500 mr-3">school</span>
            <h2 className="text-xl font-semibold">Khóa Học Đang Học</h2>
          </div>
          <p className="text-4xl font-bold text-blue-500">{courseUserRegister?.length}</p>
          {/* <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Hoàn thành trung bình 68%
          </p> */}
        </div>

        <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
          <div className="flex items-center mb-4">
            <span className="material-icons text-green-500 mr-3">assignment_turned_in</span>
            <h2 className="text-xl font-semibold">Bài Kiểm Tra Đã Hoàn Thành</h2>
          </div>
          <p className="text-4xl font-bold text-green-500">{resultsQuizz?.length}</p>
          {/* <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Điểm Trung Bình: 82%
          </p> */}
        </div>

        {/* <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
          <div className="flex items-center mb-4">
            <span className="material-icons text-purple-500 mr-3">schedule</span>
            <h2 className="text-xl font-semibold">Thời Gian Học</h2>
          </div>
          <p className="text-4xl font-bold text-purple-500">24h</p>
          <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Tháng này
          </p>
        </div> */}
      </div>

      {/* Course Progress */}
      <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
        <h2 className="text-xl font-semibold mb-4">Tiến Độ Khóa Học Của Bạn</h2>
        <div className="space-y-6">
          {courseInfomation?.slice(0, 5).map((course) => {
            // Tính % progress
            const progress = course.lessons?.length 
              ? (course.learn_progress?.length / course.lessons.length) * 100 
              : 0;

            return (
              <div key={course.id} className="space-y-2">
                {/* Tiêu đề khóa học + Tiến độ */}
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{course.title}</h3>
                  <span className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    {course.learn_progress?.length}/{course.lessons?.length} bài học
                  </span>
                </div>

                {/* Thanh Progress */}
                <div className={`h-2 w-full bg-gray-200 ${isDark ? "bg-gray-700" : ""} rounded-full overflow-hidden`}>
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Phần trăm tiến độ */}
                <div className="flex justify-end">
                  <span className="text-sm font-medium text-blue-500">{progress.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activities */}
        {/* <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
          <h2 className="text-xl font-semibold mb-4">Hoạt Động Gần Đây</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <span className={`material-icons p-2 rounded-full mr-3 ${
                  activity.type === 'quiz' 
                    ? 'bg-green-100 text-green-600' 
                    : activity.type === 'lecture' 
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-purple-100 text-purple-600'
                }`}>
                  {activity.type === 'quiz' 
                    ? 'quiz' 
                    : activity.type === 'lecture' 
                      ? 'play_circle'
                      : 'forum'
                  }
                </span>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <div className="flex mt-1 text-sm">
                    <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>{activity.date}</p>
                    {activity.score && (
                      <p className="ml-4 text-green-500">Điểm: {activity.score}</p>
                    )}
                    {activity.duration && (
                      <p className="ml-4 text-blue-500">Thời lượng: {activity.duration}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Upcoming Deadlines */}
        {/* <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
          <h2 className="text-xl font-semibold mb-4">Hạn Chót Sắp Tới</h2>
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className={`p-4 rounded-lg border ${
                isDark ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"
              }`}>
                <h3 className="font-medium">{deadline.title}</h3>
                <p className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}>
                  {deadline.course}
                </p>
                <div className="flex items-center mt-2">
                  <span className="material-icons text-red-500 text-sm mr-1">event</span>
                  <p className="text-sm text-red-500">Hạn: {deadline.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default DashboardOverview;