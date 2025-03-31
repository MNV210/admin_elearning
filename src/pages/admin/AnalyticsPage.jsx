import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// Sample analytics data
const userProgressData = [
  { name: 'Week 1', completions: 45, started: 110 },
  { name: 'Week 2', completions: 38, started: 90 },
  { name: 'Week 3', completions: 32, started: 75 },
  { name: 'Week 4', completions: 28, started: 65 },
  { name: 'Week 5', completions: 25, started: 55 },
  { name: 'Week 6', completions: 22, started: 50 },
];

const quizScoresData = [
  { name: 'JavaScript Basics', average: 76, highest: 95, lowest: 45 },
  { name: 'CSS Grid', average: 82, highest: 100, lowest: 60 },
  { name: 'React Hooks', average: 68, highest: 90, lowest: 42 },
  { name: 'Node.js Intro', average: 73, highest: 98, lowest: 40 },
  { name: 'Database Design', average: 65, highest: 88, lowest: 35 },
];

const courseCompletionRateData = [
  { name: 'Completed', value: 65, color: '#4ade80' },
  { name: 'In Progress', value: 25, color: '#60a5fa' },
  { name: 'Not Started', value: 10, color: '#f87171' },
];

const timeSpentData = [
  { name: 'Mon', hours: 3.5 },
  { name: 'Tue', hours: 4.2 },
  { name: 'Wed', hours: 3.8 },
  { name: 'Thu', hours: 5.1 },
  { name: 'Fri', hours: 4.7 },
  { name: 'Sat', hours: 6.2 },
  { name: 'Sun', hours: 5.5 },
];

function AnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState('weekly');
  const [reportType, setReportType] = useState('all');

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Reports & Analytics</h2>
        <div className="flex space-x-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="all">All Reports</option>
            <option value="users">User Progress</option>
            <option value="quizzes">Quiz Scores</option>
            <option value="completion">Completion Rates</option>
            <option value="time">Time Spent</option>
          </select>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {(reportType === 'all' || reportType === 'users') && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Course Progress ({timeFilter})</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="started" fill="#93c5fd" name="Started" />
                <Bar dataKey="completions" fill="#3b82f6" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {(reportType === 'all' || reportType === 'quizzes') && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Quiz Scores by Course</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quizScoresData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="lowest" fill="#f87171" name="Lowest Score" />
                <Bar dataKey="average" fill="#60a5fa" name="Average Score" />
                <Bar dataKey="highest" fill="#4ade80" name="Highest Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {(reportType === 'all' || reportType === 'completion') && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Course Completion Rate</h3>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseCompletionRateData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {courseCompletionRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {(reportType === 'all' || reportType === 'time') && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Average Time Spent (Hours per Day)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSpentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Students</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quiz Avg.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Spent
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { id: 1, name: 'Sarah Chen', course: 'JavaScript Fundamentals', progress: 100, quizAvg: 96, timeSpent: '28h 15m' },
                { id: 2, name: 'James Wilson', course: 'React for Beginners', progress: 95, quizAvg: 92, timeSpent: '32h 45m' },
                { id: 3, name: 'Maria Garcia', course: 'CSS Grid', progress: 100, quizAvg: 90, timeSpent: '24h 30m' },
                { id: 4, name: 'Alex Johnson', course: 'Python for Data Science', progress: 88, quizAvg: 89, timeSpent: '35h 10m' },
                { id: 5, name: 'Emma Williams', course: 'Web Development Course', progress: 92, quizAvg: 87, timeSpent: '30h 20m' },
              ].map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{student.course}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">{student.progress}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {student.quizAvg}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{student.timeSpent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage; 