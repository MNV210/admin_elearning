import React, { useState, useEffect } from 'react';
import courseService from '../../services/courseService';
import quizService from '../../services/quizService';
import { Link } from 'react-router-dom';

const QuizzesAndAssessments = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [completedQuizzes, setCompletedQuizzes] = useState(0);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const coursesResponse = await courseService.getCourseUserRegister();
        const courses = coursesResponse.data.course;
        
        // Fetch quiz results for the current user
        const quizResultResponse = await quizService.getQuizResulsByUserId();
        const quizResults = quizResultResponse.data || [];
        
        // Create a map of completed quizzes with their scores
        const completedQuizzesMap = {};
        quizResults.forEach(result => {
          completedQuizzesMap[result.quiz_id] = {
            completed: true,
            total_question: result.total_questions,
            score: result.score || 0
          };
        });
        
        const quizzesPromises = courses.map(async course => {
          const quizResponse = await quizService.getCourseQuizzes(course.id);
          return (quizResponse.data || []).map(quiz => {
            const quizResult = completedQuizzesMap[quiz.id];
            return {
              ...quiz,
              courseName: course.title || 'Chưa đặt tên khóa học',
              courseId: course.id,
              completed: quizResult ? true : false,
              total_question: quizResult ? quizResult.total_question : 0,
              score: quizResult ? quizResult.score : 0
            };
          });
        });
        
        const quizzesResponses = await Promise.all(quizzesPromises);
        const allQuizzes = quizzesResponses.flat();
        
        setQuizzes(allQuizzes);
        setCompletedQuizzes(allQuizzes.filter(quiz => quiz.completed).length);
      } catch (error) {
        console.error('Lỗi khi tải danh sách bài kiểm tra:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = 
      quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.courseName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'completed') return matchesSearch && quiz.completed;
    if (activeTab === 'pending') return matchesSearch && !quiz.completed;
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-6xl ">
          <h1 className="text-4xl font-bold mb-4">Kiểm Tra Kiến Thức</h1>
         
          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Tìm kiếm bài kiểm tra hoặc khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
            />
            <svg 
              className="w-6 h-6 text-gray-400 absolute left-3 top-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="max-w-6xl mx-auto px-4 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-600">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-semibold">Tổng Số Bài Kiểm Tra</h3>
                <p className="text-2xl font-bold text-gray-800">{quizzes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-semibold">Đã Hoàn Thành</h3>
                <p className="text-2xl font-bold text-gray-800">{completedQuizzes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-amber-500">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-semibold">Tỷ Lệ Hoàn Thành</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {quizzes.length > 0 ? Math.round((completedQuizzes / quizzes.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 my-6">
        {/* Filter Tabs */}
        <div className="flex overflow-x-auto mb-8 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap mr-4 ${
              activeTab === 'all' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tất Cả Bài Kiểm Tra
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap mr-4 ${
              activeTab === 'completed' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đã Hoàn Thành
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap mr-4 ${
              activeTab === 'pending' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Chưa Hoàn Thành
          </button>
        </div>

        {/* Quiz Cards */}
        {filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map(quiz => (
              <div key={quiz.id} className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 relative">
                  {/* Course Name Banner */}
                  <div className="bg-gray-100 px-4 py-2 flex items-center">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    <span className="ml-2 text-sm text-gray-600 truncate max-w-full">{quiz.courseName}</span>
                  </div>
                  
                  {/* Status Badge */}
                  {quiz.completed && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      Đã hoàn thành
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
                      {quiz.title}
                    </h3>
                    <div className="text-gray-600 mb-4 line-clamp-2">
                      {quiz.description || 'Không có mô tả'}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <div className="flex items-center mr-4">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {quiz.time_limit} phút
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {quiz.questions?.length || 0} câu hỏi
                      </div>
                    </div>
                    
                    {quiz.completed ? (
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">Điểm đạt được:</span>
                          <span className="text-sm font-bold text-indigo-600">{quiz.score}/{quiz.total_question} câu</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${quiz.total_question ? (quiz.score / quiz.total_question) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <Link 
                        to={`/user/quiz/${quiz.courseId}/${quiz.id}/take`}
                        className="block w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-center font-medium rounded-lg transition-colors duration-200"
                      >
                        Bắt đầu làm bài
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-1">Không tìm thấy bài kiểm tra</h3>
              <p className="text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesAndAssessments;