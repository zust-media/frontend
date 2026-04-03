import api from './api';

export const imageService = {
  getImages(params) {
    return api.get('/api/images', { params });
  },

  getImageById(id) {
    return api.get(`/api/images/${id}`);
  },

  uploadImages(formData) {
    return api.post('/api/images/upload', formData);
  },

  updateImage(id, data) {
    return api.put(`/api/images/${id}`, data);
  },

  deleteImage(id) {
    return api.delete(`/api/images/${id}`);
  },

  batchDelete(ids) {
    return api.post('/api/images/batch-delete', { ids });
  },

  addTags(imageId, tagIds) {
    return api.post(`/api/images/${imageId}/tags`, { tagIds });
  },

  removeTag(imageId, tagId) {
    return api.delete(`/api/images/${imageId}/tags/${tagId}`);
  },

  getPreviewUrl(id) {
    return api.get(`/api/images/${id}/preview`);
  },

  getImagesByUserSlug(userSlug, params) {
    return api.get(`/api/images/user/${userSlug}`, { params });
  },
};

export const categoryService = {
  getCategories() {
    return api.get('/api/categories');
  },

  getCategoryById(id) {
    return api.get(`/api/categories/${id}`);
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

export const tagService = {
  getTags() {
    return api.get('/api/tags');
  },

  getTagById(id) {
    return api.get(`/api/tags/${id}`);
  },

  createTag(data) {
    return api.post('/api/tags', data);
  },

  updateTag(id, data) {
    return api.put(`/api/tags/${id}`, data);
  },

  deleteTag(id) {
    return api.delete(`/api/tags/${id}`);
  },
};