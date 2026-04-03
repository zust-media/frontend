import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { imageService } from '../../services/imageService';
import { Search, Trash2, RefreshCw } from 'lucide-react';

function AdminImages() {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 24, total: 0, totalPages: 0 });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchImages();
  }, [pagination.page, searchQuery]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      if (searchQuery) params.search = searchQuery;

      const response = await imageService.getImages(params);
      const responseData = response.data.data;
      setImages(Array.isArray(responseData.images) ? responseData.images : []);
      setPagination((prev) => ({
        ...prev,
        total: responseData.total || 0,
        totalPages: Math.ceil((responseData.total || 0) / pagination.pageSize),
      }));
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm(t('admin.images.confirmDelete'))) return;
    try {
      await imageService.deleteImage(imageId);
      fetchImages();
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('admin.images.title')}</h1>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" size={18} />
          <input
            type="text"
            placeholder={t('admin.images.searchPlaceholder')}
            className="input input-bordered w-full pl-10"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
          />
        </div>
        <button className="btn btn-ghost" onClick={fetchImages}>
          <RefreshCw size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {images.map((image) => (
              <div key={image.id} className="card bg-base-200 shadow">
                <figure className="aspect-square">
                  <img
                    src={image.thumbnailUrl || image.url || image.fileUrl}
                    alt={image.originalName}
                    className="object-cover w-full h-full cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  />
                </figure>
                <div className="card-body p-2">
                  <p className="text-xs truncate">{image.originalName}</p>
                  <p className="text-xs text-base-content/60">{formatBytes(image.size)}</p>
                  <div className="flex justify-end gap-1">
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <button
                className="btn btn-sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                Previous
              </button>
              <span className="btn btn-sm btn-disabled">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                className="btn btn-sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {selectedImage && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <img
              src={selectedImage.url || selectedImage.fileUrl}
              alt={selectedImage.originalName}
              className="w-full"
            />
            <div className="mt-4">
              <p><strong>{t('admin.images.filename')}:</strong> {selectedImage.originalName}</p>
              <p><strong>{t('admin.images.size')}:</strong> {formatBytes(selectedImage.size)}</p>
              <p><strong>{t('admin.images.dimensions')}:</strong> {selectedImage.width}x{selectedImage.height}</p>
              <p><strong>{t('admin.images.uploadedAt')}:</strong> {formatDate(selectedImage.createdAt)}</p>
              <p><strong>URL:</strong> <a href={selectedImage.url} target="_blank" rel="noopener noreferrer" className="link link-primary">{selectedImage.url}</a></p>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedImage(null)}>
                {t('common.close')}
              </button>
              <button
                className="btn btn-error"
                onClick={() => { handleDelete(selectedImage.id); setSelectedImage(null); }}
              >
                <Trash2 size={16} />
                {t('common.delete')}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setSelectedImage(null)} />
        </div>
      )}
    </div>
  );
}

export default AdminImages;