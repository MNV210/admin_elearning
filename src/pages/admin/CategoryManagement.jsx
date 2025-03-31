import { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { categoryService } from '../../services';
import { toast } from 'react-toastify';
import { Modal, Form, Input, Select, Button } from 'antd';
import { useAuth } from '../../context/AuthContext';

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const { user } = useAuth();
  const [form] = Form.useForm();
  
  // Form data for category modal
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await categoryService.getAllCategories();
      setCategories(response);
    } catch (error) {
      toast.error('Không thể tải danh mục: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter categories based on search term
  const filteredCategories = Array.isArray(categories) ? categories.filter(category => {
    const name = category?.name || '';
    const description = category?.description || '';
    
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           description.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  // Handle opening delete category modal
  const handleDeleteCategory = (category) => {
    if (user?.role !== 'admin') {
      toast.error('Bạn không có quyền xóa danh mục!');
      return;
    }
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  // Handle confirming category deletion
  const confirmDeleteCategory = async () => {
    try {
      await categoryService.deleteCategory(deletingCategory.id).then(() => {
        setCategories(categories.filter(category => category.id !== deletingCategory.id));
        toast.success('Đã xóa danh mục thành công');
        setIsDeleteModalOpen(false);
        setDeletingCategory(null);
      });
    } catch (error) {
      console.error('Lỗi khi xóa danh mục:', error);
      toast.error('Không thể xóa danh mục. Vui lòng thử lại.');
    }
  };

  // Handle canceling category deletion
  const cancelDeleteCategory = () => {
    setIsDeleteModalOpen(false);
    setDeletingCategory(null);
  };

  // Handle opening edit category modal
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description || '',
      status: category.status || 'active'
    });
    setIsModalOpen(true);
  };
  
  // Handle opening add category modal
  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        // Update existing category
        const result = await categoryService.updateCategory(editingCategory.id, values);
        if (result) {
          toast.success('Danh mục đã được cập nhật thành công');
          // Close modal and reset form
          setIsModalOpen(false);
          setEditingCategory(null);
          form.resetFields();
          
          // Fetch updated data from API
          fetchCategories();
        }
      } else {
        // Create new category
        const result = await categoryService.createCategory(values);
        if (result) {
          toast.success('Danh mục mới đã được tạo thành công');
          // Close modal and reset form
          setIsModalOpen(false);
          setEditingCategory(null);
          form.resetFields();
          
          // Fetch updated data from API
          fetchCategories();
        }
      }
    } catch (error) {
      console.error('Lỗi khi lưu danh mục:', error);
      toast.error('Không thể lưu danh mục. Vui lòng thử lại.');
    }
  };

  // Display loading state
  if (loading && categories?.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Quản Lý Danh Mục</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải danh mục...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Quản Lý Danh Mục</h3>
          <div className="flex space-x-2">
            <button 
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              onClick={handleAddCategory}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Thêm Danh Mục Mới
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {loading && categories.length > 0 && (
          <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            Đang làm mới danh mục...
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Không tìm thấy danh mục nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Danh Mục</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô Tả</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{category.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      <Modal
        title={editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          initialValues={formData}
        >
          <Form.Item
            label="Tên Danh Mục"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item
            label="Mô Tả"
            name="description"
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Nhập mô tả danh mục"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-2">
              <Button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCategory(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? 'Cập Nhật' : 'Thêm Mới'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác Nhận Xóa"
        open={isDeleteModalOpen}
        onOk={confirmDeleteCategory}
        onCancel={cancelDeleteCategory}
      >
        <p>Bạn có chắc chắn muốn xóa danh mục "{deletingCategory?.name}"?</p>
      </Modal>
    </div>
  );
}

export default CategoryManagement; 