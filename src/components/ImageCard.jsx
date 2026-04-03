import { Eye, Download } from 'lucide-react';

function ImageCard({ image, onClick, onPreview, onDownload }) {
  const handlePreview = (e) => {
    e.stopPropagation();
    onPreview?.(image);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    onDownload?.(image);
  };

  return (
    <div
      className="card bg-base-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick?.(image)}
    >
      <figure className="relative group">
        <img
          src={image.thumbnailUrl || image.url || image.fileUrl}
          alt={image.name || image.originalName}
          className="w-full h-48 object-cover"
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
      </figure>
      <div className="card-body p-3">
        <p className="font-medium truncate" title={image.name || image.originalName}>
          {image.name || image.originalName}
        </p>
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
      </div>
    </div>
  );
}

export default ImageCard;