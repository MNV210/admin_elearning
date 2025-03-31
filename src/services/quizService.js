import apiClient from './api';

const quizService = {
  // Lấy tất cả bài kiểm tra trong một khóa học
  getCourseQuizzes: async (courseId) => {
    try {
      const response = await apiClient.get(`/quizzes?course_id=${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  //Lấy thông tin của 1 bài kiêm tra
  getInfomationQuiz: async (quizId) => {
    try {
      const response = await apiClient.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Lấy kết quả bài kiểm tra
  getQuizResult: async (quizzesData) => {
    try {
      const response = await apiClient.post(`/quizz/user_results`, quizzesData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },  

  // Tạo bài kiểm tra mới (chỉ Admin)
  createQuiz: async (quizData) => {
    try {
      const response = await apiClient.post(`/quizzes`, quizData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật bài kiểm tra (chỉ Admin)
  updateQuiz: async (quizId, quizData) => {
    try {
      const response = await apiClient.put(`/quizzes/${quizId}`, quizData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteQuiz: async(quizId) => {
    try {
      const response = await apiClient.delete(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Thêm câu hỏi vào bài kiểm tra (chỉ Admin)
  addQuizQuestion: async (courseId, quizId, questionData) => {
    try {
      const response = await apiClient.post(
        `/courses/${courseId}/quizzes/${quizId}/questions`,
        questionData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Nộp bài làm của học viên
  submitQuizAnswers: async (courseId, quizId, answerData) => {
    try {
      const response = await apiClient.post(
        `/courses/${courseId}/quizzes/${quizId}/submit`,
        answerData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Lấy thống kê kết quả bài kiểm tra của tất cả học viên (chỉ Admin)
  getQuizStatistics: async (courseId, quizId) => {
    try {
      const response = await apiClient.get(`/admin/courses/${courseId}/quizzes/${quizId}/statistics`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  //get quiz results in database (tu viet)
  getQuizResulsByUserId: async () => {
    try {
      const response = await apiClient.post(`/quizz/user_results`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Nộp kết quả bài kiểm tra
  submitQuizResult: async (submissionData) => {
    try {
      const response = await apiClient.post(`/quizz/submit_result`, submissionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default quizService; 