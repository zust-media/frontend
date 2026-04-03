import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { tagService } from '../../services/imageService';
import { Plus, Edit2, Trash2 } from 'lucide-react';

function AdminTags() {
  const { t } = useTranslation();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagName, setTagName] = useState('');
  const [tagDescription, setTagDescription] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await tagService.getTags();
      setTags(response.data.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await tagService.updateTag(editingTag.id, { name: tagName, description: tagDescription });
      } else {
        await tagService.createTag({ name: tagName, description: tagDescription });
      }
      setShowModal(false);
      setEditingTag(null);
      setTagName('');
      setTagDescription('');
      fetchTags();
    } catch (error) {
      console.error('Failed to save tag:', error);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagDescription(tag.description || '');
    setShowModal(true);
  };

  const handleDelete = async (tagId) => {
    if (!confirm(t('admin.tags.confirmDelete'))) return;
    try {
      await tagService.deleteTag(tagId);
      fetchTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  const openCreateModal = () => {
    setEditingTag(null);
    setTagName('');
    setTagDescription('');
    setShowModal(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('admin.tags.title')}</h1>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          {t('admin.tags.create')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <div key={tag.id} className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">{tag.name}</h2>
                {tag.description && (
                  <p className="text-sm text-base-content/60">{tag.description}</p>
                )}
                <p className="text-xs text-base-content/50">
                  {tag.imageCount || 0} {t('admin.tags.images')}
                </p>
                <div className="card-actions justify-end mt-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(tag)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(tag.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {editingTag ? t('admin.tags.edit') : t('admin.tags.create')}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">{t('admin.tags.name')}</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">{t('admin.tags.description')}</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={tagDescription}
                  onChange={(e) => setTagDescription(e.target.value)}
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
}

export default AdminTags;