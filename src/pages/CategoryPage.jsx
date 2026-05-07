import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiFolder } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useMetadata } from '../context/MetadataContext';
import { useAuth } from '../context/AuthContext';
import ImageCard from '../components/ImageCard';
import Lightbox from '../components/Lightbox';

export default function CategoryPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getCategoryName, categories: allCategories } = useMetadata();

  const [category, setCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lightboxImage, setLightboxImage] = useState(null);

  const fetchCategory = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.getCategoryPage(id, { page });
      setCategory(data.category);
      setImages(data.images);
      setTotalPages(data.pagination.total_pages);
    } catch (err) {
      toast.error(err.message || '加载失败');
    }
  }, [id, page]);

  useEffect(() => {
    setLoading(true);
    fetchCategory().finally(() => setLoading(false));
  }, [fetchCategory]);

  if (!id) {
    return (
      <div className="space-y-6">
        <div className="breadcrumbs text-sm">
          <ul>
            <li><Link to="/">首页</Link></li>
            <li>所有分类</li>
          </ul>
        </div>

        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiFolder className="text-primary" />
          所有分类
        </h1>

        {allCategories.length === 0 ? (
          <p className="text-base-content/50 py-10 text-center">暂无分类</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCategories.map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.id}`}
                className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="card-body p-4">
                  <h3 className="card-title text-base">{c.name}</h3>
                  {c.description && (
                    <p className="text-sm text-base-content/60">{c.description}</p>
                  )}
                  <div className="text-xs text-base-content/40 mt-1">
                    {c.image_count} 张图片
                  </div>
                </div>
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
          <li><Link to="/category">分类</Link></li>
          <li>分类: {category ? getCategoryName(category.id) : '未知'}</li>
        </ul>
      </div>

      <h1 className="text-2xl font-bold">
        分类: {category ? getCategoryName(category.id) : '未知'}
      </h1>

      {images.length === 0 ? (
        <p className="text-base-content/50 py-10 text-center">该分类下暂无图片</p>
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
