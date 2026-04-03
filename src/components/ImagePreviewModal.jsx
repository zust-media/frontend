import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { X, Download, Edit, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function ImagePreviewModal({ image, onClose, onDownload, onEdit, onDelete }) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  if (!image) return null;

  const canManage = user && (
    image.userId === user.id ||
    user.role === 'admin' ||
    user.role === 'super_admin'
  );

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">{image.name || image.originalName}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-center">
          <img
            src={image.previewUrl || image.url || image.fileUrl}
            alt={image.name || image.originalName}
            className="max-h-[60vh] object-contain"
          />
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {image.category && (
              <Link to={`/categories/${image.category.slug}`} className="badge badge-outline hover:badge-primary">
                {image.category.name}
              </Link>
            )}
            {image.tags?.map((tag) => (
              <Link key={tag.id} to={`/tags/${tag.slug}`} className="badge badge-ghost hover:badge-primary">
                {tag.name}
              </Link>
            ))}
            {image.uploaderName && (
              <Link
                to={`/u/${image.uploaderSlug || image.uploaderId}`}
                className="badge badge-info hover:badge-primary"
              >
                {t('images.preview.uploadedBy')} {image.uploaderName}
              </Link>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => onDownload?.(image)} className="btn btn-primary btn-sm">
              <Download size={16} />
              {t('common.buttons.download')}
            </button>
            {canManage && (
              <>
                {onEdit && (
                  <button onClick={() => onEdit(image)} className="btn btn-outline btn-sm">
                    <Edit size={16} />
                    {t('common.buttons.edit')}
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(image.id)} className="btn btn-error btn-sm">
                    <Trash2 size={16} />
                    {t('common.buttons.delete')}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {image.exifData && (
          <div className="mt-4 p-3 bg-base-200 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">{t('images.preview.title')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {(image.exifData.make || image.exifData.model) && (
                <div className="col-span-2">
                  <span className="text-base-content/50">Camera:</span>
                  <span className="ml-1">{image.exifData.make} {image.exifData.model}</span>
                </div>
              )}
              {image.exifData.lens && (
                <div className="col-span-2">
                  <span className="text-base-content/50">Lens:</span>
                  <span className="ml-1">{image.exifData.lens}</span>
                </div>
              )}
              {image.exifData.exposureTime && (
                <div>
                  <span className="text-base-content/50">Shutter:</span>
                  <span className="ml-1">
                    {image.exifData.exposureTime < 1
                      ? `1/${Math.round(1/image.exifData.exposureTime)}s`
                      : `${image.exifData.exposureTime}s`
                    }
                  </span>
                </div>
              )}
              {image.exifData.fNumber && (
                <div>
                  <span className="text-base-content/50">Aperture:</span>
                  <span className="ml-1">f/{image.exifData.fNumber}</span>
                </div>
              )}
              {image.exifData.iso && (
                <div>
                  <span className="text-base-content/50">ISO:</span>
                  <span className="ml-1">{image.exifData.iso}</span>
                </div>
              )}
              {image.exifData.dateTime && (
                <div>
                  <span className="text-base-content/50">Time:</span>
                  <span className="ml-1">{formatDate(image.exifData.dateTime)}</span>
                </div>
              )}
              {image.exifData.width && (
                <div>
                  <span className="text-base-content/50">{t('images.preview.dimensions')}:</span>
                  <span className="ml-1">{image.exifData.width} x {image.exifData.height}</span>
                </div>
              )}
              {image.exifData.format && (
                <div>
                  <span className="text-base-content/50">Format:</span>
                  <span className="ml-1">{image.exifData.format.toUpperCase()}</span>
                </div>
              )}
              {image.exifData.artist && (
                <div className="col-span-2">
                  <span className="text-base-content/50">Artist:</span>
                  <span className="ml-1">{image.exifData.artist}</span>
                </div>
              )}
              {image.exifData.copyright && (
                <div className="col-span-2">
                  <span className="text-base-content/50">Copyright:</span>
                  <span className="ml-1">{image.exifData.copyright}</span>
                </div>
              )}
              {image.size && (
                <div>
                  <span className="text-base-content/50">{t('images.preview.size')}:</span>
                  <span className="ml-1">{(image.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
              {image.exifData.software && (
                <div className="col-span-2">
                  <span className="text-base-content/50">Software:</span>
                  <span className="ml-1">{image.exifData.software}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-base-content/50">
          {t('images.preview.uploadedAt')}: {formatDate(image.createdAt || image.created_at)}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default ImagePreviewModal;