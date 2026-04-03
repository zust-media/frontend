import api from './api';

export const searchService = {
  searchImages(params) {
    return api.get('/api/search/images', { params });
  },

  getSuggestions(query) {
    return api.get('/api/search/suggestions', { params: { query } });
  },
};