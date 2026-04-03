import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Star, CheckCircle } from 'lucide-react';
import taskService from '../services/taskService';

function MyTasks() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, scoresRes] = await Promise.all([
        taskService.getMyTasks(),
        taskService.getMyScores()
      ]);
      setTasks(tasksRes.data.data || []);
      setScores(scoresRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('tasks.myTasks')}</h1>

      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${tab === 'tasks' ? 'tab-active' : ''}`}
          onClick={() => setTab('tasks')}
        >
          {t('tasks.myTasks')} ({tasks.length})
        </button>
        <button
          className={`tab ${tab === 'scores' ? 'tab-active' : ''}`}
          onClick={() => setTab('scores')}
        >
          {t('tasks.myScores')} ({scores.length})
        </button>
      </div>

      {tab === 'tasks' && (
        <>
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p>{t('tasks.noMyTasks')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>{t('tasks.name')}</th>
                    <th>{t('tasks.joinedAt')}</th>
                    <th>{t('tasks.score')}</th>
                    <th>{t('tasks.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.name}</td>
                      <td>{formatDate(task.joinedAt)}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-warning" />
                          <span>{task.score || 0}</span>
                        </div>
                      </td>
                      <td>
                        {task.score > 0 ? (
                          <span className="badge badge-success flex items-center gap-1 w-fit">
                            <CheckCircle size={12} />
                            {t('tasks.completed')}
                          </span>
                        ) : (
                          <span className="badge badge-warning">{t('tasks.pending')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'scores' && (
        <>
          {scores.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p>{t('tasks.noScores')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>{t('tasks.taskName')}</th>
                    <th>{t('tasks.score')}</th>
                    <th>{t('tasks.givenBy')}</th>
                    <th>{t('tasks.givenAt')}</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score) => (
                    <tr key={score.id}>
                      <td>{score.taskName}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-warning" />
                          <span>+{score.totalScore}</span>
                        </div>
                      </td>
                      <td>{score.fromUsername || '-'}</td>
                      <td>{formatDate(score.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyTasks;