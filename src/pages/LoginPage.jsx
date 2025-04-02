import React, { useEffect, useState } from 'react';
import { Form, Input, Button } from 'antd';
import userService from '../services/userService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/admin';

  // Chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async(values) => {
    setLoading(true);
    try {
      const response = await userService.login(values);
      if (response.status === 'success' && response.data.token) {
        // Lấy user từ object đầu tiên trong data
        const user = Object.values(response.data)[0];
        
        // Kiểm tra role
        if (user.role === 'student') {
          toast.error('Học viên không được phép truy cập trang quản trị!');
          return;
        }

        // Sử dụng hàm login từ AuthContext để cập nhật trạng thái
        login(user, response.data.token);
        toast.success('Đăng nhập thành công!');
        
        // Redirect based on role
        if (user.role === 'teacher') {
          navigate('/admin/categories', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        toast.error('Đăng nhập thất bại!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    toast.error('Vui lòng kiểm tra lại thông tin đăng nhập!');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
