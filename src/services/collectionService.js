import api from './api';

const collectionService = {
  getCollections() {
    return api.get('/api/collections');
  },

  getCollection(id) {
    return api.get(`/api/collections/${id}`);
  },

  createCollection(data) {
    return api.post('/api/collections', data);
  },

  updateCollection(id, data) {
    return api.put(`/api/collections/${id}`, data);
  },

  deleteCollection(id) {
    return api.delete(`/api/collections/${id}`);
  },

  addImages(collectionId, imageIds) {
    return api.post(`/api/collections/${collectionId}/images`, { imageIds });
  },

  removeImage(collectionId, imageId) {
    return api.delete(`/api/collections/${collectionId}/images/${imageId}`);
  },

  downloadCollection(id, params = {}) {
    return api.get(`/api/collections/${id}/download`, {
      params,
      responseType: 'blob',
    });
  },
};

export default collectionService;