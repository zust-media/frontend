import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import taskService from '../../services/taskService';

function AdminTaskForm({ task, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: task?.name || '',
    description: task?.description || '',
    maxParticipants: task?.maxParticipants || 0,
    startTime: task?.startTime || '',
    endTime: task?.endTime || '',
    score: task?.score || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxParticipants' || name === 'score' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (task) {
        await taskService.updateTask(task.id, formData);
      } else {
        await taskService.createTask(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            {task ? t('tasks.edit') : t('tasks.create')}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">{t('tasks.name')}</span>
            </label>
            <input
              type="text"
              name="name"
              className="input input-bordered"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">{t('tasks.description')}</span>
            </label>
            <textarea
              name="description"
              className="textarea textarea-bordered"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('tasks.maxParticipants')}</span>
              </label>
              <input
                type="number"
                name="maxParticipants"
                className="input input-bordered"
                value={formData.maxParticipants}
                onChange={handleChange}
                min={0}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('tasks.score')}</span>
              </label>
              <input
                type="number"
                name="score"
                className="input input-bordered"
                value={formData.score}
                onChange={handleChange}
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('tasks.startTime')}</span>
              </label>
              <input
                type="datetime-local"
                name="startTime"
                className="input input-bordered"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('tasks.endTime')}</span>
              </label>
              <input
                type="datetime-local"
                name="endTime"
                className="input input-bordered"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className={`btn btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default AdminTaskForm;