import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiFolder, FiDownload, FiTrash2, FiEdit3, FiSave, FiX, FiCheckSquare,
  FiChevronLeft, FiChevronRight, FiArrowLeft,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ImageCard from '../components/ImageCard';
import Lightbox from '../components/Lightbox';

export default function GalleryDetailPage() {
  const { uuid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gallery, setGallery] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedUuids, setSelectedUuids] = useState(new Set());
  const [removing, setRemoving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('jpeg');

  const [lightboxImage, setLightboxImage] = useState(null);

  const isOwner = gallery && user && (
    user.uuid === gallery.creator_uuid
  );

  const fetchGallery = useCallback(async () => {
    try {
      const data = await api.getGallery(uuid, { page, limit: 20 });
      setGallery(data.gallery);
      setImages(data.images || []);
      setTotalPages(data.pagination.total_pages);
      setEditName(data.gallery.name);
      setEditDesc(data.gallery.description || '');
    } catch (err) {
      toast.error(err.message || '加载失败');
      navigate('/galleries', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [uuid, page, navigate]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error('名称不能为空');
      return;
    }
    setSaving(true);
    try {
      await api.updateGallery(uuid, { name: editName.trim(), description: editDesc.trim() });
      toast.success('已保存');
      setEditMode(false);
      setGallery((prev) => ({ ...prev, name: editName.trim(), description: editDesc.trim() }));
    } catch (err) {
      toast.error(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedUuids.size === 0) return;
    if (!window.confirm(`确定要移除选中的 ${selectedUuids.size} 张图片吗？`)) return;
    setRemoving(true);
    try {
      await api.removeImagesFromGallery(uuid, [...selectedUuids]);
      toast.success(`已移除 ${selectedUuids.size} 张图片`);
      setSelectedUuids(new Set());
      fetchGallery();
    } catch (err) {
      toast.error(err.message || '移除失败');
    } finally {
      setRemoving(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(api.getGalleryDownloadUrl(uuid, downloadFormat), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || '下载失败');
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${gallery.name || '照片夹'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || '下载失败');
    } finally {
      setDownloading(false);
    }
  };

  const toggleSelect = (image) => {
    const imageUuid = image.uuid;
    if (!imageUuid) return;
    setSelectedUuids((prev) => {
      const next = new Set(prev);
      if (next.has(imageUuid)) next.delete(imageUuid);
      else next.add(imageUuid);
      return next;
    });
  };

  const openLightbox = useCallback((image) => {
    setLightboxImage(image);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxImage(null);
  }, []);

  const selectAll = () => {
    const allUuids = images.map((i) => i.uuid).filter(Boolean);
    setSelectedUuids(new Set(allUuids));
  };

  const deselectAll = () => {
    setSelectedUuids(new Set());
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!gallery) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link to="/galleries" className="btn btn-ghost btn-sm gap-1 mb-3">
          <FiArrowLeft size={14} />
          返回照片夹列表
        </Link>

        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div className="flex-1 min-w-0">
            {editMode ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  className="input input-sm input-bordered w-full max-w-xs"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                />
                <input
                  type="text"
                  placeholder="描述（可选）"
                  className="input input-sm input-bordered w-full max-w-sm"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                />
                <button className="btn btn-sm btn-primary gap-1" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="loading loading-spinner loading-xs"></span> : <FiSave size={14} />}
                  保存
                </button>
                <button className="btn btn-sm btn-ghost" onClick={() => { setEditMode(false); setEditName(gallery.name); setEditDesc(gallery.description || ''); }}>
                  <FiX size={14} /> 取消
                </button>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <FiFolder className="text-primary" />
                  {gallery.name}
                </h1>
                {gallery.description && (
                  <p className="text-base-content/60 mt-1">{gallery.description}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isOwner && !editMode && (
              <button className="btn btn-ghost btn-sm gap-1" onClick={() => { setEditMode(true); setEditName(gallery.name); setEditDesc(gallery.description || ''); }}>
                <FiEdit3 size={14} /> 编辑
              </button>
            )}
            <select
              className="select select-sm select-bordered"
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value)}
            >
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
            <button
              className="btn btn-primary btn-sm gap-1"
              onClick={handleDownload}
              disabled={downloading || images.length === 0}
            >
              {downloading ? <span className="loading loading-spinner loading-xs"></span> : <FiDownload size={14} />}
              批量下载
            </button>
          </div>
        </div>
      </div>

      {isOwner && images.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <button
            className={`btn btn-xs gap-1 ${selectMode ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setSelectMode(!selectMode); if (selectMode) deselectAll(); }}
          >
            <FiCheckSquare size={13} />
            {selectMode ? '退出选择' : '选择图片'}
          </button>
          {selectMode && (
            <>
              <button className="btn btn-xs btn-ghost" onClick={selectAll}>全选</button>
              <button className="btn btn-xs btn-ghost" onClick={deselectAll} disabled={selectedUuids.size === 0}>取消全选</button>
              <div className="w-px h-4 bg-base-300"></div>
              <button
                className="btn btn-xs btn-error gap-1"
                onClick={handleRemoveSelected}
                disabled={selectedUuids.size === 0 || removing}
              >
                {removing ? <span className="loading loading-spinner loading-xs"></span> : <FiTrash2 size={13} />}
                移除选中 ({selectedUuids.size})
              </button>
            </>
          )}
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center py-16">
          <FiFolder size={48} className="mx-auto text-base-content/20 mb-3" />
          <p className="text-base-content/60">照片夹是空的</p>
          <p className="text-sm text-base-content/40 mt-1">在首页选择图片后添加到这个照片夹</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image) => (
              <ImageCard
                key={image.uuid || image.id}
                image={image}
                onImageClick={openLightbox}
                selectMode={selectMode}
                selected={selectedUuids.has(image.uuid)}
                onToggleSelect={toggleSelect}
                showActions={false}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                className="btn btn-sm btn-ghost"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <FiChevronLeft />
              </button>
              <span className="text-sm text-base-content/60">
                {page} / {totalPages}
              </span>
              <button
                className="btn btn-sm btn-ghost"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {lightboxImage && (
        <Lightbox
          image={lightboxImage}
          images={images}
          onClose={closeLightbox}
          onPrev={() => {
            const idx = images.findIndex((i) => (i.uuid || i.id) === (lightboxImage.uuid || lightboxImage.id));
            if (idx > 0) setLightboxImage(images[idx - 1]);
          }}
          onNext={() => {
            const idx = images.findIndex((i) => (i.uuid || i.id) === (lightboxImage.uuid || lightboxImage.id));
            if (idx < images.length - 1) setLightboxImage(images[idx + 1]);
          }}
        />
      )}
    </div>
  );
}
