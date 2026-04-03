import { useState, useEffect, useContext } from 'react';
import { X, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { imageService, categoryService, tagService } from '../services/imageService';
import ImageUpload from '../components/ImageUpload';
import ImageCard from '../components/ImageCard';
import ImagePreviewModal from '../components/ImagePreviewModal';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function MyImages() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0, totalPages: 0 });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyImages();
    }
  }, [user, pagination.page]);

  const fetchMyImages = async () => {
    setLoading(true);
    try {
      const response = await imageService.getImages({ page: pagination.page, limit: pagination.pageSize });
      const data = response.data.data;
      const allImages = data.images || [];
      setImages(allImages.filter(img => img.userId === user.id));
      setPagination(prev => ({ ...prev, total: data.total, totalPages: Math.ceil(data.total / prev.pageSize) }));
    } catch (err) {
      showToast(t('common.messages.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchTags = async () => {
    try {
      const response = await tagService.getTags();
      setTags(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch tags');
    }
  };

  const handlePreview = async (image) => {
    try {
      const response = await imageService.getImageById(image.id);
      const fullImage = response.data.data;
      setPreviewImage({ ...image, ...fullImage, previewUrl: fullImage.url || image.url });
    } catch {
      setPreviewImage({ ...image, previewUrl: image.url || image.fileUrl });
    }
  };

  const handleDownload = (image) => {
    const link = document.createElement('a');
    link.href = image.url || image.fileUrl;
    link.download = image.name || image.originalName;
    link.click();
  };

  const handleEdit = (image) => {
    setEditImage(image);
    setEditCategory(image.categoryId || '');
    setEditTags(image.tags?.map(t => t.id) || []);
  };

  const handleUpdateImage = async () => {
    try {
      await imageService.updateImage(editImage.id, { categoryId: editCategory || null });
      if (editTags.length > 0) {
        await imageService.addTags(editImage.id, editTags);
      }
      showToast(t('common.messages.operationSuccess'));
      setEditImage(null);
      fetchMyImages();
    } catch (err) {
      showToast(t('common.messages.operationFailed'), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('common.messages.confirmDelete'))) return;
    try {
      await imageService.deleteImage(id);
      showToast(t('common.messages.operationSuccess'));
      setPreviewImage(null);
      fetchMyImages();
    } catch (err) {
      showToast(t('common.messages.operationFailed'), 'error');
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    showToast(t('images.upload.uploadSuccess'));
    fetchMyImages();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('images.myImages')}</h1>
        <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
          <Upload size={18} />
          {t('images.upload.title')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-base-content/50">
          <p>{t('images.list.noImages')}</p>
          <button onClick={() => setShowUploadModal(true)} className="btn btn-primary mt-4">
            {t('images.upload.selectFile')}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onClick={handlePreview}
                onPreview={handlePreview}
                onDownload={handleDownload}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="join">
                <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1} className="join-item btn btn-sm"><ChevronLeft size={16} /></button>
                <button className="join-item btn btn-sm">{pagination.page} / {pagination.totalPages}</button>
                <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.totalPages} className="join-item btn btn-sm"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </>
      )}

      {showUploadModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{t('images.upload.title')}</h3>
              <button onClick={() => setShowUploadModal(false)} className="btn btn-ghost btn-sm btn-circle"><X size={18} /></button>
            </div>
            <ImageUpload onSuccess={handleUploadSuccess} />
          </div>
          <div className="modal-backdrop" onClick={() => setShowUploadModal(false)} />
        </div>
      )}

      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          onClose={() => setPreviewImage(null)}
          onDownload={handleDownload}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {editImage && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{t('common.buttons.edit')}</h3>
              <button onClick={() => setEditImage(null)} className="btn btn-ghost btn-sm btn-circle"><X size={18} /></button>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="avatar"><div className="w-24 rounded"><img src={editImage.thumbnailUrl || editImage.url || editImage.fileUrl} alt={editImage.name} /></div></div>
              <div><p className="font-medium">{editImage.name}</p></div>
            </div>
            <div className="form-control mb-4">
              <label className="label"><span className="label-text">{t('images.form.category')}</span></label>
              <select className="select select-bordered" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                <option value="">{t('common.labels.all')}</option>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>
            <div className="form-control mb-4">
              <label className="label"><span className="label-text">{t('images.form.tags')}</span></label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" className="checkbox checkbox-sm" checked={editTags.includes(tag.id)} onChange={(e) => {
                      if (e.target.checked) setEditTags([...editTags, tag.id]);
                      else setEditTags(editTags.filter(id => id !== tag.id));
                    }} />
                    <span className="text-sm">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-action">
              <button onClick={() => setEditImage(null)} className="btn btn-ghost">{t('common.buttons.cancel')}</button>
              <button onClick={handleUpdateImage} className="btn btn-primary">{t('common.buttons.save')}</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setEditImage(null)} />
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

export default MyImages;