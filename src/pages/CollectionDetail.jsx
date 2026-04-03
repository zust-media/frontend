import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import collectionService from '../services/collectionService';
import ImageGrid from '../components/ImageGrid';
import { ArrowLeft } from 'lucide-react';

function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const fetchCollection = async () => {
    setIsLoading(true);
    try {
      const response = await collectionService.getCollection(id);
      setCollection(response.data.data);
    } catch (err) {
      console.error('Failed to fetch collection:', err);
      navigate('/collections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = async (imageId) => {
    try {
      await collectionService.removeImage(id, imageId);
      fetchCollection();
    } catch (err) {
      console.error('Failed to remove image:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  const handleImagesChange = (newImages) => {
    setCollection((prev) => ({
      ...prev,
      images: newImages,
      imageCount: newImages.length,
    }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/collections')}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold">{collection.name}</h1>
        <span className="text-base-content/60">({collection.imageCount} {t('collections.images')})</span>
      </div>

      {collection.description && (
        <p className="text-base-content/60 mb-6">{collection.description}</p>
      )}

      <ImageGrid
        images={collection.images || []}
        onImagesChange={handleImagesChange}
        emptyMessage={t('collections.emptyImages')}
        enableBatchDownload={true}
        enableAddToCollection={true}
        onRemove={handleRemoveImage}
      />
    </div>
  );
}

export default CollectionDetail;