import { useState, useEffect, useMemo } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from '@heroicons/react/24/outline';
import { Modal, Form, Input, Select, Button, Upload, message, Popconfirm, Pagination } from 'antd';
import { UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import userService from '../../services/userService';

const FILE_SIZE_LIMIT = 2 * 1024 * 1024; // 2MB
const DEFAULT_FORM_VALUES = {
  name: '',
  email: '',
  password: '',
  role: 'student',
};

const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

const ROLE_DISPLAY = {
  [USER_ROLES.ADMIN]: { label: 'Quản trị viên', className: 'bg-purple-100 text-purple-800' },
  [USER_ROLES.TEACHER]: { label: 'Giáo viên', className: 'bg-blue-100 text-blue-800' },
  [USER_ROLES.STUDENT]: { label: 'Học viên', className: 'bg-green-100 text-green-800' },
};

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  
  // React Hook Form setup
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: DEFAULT_FORM_VALUES
  });

  // Fetch all users
  const fetchUsers = async() => {
    try {
      setIsLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      message.error("Tải danh sách người dùng thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and sort users using useMemo to prevent unnecessary recalculations
  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'All' || user.role?.toLowerCase() === roleFilter.toLowerCase();
        
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;
        
        const aValue = a[sortConfig.key].toLowerCase();
        const bValue = b[sortConfig.key].toLowerCase();
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
  }, [users, searchTerm, roleFilter, sortConfig]);

  // Calculate paginated data
  const paginatedUsers = useMemo(() => {
    const { current, pageSize } = pagination;
    const startIndex = (current - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, pagination]);

  // Handle sort
  const requestSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // Handle delete user
  const handleDeleteUser = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa người dùng',
      icon: <ExclamationCircleOutlined style={{ color: 'red' }} />,
      content: 'Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      width: 450,
      maskClosable: false,
      className: 'delete-user-modal',
      okButtonProps: { 
        size: 'large',
        danger: true
      },
      cancelButtonProps: {
        size: 'large'
      },
      onOk: async () => {
        try {
          setIsLoading(true);
          await userService.deleteUser(id).then(() => {
            message.success('Xóa người dùng thành công');
            fetchUsers();
          }).catch((error) => {
            console.error("Failed to delete user:", error);
            message.error("Xóa người dùng thất bại. Vui lòng thử lại.");
          });
        } catch (error) {
          console.error("Failed to delete user:", error);
          message.error("Xóa người dùng thất bại. Vui lòng thử lại.");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role?.toLowerCase() || 'student',
    });
    
    setIsModalOpen(true);
  };

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      // Create FormData object
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      if (data.password) {
        formData.append('password', data.password);
      }
      formData.append('role', data.role);
      
      // Append file if exists
      // if (fileList.length > 0 && fileList[0].originFileObj) {
      //   formData.append('avatar', fileList[0].originFileObj);
      // }
      
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
        message.success('Cập nhật người dùng thành công');
      } else {
        await userService.createUser(formData);
        message.success('Thêm người dùng mới thành công');
      }
      
      closeModal();
      fetchUsers();
      
    } catch (error) {
      console.error("Failed to save user:", error);
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('email')) {
          message.error('Email đã được sử dụng');
        } else {
          message.error("Lưu thông tin người dùng thất bại: " + error.response.data.message);
        }
      } else {
        message.error("Lưu thông tin người dùng thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Upload props for Ant Design Upload component
  // const uploadProps = {
  //   onRemove: () => setFileList([]),
  //   beforeUpload: (file) => {
  //     // Check file size (max 2MB)
  //     if (file.size > FILE_SIZE_LIMIT) {
  //       message.error('Kích thước file không được vượt quá 2MB');
  //       return Upload.LIST_IGNORE;
  //     }
      
  //     // Check file type
  //     if (!file.type.match('image.*')) {
  //       message.error('Chỉ chấp nhận file hình ảnh');
  //       return Upload.LIST_IGNORE;
  //     }
      
  //     setFileList([{
  //       uid: '-1',
  //       name: file.name,
  //       status: 'done',
  //       originFileObj: file
  //     }]);
  //     return false;
  //   },
  //   fileList,
  // };

  // Open add user modal
  const openAddUserModal = () => {
    setEditingUser(null);
    reset(DEFAULT_FORM_VALUES);
    setFileList([]);
    setIsModalOpen(true);
  };

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    reset(DEFAULT_FORM_VALUES);
    setFileList([]);
    setEditingUser(null);
  };

  // Render sort icon
  // const renderSortIcon = (key) => {
  //   if (sortConfig.key !== key) return null;
  //   return sortConfig.direction === 'ascending' 
  //     ? <ArrowUpIcon className="w-4 h-4 ml-1" />
  //     : <ArrowDownIcon className="w-4 h-4 ml-1" />;
  // };

  // Get role display info
  const getRoleDisplay = (role) => {
    const normalizedRole = role?.toLowerCase();
    
    // Check for instructor/teacher variations
    if (normalizedRole === 'instructor' || normalizedRole === 'teacher') {
      return ROLE_DISPLAY[USER_ROLES.TEACHER];
    }
    
    // Check for admin variations
    if (normalizedRole === 'admin') {
      return ROLE_DISPLAY[USER_ROLES.ADMIN];
    }
    
    // Default to student
    return ROLE_DISPLAY[USER_ROLES.STUDENT];
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Quản lý người dùng</h3>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={openAddUserModal}
            disabled={isLoading}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm người dùng mới
          </button>
        </div>
        
        {/* Search and filter */}
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex space-x-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">Tất cả</option>
              <option value="student">Học viên</option>
              <option value="teacher">Giáo viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* User table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    Họ tên 
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  // onClick={() => requestSort('email')}
                >
                  <div className="flex items-center">
                    Email
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  
                >
                  <div className="flex items-center">
                    Vai trò 
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => {
                  const roleInfo = getRoleDisplay(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
                            {user.name?.charAt(0) || '?'}
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.className}`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center">
                        <button 
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          onClick={() => handleEditUser(user)}
                          disabled={isLoading}
                          aria-label="Edit user"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isLoading}
                          aria-label="Delete user"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    Hiện chưa có dữ liệu nào!!!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Hiển thị {pagination.current === 1 ? 1 : (pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, filteredUsers.length)} / {filteredUsers.length} người dùng
          </p>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={filteredUsers.length}
            onChange={handlePaginationChange}
            showSizeChanger
            pageSizeOptions={['5', '10', '20', '50']}
          />
        </div>
      </div>
      
      {/* User modal form */}
      <Modal
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={500}
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item 
            label="Họ tên" 
            required 
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Họ tên không được để trống' }}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
          
          <Form.Item 
            label="Email" 
            required
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              rules={{ 
                required: 'Email không được để trống',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Email không hợp lệ'
                },
                validate: value => {
                  // Skip validation if editing user and email hasn't changed
                  if (editingUser && value === editingUser.email) return true;
                  
                  // Check if email is already in use
                  if (users.some(user => user.email === value)) {
                    return 'Email đã được sử dụng';
                  }
                  
                  return true;
                }
              }}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
          
          <Form.Item 
            label={
              <span>
                Mật khẩu
                {!editingUser && <span className="text-red-600"> *</span>}
                {editingUser && <span className="text-xs text-gray-500"> (Để trống nếu muốn giữ mật khẩu hiện tại)</span>}
              </span>
            }
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              rules={{ 
                required: !editingUser ? 'Mật khẩu không được để trống' : false,
                minLength: {
                  value: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự'
                }
              }}
              render={({ field }) => <Input.Password {...field} />}
            />
          </Form.Item>
          
          <Form.Item label="Vai trò" required>
            <Controller
              name="role"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field}>
                  <Select.Option value="student">Học viên</Select.Option>
                  <Select.Option value="teacher">Giáo viên</Select.Option>
                  <Select.Option value="admin">Quản trị viên</Select.Option>
                </Select>
              )}
            />
          </Form.Item>
          
          {/* <Form.Item label="Ảnh đại diện">
            <Upload
              listType="picture"
              maxCount={1}
              {...uploadProps}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF tối đa 2MB</p>
          </Form.Item> */}
          
          <Form.Item className="mb-0 flex justify-end">
            <Button 
              type="default" 
              onClick={closeModal}
              className="mr-2"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={isLoading}
              className="bg-blue-600"
            >
              {editingUser ? 'Lưu thay đổi' : 'Thêm người dùng'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagement;