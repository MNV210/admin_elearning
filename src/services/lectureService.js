import apiClient from './api';

const lectureService = {
  // Lấy danh sách tất cả bài giảng của một khóa học
  getCourseLectures: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/lectures`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết một bài giảng cụ thể
  getLectureById: async (lectureId) => {
    try {
      const response = await apiClient.get(`/lessons/${lectureId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy tài liệu của một bài giảng
  getLectureMaterials: async (courseId, lectureId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/lectures/${lectureId}/materials`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo bài giảng mới (chỉ Admin)
  createLecture: async (courseId, lectureData) => {
    try {
      const response = await apiClient.post(`/courses/${courseId}/lectures`, lectureData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật bài giảng (chỉ Admin)
  updateLecture: async (courseId, lectureId, lectureData) => {
    try {
      const response = await apiClient.put(`/courses/${courseId}/lectures/${lectureId}`, lectureData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa bài giảng (chỉ Admin)
  deleteLecture: async (courseId, lectureId) => {
    try {
      const response = await apiClient.delete(`/courses/${courseId}/lectures/${lectureId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Thêm tài liệu vào bài giảng (chỉ Admin)
  addLectureMaterial: async (courseId, lectureId, materialData) => {
    try {
      const response = await apiClient.post(
        `/courses/${courseId}/lectures/${lectureId}/materials`,
        materialData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Đánh dấu bài giảng đã hoàn thành (học viên)
  markLectureAsCompleted: async (courseId, lectureId) => {
    try {
      const response = await apiClient.post(`/courses/${courseId}/lectures/${lectureId}/complete`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Kiểm tra trạng thái hoàn thành bài giảng của học viên
  getLectureCompletionStatus: async (courseId, lectureId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/lectures/${lectureId}/status`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default lectureService; 