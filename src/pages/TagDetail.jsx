import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { tagService, imageService } from '../services/imageService';
import ImageGrid from '../components/ImageGrid';
import { useTranslation } from 'react-i18next';

function TagDetail() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [tag, setTag] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTagDetail();
  }, [slug]);

  const fetchTagDetail = async () => {
    setLoading(true);
    try {
      const response = await tagService.getTagBySlug(slug);
      const data = response.data.data;
      setTag(data.tag);
      setImages(data.images || []);
      setError(null);
    } catch (err) {
      setError(t('errors.notFound'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (imageId) => {
    try {
      await imageService.removeTag(imageId, tag.id);
    } catch (err) {
      console.error('Failed to remove tag from image:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error">{error}</p>
        <Link to="/tags" className="btn btn-primary mt-4">{t('tags.gallery')}</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/tags" className="btn btn-ghost btn-sm">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{tag.name}</h1>
          {tag.description && (
            <p className="text-base-content/60 mt-2">{tag.description}</p>
          )}
          <p className="text-sm text-base-content/50 mt-1">
            {t('tags.list.imageCount', { count: images.length })}
          </p>
        </div>
      </div>

      <ImageGrid
        images={images}
        onImagesChange={setImages}
        emptyMessage={t('images.list.noImages')}
        onRemove={handleRemoveImage}
      />
    </div>
  );
}

export default TagDetail;