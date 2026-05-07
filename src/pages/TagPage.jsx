import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useMetadata } from '../context/MetadataContext';
import { useAuth } from '../context/AuthContext';
import ImageCard from '../components/ImageCard';
import Lightbox from '../components/Lightbox';

export default function TagPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getTagName, tags: allTags } = useMetadata();

  const [tag, setTag] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lightboxImage, setLightboxImage] = useState(null);

  const fetchTag = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.getTagPage(id, { page });
      setTag(data.tag);
      setImages(data.images);
      setTotalPages(data.pagination.total_pages);
    } catch (err) {
      toast.error(err.message || '加载失败');
    }
  }, [id, page]);

  useEffect(() => {
    setLoading(true);
    fetchTag().finally(() => setLoading(false));
  }, [fetchTag]);

  if (!id) {
    return (
      <div className="space-y-6">
        <div className="breadcrumbs text-sm">
          <ul>
            <li><Link to="/">首页</Link></li>
            <li>所有标签</li>
          </ul>
        </div>

        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiTag className="text-primary" />
          所有标签
        </h1>

        {allTags.length === 0 ? (
          <p className="text-base-content/50 py-10 text-center">暂无标签</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {allTags.filter((t) => t.image_count > 0).map((t) => (
              <Link
                key={t.id}
                to={`/tag/${t.id}`}
                className="btn btn-outline btn-sm gap-1"
              >
                #{t.name}
                {t.image_count > 0 && (
                  <span className="badge badge-sm ml-1">{t.image_count}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="breadcrumbs text-sm">
        <ul>
          <li><Link to="/">首页</Link></li>
          <li><Link to="/tag">标签</Link></li>
          <li>{tag ? getTagName(tag.id) : `#${id}`}</li>
        </ul>
      </div>

      <h1 className="text-2xl font-bold">
        标签: {tag ? getTagName(tag.id) : `#${id}`}
      </h1>

      {images.length === 0 ? (
        <p className="text-base-content/50 py-10 text-center">该标签下暂无图片</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((img) => (
              <ImageCard
                key={img.id}
                image={img}
                onOpen={() => setLightboxImage(img)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                className="btn btn-sm btn-ghost"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <FiChevronLeft />
              </button>
              <span className="text-sm px-3">第 {page} / {totalPages} 页</span>
              <button
                className="btn btn-sm btn-ghost"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {lightboxImage && (
        <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
    </div>
  );
}
