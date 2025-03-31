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
import { Modal } from 'antd';

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  
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
      // const categoriesData = response.data || response.categories || [];
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
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  // Handle confirming category deletion
  const confirmDeleteCategory = async () => {
    try {
      await categoryService.deleteCategory(deletingCategory.id).then  (() => {
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
    setFormData({
      name: category.name,
      description: category.description || '',
      status: category.status || 'active'
    });
    setIsModalOpen(true);
  };
  
  // Handle opening add category modal
  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      status: 'active'
    });
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // Update existing category
        const result = await categoryService.updateCategory(editingCategory.id, formData);
        if (result) {
          toast.success('Danh mục đã được cập nhật thành công');
          // Close modal and reset form
          setIsModalOpen(false);
          setEditingCategory(null);
          setFormData({
            name: '',
            description: '',
            status: 'active'
          });
          
          // Fetch updated data from API
          fetchCategories();
        }
      } else {
        // Create new category
        const result = await categoryService.createCategory(formData);
        if (result) {
          toast.success('Danh mục mới đã được tạo thành công');
          // Close modal and reset form
          setIsModalOpen(false);
          setEditingCategory(null);
          setFormData({
            name: '',
            description: '',
            status: 'active'
          });
          
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
            {/* <button 
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              onClick={fetchCategories}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></span>
                  Đang làm mới...
                </>
              ) : (
                'Làm Mới Danh Mục'
              )}
            </button> */}
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên danh mục
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th> */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số khóa học
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map(category => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">{category.description || 'Không có mô tả'}</div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {category.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.courseCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal for adding/editing category */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Tên danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên danh mục"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập mô tả danh mục"
                  ></textarea>
                </div>
                
                {/* <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div> */}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingCategory ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        title="Xác nhận xóa"
        open={isDeleteModalOpen}
        onOk={confirmDeleteCategory}
        onCancel={cancelDeleteCategory}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ 
          style: { backgroundColor: '#ef4444', borderColor: '#ef4444' } 
        }}
      >
        <p>Bạn có chắc chắn muốn xóa danh mục "{deletingCategory?.name}"?</p>
        <p className="text-gray-500 text-sm mt-2">Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
}

export default CategoryManagement; 