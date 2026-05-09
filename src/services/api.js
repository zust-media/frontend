const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
}

export const api = {
  // Auth
  login(username, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  register(data) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCaptcha() {
    return request('/auth/captcha/generate');
  },

  verifyCaptcha(captchaKey, answer) {
    return request('/auth/captcha/verify', {
      method: 'POST',
      body: JSON.stringify({ captchaKey, answer }),
    });
  },

  getMe() {
    return request('/auth/me');
  },

  updateProfile(data) {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Images
  getImages(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/images/list?${query}`);
  },

  getImage(id) {
    return request(`/images/detail/${id}`);
  },

  getImageByUuid(uuid) {
    return request(`/images/by-uuid/${uuid}`);
  },

  signUrl(filename, params = {}) {
    return request('/images/sign-url', {
      method: 'POST',
      body: JSON.stringify({ filename, ...params }),
    });
  },

  uploadImage(formData) {
    return request('/images/upload', {
      method: 'POST',
      body: formData,
    });
  },

  batchUpload(formData) {
    return request('/images/batch-upload', {
      method: 'POST',
      body: formData,
    });
  },

  updateImage(id, data) {
    return request(`/images/detail/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteImage(id) {
    return request(`/images/delete/${id}`, {
      method: 'DELETE',
    });
  },

  batchDeleteImages(ids) {
    return request('/images/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  batchUpdateImages(ids, data) {
    return request('/images/batch-update', {
      method: 'POST',
      body: JSON.stringify({ ids, ...data }),
    });
  },

  getBatchInfo(ids) {
    return request(`/images/batch-info?ids=${ids.join(',')}`);
  },

  getDuplicates() {
    return request('/images/duplicates');
  },

  getImageUrl(filename, signedUrl) {
    return signedUrl || '';
  },

  getThumbUrl(filename, thumbUrl) {
    return thumbUrl || '';
  },

  getPreviewUrl(filename, previewUrl) {
    return previewUrl || '';
  },

  getDownloadUrl(filename, downloadUrl) {
    return downloadUrl || '';
  },

  // Tags
  getTags() {
    return request('/tags/list');
  },

  getTagPage(id, params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/tags/${encodeURIComponent(id)}?${query}`);
  },

  createTag(name, slug) {
    const body = { name };
    if (slug) body.slug = slug;
    return request('/tags/create', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  updateTag(id, data) {
    return request(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTag(id) {
    return request(`/tags/${id}`, {
      method: 'DELETE',
    });
  },

  // Categories
  getCategories() {
    return request('/categories/list');
  },

  getCategoryPage(id, params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/categories/${encodeURIComponent(id)}?${query}`);
  },

  createCategory(data) {
    return request('/categories/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCategory(id, data) {
    return request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCategory(id) {
    return request(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Config
  getConfig() {
    return request('/config');
  },

  // Users
  getUser(identifier, params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/users/${identifier}?${query}`);
  },

  lookupUsers(uuids) {
    const q = uuids.filter(Boolean).join(',');
    if (!q) return Promise.resolve({ users: {} });
    return request(`/users/lookup?uuids=${encodeURIComponent(q)}`);
  },

  listUsers() {
    return request('/users/list');
  },

  createUser(data) {
    return request('/users/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUser(id, data) {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateUserRole(id, role) {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  deleteUser(id) {
    return request(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin
  getAdminStats() {
    return request('/admin/stats');
  },

  getLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/logs?${query}`);
  },

  getAuthCodes() {
    return request('/admin/auth-codes');
  },

  createAuthCode(data) {
    return request('/admin/auth-codes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteAuthCode(id) {
    return request(`/admin/auth-codes/${id}`, {
      method: 'DELETE',
    });
  },

  // Galleries
  getGalleries() {
    return request('/galleries');
  },

  createGallery(data) {
    return request('/galleries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getGallery(uuid, params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/galleries/${uuid}?${query}`);
  },

  updateGallery(uuid, data) {
    return request(`/galleries/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteGallery(uuid) {
    return request(`/galleries/${uuid}`, {
      method: 'DELETE',
    });
  },

  addImagesToGallery(uuid, imageUuids) {
    return request(`/galleries/${uuid}/images`, {
      method: 'POST',
      body: JSON.stringify({ image_uuids: imageUuids }),
    });
  },

  removeImagesFromGallery(uuid, imageUuids) {
    return request(`/galleries/${uuid}/images`, {
      method: 'DELETE',
      body: JSON.stringify({ image_uuids: imageUuids }),
    });
  },

  getGalleryDownloadUrl(uuid) {
    return `${API_BASE}/galleries/${uuid}/download`;
  },

  batchDownloadImages(imageUuids) {
    return request('/images/batch-download', {
      method: 'POST',
      body: JSON.stringify({ image_uuids: imageUuids }),
    });
  },

  batchDownloadUrl() {
    return `${API_BASE}/images/batch-download`;
  },
};
