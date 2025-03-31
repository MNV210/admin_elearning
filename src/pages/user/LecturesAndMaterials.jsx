import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import LectureList from "../../components/lectures/LectureList";
import LectureDetails from "../../components/lectures/LectureDetails";
import LessonView from "../../components/lectures/LessonView";
import { courseService, lectureService, categoryService } from "../../services";
import { toast } from 'react-toastify';
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { useNavigate } from "react-router-dom";

const LecturesAndMaterials = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate()
  
  // States for lectures and UI
  const [lectures, setLectures] = useState([]);
  const [filteredLectures, setFilteredLectures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [currentView, setCurrentView] = useState("list");
  const [selectedLesson, setSelectedLesson] = useState(null);
  

  // Fetch dữ liệu khóa học và danh mục từ API khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories first
        const categoriesResponse = await categoryService.getAllCategories();
        const categoriesData = categoriesResponse?.data || [];
        setCategories(categoriesData);
        
        // Then fetch courses
        const coursesResponse = await courseService.getAllCourses();
        const coursesData = coursesResponse?.data || [];
        
        // Enrich courses with category names
        const enrichedCourses = coursesData
          .map(course => {
            if (!course) return null;
            
            // Kiểm tra xem khóa học có bài học không
            const hasLessons = Array.isArray(course.lessons) && course.lessons.length > 0;
            const hasModulesWithLessons = Array.isArray(course.modules) && 
              course.modules.some(module => Array.isArray(module.lessons) && module.lessons.length > 0);
            
            // Chỉ tiếp tục nếu có ít nhất 1 bài học
            if (!hasLessons && !hasModulesWithLessons) return null;

            const category = categoriesData.find(cat => 
              cat?.id && course?.category_id && 
              cat.id.toString() === course.category_id.toString()
            );
            
            return {
              ...course,
              title: course.title || 'Chưa có tiêu đề',
              instructor: course.instructor || 'Chưa có giảng viên',
              description: course.description || 'Chưa có mô tả',
              duration: course.duration || '0h',
              level: course.level || 'Cơ bản',
              thumbnail: course.thumbnail || 'https://placehold.co/600x400',
              categoryName: category?.name || 'Không có danh mục',
              category_id: course.category_id || null,
              totalLessons: hasLessons 
                ? course.lessons.length 
                : hasModulesWithLessons 
                  ? course.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0)
                  : 0
            };
          })
          .filter(Boolean); // Remove null entries
        
        console.log('Courses with lessons:', enrichedCourses);
        
        setLectures(enrichedCourses);
        setFilteredLectures(enrichedCourses);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load courses. Please try again later.');
        toast.error('Error loading courses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter lectures when category changes
  useEffect(() => {
    if (!Array.isArray(lectures)) return;
    
    if (selectedCategory === 'all') {
      setFilteredLectures(lectures);
    } else {
      const filtered = lectures.filter(lecture => 
        lecture?.category_id && selectedCategory &&
        lecture.category_id.toString() === selectedCategory.toString()
      );
      setFilteredLectures(filtered);
    }
  }, [selectedCategory, lectures]);

 
 

  const handleLectureClick = (lecture) => {
    if (lecture?.id) {
      navigate(`/user/lecture/${lecture.id}`);
    }
  };


  // Render loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Render error state
  if (error && (!lectures || lectures.length === 0)) {
    return (
      <div className={`p-6 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <h1 className="text-2xl font-bold mb-6">Bài Giảng & Tài Liệu</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render the appropriate view based on the currentView
  return (
    <div className="container mx-auto px-4 py-8">
      <>
        <LectureList 
          lectures={filteredLectures || []} 
          isDark={isDark} 
          onLectureClick={handleLectureClick}
        />
      </>
    </div>
  );
};

export default LecturesAndMaterials; 