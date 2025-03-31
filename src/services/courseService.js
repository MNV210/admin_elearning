import apiClient from './api';

const courseService = {
  // Lấy tất cả khóa học
  getAllCourses: async () => {
    try {
      const response = await apiClient.get('/courses');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy một khóa học cụ thể theo ID
  getCourseById: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Tạo khóa học mới (chỉ Admin)
  createCourse: async (courseData) => {
    try {
      const response = await apiClient.post('/courses', courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin khóa học (chỉ Admin)
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await apiClient.put(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa khóa học (chỉ Admin)
  deleteCourse: async (courseId) => {
    try {
      const response = await apiClient.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Đăng ký khóa học
  enrollCourse: async (courseId, userData) => {
    try {
      const response = await apiClient.post(`/courses/${courseId}/enroll`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  //lấy các khóa học đã đăng ký của user
  getCourseUserRegister: async () => {
    try {
      const response = await apiClient.post('/courses/user_register');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // kiểm tra user đã đăng ký khóa học chưa(TV)
  checkUserRegister:async(data) => {
    try {
      const response = await apiClient.post('/courses/check_register',data);
      return response.data
    }catch (error) {
      throw error
    }
  },

  // lấy các khóa học đã tạo của user
  getCourseUserCreate: async () => {
    try {
      const response = await apiClient.post('/courses/user_create');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  //Lấy các bài học có trong khóa học bằng course_id
  getLessonByCourseId: async (course_id) => {
    try {
      const response = await apiClient.get(`lessons/course/${course_id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default courseService; 