import api from './api';

export const tagService = {
  getTags() {
    return api.get('/api/tags');
  },

  getTagById(id) {
    return api.get(`/api/tags/${id}`);
  },

  getTagBySlug(slug) {
    return api.get(`/api/tags/slug/${slug}`);
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