import api from './api';

const adminService = {
  getUsers(params = {}) {
    return api.get('/api/admin/users', { params });
  },

  getUser(id) {
    return api.get(`/api/admin/users/${id}`);
  },

  updateUser(id, data) {
    return api.put(`/api/admin/users/${id}`, data);
  },

  deleteUser(id) {
    return api.delete(`/api/admin/users/${id}`);
  },

  createUser(data) {
    return api.post('/api/admin/users', data);
  },

  getStats() {
    return api.get('/api/stats');
  },

  getStatsHistory(days = 30) {
    return api.get('/api/stats/history', { params: { days } });
  },

  getSettings() {
    return api.get('/api/admin/settings');
  },

  updateSettings(data) {
    return api.put('/api/admin/settings', data);
  },
};

export default adminService;