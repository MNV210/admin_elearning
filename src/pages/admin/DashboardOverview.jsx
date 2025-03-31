import React from 'react';
import { 
  UsersIcon, 
  BookOpenIcon, 
  AcademicCapIcon, 
  DocumentChartBarIcon 
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Sample data for charts
const userActivityData = [
  { name: 'Th1', activeUsers: 400 },
  { name: 'Th2', activeUsers: 550 },
  { name: 'Th3', activeUsers: 600 },
  { name: 'Th4', activeUsers: 750 },
  { name: 'Th5', activeUsers: 800 },
  { name: 'Th6', activeUsers: 950 },
];

const courseCompletionData = [
  { name: 'Khóa học A', completed: 45, total: 80 },
  { name: 'Khóa học B', completed: 65, total: 90 },
  { name: 'Khóa học C', completed: 35, total: 70 },
  { name: 'Khóa học D', completed: 55, total: 60 },
  { name: 'Khóa học E', completed: 25, total: 50 },
];

function DashboardOverview() {
  const statCards = [
    {
      title: 'Tổng Người Dùng',
      value: '1,247',
      icon: <UsersIcon className="w-8 h-8 text-blue-600" />,
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Khóa Học Hoạt Động',
      value: '34',
      icon: <BookOpenIcon className="w-8 h-8 text-green-600" />,
      change: '+5%',
      changeType: 'positive',
    },
    {
      title: 'Hoàn Thành Khóa Học',
      value: '156',
      icon: <AcademicCapIcon className="w-8 h-8 text-purple-600" />,
      change: '+18%',
      changeType: 'positive',
    },
    {
      title: 'Điểm Kiểm Tra TB',
      value: '78%',
      icon: <DocumentChartBarIcon className="w-8 h-8 text-yellow-600" />,
      change: '+3%',
      changeType: 'positive',
    },
  ];

  return (
    <div>
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
                  {card.change} so với tháng trước
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
          <h3 className="text-lg font-semibold mb-4">Hoạt Động Người Dùng (6 Tháng Qua)</h3>
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
                  dataKey="activeUsers"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Tỷ Lệ Hoàn Thành Khóa Học</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#3b82f6" />
                <Bar dataKey="total" fill="#93c5fd" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Hoạt Động Gần Đây</h3>
        <div className="space-y-4">
          {[
            { user: 'Sarah Chen', action: 'đã hoàn thành', item: 'JavaScript Cơ Bản', time: '2 giờ trước' },
            { user: 'James Wilson', action: 'đã đăng ký', item: 'React cho Người Mới', time: '5 giờ trước' },
            { user: 'Maria Garcia', action: 'đạt 95% điểm trong', item: 'Bài Kiểm Tra CSS Grid', time: '1 ngày trước' },
            { user: 'Alex Johnson', action: 'đã nộp', item: 'Dự Án Cuối Khóa', time: '2 ngày trước' },
            { user: 'Emma Williams', action: 'đã nhận chứng chỉ cho', item: 'Khóa Học Phát Triển Web', time: '3 ngày trước' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center py-3 border-b border-gray-200 last:border-0">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold mr-4">
                {activity.user.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-gray-800">
                  <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                  <span className="font-medium">{activity.item}</span>
                </p>
                <p className="text-gray-500 text-sm">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview; 