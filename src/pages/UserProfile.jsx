import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { imageService } from '../services/imageService';
import { AuthContext } from '../context/AuthContext';
import ImageGrid from '../components/ImageGrid';
import { useTranslation } from 'react-i18next';

function UserProfile() {
  const { slug } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      if (currentUser) {
        const identifier = currentUser.slug || currentUser.id;
        navigate(`/u/${identifier}`, { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
      return;
    }
    fetchUserImages();
  }, [slug, currentUser, navigate]);

  const fetchUserImages = async () => {
    setLoading(true);
    try {
      const response = await imageService.getImagesByUserSlug(slug);
      const data = response.data.data;
      setUser(data.user);
      setImages(data.images || []);
      setError(null);
    } catch (err) {
      setError(t('errors.notFound'));
    } finally {
      setLoading(false);
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
        <Link to="/" className="btn btn-primary mt-4">{t('userProfile.backToHome')}</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="btn btn-ghost btn-sm">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-12">
              <User size={24} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="text-sm text-base-content/50">
              {t('userProfile.imagesCount', { count: images.length })}
            </p>
          </div>
        </div>
      </div>

      <ImageGrid
        images={images}
        onImagesChange={setImages}
        emptyMessage={t('userProfile.noImages')}
      />
    </div>
  );
}

export default UserProfile;