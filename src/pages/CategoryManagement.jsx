import { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import { useTranslation } from 'react-i18next';

function CategoryManagement() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      setCategories(response.data.data || response.data);
    } catch (err) {
      setError(t('common.messages.error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) return;
    try {
      await categoryService.createCategory({ name: categoryName });
      setIsModalOpen(false);
      setCategoryName('');
      fetchCategories();
    } catch (err) {
      setError(t('categories.create.failed'));
      console.error(err);
    }
  };

  const handleUpdateCategory = async () => {
    if (!categoryName.trim() || !editingCategory) return;
    try {
      await categoryService.updateCategory(editingCategory.id, { name: categoryName });
      setIsModalOpen(false);
      setEditingCategory(null);
      setCategoryName('');
      fetchCategories();
    } catch (err) {
      setError(t('categories.edit.failed'));
      console.error(err);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      await categoryService.deleteCategory(deletingCategory.id);
      setIsDeleteModalOpen(false);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      const message = err.response?.data?.message || t('categories.delete.failed');
      setError(message);
      setIsDeleteModalOpen(false);
      console.error(err);
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsModalOpen(true);
  };

  const openDeleteModal = (category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('categories.management')}</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingCategory(null);
            setCategoryName('');
            setIsModalOpen(true);
          }}
        >
          {t('categories.create.title')}
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
                  <th>{t('categories.form.name')}</th>
                  <th>{t('images.title')}</th>
                  <th>{t('common.labels.createdAt')}</th>
                  <th>{t('common.labels.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      {t('categories.list.noCategories')}
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.imageCount || 0}</td>
                      <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => openEditModal(category)}
                        >
                          {t('common.buttons.edit')}
                        </button>
                        <button
                          className="btn btn-sm btn-ghost text-error"
                          onClick={() => openDeleteModal(category)}
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
            {editingCategory ? t('categories.edit.title') : t('categories.create.title')}
          </h3>
          <div className="py-4">
            <input
              type="text"
              placeholder={t('categories.create.namePlaceholder')}
              className="input input-bordered w-full"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>
          <div className="modal-action">
            <button className="btn" onClick={() => setIsModalOpen(false)}>
              {t('common.buttons.cancel')}
            </button>
            <button
              className="btn btn-primary"
              onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
            >
              {editingCategory ? t('common.buttons.save') : t('common.buttons.submit')}
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
            {t('common.messages.confirmDelete')} "{deletingCategory?.name}"?
            {deletingCategory?.imageCount > 0 && (
              <span className="text-error block mt-2">
                {t('categories.delete.hasImages')}
              </span>
            )}
          </p>
          <div className="modal-action">
            <button className="btn" onClick={() => setIsDeleteModalOpen(false)}>
              {t('common.buttons.cancel')}
            </button>
            <button
              className="btn btn-error"
              onClick={handleDeleteCategory}
              disabled={deletingCategory?.imageCount > 0}
            >
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

export default CategoryManagement;