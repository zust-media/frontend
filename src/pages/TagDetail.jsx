import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { tagService } from '../services/tagService';
import ImageCard from '../components/ImageCard';
import ImagePreviewModal from '../components/ImagePreviewModal';
import { imageService } from '../services/imageService';
import { useTranslation } from 'react-i18next';

function TagDetail() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [tag, setTag] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
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

  const handlePreview = async (image) => {
    try {
      const response = await imageService.getImageById(image.id);
      const fullImage = response.data.data;
      setPreviewImage({
        ...image,
        ...fullImage,
        previewUrl: fullImage.url || image.url,
      });
    } catch {
      setPreviewImage({
        ...image,
        previewUrl: image.url || image.fileUrl,
      });
    }
  };

  const handleDownload = (image) => {
    const link = document.createElement('a');
    link.href = image.url || image.fileUrl;
    link.download = image.name || image.originalName;
    link.click();
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

      {images.length === 0 ? (
        <div className="text-center py-8 text-base-content/50">
          {t('images.list.noImages')}
        </div>
      ) : (
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
      )}

      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          onClose={() => setPreviewImage(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}

export default TagDetail;