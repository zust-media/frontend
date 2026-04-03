import { useState, useEffect, useContext } from 'react';
import { X, Upload } from 'lucide-react';
import { imageService, categoryService, tagService } from '../services/imageService';
import ImageUpload from '../components/ImageUpload';
import ImageGrid from '../components/ImageGrid';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function MyImages() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    if (user) {
      fetchMyImages();
    }
  }, [user]);

  const fetchMyImages = async () => {
    setLoading(true);
    try {
      const response = await imageService.getImages({ page: 1, pageSize: 1000 });
      const data = response.data.data;
      const allImages = data.images || [];
      setImages(allImages.filter(img => img.userId === user.id));
    } catch (err) {
      showToast(t('common.messages.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    showToast(t('images.upload.uploadSuccess'));
    fetchMyImages();
  };

  const handleDelete = async (id) => {
    if (!confirm(t('common.messages.confirmDelete'))) return;
    try {
      await imageService.deleteImage(id);
      showToast(t('common.messages.operationSuccess'));
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      showToast(t('common.messages.operationFailed'), 'error');
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
        <h1 className="text-2xl font-bold">{t('images.myImages')}</h1>
        <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
          <Upload size={18} />
          {t('images.upload.title')}
        </button>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-base-content/50">
          <p>{t('images.list.noImages')}</p>
          <button onClick={() => setShowUploadModal(true)} className="btn btn-primary mt-4">
            {t('images.upload.selectFile')}
          </button>
        </div>
      ) : (
        <ImageGrid
          images={images}
          onImagesChange={setImages}
          emptyMessage={t('images.list.noImages')}
          onDelete={handleDelete}
        />
      )}

      {showUploadModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{t('images.upload.title')}</h3>
              <button onClick={() => setShowUploadModal(false)} className="btn btn-ghost btn-sm btn-circle">
                <X size={18} />
              </button>
            </div>
            <ImageUpload onSuccess={handleUploadSuccess} />
          </div>
          <div className="modal-backdrop" onClick={() => setShowUploadModal(false)} />
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