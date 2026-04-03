import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Users, Calendar, Star, CheckCircle, Clock } from 'lucide-react';
import taskService from '../../services/taskService';
import AdminTaskForm from './AdminTaskForm';
import TaskScores from './TaskScores';

function AdminTasks() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showScores, setShowScores] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

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

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (!confirm(t('tasks.confirmDelete'))) return;
    try {
      await taskService.deleteTask(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleScores = (task) => {
    setSelectedTask(task);
    setShowScores(true);
  };

  const handleSettle = async (task) => {
    if (!confirm(t('tasks.confirmSettle'))) return;
    try {
      await taskService.settleTask(task.id);
      fetchTasks();
    } catch (error) {
      console.error('Failed to settle task:', error);
      alert(error.response?.data?.message || 'Failed to settle task');
    }
  };

  const isTaskEnded = (task) => {
    if (!task.endTime) return false;
    return new Date(task.endTime) <= new Date();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('tasks.adminTitle')}</h1>

      <div className="mb-4">
        <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowForm(true); }}>
          <Plus size={18} />
          {t('tasks.create')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-base-content/60">
          <p>{t('tasks.empty')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>{t('tasks.name')}</th>
                <th>{t('tasks.status')}</th>
                <th>{t('tasks.maxParticipants')}</th>
                <th>{t('tasks.endTime')}</th>
                <th>{t('tasks.score')}</th>
                <th>{t('tasks.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.name}</td>
                  <td>
                    {task.settled ? (
                      <span className="badge badge-success flex items-center gap-1 w-fit">
                        <CheckCircle size={12} />
                        {t('tasks.settled')}
                      </span>
                    ) : isTaskEnded(task) ? (
                      <span className="badge badge-warning flex items-center gap-1 w-fit">
                        <Clock size={12} />
                        {t('tasks.pendingSettle')}
                      </span>
                    ) : (
                      <span className="badge badge-info flex items-center gap-1 w-fit">
                        <Clock size={12} />
                        {t('tasks.inProgress')}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{task.participantCount || 0} / {task.maxParticipants || '∞'}</span>
                    </div>
                  </td>
                  <td>{formatDate(task.endTime)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-warning" />
                      <span>{task.score}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {isTaskEnded(task) && !task.settled && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSettle(task)}
                        >
                          {t('tasks.settle')}
                        </button>
                      )}
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleScores(task)}
                      >
                        {t('tasks.giveScore')}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleEdit(task)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <AdminTaskForm
          task={editingTask}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
          onSuccess={() => { setShowForm(false); setEditingTask(null); fetchTasks(); }}
        />
      )}

      {showScores && selectedTask && (
        <TaskScores
          task={selectedTask}
          onClose={() => { setShowScores(false); setSelectedTask(null); }}
        />
      )}
    </div>
  );
}

export default AdminTasks;