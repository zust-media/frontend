import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { categoryService, imageService } from '../services/imageService';
import ImageGrid from '../components/ImageGrid';
import { useTranslation } from 'react-i18next';

function CategoryDetail() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategoryDetail();
  }, [slug]);

  const fetchCategoryDetail = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategoryBySlug(slug);
      const data = response.data.data;
      setCategory(data.category);
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
      await imageService.removeCategory(imageId);
    } catch (err) {
      console.error('Failed to remove category from image:', err);
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
        <Link to="/categories" className="btn btn-primary mt-4">{t('categories.gallery')}</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/categories" className="btn btn-ghost btn-sm">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-base-content/60 mt-2">{category.description}</p>
          )}
          <p className="text-sm text-base-content/50 mt-1">
            {t('categories.list.imageCount', { count: images.length })}
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

export default CategoryDetail;