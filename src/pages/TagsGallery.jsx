import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, X } from 'lucide-react';
import { tagService } from '../services/tagService';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function TagsGallery() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await tagService.getTags();
      setTags(response.data.data || []);
    } catch (err) {
      showToast(t('common.messages.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTag(null);
    setFormData({ name: '', slug: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, slug: tag.slug || '', description: tag.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast(t('tags.form.name') + ' ' + t('common.messages.error'), 'error');
      return;
    }

    try {
      if (editingTag) {
        await tagService.updateTag(editingTag.id, formData);
        showToast(t('tags.edit.success'));
      } else {
        await tagService.createTag(formData);
        showToast(t('tags.create.success'));
      }
      setShowModal(false);
      fetchTags();
    } catch (err) {
      showToast(err.response?.data?.message || t('tags.create.failed'), 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('tags.gallery')}</h1>
        <button onClick={handleCreate} className="btn btn-primary">
          <Plus size={18} />
          {t('tags.create.title')}
        </button>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-8 text-base-content/50">
          {t('tags.list.noTags')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <div key={tag.id} className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body">
                <Link to={`/tags/${tag.slug}`} className="card-title hover:text-primary">
                  {tag.name}
                </Link>
                {tag.slug && (
                  <p className="text-sm text-base-content/50">/{tag.slug}</p>
                )}
                {tag.description && (
                  <p className="text-sm mt-2 line-clamp-2">{tag.description}</p>
                )}
                {isAdmin && (
                  <div className="card-actions justify-end mt-4">
                    <button onClick={() => handleEdit(tag)} className="btn btn-ghost btn-sm">
                      <Edit size={16} />
                      {t('common.buttons.edit')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{editingTag ? t('tags.edit.title') : t('tags.create.title')}</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm btn-circle">
                <X size={18} />
              </button>
            </div>
            <div className="form-control mb-4">
              <label className="label"><span className="label-text">{t('tags.form.name')}</span></label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('tags.create.namePlaceholder')}
              />
            </div>
            <div className="form-control mb-4">
              <label className="label"><span className="label-text">Slug</span></label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="url-slug"
              />
            </div>
            <div className="form-control mb-4">
              <label className="label"><span className="label-text">{t('tags.form.description')}</span></label>
              <textarea
                className="textarea textarea-bordered"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('tags.create.descriptionPlaceholder')}
                rows={3}
              />
            </div>
            <div className="modal-action">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">{t('common.buttons.cancel')}</button>
              <button onClick={handleSubmit} className="btn btn-primary">{t('common.buttons.save')}</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}

      {toast.show && (
        <div className="toast toast-top toast-center">
          <div className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TagsGallery;