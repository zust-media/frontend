import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, X } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function CategoriesGallery() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data.data || []);
    } catch (err) {
      showToast(t('common.messages.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug || '', description: category.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast(t('categories.form.name') + ' ' + t('common.messages.error'), 'error');
      return;
    }

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        showToast(t('categories.edit.success'));
      } else {
        await categoryService.createCategory(formData);
        showToast(t('categories.create.success'));
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || t('categories.create.failed'), 'error');
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
        <h1 className="text-2xl font-bold">{t('categories.gallery')}</h1>
        {isAdmin && (
          <button onClick={handleCreate} className="btn btn-primary">
            <Plus size={18} />
            {t('categories.create.title')}
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8 text-base-content/50">
          {t('categories.list.noCategories')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body">
                <Link to={`/categories/${category.slug}`} className="card-title hover:text-primary">
                  {category.name}
                </Link>
                {category.slug && (
                  <p className="text-sm text-base-content/50">/{category.slug}</p>
                )}
                {category.description && (
                  <p className="text-sm mt-2 line-clamp-2">{category.description}</p>
                )}
                {isAdmin && (
                  <div className="card-actions justify-end mt-4">
                    <button onClick={() => handleEdit(category)} className="btn btn-ghost btn-sm">
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
              <h3 className="font-bold text-lg">{editingCategory ? t('categories.edit.title') : t('categories.create.title')}</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm btn-circle">
                <X size={18} />
              </button>
            </div>
            <div className="form-control mb-4">
              <label className="label"><span className="label-text">{t('categories.form.name')}</span></label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('categories.create.namePlaceholder')}
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
              <label className="label"><span className="label-text">{t('categories.form.description')}</span></label>
              <textarea
                className="textarea textarea-bordered"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('categories.create.descriptionPlaceholder')}
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

export default CategoriesGallery;