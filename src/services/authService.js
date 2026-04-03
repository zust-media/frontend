import api from './api';

export const authService = {
  prepareRegister() {
    return api.post('/api/auth/register/prepare');
  },

  register(userData) {
    return api.post('/api/auth/register', userData);
  },

  login(credentials) {
    return api.post('/api/auth/login', credentials);
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  refreshToken() {
    return api.post('/api/auth/refresh');
  },

  getCurrentUser() {
    return api.get('/api/users/me');
  },

  updateProfile(data) {
    return api.put('/api/users/me', data);
  },

  changePassword(currentPassword, newPassword) {
    return api.put('/api/users/me/password', { currentPassword, newPassword });
  },

  changeEmail(email, password) {
    return api.put('/api/users/me/email', { email, password });
  },

  regenerateToken() {
    return api.post('/api/users/me/regenerate-token');
  },

  getSlugStatus() {
    return api.get('/api/users/me/slug-status');
  },

  updateSlug(slug) {
    return api.put('/api/users/me/slug', { slug });
  },
};