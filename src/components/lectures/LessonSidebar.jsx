import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import learnProgressService from "../../services/learnProgressService";

const LessonSidebar = ({ lecture, activeLesson, isDark, onLessonClick }) => {
  const params = useParams();
  const [progressData, setProgressData] = useState([]);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const getProgressLearn = async () => {
    try {
      const progressCheck = await learnProgressService.getByUserAndLession({
        course_id: params.course_id,
      });
      setProgressData(progressCheck.data || []);
    } catch (error) {
      console.error("Error fetching progress:", error);
      setProgressData([]);
    }
  };

  useEffect(() => {
    getProgressLearn();
  }, []);

  // Reset lessonCompleted when activeLesson changes
  useEffect(() => {
    if (activeLesson) {
      const isCompleted = progressData.some(
        progress => progress.lesson_id === activeLesson.id && progress.status === 'completed'
      );
      setLessonCompleted(isCompleted);
    }
  }, [activeLesson, progressData]);

  // For video lessons (in video player component):
  const handleVideoProgress = (event) => {
    if (!activeLesson || activeLesson.type !== 'video') return;
    
    const video = event.target;
    const percentWatched = (video.currentTime / video.duration) * 100;
    
    if (percentWatched >= 97 && !lessonCompleted) {
      // Mark lesson as completed
      learnProgressService.updateProgress({
        course_id: params.course_id,
        lesson_id: activeLesson.id,
        status: 'completed'
      })
      .then(() => {
        setLessonCompleted(true);
        getProgressLearn(); // Refresh progress data
        
        // Find the next lesson to unlock it
        const currentLessonIndex = lecture?.lessons?.findIndex(lesson => lesson.id === activeLesson.id);
        const nextLesson = lecture?.lessons?.[currentLessonIndex + 1];
        
        // If there's a next lesson, insert progress record for it to unlock it
        if (nextLesson) {
          learnProgressService.updateProgress({
            course_id: params.course_id,
            lesson_id: nextLesson.id,
            status: 'in_progress'
          })
          .then(() => {
            getProgressLearn(); // Refresh progress data again after unlocking next lesson
          })
          .catch(error => {
            console.error("Error unlocking next lesson:", error);
          });
        }
      })
      .catch(error => {
        console.error("Error updating progress:", error);
      });
    }
  };
  
  // For file lessons
  useEffect(() => {
    let timer;
    if (activeLesson?.type === 'file' && !lessonCompleted) {
      timer = setTimeout(() => {
        // Mark lesson as completed after 30 seconds
        learnProgressService.updateProgress({
          course_id: params.course_id,
          lesson_id: activeLesson.id,
          status: 'completed'
        })
        .then(() => {
          setLessonCompleted(true);
          getProgressLearn(); // Refresh progress data
          
          // Find the next lesson to unlock it
          const currentLessonIndex = lecture?.lessons?.findIndex(lesson => lesson.id === activeLesson.id);
          const nextLesson = lecture?.lessons?.[currentLessonIndex + 1];
          
          // If there's a next lesson, insert progress record for it to unlock it
          if (nextLesson) {
            learnProgressService.updateProgress({
              course_id: params.course_id,
              lesson_id: nextLesson.id,
              status: 'in_progress'
            })
            .then(() => {
              getProgressLearn(); // Refresh progress data again after unlocking next lesson
            })
            .catch(error => {
              console.error("Error unlocking next lesson:", error);
            });
          }
        })
        .catch(error => {
          console.error("Error updating progress:", error);
        });
      }, 30000); // 30 seconds
    }
    
    return () => clearTimeout(timer);
  }, [activeLesson, lessonCompleted, params.course_id]);

  // Check if a lesson is unlocked based on progress data
  const isLessonUnlocked = (lessonId) => {
    // If no progress data, only unlock the first lesson
    if (!progressData || progressData.length === 0) {
      return lecture?.lessons?.[0]?.id === lessonId;
    }
    
    // Find the lesson's index in the list
    const currentLessonIndex = lecture?.lessons?.findIndex(lesson => lesson.id === lessonId);
    
    // Check if this lesson is in the progress data (completed or in progress)
    const isInProgress = progressData.some(progress => progress.lesson_id === lessonId);
    
    // If the lesson is in progress or completed, unlock it
    if (isInProgress) {
      return true;
    }
    
    // If it's the first lesson, unlock it
    if (currentLessonIndex === 0) {
      return true;
    }
    
    // Check if the previous lesson is in progress or completed to unlock this one
    const previousLesson = lecture?.lessons?.[currentLessonIndex - 1];
    return previousLesson && progressData.some(progress => progress.lesson_id === previousLesson.id);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Danh sách bài học</h2>
      <div className="space-y-4 max-h-[calc(100vh-260px)] overflow-y-auto pr-2">
        <ul className="space-y-2">
          {lecture?.lessons?.map(lesson => {
            const unlocked = isLessonUnlocked(lesson.id);
            const isCompleted = progressData.some(
              progress => progress.lesson_id === lesson.id && progress.status === 'completed'
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
                    {(isCompleted || lesson.watched || lesson.downloaded) && (
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

export default LessonSidebar;