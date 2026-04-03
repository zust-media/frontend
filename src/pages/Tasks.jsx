import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, Star } from 'lucide-react';
import taskService from '../services/taskService';

function Tasks() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getTasks();
      setTasks(response.data.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (taskId) => {
    try {
      await taskService.joinTask(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Failed to join task:', error);
      alert(error.response?.data?.message || 'Failed to join task');
    }
  };

  const handleLeave = async (taskId) => {
    try {
      await taskService.leaveTask(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Failed to leave task:', error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const isTaskActive = (task) => {
    const now = new Date();
    if (task.endTime && new Date(task.endTime) <= now) return false;
    return true;
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
      <h1 className="text-3xl font-bold mb-6">{t('tasks.title')}</h1>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-base-content/60">
          <p>{t('tasks.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="card bg-base-200 shadow">
              <div className="card-body">
                <h2 className="card-title">{task.name}</h2>
                {task.description && (
                  <p className="text-sm text-base-content/60">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{task.participantCount || 0} / {task.maxParticipants || '∞'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-warning" />
                    <span>{task.score}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(task.endTime)}</span>
                  </div>
                </div>
                <div className="card-actions justify-end mt-4">
                  {task.isJoined ? (
                    <button
                      className="btn btn-ghost"
                      onClick={() => handleLeave(task.id)}
                    >
                      {t('tasks.leave')}
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleJoin(task.id)}
                      disabled={!isTaskActive(task)}
                    >
                      {t('tasks.join')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Tasks;