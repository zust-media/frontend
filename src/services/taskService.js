import api from './api';

const taskService = {
  getTasks() {
    return api.get('/api/tasks');
  },

  getTask(id) {
    return api.get(`/api/tasks/${id}`);
  },

  createTask(data) {
    return api.post('/api/tasks', data);
  },

  updateTask(id, data) {
    return api.put(`/api/tasks/${id}`, data);
  },

  deleteTask(id) {
    return api.delete(`/api/tasks/${id}`);
  },

  joinTask(id) {
    return api.post(`/api/tasks/${id}/join`);
  },

  leaveTask(id) {
    return api.post(`/api/tasks/${id}/leave`);
  },

  getMyTasks() {
    return api.get('/api/tasks/my-tasks');
  },

  getMyScores() {
    return api.get('/api/tasks/my-scores');
  },

  getParticipants(taskId) {
    return api.get(`/api/tasks/${taskId}/participants`);
  },

  giveScore(taskId, userId, score) {
    return api.post(`/api/tasks/${taskId}/scores`, { userId, score });
  },

  settleTask(taskId) {
    return api.post(`/api/tasks/${taskId}/settle`);
  },

  addParticipant(taskId, userId) {
    return api.post(`/api/tasks/${taskId}/participants`, { userId });
  },

  removeParticipant(taskId, userId) {
    return api.delete(`/api/tasks/${taskId}/participants/${userId}`);
  },

  getStats(startDate, endDate) {
    return api.get('/api/task-stats/stats', { params: { startDate, endDate } });
  },
};

export default taskService;