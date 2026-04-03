import { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  Square,
  Trash2,
  FolderPlus,
  Download,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import ImageCard from './ImageCard';
import ImagePreviewModal from './ImagePreviewModal';
import collectionService from '../services/collectionService';
import { imageService } from '../services/imageService';
import { useTranslation } from 'react-i18next';

function ImageGrid({
  images = [],
  onImagesChange,
  emptyMessage,
  showBatchActions = true,
  enableBatchDownload = false,
  enableAddToCollection = true,
  onDelete,
  onRemove,
}) {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [downloadWidth, setDownloadWidth] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [images]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  }, []);

  const handleSelectAll = () => {
    if (selectedIds.length === images.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(images.map((img) => img.id));
    }
  };

  const handleSelectImage = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0 || !onDelete) return;
    if (!window.confirm(t('common.messages.confirmDelete'))) return;

    try {
      await imageService.batchDelete(selectedIds);
      showToast(t('common.messages.operationSuccess'));
      const remaining = images.filter((img) => !selectedIds.includes(img.id));
      setSelectedIds([]);
      onImagesChange?.(remaining);
    } catch {
      showToast(t('common.messages.operationFailed'), 'error');
    }
  };

  const handleBatchRemove = async () => {
    if (selectedIds.length === 0 || !onRemove) return;

    try {
      for (const imageId of selectedIds) {
        await onRemove(imageId);
      }
      showToast(t('common.messages.operationSuccess'));
      const remaining = images.filter((img) => !selectedIds.includes(img.id));
      setSelectedIds([]);
      onImagesChange?.(remaining);
    } catch {
      showToast(t('common.messages.operationFailed'), 'error');
    }
  };

  const handleBatchDownload = async () => {
    if (selectedIds.length === 0) return;
    setDownloading(true);

    try {
      const selectedImgs = images.filter((img) => selectedIds.includes(img.id));
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      for (const img of selectedImgs) {
        const url = downloadWidth ? img.thumbnailUrl : img.url;
        const response = await fetch(url);
        const blob = await response.blob();
        zip.file(img.originalName || img.filename, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `images_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
      showToast(t('common.messages.operationSuccess'));
    } catch {
      showToast(t('common.messages.operationFailed'), 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleBatchAddToCollection = async () => {
    if (selectedIds.length === 0) return;
    try {
      const response = await collectionService.getCollections();
      setCollections(response.data.data || []);
      setSelectedCollections([]);
      setShowCollectionModal(true);
    } catch {
      showToast(t('common.messages.operationFailed'), 'error');
    }
  };

  const handleAddToCollectionSubmit = async () => {
    if (selectedCollections.length === 0) return;
    try {
      for (const collectionId of selectedCollections) {
        await collectionService.addImages(collectionId, selectedIds);
      }
      showToast(t('common.messages.operationSuccess'));
      setShowCollectionModal(false);
      setSelectedIds([]);
    } catch {
      showToast(t('common.messages.operationFailed'), 'error');
    }
  };

  const handlePreview = (image) => {
    setPreviewImage(image);
  };

  const handleDownload = (image) => {
    const link = document.createElement('a');
    link.href = image.url || image.fileUrl;
    link.download = image.name || image.originalName;
    link.click();
  };

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="mx-auto mb-4 text-base-content/30" size={64} />
        <p className="text-base-content/50">{emptyMessage || t('images.list.noImages')}</p>
      </div>
    );
  }

  return (
    <div>
      {showBatchActions && (
        <div className="flex items-center gap-2 mb-4">
          <button onClick={handleSelectAll} className="btn btn-ghost btn-sm">
            {selectedIds.length === images.length ? (
              <CheckSquare size={18} />
            ) : (
              <Square size={18} />
            )}
            {t('common.labels.all')}
          </button>
        </div>
      )}

      {showBatchActions && selectedIds.length > 0 && (
        <div className="alert alert-info mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              {t('common.labels.total')} {selectedIds.length} {t('images.title').toLowerCase()}
            </span>
            <button onClick={() => setSelectedIds([])} className="btn btn-ghost btn-xs">
              {t('common.buttons.cancel')}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {enableAddToCollection && (
              <button onClick={handleBatchAddToCollection} className="btn btn-primary btn-sm">
                <FolderPlus size={16} />
                {t('collections.addToCollection')}
              </button>
            )}
            {enableBatchDownload && (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="input input-bordered input-sm w-20"
                  placeholder={t('collections.widthPlaceholder')}
                  value={downloadWidth}
                  onChange={(e) => setDownloadWidth(e.target.value)}
                />
                <button onClick={handleBatchDownload} className="btn btn-outline btn-sm" disabled={downloading}>
                  {downloading ? <span className="loading loading-spinner loading-xs" /> : <Download size={16} />}
                </button>
              </div>
            )}
            {onRemove && (
              <button onClick={handleBatchRemove} className="btn btn-warning btn-sm">
                <X size={16} />
                {t('common.buttons.remove')}
              </button>
            )}
            {onDelete && (
              <button onClick={handleBatchDelete} className="btn btn-error btn-sm">
                <Trash2 size={16} />
                {t('common.buttons.delete')}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            isSelected={selectedIds.includes(image.id)}
            showCheckbox={showBatchActions}
            onSelect={handleSelectImage}
            onClick={handlePreview}
            onPreview={handlePreview}
            onDownload={handleDownload}
          />
        ))}
      </div>

      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          onClose={() => setPreviewImage(null)}
          onDownload={handleDownload}
          onDelete={onDelete ? (id) => { setPreviewImage(null); onDelete(id); } : undefined}
          onRemove={onRemove ? (id) => { setPreviewImage(null); onRemove(id); } : undefined}
        />
      )}

      {showCollectionModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{t('collections.addToCollection')}</h3>
              <button onClick={() => setShowCollectionModal(false)} className="btn btn-ghost btn-sm btn-circle">✕</button>
            </div>
            <p className="mb-4 text-base-content/60">{selectedIds.length} {t('images.title').toLowerCase()} selected</p>
            {collections.length === 0 ? (
              <p className="text-base-content/60">{t('collections.empty')}</p>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {collections.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selectedCollections.includes(c.id)}
                      onChange={() => {
                        setSelectedCollections((prev) =>
                          prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                        );
                      }}
                    />
                    <span>{c.name}</span>
                    <span className="text-base-content/60 text-sm">({c.imageCount})</span>
                  </label>
                ))}
              </div>
            )}
            <div className="modal-action">
              <button onClick={() => setShowCollectionModal(false)} className="btn btn-ghost">{t('common.buttons.cancel')}</button>
              <button onClick={handleAddToCollectionSubmit} className="btn btn-primary" disabled={selectedCollections.length === 0}>
                {t('common.buttons.confirm')}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowCollectionModal(false)} />
        </div>
      )}

      {toast.show && (
        <div className="toast toast-top toast-center z-50">
          <div className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGrid;