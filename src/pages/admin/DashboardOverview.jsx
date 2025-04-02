import React, { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  BookOpenIcon, 
  AcademicCapIcon, 
  DocumentChartBarIcon 
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import AnalysisService from '../../services/analysService';

function DashboardOverview() {

  const [actionHistory, setActionHistory] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);
  const [courseCompletionData, setCourseCompletionData] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [statCards, setStatCards] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state

  const getActionHistory = async () => {
    try {
      setLoading(true); // Start loading
      const response = await AnalysisService.getActionHistory();
      setActionHistory(response);
      // Process data for charts
      const activityData = processUserActivityData(response);
      const completionData = processCourseCompletionData(response);
      
      setUserActivityData(activityData);
      setCourseCompletionData(completionData);
    } catch (error) {
      console.error('Error fetching action history:', error);
    } finally {
      setLoading(false); // End loading
    }
  }

  const getUserAndCourseInMonth = async () => {
    try {
      setLoading(true); // Start loading
      const response = await AnalysisService.getUserAndCourseInMonth();
      setMonthlyData(response);

      // Update stat cards with the total data
      if (response && response.total_users && response.total_courses && response.registered_courses) {
        const users = response.total_users;
        const courses = response.total_courses;
        const registeredCourses = response.registered_courses.this_month || 0;
        const previousRegisteredCourses = response.registered_courses.last_month || 0;

        // Calculate percentage change for registered courses
        const registeredChange = previousRegisteredCourses > 0
          ? ((registeredCourses - previousRegisteredCourses) / previousRegisteredCourses * 100).toFixed(1)
          : (registeredCourses > 0 ? '100' : '0'); // Handle case where last_month is 0

        setStatCards([
          {
            title: 'Tổng Người Dùng',
            value: users,
            icon: <UsersIcon className="w-8 h-8 text-blue-600" />,
            change: '',
            changeType: '',
          },
          {
            title: 'Khóa Học Hoạt Động',
            value: courses,
            icon: <BookOpenIcon className="w-8 h-8 text-green-600" />,
            change: '',
            changeType: '',
          },
          {
            title: 'Khóa Học Đăng Ký Trong Tháng',
            value: registeredCourses.toLocaleString(),
            icon: <BookOpenIcon className="w-8 h-8 text-orange-600" />,
            change: `${registeredChange > 0 ? '+' : ''}${registeredChange}%`,
            changeType: registeredChange >= 0 ? 'positive' : 'negative',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching monthly user and course data:', error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const getUserIn6Month = async () => {
    try {
      setLoading(true); // Start loading
      const response = await AnalysisService.getUserIn6Month();

      // Transform the response into a format suitable for the chart
      const formattedData = Object.entries(response).map(([month, users]) => ({
        name: month, // Use the month as the label
        users, // Use the value as the active users count
      }));

      setUserActivityData(formattedData);
    } catch (error) {
      console.error('Error fetching user activity data for 6 months:', error);
    } finally {
      setLoading(false); // End loading
    }
  };


  // const processCourseCompletionData = (data) => {
  //   // Process data for course completion chart
  //   // This is a simplified example - you should implement your own logic
  //   return [
  //     { name: 'Khóa học A', completed: 45, total: 80 },
  //     { name: 'Khóa học B', completed: 65, total: 90 },
  //     { name: 'Khóa học C', completed: 35, total: 70 },
  //     { name: 'Khóa học D', completed: 55, total: 60 },
  //     { name: 'Khóa học E', completed: 25, total: 50 },
  //   ];
  // };

  useEffect(() => {
    getActionHistory();
    getUserAndCourseInMonth();
    getUserIn6Month(); // Fetch user activity data for 6 months
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    // Ensure both dates are valid
    if (isNaN(date.getTime()) || isNaN(now.getTime())) {
      return 'Thời gian không hợp lệ';
    }

    // Use UTC time to avoid timezone issues
    const diffInMilliseconds = now.getTime() - date.getTime();

    // Ensure the difference is not negative
    if (diffInMilliseconds < 0) {
      return 'Thời gian không hợp lệ';
    }

    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
  };

  return (
    <div>
      {loading ? ( // Show CSS-based loading spinner
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 border-solid"></div> {/* CSS spinner */}
          <p className="text-lg font-semibold ml-4">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 font-medium">{card.title}</p>
                    <h3 className="text-3xl font-bold mt-2">{card.value}</h3>
                    <span className={`inline-block mt-2 text-sm font-medium ${
                      card.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {card.change}
                    </span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Số lượng người dùng (6 Tháng Qua)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#3b82f6"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Hoạt Động Gần Đây</h3>
              <div className="space-y-4">
                {actionHistory.length > 0 ? (
                  actionHistory.map((activity, index) => (
                    <div key={index} className="flex items-center py-3 border-b border-gray-200 last:border-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold mr-4">
                        {activity.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800">
                          <span className="font-medium">{activity.user?.name || 'Người dùng'}</span> {activity.action_details}
                          {activity.course && (
                            <span className="font-medium"> {activity.course.title}</span>
                          )}
                        </p>
                        <p className="text-gray-500 text-sm">{formatTime(activity.created_at)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 py-4 text-center">Không có hoạt động nào gần đây</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardOverview;