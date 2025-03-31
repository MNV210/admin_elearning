import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";
import LoadingSkeleton from "../LoadingSkeleton";
import { courseService, lectureService } from "../../services";
import learnProgressService from "../../services/learnProgressService";
import ChatTab from "./ChatTab";

// Component hiển thị nội dung bài học
const LessonContent = ({ lesson, isDark, onVideoProgress }) => {
  if (!lesson) return null;

  return (
    <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
      <h2 className="text-2xl font-bold mb-4">{lesson.title}</h2>
      {lesson.type === "video" ? (
        // Hiển thị video player nếu bài học là dạng video
        <div className="aspect-w-16 aspect-h-9">
          <video
            className="w-full rounded-lg"
            controls
            onTimeUpdate={onVideoProgress}
            src={lesson.file_url}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        // Hiển thị iframe nếu bài học là dạng file
        <div className="prose max-w-none">
          <iframe
            src={lesson.file_url}
            className="w-full h-[600px] rounded-lg"
            title={lesson.title}
          />
        </div>
      )}
    </div>
  );
};

// Component sidebar hiển thị danh sách bài học - được điều khiển bởi parent
const LessonSidebar = ({ 
  lecture, 
  activeLesson, 
  isDark, 
  onLessonClick,
  progressData, 
  completedLessons
}) => {
  // Hàm kiểm tra bài học có được mở khóa hay không dựa trên dữ liệu từ parent
  const isLessonUnlocked = (lessonId) => {
    console.log(`Kiểm tra mở khóa cho bài học ${lessonId} với danh sách bài học đã hoàn thành:`, completedLessons);
    
    // Bài học đầu tiên luôn được mở khóa
    if (lecture?.lessons?.[0]?.id === lessonId) {
      return true;
    }
    
    // Nếu bài học đã có tiến trình, nó được mở khóa
    if (progressData.some(progress => progress.lesson_id === lessonId)) {
      return true;
    }
    
    // Lấy bài học trước đó
    const currentLessonIndex = lecture?.lessons?.findIndex(lesson => lesson.id === lessonId);
    if (currentLessonIndex <= 0) return true; // Bài học đầu tiên hoặc index không hợp lệ
    
    const previousLessonId = lecture?.lessons?.[currentLessonIndex - 1]?.id;
    
    // Kiểm tra xem bài học trước đó đã hoàn thành chưa
    const isPreviousLessonCompleted = completedLessons.includes(previousLessonId);
    console.log(`Bài học trước đó ${previousLessonId} đã hoàn thành: ${isPreviousLessonCompleted}`);
    
    return isPreviousLessonCompleted;
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Danh sách bài học</h2>
      <div className="space-y-4 max-h-[calc(100vh-260px)] overflow-y-auto pr-2">
        <ul className="space-y-2">
          {lecture?.lessons?.map(lesson => {
            const unlocked = isLessonUnlocked(lesson.id);
            const isCompleted = progressData.some(
              progress => progress.lesson_id === lesson.id && progress.progress === 'completed'
            );
            
            return (
              <li key={lesson.id}>
                <button
                  onClick={() => unlocked && onLessonClick(lesson)}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between ${
                    activeLesson?.id === lesson.id
                      ? isDark
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-800"
                      : isDark
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                  } ${!unlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!unlocked}
                >
                  <div className="flex items-center">
                    <span className="material-icons mr-2 text-lg">
                      {!unlocked ? "lock" : lesson.type === "video" ? "play_circle" : "description"}
                    </span>
                    <span className="font-medium text-sm">{lesson.title}</span>
                  </div>
                  <div className="flex items-center">
                    {lesson.type === "video" ? (
                      <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {lesson.duration}
                      </span>
                    ) : (
                      <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {lesson.size}
                      </span>
                    )}
                    {isCompleted && (
                      <span className="material-icons ml-2 text-green-500 text-sm">
                        check_circle
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

// Component chính quản lý toàn bộ giao diện và logic của trang bài học
const LessonView = () => {
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState("lessons");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [loading, setLoading] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [progressData, setProgressData] = useState([]);
  const isUpdatingRef = useRef(false);
  // State mới để theo dõi trực tiếp các bài học đã hoàn thành
  const [completedLessons, setCompletedLessons] = useState([]);

  const [lecture, setLecture] = useState([]);
  const params = useParams();
  const navigate = useNavigate();

  // Hàm lấy dữ liệu tiến trình học tập từ backend
  const getProgressLearn = async () => {
    try {
      console.log("Đang lấy dữ liệu tiến trình từ backend");
      const progressCheck = await learnProgressService.getByUserAndLession({
        course_id: params.course_id,
      });
      
      const data = progressCheck.data || [];
      setProgressData(data);
      
      // Trích xuất ID của các bài học đã hoàn thành và cập nhật state
      const completedLessonIds = data
        .filter(item => item.progress === 'completed')
        .map(item => item.lesson_id);
        
      console.log("Các bài học đã hoàn thành:", completedLessonIds);
      setCompletedLessons(completedLessonIds);
      
      // Cập nhật trạng thái hoàn thành của bài học hiện tại nếu có
      if (activeLesson) {
        const isCompleted = data.some(
          progress => progress.lesson_id === activeLesson.id && progress.progress === 'completed'
        );
        setLessonCompleted(isCompleted);
      }
      return data;
    } catch (error) {
      console.error("Lỗi khi lấy tiến trình:", error);
      setProgressData([]);
      setCompletedLessons([]);
      return [];
    }
  };

  // Hàm xử lý sự kiện khi xem video, theo dõi tiến độ và đánh dấu hoàn thành khi đạt 97%
  const handleVideoProgress = (event) => {
    if (!activeLesson || activeLesson.type !== 'video' || isUpdatingRef.current) return;
    
    const video = event.target;
    const percentWatched = (video.currentTime / video.duration) * 100;
    
    // Log tiến trình để debug
    console.log(`Tiến trình video: ${percentWatched.toFixed(1)}%`);
    
    // Nếu đã xem 97% video và bài học chưa được đánh dấu hoàn thành
    if (percentWatched >= 97 && !lessonCompleted) {
      console.log('ĐẠT NGƯỠNG: Đánh dấu bài học là đã hoàn thành');
      isUpdatingRef.current = true;
      
      // Đánh dấu bài học hiện tại là đã hoàn thành
      learnProgressService.updateProgress({
        course_id: params.course_id,
        lesson_id: activeLesson.id,
        progress: 'completed'
      })
      .then(() => {
        console.log('THÀNH CÔNG: Bài học đã được đánh dấu hoàn thành trong cơ sở dữ liệu');
        // Cập nhật state local ngay lập tức
        setLessonCompleted(true);
        
        // Cập nhật ngay lập tức mảng completedLessons
        setCompletedLessons(prev => {
          if (!prev.includes(activeLesson.id)) {
            const updated = [...prev, activeLesson.id];
            console.log('Danh sách bài học đã hoàn thành đã được cập nhật:', updated);
            return updated;
          }
          return prev;
        });
        
        toast.success("Bài học đã hoàn thành!");
        
        // Lấy dữ liệu tiến trình mới nhất từ backend
        return getProgressLearn();
      })
      .then((latestProgressData) => {
        console.log('Dữ liệu tiến trình đã được làm mới:', latestProgressData);
        
        // Tìm bài học tiếp theo
        const currentLessonIndex = lecture?.lessons?.findIndex(lesson => lesson.id === activeLesson.id);
        const nextLesson = lecture?.lessons?.[currentLessonIndex + 1];
        
        if (nextLesson) {
          console.log(`Đã tìm thấy bài học tiếp theo: ${nextLesson.title}`);
          toast.info("Đã mở khóa bài học tiếp theo!");
        } else {
          console.log('Không tìm thấy bài học tiếp theo');
        }
      })
      .catch(error => {
        console.error("Lỗi khi cập nhật tiến trình bài học:", error);
        toast.error("Lỗi khi cập nhật tiến độ học tập");
      })
      .finally(() => {
        isUpdatingRef.current = false;
        console.log('Cập nhật tiến trình hoàn tất');
      });
    }
  };

  // Reset cờ đang cập nhật khi bài học thay đổi
  useEffect(() => {
    isUpdatingRef.current = false;
  }, [activeLesson]);

  // Lấy thông tin chi tiết khóa học
  const getDetailCourse = async () => {
    try {
      setLoading(true);
      const courseDetails = await courseService.getCourseById(params.course_id);
      setLecture(courseDetails.data);  
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chi tiết khóa học:', error);
      toast.error('Không thể tải thông tin khóa học.');
    } finally {
      setLoading(false);
    }
  };

  // Lấy thông tin bài học hiện tại
  const getInfomationLesson = async () => {
    try {
      const response = await lectureService.getLectureById(params.lesson_id);
      setActiveLesson(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin bài học:', error);
      toast.error('Không thể tải thông tin bài học.');
    }
  };

  // Xử lý tự động đánh dấu hoàn thành bài học dạng file sau 30 giây
  useEffect(() => {
    let timer;
    // Chỉ áp dụng cho bài học dạng file chưa hoàn thành
    if (activeLesson?.type === 'file' && !lessonCompleted) {
      console.log('Bài học dạng file: Đặt hẹn giờ 30 giây để đánh dấu hoàn thành');
      timer = setTimeout(() => {
        console.log('Hẹn giờ 30 giây đã hoàn tất: Đánh dấu bài học dạng file là đã hoàn thành');
        // Đánh dấu bài học là đã hoàn thành sau 30 giây
        learnProgressService.updateProgress({
          course_id: params.course_id,
          lesson_id: activeLesson.id,
          progress: 'completed'
        })
        .then(() => {
          console.log('THÀNH CÔNG: Bài học dạng file đã được đánh dấu hoàn thành trong cơ sở dữ liệu');
          setLessonCompleted(true);
          toast.success("Bài học đã hoàn thành!");
          
          // Cập nhật ngay lập tức mảng completedLessons
          setCompletedLessons(prev => {
            if (!prev.includes(activeLesson.id)) {
              const updated = [...prev, activeLesson.id];
              console.log('Danh sách bài học đã hoàn thành đã được cập nhật:', updated);
              return updated;
            }
            return prev;
          });
          
          // Lấy dữ liệu tiến trình mới nhất từ backend
          return getProgressLearn();
        })
        .then((latestProgressData) => {
          console.log('Dữ liệu tiến trình đã được làm mới sau khi hoàn thành file:', latestProgressData);
          
          // Tìm bài học tiếp theo
          const currentLessonIndex = lecture?.lessons?.findIndex(lesson => lesson.id === activeLesson.id);
          const nextLesson = lecture?.lessons?.[currentLessonIndex + 1];
          
          if (nextLesson) {
            console.log(`Đã tìm thấy bài học tiếp theo sau khi hoàn thành file: ${nextLesson.title}`);
            toast.info("Đã mở khóa bài học tiếp theo!");
          } else {
            console.log('Không tìm thấy bài học tiếp theo');
          }
        })
        .catch(error => {
          console.error("Lỗi khi cập nhật tiến trình bài học dạng file:", error);
          toast.error("Lỗi khi cập nhật tiến độ học tập");
        });
      }, 30000); // 30 giây
    }
    
    // Xóa hẹn giờ khi component unmount hoặc activeLesson thay đổi
    return () => clearTimeout(timer);
  }, [activeLesson, lessonCompleted, params.course_id]);

  // Lấy thông tin bài học khi ID bài học thay đổi
  useEffect(() => {
    getInfomationLesson();
  }, [params.lesson_id]);

  // Lấy thông tin khóa học khi ID khóa học thay đổi
  useEffect(() => {
    getDetailCourse();
  }, [params.course]);

  // Lấy tiến trình học khi bài học thay đổi
  useEffect(() => {
    getProgressLearn();
  }, [activeLesson]);

  // Xử lý khi nhấp vào bài học trong sidebar
  const handleLessonClick = (lesson) => {
    navigate(`/user/learn/${params.course_id}/lesson/${lesson.id}`);
  };

  // Xử lý khi nhấp vào nút quay lại
  const onBackClick = () => {
    navigate(`/user/lecture/${params.course_id}`);
  };

  // Hiển thị loading khi đang tải dữ liệu
  if(loading) {
    return <LoadingSkeleton/>;
  }

  return (
    <div>
      {/* Header với nút quay lại và tiêu đề khóa học */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBackClick}
          className={`flex items-center ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}`}
        >
          <span className="material-icons mr-1">arrow_back</span>
          Quay lại thông tin khóa học
        </button>
        
        <h1 className="text-2xl font-bold">{lecture.title}</h1>
      </div>
      
      {/* Layout chính với nội dung bài học bên trái và sidebar bên phải */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Phần nội dung bài học */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <LessonContent 
            lesson={activeLesson} 
            isDark={isDark} 
            onVideoProgress={handleVideoProgress}
          />
        </div>

        {/* Phần sidebar */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          {/* Tab navigator */}
          <div className="mb-4 border-b border-gray-200">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
              <li className="mr-2">
                <button
                  className={`inline-block p-4 rounded-t-lg ${
                    activeTab === "lessons"
                      ? isDark
                        ? "text-blue-500 border-b-2 border-blue-500"
                        : "text-blue-600 border-b-2 border-blue-600"
                      : isDark 
                        ? "text-gray-400 hover:text-gray-300" 
                        : "text-gray-500 hover:text-gray-600"
                  }`}
                  onClick={() => setActiveTab("lessons")}
                >
                  <div className="flex items-center">
                    <span className="material-icons mr-2">menu_book</span>
                    Bài học
                  </div>
                </button>
              </li>
              <li className="mr-2">
                <button
                  className={`inline-block p-4 rounded-t-lg ${
                    activeTab === "chat"
                      ? isDark
                        ? "text-blue-500 border-b-2 border-blue-500"
                        : "text-blue-600 border-b-2 border-blue-600"
                      : isDark 
                        ? "text-gray-400 hover:text-gray-300" 
                        : "text-gray-500 hover:text-gray-600"
                  }`}
                  onClick={() => setActiveTab("chat")}
                >
                  <div className="flex items-center">
                    <span className="material-icons mr-2">chat</span>
                    Trò chuyện
                  </div>
                </button>
              </li>
            </ul>
          </div>

          {/* Nội dung của tab được chọn */}
          <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md`}>
            {activeTab === "lessons" ? (
              <LessonSidebar 
                lecture={lecture} 
                activeLesson={activeLesson} 
                isDark={isDark} 
                onLessonClick={handleLessonClick}
                progressData={progressData}
                completedLessons={completedLessons}
              />
            ) : (
              <ChatTab isDark={isDark} lecture={lecture} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonView;