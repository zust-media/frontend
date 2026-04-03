import api from './api';

const statsService = {
  getCurrentStats() {
    return api.get('/api/stats');
  },

  getHistory(days = 30) {
    return api.get('/api/stats/history', { params: { days } });
  },
};

export default statsService;