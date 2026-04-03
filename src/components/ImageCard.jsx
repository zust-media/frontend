import { Eye, Download } from 'lucide-react';

function ImageCard({
  image,
  isSelected,
  showCheckbox,
  onSelect,
  onClick,
  onPreview,
  onDownload
}) {
  const handleSelect = (e) => {
    e.stopPropagation();
    if (onSelect && showCheckbox) {
      onSelect(image.id);
    }
  };

  const handlePreview = (e) => {
    e.stopPropagation();
    if (onPreview) {
      onPreview(image);
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(image);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(image);
    }
  };

  return (
    <div
      className={`card bg-base-100 shadow transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={handleCardClick}
    >
      <figure className="relative group">
        <img
          src={image.thumbnailUrl || image.url || image.fileUrl}
          alt={image.name || image.originalName}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={handlePreview}
            className="btn btn-ghost btn-circle btn-sm text-white"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-ghost btn-circle btn-sm text-white"
          >
            <Download size={18} />
          </button>
        </div>
        {showCheckbox && (
          <label
            className="absolute top-2 left-2 cursor-pointer z-10"
            onClick={handleSelect}
          >
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm"
              checked={isSelected || false}
              onChange={() => {}}
            />
          </label>
        )}
      </figure>
      <div className="card-body p-3">
        <p className="font-medium truncate" title={image.name || image.originalName}>
          {image.name || image.originalName}
        </p>
        <div className="flex items-center gap-2 text-xs text-base-content/50">
          <span>{image.uploaderName}</span>
        </div>
        {image.category && (
          <div className="badge badge-outline badge-sm mt-1">
            {image.category.name}
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-1">
          {image.tags?.slice(0, 3).map((tag) => (
            <span key={tag.id} className="badge badge-ghost badge-xs">
              {tag.name}
            </span>
          ))}
          {image.tags?.length > 3 && (
            <span className="badge badge-ghost badge-xs">
              +{image.tags.length - 3}
            </span>
          )}
        </div>
        <p className="text-xs text-base-content/50 mt-1">
          {new Date(image.createdAt || image.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export default ImageCard;