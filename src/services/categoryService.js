import api from './api';

export const categoryService = {
  getCategories() {
    return api.get('/api/categories');
  },

  getCategoryById(id) {
    return api.get(`/api/categories/${id}`);
  },

  getCategoryBySlug(slug) {
    return api.get(`/api/categories/slug/${slug}`);
  },

  createCategory(data) {
    return api.post('/api/categories', data);
  },

  updateCategory(id, data) {
    return api.put(`/api/categories/${id}`, data);
  },

  deleteCategory(id) {
    return api.delete(`/api/categories/${id}`);
  },
};