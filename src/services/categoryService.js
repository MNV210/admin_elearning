import apiClient from './api';

const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await apiClient.get('/categories');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    try {
      const response = await apiClient.get(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new category (Admin only)
  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update category (Admin only)
  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await apiClient.put(`/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete category (Admin only)
  deleteCategory: async (categoryId) => {
    try {
      const response = await apiClient.delete(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default categoryService; 