import { useState, useEffect, useCallback } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { 
  Modal, 
  Select, 
  Upload, 
  message, 
  Button,
  Form as AntForm,
  Input,
} from 'antd';
import { InboxOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { courseService, categoryService } from '../../services';
import { toast } from 'react-toastify';
import { userService } from '../../services';
import uploadToS3 from '../../services/uploadToS3';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Dragger } = Upload;
const { TextArea } = Input;

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [pdfFileList, setPdfFileList] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const navigate = useNavigate();
  
  // Define react-hook-form
  const { 
    control, 
    handleSubmit: handleRHFSubmit, 
    formState: { errors }, 
    reset,
    setValue 
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: undefined,
      teacher: '',
      level: undefined, // Add default value for level
      thumbnail: null,
      pdfFile: null
    }
  });
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchCourses(),
          fetchCategories(),
          fetchTeachers()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Function to fetch courses from API
  const fetchCourses = async () => {
    try {
      setError(null);
      const response = await courseService.getCourseUserCreate();
      setCourses(response.data);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`Không thể tải khóa học: ${errorMsg}`);
      setError('Không thể tải khóa học. Vui lòng thử lại sau.');
      return [];
    }
  };

  // Function to fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response);
      return response;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`Không thể tải danh mục: ${errorMsg}`);
      return [];
    }
  };

  // Fetch teachers (users who are not students)
  const fetchTeachers = async () => {
    try {
      const response = await userService.getInstructors({ role: 'teacher' });
      setTeachers(response.data);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`Không thể tải danh sách giảng viên: ${errorMsg}`);
      return [];
    }
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter courses based on search term and selected category
  const filteredCourses = Array.isArray(courses) ? courses.filter(course => {
    const title = course?.title || '';
    const description = course?.description || '';
    const teacher = course?.teacher?.name || '';
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      title.toLowerCase().includes(searchLower) || 
      description.toLowerCase().includes(searchLower) ||
      teacher.toLowerCase().includes(searchLower)
    );
    const matchesCategory = selectedCategory ? course.category_id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  }) : [];

  // Handle opening delete course modal
  const handleDeleteCourse = useCallback((course) => {
    setDeletingCourse(course);
    setIsDeleteModalOpen(true);
  }, []);

  // Handle confirming course deletion
  const confirmDeleteCourse = async () => {
    try {
      setSubmitLoading(true);
      await courseService.deleteCourse(deletingCourse.id);
      setCourses(courses.filter(course => course.id !== deletingCourse.id));
      toast.success('Đã xóa khóa học thành công');
      setIsDeleteModalOpen(false);
      setDeletingCourse(null);
    } catch (error) {
      console.error('Lỗi khi xóa khóa học:', error);
      toast.error('Không thể xóa khóa học. Vui lòng thử lại.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle canceling course deletion
  const cancelDeleteCourse = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingCourse(null);
  }, []);

  // Handle opening edit course modal
  const handleEditCourse = useCallback((course) => {
    setEditingCourse(course);
    
    // Reset the form with course data
    reset({
      title: course.title,
      description: course.description || '',
      category: course.category_id,
      teacher: course.teacher?.id || '',
      level: course.level || undefined, // Ensure level is reset
      thumbnail: null,
      pdfFile: null
    });
    
    // Reset file list if there's a thumbnail
    if (course.thumbnail) {
      setFileList([
        {
          uid: '-1',
          name: 'thumbnail.jpg',
          status: 'done',
          url: course.thumbnail,
        }
      ]);
    } else {
      setFileList([]);
    }
    
    // Reset PDF file list if there's a PDF file
    if (course.pdfFileUrl) {
      setPdfFileList([
        {
          uid: '-1',
          name: 'document.pdf',
          status: 'done',
          url: course.pdfFileUrl,
        }
      ]);
    } else {
      setPdfFileList([]);
    }
    
    setIsModalOpen(true);
  }, [reset]);
  
  // Handle opening add course modal
  const handleAddCourse = useCallback(() => {
    setEditingCourse(null);
    reset({
      title: '',
      description: '',
      category: undefined,
      teacher: '',
      level: undefined, // Ensure level is reset
      thumbnail: null,
      pdfFile: null
    });
    setFileList([]);
    setPdfFileList([]);
    setIsModalOpen(true);
  }, [reset]);

  // Upload props for thumbnail
  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      setValue('thumbnail', null);
    },
    beforeUpload: (file) => {
      // Validate file type and size
      const isImage = file.type.startsWith('image/');
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isImage) {
        message.error('Chỉ chấp nhận file hình ảnh!');
        return Upload.LIST_IGNORE;
      }
      if (!isLt5M) {
        message.error('Kích thước hình phải nhỏ hơn 5MB!');
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      setValue('thumbnail', file);
      return false;
    },
    fileList,
  };

  // Upload props for PDF file
  const pdfUploadProps = {
    onRemove: () => {
      setPdfFileList([]);
      setValue('pdfFile', null);
    },
    beforeUpload: (file) => {
      // Validate file type and size
      const isPdf = file.type === 'application/pdf';
      const isLt10M = file.size / 1024 / 1024 < 10;

      if (!isPdf) {
        message.error('Chỉ chấp nhận tệp PDF!');
        return Upload.LIST_IGNORE;
      }
      if (!isLt10M) {
        message.error('Kích thước PDF phải nhỏ hơn 10MB!');
        return Upload.LIST_IGNORE;
      }

      setPdfFileList([file]);
      setValue('pdfFile', file);
      return false;
    },
    fileList: pdfFileList,
  };

  // Function to handle form submission
  const onSubmit = async (data) => {
    try {
      setSubmitLoading(true);
      console.log(data)
      const formData = new FormData();
      
      // Add form fields to formData
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('category_id', data.category);
      formData.append('teacher_id', data.teacher);
      formData.append('level', data.level);
      
      // Add files to formData if they exist
      if (data.thumbnail) {
        await uploadToS3.uploadVideo({file:data.thumbnail}).then((response) => {
          formData.append('thumbnail', response.data.url);
        }).catch((error) => {
          console.error('Error uploading thumbnail:', error);
          throw error;
        });
      }
      
      if (data.pdfFile) {
        await uploadToS3.uploadVideo({file:data.pdfFile}).then((response) => {
          formData.append('file_url', response.data.url);
        }).catch((error) => {
          console.error('Error uploading PDF file:', error);
          throw error;
        });
      }
      
      let response;
      
      if (editingCourse) {
        // Update existing course
        response = await updateCourse(editingCourse.id, formData);
      } else {
        // Create new course
        console.log(formData)
        response = await createCourse(formData);
      }
      
      if (response) {
        // Refresh courses list
        await fetchCourses();
        
        // Close modal and show success message
        setIsModalOpen(false);
        toast.success(editingCourse ? 'Cập nhật khóa học thành công!' : 'Tạo khóa học mới thành công!');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`Không thể ${editingCourse ? 'cập nhật' : 'tạo'} khóa học: ${errorMsg}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Function to create a new course
  const createCourse = async (formData) => {
    try {
      const response = await courseService.createCourse(formData);
      return response;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  };

  // Function to update an existing course
  const updateCourse = async (courseId, formData) => {
    try {
      const response = await courseService.updateCourse(courseId, formData);
      return response;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  };

  const goToDetailsCourse = (course) => {
    navigate(`/admin/course/${course.id}`);
  }

  // Display loading state
  if (loading && courses?.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Quản Lý Khóa Học</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải khóa học...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Quản Lý Khóa Học</h3>
          <div className="flex space-x-2">
            <button 
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              onClick={handleAddCourse}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Thêm Khóa Học Mới
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          <div>
            <Select
              placeholder="Lọc theo danh mục"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => setSelectedCategory(value)}
            >
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {loading && courses.length > 0 && (
          <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            Đang làm mới khóa học...
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {filteredCourses.length === 0 ? (
          // {console.log(filteredCourses)}
          <div className="text-center py-8">
            <p className="text-gray-500">Không tìm thấy khóa học nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khóa học
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giảng viên
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tài liệu PDF
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {course.thumbnail ? (
                            <img 
                              className="h-10 w-10 rounded-md object-cover" 
                              src={course.thumbnail} 
                              alt={course.title} 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                              <ExclamationCircleIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{course.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{course.teacher?.name || 'Chưa cập nhật'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {categories.find(c => c.id === course.category_id)?.name || 'Không có danh mục'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {course.file_url ? (
                        <div className="flex items-center text-sm text-blue-600">
                          <FilePdfOutlined className="mr-1" />
                          <a href={course.file_url} target="_blank" rel="noopener noreferrer">
                            Xem tài liệu
                          </a>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Chưa có tài liệu</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Xóa
                        </button>
                        <button
                          onClick={() => handleUploadDocument(course)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <PlusIcon className="w-4 h-4 mr-1" />
                          Tải tài liệu
                        </button>
                        <button
                          onClick={() => goToDetailsCourse(course)}
                          className="text-gray-600 hover:text-gray-900 flex items-center"
                        >
                          <DocumentTextIcon className="w-4 h-4 mr-1" />
                          Chi tiết
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
      
      {/* Modal for adding/editing course */}
      <Modal
        title={editingCourse ? 'Chỉnh Sửa Khóa Học' : 'Thêm Khóa Học Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        <form onSubmit={handleRHFSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên khóa học <span className="text-red-500">*</span>
              </label>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Vui lòng nhập tên khóa học' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Nhập tên khóa học"
                    status={errors.title ? 'error' : ''}
                  />
                )}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Vui lòng chọn danh mục' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Chọn danh mục"
                    status={errors.category ? 'error' : ''}
                    style={{ width: '100%' }}
                  >
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                )}
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cấp độ <span className="text-red-500">*</span>
            </label>
            <Controller
              name="level"
              control={control}
              rules={{ required: 'Vui lòng chọn cấp độ' }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Chọn cấp độ"
                  status={errors.level ? 'error' : ''}
                  style={{ width: '100%' }}
                >
                  <Option value="beginner">Người mới bắt đầu</Option>
                  <Option value="intermediate">Trung cấp</Option>
                  <Option value="advanced">Nâng cao</Option>
                </Select>
              )}
            />
            {errors.level && (
              <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
            )}
          </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả khóa học
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  rows={4}
                  placeholder="Nhập mô tả khóa học"
                />
              )}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giảng viên <span className="text-red-500">*</span>
            </label>
            <Controller
              name="teacher"
              control={control}
              rules={{ required: 'Vui lòng chọn giảng viên' }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Chọn giảng viên"
                  status={errors.teacher ? 'error' : ''}
                  style={{ width: '100%' }}
                >
                  {teachers?.map((teacher) => (
                    <Option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </Option>
                  ))}
                </Select>
              )}
            />
            {errors.teacher && (
              <p className="mt-1 text-sm text-red-600">{errors.teacher.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail
            </label>
            <Dragger {...uploadProps} maxCount={1} listType="picture">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Nhấp hoặc kéo tệp vào khu vực này để tải lên</p>
              <p className="ant-upload-hint">
                Hỗ trợ tệp hình ảnh JPG, PNG hoặc GIF dưới 5MB
              </p>
            </Dragger>
          </div>
          
          {!editingCourse && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tài liệu PDF <span className="text-red-500">*</span>
              </label>
              <Controller
                name="pdfFile"
                control={control}
                rules={{
                  required: 'Vui lòng tải lên tệp PDF'
                }}
                render={({ field }) => (
                  <Dragger 
                    {...pdfUploadProps} 
                    maxCount={1} 
                    listType="text"
                    status={errors.pdfFile ? 'error' : ''}
                    onChange={(info) => {
                      if (info.fileList.length > 0) {
                        setValue('pdfFile', info.fileList[0].originFileObj);
                      } else {
                        setValue('pdfFile', null);
                      }
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <FilePdfOutlined style={{ fontSize: '36px', color: '#ff4d4f' }} />
                    </p>
                    <p className="ant-upload-text">Nhấp hoặc kéo tệp PDF vào khu vực này để tải lên</p>
                    <p className="ant-upload-hint">
                      Chỉ hỗ trợ tệp PDF dưới 10MB
                    </p>
                  </Dragger>
                )}
              />
              {errors.pdfFile && (
                <p className="mt-1 text-sm text-red-600">{errors.pdfFile.message}</p>
              )}
            </div>
          )}
          
          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button onClick={() => setIsModalOpen(false)} disabled={submitLoading}>
              Hủy bỏ
            </Button>
            <Button type="primary" htmlType="submit" loading={submitLoading}>
              {editingCourse ? 'Cập Nhật' : 'Thêm Mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        title="Xác nhận xóa"
        open={isDeleteModalOpen}
        onOk={confirmDeleteCourse}
        onCancel={cancelDeleteCourse}
        okText="Xóa"
        cancelText="Hủy"
        confirmLoading={submitLoading}
        okButtonProps={{ 
          style: { backgroundColor: '#ef4444', borderColor: '#ef4444' } 
        }}
      >
        <p>Bạn có chắc chắn muốn xóa khóa học "{deletingCourse?.title}"?</p>
        <p className="text-gray-500 text-sm mt-2">Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
}

// Add handlers for the new buttons
const handleUploadDocument = (course) => {
  console.log('Upload document for course:', course);
  // Add logic for uploading documents
};


export default CourseManagement;