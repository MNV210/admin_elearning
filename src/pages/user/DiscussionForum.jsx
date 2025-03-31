import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const DiscussionForum = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Sample data - in a real app, this would come from API/backend
  const forumCategories = [
    { id: 1, name: "General Discussion", description: "General topics related to learning and courses", postCount: 156 },
    { id: 2, name: "Course Specific", description: "Discussions related to specific courses", postCount: 243 },
    { id: 3, name: "Technical Help", description: "Technical questions and troubleshooting", postCount: 89 },
    { id: 4, name: "Career Advice", description: "Career guidance and industry insights", postCount: 67 }
  ];
  
  const threads = [
    {
      id: 101,
      categoryId: 2,
      title: "Understanding React Hooks",
      author: "jane_doe",
      date: "May 12, 2023",
      replies: 24,
      views: 142,
      pinned: true,
      lastActivity: "2 hours ago"
    },
    {
      id: 102,
      categoryId: 2,
      title: "Best practices for state management",
      author: "react_dev",
      date: "May 10, 2023",
      replies: 18,
      views: 95,
      pinned: false,
      lastActivity: "1 day ago"
    },
    {
      id: 103,
      categoryId: 2,
      title: "Component reusability strategies",
      author: "frontend_guru",
      date: "May 8, 2023",
      replies: 12,
      views: 78,
      pinned: false,
      lastActivity: "3 days ago"
    },
    {
      id: 104,
      categoryId: 2,
      title: "Performance optimization in React",
      author: "performance_master",
      date: "May 5, 2023",
      replies: 31,
      views: 203,
      pinned: false,
      lastActivity: "6 hours ago"
    }
  ];
  
  const posts = [
    {
      id: 1001,
      threadId: 101,
      author: "jane_doe",
      authorRole: "Student",
      content: "I'm trying to understand the useEffect hook in React. Can someone explain when to use the dependency array and what happens when it's empty vs. when it has values?",
      date: "May 12, 2023",
      likes: 15,
      isOriginalPost: true
    },
    {
      id: 1002,
      threadId: 101,
      author: "react_expert",
      authorRole: "Instructor",
      content: "Great question! The dependency array in useEffect controls when the effect will run:\n\n- Empty array ([]): Effect runs only once after the initial render\n- With dependencies ([a, b]): Effect runs whenever any dependency changes\n- No array at all: Effect runs after every render\n\nIt's a common mistake to forget dependencies, which can lead to stale closures. React's ESLint rules can help catch these issues.",
      date: "May 12, 2023",
      likes: 28,
      isOriginalPost: false
    },
    {
      id: 1003,
      threadId: 101,
      author: "hook_newbie",
      authorRole: "Student",
      content: "That's super helpful! So if I have a function that depends on a state variable, I should include that variable in the dependency array?",
      date: "May 12, 2023",
      likes: 7,
      isOriginalPost: false
    },
    {
      id: 1004,
      threadId: 101,
      author: "react_expert",
      authorRole: "Instructor",
      content: "Exactly! Any values from the component scope (props, state, context) that are used inside the effect should be included in the dependency array. This ensures the effect runs whenever those values change.\n\nIf you don't want to re-run the effect when a function changes, consider using useCallback for that function.",
      date: "May 12, 2023",
      likes: 22,
      isOriginalPost: false
    }
  ];

  const [activeView, setActiveView] = useState("categories"); // categories, threads, thread
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newPostContent, setNewPostContent] = useState("");

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setActiveView("threads");
  };

  const handleThreadClick = (thread) => {
    setSelectedThread(thread);
    setActiveView("thread");
  };

  const goBackToCategories = () => {
    setSelectedCategory(null);
    setActiveView("categories");
  };

  const goBackToThreads = () => {
    setSelectedThread(null);
    setActiveView("threads");
  };

  const handleSubmitReply = (e) => {
    e.preventDefault();
    // In a real app, you would submit the post to the server
    alert("Reply submitted! In a real app, this would be saved to the database.");
    setNewPostContent("");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Discussion Forum</h1>
        <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Connect with fellow learners and instructors in our community forums.
        </p>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center text-sm mb-6">
        <button 
          onClick={goBackToCategories}
          className={`${activeView !== "categories" ? "" : "font-semibold"} hover:underline flex items-center`}
        >
          Forums
        </button>
        
        {activeView === "threads" && (
          <>
            <span className="mx-2">/</span>
            <span className="font-semibold">{selectedCategory.name}</span>
          </>
        )}
        
        {activeView === "thread" && (
          <>
            <span className="mx-2">/</span>
            <button 
              onClick={goBackToThreads}
              className="hover:underline"
            >
              {selectedCategory.name}
            </button>
            <span className="mx-2">/</span>
            <span className="font-semibold">{selectedThread.title}</span>
          </>
        )}
      </div>

      {/* Categories View */}
      {activeView === "categories" && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Forum Categories</h2>
            <div className={`relative rounded-md ${isDark ? "bg-gray-700" : "bg-white"}`}>
              <input
                type="text"
                placeholder="Search forums..."
                className={`w-full py-2 pl-10 pr-4 rounded-md border ${
                  isDark 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-gray-400">search</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {forumCategories.map(category => (
              <div 
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`${
                  isDark ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-md p-5 cursor-pointer hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start">
                  <div className={`p-3 rounded-full mr-4 ${isDark ? "bg-gray-700" : "bg-blue-100"}`}>
                    <span className={`material-icons ${isDark ? "text-blue-400" : "text-blue-600"}`}>forum</span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                        <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-2`}>
                          {category.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                          {category.postCount}
                        </span>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>posts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threads View */}
      {activeView === "threads" && selectedCategory && (
        <div>
          <div className="mb-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">{selectedCategory.name}</h2>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {selectedCategory.description}
              </p>
            </div>
            <div className="flex items-center">
              <div className={`relative rounded-md ${isDark ? "bg-gray-700" : "bg-white"} mr-2`}>
                <input
                  type="text"
                  placeholder="Search threads..."
                  className={`w-full py-2 pl-10 pr-4 rounded-md border ${
                    isDark 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons text-gray-400">search</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                New Thread
              </button>
            </div>
          </div>

          <div className={`overflow-hidden rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} shadow-md`}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Thread
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Replies
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Views
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                {threads
                  .filter(thread => thread.categoryId === selectedCategory.id)
                  .map(thread => (
                    <tr 
                      key={thread.id} 
                      onClick={() => handleThreadClick(thread)}
                      className={`cursor-pointer ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          {thread.pinned && (
                            <span className="material-icons text-yellow-500 mr-2">push_pin</span>
                          )}
                          <div>
                            <p className="font-medium">{thread.title}</p>
                            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{thread.date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isDark ? "bg-blue-900" : "bg-blue-100"
                          } mr-2`}>
                            <span className={`${isDark ? "text-blue-300" : "text-blue-600"}`}>
                              {thread.author.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span>{thread.author}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{thread.replies}</td>
                      <td className="px-6 py-4">{thread.views}</td>
                      <td className="px-6 py-4">{thread.lastActivity}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Thread View */}
      {activeView === "thread" && selectedThread && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{selectedThread.title}</h2>
          
          <div className="space-y-6">
            {posts
              .filter(post => post.threadId === selectedThread.id)
              .map(post => (
                <div 
                  key={post.id} 
                  className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-5 ${
                    post.isOriginalPost ? `border-l-4 ${isDark ? "border-blue-600" : "border-blue-500"}` : ""
                  }`}
                >
                  <div className="flex items-start">
                    <div className="mr-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        post.authorRole === "Instructor"
                          ? isDark ? "bg-purple-900" : "bg-purple-100"
                          : isDark ? "bg-blue-900" : "bg-blue-100"
                      }`}>
                        <span className={`${
                          post.authorRole === "Instructor"
                            ? isDark ? "text-purple-300" : "text-purple-600"
                            : isDark ? "text-blue-300" : "text-blue-600"
                        }`}>
                          {post.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold">{post.author}</h3>
                            {post.authorRole === "Instructor" && (
                              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                isDark ? "bg-purple-900 text-purple-200" : "bg-purple-100 text-purple-800"
                              }`}>
                                Instructor
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{post.date}</p>
                        </div>
                        <div className="flex items-center">
                          <button className={`p-1 rounded-full ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                            <span className="material-icons text-sm">more_vert</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className={`whitespace-pre-line ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          {post.content}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <button className={`flex items-center mr-4 ${isDark ? "text-gray-400 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"}`}>
                            <span className="material-icons text-sm mr-1">thumb_up</span>
                            <span>{post.likes}</span>
                          </button>
                          <button className={`flex items-center ${isDark ? "text-gray-400 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"}`}>
                            <span className="material-icons text-sm mr-1">reply</span>
                            <span>Reply</span>
                          </button>
                        </div>
                        
                        {post.isOriginalPost && (
                          <button className={`flex items-center ${isDark ? "text-gray-400 hover:text-yellow-400" : "text-gray-500 hover:text-yellow-600"}`}>
                            <span className="material-icons text-sm mr-1">bookmark</span>
                            <span>Bookmark</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {/* Reply form */}
          <div className={`mt-8 ${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-5`}>
            <h3 className="font-semibold mb-4">Post Reply</h3>
            <form onSubmit={handleSubmitReply}>
              <div className="mb-4">
                <textarea
                  rows="4"
                  placeholder="Write your reply here..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className={`w-full p-3 rounded-md border ${
                    isDark 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={!newPostContent.trim()}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                    !newPostContent.trim() ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Submit Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionForum; 