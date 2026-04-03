import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { categoryService } from '../../services/categoryService';
import { Plus, Edit2, Trash2 } from 'lucide-react';

function AdminCategories() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, { name: categoryName, description: categoryDescription });
      } else {
        await categoryService.createCategory({ name: categoryName, description: categoryDescription });
      }
      setShowModal(false);
      setEditingCategory(null);
      setCategoryName('');
      setCategoryDescription('');
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm(t('admin.categories.confirmDelete'))) return;
    try {
      await categoryService.deleteCategory(categoryId);
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setShowModal(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('admin.categories.title')}</h1>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          {t('admin.categories.create')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">{category.name}</h2>
                {category.description && (
                  <p className="text-sm text-base-content/60">{category.description}</p>
                )}
                <p className="text-xs text-base-content/50">
                  {category.imageCount || 0} {t('admin.categories.images')}
                </p>
                <div className="card-actions justify-end mt-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(category)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(category.id)}>
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
              {editingCategory ? t('admin.categories.edit') : t('admin.categories.create')}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">{t('admin.categories.name')}</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">{t('admin.categories.description')}</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
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

export default AdminCategories;