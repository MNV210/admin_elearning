import React, { useEffect, useState } from "react";
import { courseService, categoryService } from "../../services";
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const LectureList = ({ lectures, isDark, onLectureClick, onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection
  const handleCategoryClick = (category) => {
    const newSelectedCategory = category.id === selectedCategory?.id ? null : category;
    setSelectedCategory(newSelectedCategory);
    
    // Notify parent component about filter change
    if (onFilterChange) {
      onFilterChange({
        category: newSelectedCategory,
        searchTerm
      });
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    // Notify parent component about filter change
    if (onFilterChange) {
      onFilterChange({
        category: selectedCategory,
        searchTerm: newSearchTerm
      });
    }
  };

  // Filter lectures based on category and search term
  const filteredLectures = lectures?.filter(lecture => {
    const matchesCategory = !selectedCategory || lecture.category_id === selectedCategory.id;
    const matchesSearch = !searchTerm || 
      lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Bài Giảng & Tài Liệu Học Tập</h1>
        <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Khám phá các bài giảng có sẵn và đăng ký để bắt đầu học tập.
        </p>
      </div>
      
      {/* Search and filter controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center ${
              isDark 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Lọc theo danh mục
            {selectedCategory && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                isDark ? 'bg-blue-600' : 'bg-blue-100 text-blue-800'
              }`}>
                1
              </span>
            )}
          </button>
        </div>
        
        {/* Category filters */}
        {showFilters && (
          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Danh mục</h3>
              <div className="flex items-center space-x-3">
                {selectedCategory && (
                  <button 
                    onClick={() => {
                      setSelectedCategory(null);
                      if (onFilterChange) {
                        onFilterChange({
                          category: null,
                          searchTerm
                        });
                      }
                    }}
                    className="text-sm text-blue-500 hover:underline flex items-center"
                  >
                    Xóa lọc <XMarkIcon className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <div className="w-full py-3 text-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : categories.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">Không có danh mục nào</p>
              ) : (
                categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      selectedCategory?.id === category.id
                        ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                        : isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Results summary */}
      <div className="mb-4">
        <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Hiển thị {filteredLectures?.length || 0} khóa học
          {selectedCategory && <span> trong danh mục <strong>{selectedCategory.name}</strong></span>}
          {searchTerm && <span> với từ khóa <strong>"{searchTerm}"</strong></span>}
        </p>
      </div>
      
      {/* Course grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLectures?.length > 0 ? (
          filteredLectures.map(lecture => (
            <div 
              key={lecture.id} 
              className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer`}
              onClick={() => onLectureClick(lecture)}
            >
              <div className="h-40 bg-gray-300 relative overflow-hidden">
                <img 
                  src={lecture.thumbnail} 
                  alt={lecture.title} 
                  className="w-full h-full object-cover"
                />
                {lecture.category?.name && (
                  <div className={`absolute top-2 left-2 px-2 py-1 text-xs rounded-full ${
                    isDark ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
                  }`}>
                    {lecture.category?.name}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{lecture.title}</h3>
                <div className="flex flex-wrap text-sm mb-2">
                  <span className={`mr-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    <span className="material-icons text-sm align-text-bottom mr-1">person</span>
                    {lecture.instructor}
                  </span>
                  <span className={`mr-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    <span className="material-icons text-sm align-text-bottom mr-1">schedule</span>
                    {lecture.duration}
                  </span>
                  <span className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    <span className="material-icons text-sm align-text-bottom mr-1">signal_cellular_alt</span>
                    {lecture.level}
                  </span>
                </div>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"} line-clamp-2`}>
                  {lecture.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-12 text-center">
            <p className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Không tìm thấy khóa học nào.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LectureList;