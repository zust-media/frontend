import { useState, useEffect } from 'react';
import { tagService } from '../services/tagService';
import { useTranslation } from 'react-i18next';

function TagManagement() {
  const { t } = useTranslation();
  const [tags, setTags] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [tagName, setTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await tagService.getTags();
      setTags(response.data.data || response.data);
    } catch (err) {
      setError(t('tags.list.noTags'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!tagName.trim()) return;
    try {
      await tagService.createTag({ name: tagName });
      setIsModalOpen(false);
      setTagName('');
      fetchTags();
    } catch (err) {
      setError(t('tags.create.failed'));
      console.error(err);
    }
  };

  const handleUpdateTag = async () => {
    if (!tagName.trim() || !editingTag) return;
    try {
      await tagService.updateTag(editingTag.id, { name: tagName });
      setIsModalOpen(false);
      setEditingTag(null);
      setTagName('');
      fetchTags();
    } catch (err) {
      setError(t('tags.edit.failed'));
      console.error(err);
    }
  };

  const handleDeleteTag = async () => {
    if (!deletingTag) return;
    try {
      await tagService.deleteTag(deletingTag.id);
      setIsDeleteModalOpen(false);
      setDeletingTag(null);
      fetchTags();
    } catch (err) {
      setError(t('tags.delete.failed'));
      setIsDeleteModalOpen(false);
      console.error(err);
    }
  };

  const openEditModal = (tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setIsModalOpen(true);
  };

  const openDeleteModal = (tag) => {
    setDeletingTag(tag);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('tags.management')}</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingTag(null);
            setTagName('');
            setIsModalOpen(true);
          }}
        >
          {t('tags.create.title')}
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button onClick={() => setError('')} className="btn btn-sm btn-ghost">
            {t('common.buttons.close')}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="card bg-base-100 shadow">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('tags.form.name')}</th>
                  <th>{t('images.title')}</th>
                  <th>{t('common.labels.createdAt')}</th>
                  <th>{t('common.labels.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {tags.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      {t('tags.list.noTags')}
                    </td>
                  </tr>
                ) : (
                  tags.map((tag) => (
                    <tr key={tag.id}>
                      <td>{tag.name}</td>
                      <td>{tag.imageCount || 0}</td>
                      <td>{new Date(tag.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => openEditModal(tag)}
                        >
                          {t('common.buttons.edit')}
                        </button>
                        <button
                          className="btn btn-sm btn-ghost text-error"
                          onClick={() => openDeleteModal(tag)}
                        >
                          {t('common.buttons.delete')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <dialog className="modal" open={isModalOpen}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {editingTag ? t('tags.edit.title') : t('tags.create.title')}
          </h3>
          <div className="py-4">
            <input
              type="text"
              placeholder={t('tags.create.namePlaceholder')}
              className="input input-bordered w-full"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
            />
          </div>
          <div className="modal-action">
            <button className="btn" onClick={() => setIsModalOpen(false)}>
              {t('common.buttons.cancel')}
            </button>
            <button
              className="btn btn-primary"
              onClick={editingTag ? handleUpdateTag : handleCreateTag}
            >
              {editingTag ? t('common.buttons.save') : t('common.buttons.submit')}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsModalOpen(false)}>close</button>
        </form>
      </dialog>

      <dialog className="modal" open={isDeleteModalOpen}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">{t('common.buttons.delete')}</h3>
          <p className="py-4">
            {t('common.messages.confirmDelete')} "{deletingTag?.name}"?
          </p>
          <div className="modal-action">
            <button className="btn" onClick={() => setIsDeleteModalOpen(false)}>
              {t('common.buttons.cancel')}
            </button>
            <button className="btn btn-error" onClick={handleDeleteTag}>
              {t('common.buttons.delete')}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsDeleteModalOpen(false)}>close</button>
        </form>
      </dialog>
    </div>
  );
}

export default TagManagement;