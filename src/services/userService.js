import apiClient from './api';

const userService = {
  // Xác thực người dùng
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      console.log(response)
      // Lưu token vào localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Đăng ký người dùng mới
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
  },

  // Lấy thông tin người dùng hiện tại
  // getCurrentUser: async () => {
  //   try {
  //     const response = await apiClient.get('/users/me');
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  // Cập nhật thông tin người dùng
  // updateProfile: async (userData) => {
  //   try {
  //     const response = await apiClient.put('/users/me', userData);
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  // Lấy danh sách tất cả người dùng (chỉ Admin)
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error;  
    }
  },
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Lấy thông tin chi tiết của một người dùng (chỉ Admin)
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getInstructors: async () => {
    try {
      const response = await apiClient.get('/not_student');
      return response.data;
    } catch (error) {
      throw error;    
    }
  },

  // Cập nhật vai trò người dùng (chỉ Admin)
  // updateUserRole: async (userId, roleData) => {
  //   try {
  //     const response = await apiClient.put(`/users/${userId}/role`, roleData);
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // },


};

export default userService; 