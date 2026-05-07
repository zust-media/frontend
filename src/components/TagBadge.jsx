import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useMetadata } from '../context/MetadataContext';

export default function TagBadge({ tagId, onRemove, className = '' }) {
  const { getTagName } = useMetadata();
  const name = getTagName(tagId);

  if (onRemove) {
    return (
      <span className={`badge badge-sm gap-1 ${className}`}>
        {name}
        <button
          type="button"
          className="cursor-pointer hover:text-error"
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onRemove(tagId); }}
        >
          <FiX size={10} />
        </button>
      </span>
    );
  }

  return (
    <Link
      to={`/tag/${tagId}`}
      className={`badge badge-sm badge-outline hover:badge-primary transition-colors cursor-pointer truncate ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {name}
    </Link>
  );
}
