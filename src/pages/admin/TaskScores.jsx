import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Star, UserMinus, UserPlus, Search } from 'lucide-react';
import taskService from '../../services/taskService';
import adminService from '../../services/adminService';

function TaskScores({ task, onClose }) {
  const { t } = useTranslation();
  const [participants, setParticipants] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchParticipants();
  }, [task.id]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const response = await taskService.getParticipants(task.id);
      setParticipants(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (userId, value) => {
    setScores(prev => ({
      ...prev,
      [userId]: parseInt(value) || 0
    }));
  };

  const handleGiveScore = async (userId) => {
    const score = scores[userId];
    if (!score || score <= 0) return;

    try {
      await taskService.giveScore(task.id, userId, score);
      setScores(prev => ({ ...prev, [userId]: 0 }));
      fetchParticipants();
    } catch (error) {
      console.error('Failed to give score:', error);
      alert(error.response?.data?.message || 'Failed to give score');
    }
  };

  const handleRemoveParticipant = async (userId) => {
    if (!confirm(t('tasks.confirmRemove'))) return;
    try {
      await taskService.removeParticipant(task.id, userId);
      fetchParticipants();
    } catch (error) {
      console.error('Failed to remove participant:', error);
      alert(error.response?.data?.message || 'Failed to remove participant');
    }
  };

  const handleSearchUsers = async () => {
    if (!userSearch.trim()) return;
    setSearching(true);
    try {
      const response = await adminService.getUsers({ search: userSearch, pageSize: 10 });
      const existingUserIds = participants.map(p => p.userId);
      setSearchResults(response.data.data.users.filter(u => !existingUserIds.includes(u.id)));
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddParticipant = async (userId) => {
    try {
      await taskService.addParticipant(task.id, userId);
      setSearchResults([]);
      setUserSearch('');
      setShowAddUser(false);
      fetchParticipants();
    } catch (error) {
      console.error('Failed to add participant:', error);
      alert(error.response?.data?.message || 'Failed to add participant');
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            {t('tasks.giveScore')} - {task.name}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex justify-end">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setShowAddUser(!showAddUser)}
          >
            <UserPlus size={16} />
            {t('tasks.addParticipant')}
          </button>
        </div>

        {showAddUser && (
          <div className="mb-4 p-4 bg-base-200 rounded-lg">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="input input-bordered flex-1"
                placeholder={t('tasks.searchUsers')}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
              />
              <button
                className={`btn btn-primary ${searching ? 'loading' : ''}`}
                onClick={handleSearchUsers}
                disabled={searching}
              >
                <Search size={16} />
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto">
                {searchResults.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 hover:bg-base-300 rounded">
                    <span>{user.username} ({user.email})</span>
                    <button
                      className="btn btn-xs btn-primary"
                      onClick={() => handleAddParticipant(user.id)}
                    >
                      {t('tasks.add')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : participants.length === 0 ? (
          <p className="text-center py-8 text-base-content/60">
            {t('tasks.noParticipants')}
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>{t('tasks.user')}</th>
                  <th>{t('tasks.baseScore')}</th>
                  <th>{t('tasks.extraScore')}</th>
                  <th>{t('tasks.totalScore')}</th>
                  <th>{t('tasks.giveScore')}</th>
                  <th>{t('tasks.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.userId}>
                    <td>{p.username}</td>
                    <td>{p.baseScore || 0}</td>
                    <td>{p.extraScore || 0}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-warning" />
                        <span>{p.totalScore || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1 items-center">
                        <input
                          type="number"
                          className="input input-bordered input-sm w-16"
                          placeholder={t('tasks.extraScore')}
                          value={scores[p.userId] || ''}
                          onChange={(e) => handleScoreChange(p.userId, e.target.value)}
                          min={1}
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleGiveScore(p.userId)}
                          disabled={!scores[p.userId] || scores[p.userId] <= 0}
                        >
                          {t('tasks.give')}
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => handleRemoveParticipant(p.userId)}
                        title={t('tasks.removeParticipant')}
                      >
                        <UserMinus size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default TaskScores;