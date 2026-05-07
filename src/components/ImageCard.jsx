import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiDownload, FiZoomIn, FiEdit3, FiTrash2, FiFolder } from 'react-icons/fi';
import { useMetadata } from '../context/MetadataContext';
import TagBadge from './TagBadge';
import UserDisplay from './UserDisplay';

const formatSize = (bytes) => {
  if (!bytes) return '';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`;
};

export default function ImageCard({
  image,
  onOpen,
  onImageClick,
  onDelete,
  onEdit,
  showActions,
  selectMode,
  selected,
  onToggleSelect,
}) {
  const [imgError, setImgError] = useState(false);
  const { getTagName, getCategoryName, categories } = useMetadata();

  const catInfo = categories.find((c) => c.id === image.category_id);
  const catSlug = catInfo?.slug;
  const catHref = catSlug ? `/category/${catSlug}` : (image.category_id ? `/category/${image.category_id}` : null);

  const handlePreview = () => {
    if (selectMode && onToggleSelect) {
      onToggleSelect(image);
      return;
    }
    const handler = onOpen || onImageClick;
    if (handler) handler(image);
  };

  const imgSrc = image.thumbnail_url || '#';

  return (
    <div className={`card bg-base-100 shadow-md hover:shadow-xl transition-all w-full overflow-hidden group ${selected ? 'ring-2 ring-primary' : ''}`}>
      <figure
        className="relative w-full overflow-hidden bg-base-200 cursor-pointer"
        style={{ aspectRatio: '4/3' }}
        onClick={handlePreview}
      >
        {selectMode && (
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-primary"
              checked={selected || false}
              onChange={() => onToggleSelect?.(image)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {imgError ? (
          <div className="flex items-center justify-center w-full h-full text-base-content/40">
            <span className="text-sm">图片加载失败</span>
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={image.title || ''}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <FiZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={28} />
        </div>
      </figure>

      <div className="card-body p-3 gap-1.5">
        <h3 className="card-title text-sm font-semibold truncate">
          {image.title || image.original_name || '未命名'}
        </h3>

        {catHref && (
          <Link
            to={catHref}
            className="flex items-center gap-1 text-xs text-primary hover:underline w-fit"
          >
            <FiFolder size={12} />
            {getCategoryName(image.category_id)}
          </Link>
        )}

        <div className="flex flex-wrap gap-1">
          {Array.isArray(image.tags) && image.tags.length > 0
            ? image.tags.map((tagId) => (
                <TagBadge key={tagId} tagId={tagId} />
              ))
            : <span className="text-xs text-base-content/40">无标签</span>}
        </div>

        <div className="flex items-center justify-between text-xs text-base-content/60 mt-auto pt-1">
          <div className="flex items-center gap-2 truncate">
            <UserDisplay uuid={image.uploader_uuid} />
            {image.file_size > 0 && (
              <span className="shrink-0">{formatSize(image.file_size)}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showActions && onEdit && (
              <button
                className="btn btn-ghost btn-xs btn-square"
                onClick={(e) => { e.stopPropagation(); onEdit(image); }}
                title="编辑"
              >
                <FiEdit3 size={12} />
              </button>
            )}
            {showActions && onDelete && (
              <button
                className="btn btn-ghost btn-xs btn-square text-error"
                onClick={(e) => { e.stopPropagation(); onDelete(image); }}
                title="删除"
              >
                <FiTrash2 size={12} />
              </button>
            )}
            <FiHeart size={12} className="cursor-pointer hover:text-error transition-colors" />
            <FiDownload size={12} className="cursor-pointer hover:text-success transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
