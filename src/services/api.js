import axios from 'axios';

// Tạo instance của axios với cấu hình mặc định
const API_BASE_URL = 'http://localhost:8000/api/v1'; // Thay đổi URL này thành API endpoint thật của bạn

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để xử lý việc thêm token xác thực vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý phản hồi và lỗi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý các lỗi chung như lỗi xác thực 401, lỗi máy chủ 500, v.v.
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        // Xử lý lỗi xác thực - có thể đăng xuất người dùng
        localStorage.removeItem('token');
        // Chuyển hướng đến trang đăng nhập
        window.location.href = '/login';
      }
      
      // Các xử lý lỗi khác
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 