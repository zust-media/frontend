import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiCheckSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ImageCard from '../components/ImageCard';
import Lightbox from '../components/Lightbox';
import BatchEditModal from '../components/BatchEditModal';
import MultiSelectBar from '../components/MultiSelectBar';

export default function UserPage() {
  const { uuid } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lightboxImage, setLightboxImage] = useState(null);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBatchEdit, setShowBatchEdit] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!uuid) return;
    try {
      const data = await api.getUser(uuid, { page });
      setProfile(data.user);
      setImages(data.images);
      setTotalPages(data.pagination.total_pages);
    } catch (err) {
      toast.error(err.message || '加载失败');
    }
  }, [uuid, page]);

  useEffect(() => {
    setLoading(true);
    fetchUser().finally(() => setLoading(false));
  }, [fetchUser]);

  useEffect(() => {
    if (profile?.slug && profile.slug !== uuid) {
      navigate(`/user/${profile.slug}`, { replace: true });
    }
  }, [profile, uuid, navigate]);

  const isOwner = currentUser && profile && currentUser.uuid === profile.uuid;

  const toggleSelectMode = () => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  };

  const toggleSelectImage = useCallback((image) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(image.id)) next.delete(image.id);
      else next.add(image.id);
      return next;
    });
  }, []);

  const selectAll = () => setSelectedIds(new Set(images.map((img) => img.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定要删除选中的 ${selectedIds.size} 张图片吗？此操作不可撤销。`)) return;
    try {
      const result = await api.batchDeleteImages([...selectedIds]);
      toast.success(result.message || `成功删除 ${result.deleted} 张图片`);
      setSelectedIds(new Set());
      setSelectMode(false);
      fetchUser();
    } catch (err) {
      toast.error(err.message || '批量删除失败');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!profile) {
    return <p className="text-base-content/50 py-10 text-center">用户不存在</p>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="breadcrumbs text-sm">
        <ul>
          <li><Link to="/">首页</Link></li>
          <li>{profile.nickname || profile.uuid?.substring(0, 8)}</li>
        </ul>
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-6">
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-16">
                <span className="text-xl">{(profile.nickname || '?').charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{profile.nickname || '未命名'}</h1>
              <p className="text-sm text-base-content/60">UUID: {profile.uuid?.substring(0, 8)}...</p>
              {isOwner && <p className="text-xs text-primary mt-1">这是我的主页</p>}
            </div>
            {isOwner && (
              <button
                className={`btn btn-sm gap-1 ${selectMode ? 'btn-primary' : 'btn-ghost'}`}
                onClick={toggleSelectMode}
              >
                <FiCheckSquare size={14} />
                多选
              </button>
            )}
          </div>
          {profile.bio && <p className="text-sm mt-3 text-base-content/70">{profile.bio}</p>}
        </div>
      </div>

      {images.length === 0 ? (
        <p className="text-base-content/50 py-10 text-center">暂无上传图片</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <ImageCard
                key={img.id}
                image={img}
                onOpen={() => setLightboxImage(img)}
                showActions={isOwner}
                selectMode={selectMode}
                selected={selectedIds.has(img.id)}
                onToggleSelect={toggleSelectImage}
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

      {selectMode && (
        <MultiSelectBar
          count={selectedIds.size}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onEdit={() => setShowBatchEdit(true)}
          onDelete={handleBatchDelete}
          onClose={toggleSelectMode}
        />
      )}

      {lightboxImage && (
        <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}

      {showBatchEdit && (
        <BatchEditModal
          ids={[...selectedIds]}
          onClose={() => setShowBatchEdit(false)}
          onSaved={fetchUser}
        />
      )}
    </div>
  );
}
