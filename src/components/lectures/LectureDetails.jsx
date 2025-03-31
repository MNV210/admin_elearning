import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { courseService } from "../../services";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./LectureDetails.css"; // Import the CSS file
import LoadingSkeleton from "../LoadingSkeleton";
import userRegisterCourse from "../../services/userRegisterService";
import { message } from "antd";

const courseDetails = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const params = useParams();
  const [course, setCourse] = useState({});
  const [isRegistered,setIsRegistered] = useState(false)
  const [loading,setLoading] = useState(false)

  const navigate = useNavigate()

  const getDetailCourse = async () => {
    try {
      setLoading(true)
      const courseDetails = await courseService.getCourseById(params.id);
      setCourse(courseDetails.data);

      //check User Register Course 
      const checkRegister = await courseService.checkUserRegister({'course_id':params.id})
      if(checkRegister.data!=null){
        setIsRegistered(true)
      }

    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details.');
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    getDetailCourse();
  }, []);

  const goToList= ()=> {
    navigate('/user/lectures')
  }

  const onGoToLearn = (course) => {
    navigate(`/user/learn/${course.id}/lesson/${course?.lessons[0]?.id}`)
  }

  const onRegisterCourse = async(courseId) => {
    const response = await userRegisterCourse.registerCourse({
      course_id:courseId,
    }).then(()=>{
      message.success('Đăng ký khóa học thành công')
      setIsRegistered(true)
    })
  }

  if (!course || Object.keys(course).length === 0) return null;

  if(loading) {
    return <LoadingSkeleton/>
  }

  return (
    <div>
      <button 
        onClick={goToList}
        className={`mb-4 flex items-center ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}`}
      >
        <span className="material-icons mr-1">arrow_back</span>
        Quay lại danh sách bài giảng
      </button>
      
      <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md overflow-hidden`}>
        <div className="h-64 bg-gray-300 relative">
        {course.thumbnail && (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        )}
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <div className="flex flex-wrap text-sm mb-4">
                <span className={`mr-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  <span className="material-icons text-sm align-text-bottom mr-1">person</span>
                  Giảng viên: {course.teacher?.name}
                </span>
                {/* <span className={`mr-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  <span className="material-icons text-sm align-text-bottom mr-1">schedule</span>
                  Thời lượng:
                </span> */}
                <span className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  <span className="material-icons text-sm align-text-bottom mr-1">signal_cellular_alt</span>
                  Cấp độ: {course.level}
                </span>
              </div>
            </div>
            
            {isRegistered ? (
              <button 
                onClick={() => onGoToLearn(course)} 
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium flex items-center hover:bg-green-700 transition-colors mt-4 md:mt-0"
              >
                <span className="material-icons mr-2">play_circle</span>
                Bắt đầu học
              </button>
            ) : (
              <button 
                onClick={() => onRegisterCourse(course.id)} 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center hover:bg-blue-700 transition-colors mt-4 md:mt-0"
              >
                <span className="material-icons mr-2">how_to_reg</span>
                Đăng ký khóa học
              </button>
            )}
          </div>
          
          <div className={`${isDark ? "bg-gray-700" : "bg-gray-100"} rounded-lg p-5 mb-6`}>
            <h2 className="text-xl font-semibold mb-3">Mô tả khóa học</h2>
            <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {course.description}
            </p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Nội dung khóa học</h2>
            <div className="space-y-4">
              {course?.lessons && course.lessons?.map((lesson, index) => (
                <div key={lesson.id} className={`${isDark ? "bg-gray-700" : "bg-gray-100"} rounded-lg p-4`}>
                  <h3 className="font-medium text-lg mb-2">
                    {lesson.title}
                  </h3>
                  {/* {lesson.file_url ? (
                    <embed
                      src={lesson.file_url}
                      className="w-full h-full"
                      type={
                        lesson.file_url?.endsWith('.pdf') 
                          ? 'application/pdf'
                          : 'text/plain'
                      }
                    />
                  ) : (
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      No file available for this lesson.
                    </p>
                  )} */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default courseDetails;