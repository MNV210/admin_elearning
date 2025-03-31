import { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  PaperAirplaneIcon,
  UserCircleIcon,
  UsersIcon,
  AcademicCapIcon,
  ChatBubbleBottomCenterTextIcon,
  MegaphoneIcon,
  BellIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Sample notification data
const initialNotifications = [
  { 
    id: 1, 
    title: 'New Course Available', 
    message: 'A new course "Advanced Machine Learning" is now available. Enroll today!', 
    type: 'announcement', 
    audience: 'all-users',
    status: 'sent',
    sentAt: 'June 15, 2023 - 10:30 AM',
    sentBy: 'Admin'
  },
  { 
    id: 2, 
    title: 'System Maintenance', 
    message: 'The platform will be unavailable on Sunday, June 18 from 2 AM to 4 AM for scheduled maintenance.', 
    type: 'system', 
    audience: 'all-users',
    status: 'sent',
    sentAt: 'June 12, 2023 - 02:15 PM',
    sentBy: 'System'
  },
  { 
    id: 3, 
    title: 'Quiz Reminder', 
    message: 'Reminder: The JavaScript Fundamentals quiz is due tomorrow at midnight.', 
    type: 'reminder', 
    audience: 'course-javascript',
    status: 'sent',
    sentAt: 'June 10, 2023 - 09:00 AM',
    sentBy: 'Admin'
  },
  { 
    id: 4, 
    title: 'Upcoming Webinar', 
    message: 'Join us for a live webinar on "Career Opportunities in Web Development" on June 20 at 7 PM EST.', 
    type: 'announcement', 
    audience: 'all-users',
    status: 'scheduled',
    sentAt: 'Scheduled for June 18, 2023 - 08:00 AM',
    sentBy: 'Admin'
  },
  { 
    id: 5, 
    title: 'New Feature: Study Groups', 
    message: 'We\'ve launched a new feature allowing you to create and join study groups. Check it out in your dashboard!', 
    type: 'feature', 
    audience: 'all-users',
    status: 'draft',
    sentAt: 'Draft created on June 14, 2023',
    sentBy: 'Admin'
  },
];

function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'sent') return notification.status === 'sent';
    if (activeTab === 'scheduled') return notification.status === 'scheduled';
    if (activeTab === 'draft') return notification.status === 'draft';
    return true;
  });

  // Handle delete notification
  const handleDeleteNotification = (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setNotifications(notifications.filter(notification => notification.id !== id));
    }
  };

  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case 'announcement':
        return <MegaphoneIcon className="w-5 h-5" />;
      case 'system':
        return <BellIcon className="w-5 h-5" />;
      case 'reminder':
        return <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />;
      case 'feature':
        return <AcademicCapIcon className="w-5 h-5" />;
      default:
        return <BellIcon className="w-5 h-5" />;
    }
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'announcement':
        return 'bg-blue-100 text-blue-800';
      case 'system':
        return 'bg-yellow-100 text-yellow-800';
      case 'reminder':
        return 'bg-purple-100 text-purple-800';
      case 'feature':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAudienceIcon = (audience) => {
    switch (audience) {
      case 'all-users':
        return <UsersIcon className="w-5 h-5" />;
      case 'course-javascript':
        return <AcademicCapIcon className="w-5 h-5" />;
      default:
        return <UserCircleIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Notifications & Announcements</h3>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Notification
          </button>
        </div>
        
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['all', 'sent', 'scheduled', 'draft'].map((tab) => (
              <button
                key={tab}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="p-6">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-6">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex space-x-4">
                    <div className={`p-3 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                      {getNotificationTypeIcon(notification.type)}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{notification.title}</h4>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      
                      <div className="flex flex-wrap items-center space-x-4 mt-3">
                        <div className="flex items-center">
                          <span className="mr-2">{getAudienceIcon(notification.audience)}</span>
                          <span className="text-sm text-gray-600">
                            {notification.audience === 'all-users' 
                              ? 'All Users' 
                              : notification.audience.startsWith('course') 
                                ? 'Course Specific' 
                                : notification.audience}
                          </span>
                        </div>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                          {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                        </span>
                        
                        <span className="text-sm text-gray-500">{notification.sentAt}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                      aria-label="Edit notification"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button 
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                      aria-label="Delete notification"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    {notification.status !== 'sent' && (
                      <button 
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full"
                        aria-label="Send notification now"
                      >
                        <PaperAirplaneIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BellIcon className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications found</h3>
            <p className="mt-2 text-gray-500">
              There are no {activeTab !== 'all' ? activeTab : ''} notifications available.
            </p>
          </div>
        )}
      </div>
      
      {/* Modal for creating/editing notifications */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold">Create New Notification</h3>
              <button 
                className="text-gray-400 hover:text-gray-500" 
                onClick={() => setIsAddModalOpen(false)}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notification title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    placeholder="Write your notification message here..."
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="announcement">Announcement</option>
                      <option value="system">System</option>
                      <option value="reminder">Reminder</option>
                      <option value="feature">Feature Update</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all-users">All Users</option>
                      <option value="students">Students Only</option>
                      <option value="instructors">Instructors Only</option>
                      <option value="course-javascript">JavaScript Course</option>
                      <option value="course-react">React Course</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Options</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="delivery" value="now" defaultChecked />
                      <span className="ml-2">Send now</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="delivery" value="schedule" />
                      <span className="ml-2">Schedule</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="delivery" value="draft" />
                      <span className="ml-2">Save as draft</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => setIsAddModalOpen(false)}
              >
                Create Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsPage; 