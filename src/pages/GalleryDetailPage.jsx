import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiFolder, FiDownload, FiTrash2, FiEdit3, FiSave, FiX, FiCheckSquare,
  FiChevronLeft, FiChevronRight, FiArrowLeft, FiUsers, FiUserPlus,
  FiArchive, FiRefreshCw,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ImageCard from '../components/ImageCard';
import Lightbox from '../components/Lightbox';
import DownloadModal from '../components/DownloadModal';

export default function GalleryDetailPage() {
  const { uuid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gallery, setGallery] = useState(null);
  const [images, setImages] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
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

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadImageUuids, setDownloadImageUuids] = useState(null);

  const [lightboxImage, setLightboxImage] = useState(null);

  const [showCollabPanel, setShowCollabPanel] = useState(false);
  const [collabInput, setCollabInput] = useState('');
  const [collabRole, setCollabRole] = useState('user');
  const [collabSaving, setCollabSaving] = useState(false);

  const [showTransferPanel, setShowTransferPanel] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [transferring, setTransferring] = useState(false);

  const myRole = gallery?.my_role;
  const isOwner = myRole === 'owner';
  const canManage = isOwner || myRole === 'admin';

  const fetchGallery = useCallback(async () => {
    try {
      const data = await api.getGallery(uuid, { page, limit: 20 });
      setGallery(data.gallery);
      setImages(data.images || []);
      setCollaborators(data.collaborators || []);
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
      const data = await api.updateGallery(uuid, { name: editName.trim(), description: editDesc.trim() });
      toast.success('已保存');
      setEditMode(false);
      setGallery((prev) => ({ ...prev, ...data.gallery }));
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

  const handleAddCollab = async () => {
    const targetUuid = collabInput.trim();
    if (!targetUuid) { toast.error('请输入用户UUID'); return; }
    setCollabSaving(true);
    try {
      await api.addGalleryCollaborator(uuid, targetUuid, collabRole);
      toast.success('已添加协同用户');
      setCollabInput('');
      fetchGallery();
    } catch (err) {
      toast.error(err.message || '添加失败');
    } finally {
      setCollabSaving(false);
    }
  };

  const handleRemoveCollab = async (collabUuid) => {
    if (!window.confirm('确定要移除此协同用户吗？')) return;
    try {
      await api.removeGalleryCollaborator(uuid, collabUuid);
      toast.success('已移除');
      fetchGallery();
    } catch (err) {
      toast.error(err.message || '移除失败');
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('确定要归档此照片夹吗？归档后将无法添加或移除图片。')) return;
    try {
      const data = await api.archiveGallery(uuid);
      setGallery(data.gallery);
      toast.success('已归档');
    } catch (err) {
      toast.error(err.message || '归档失败');
    }
  };

  const handleUnarchive = async () => {
    try {
      const data = await api.unarchiveGallery(uuid);
      setGallery(data.gallery);
      toast.success('已取消归档');
    } catch (err) {
      toast.error(err.message || '取消失败');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要删除此照片夹吗？此操作不可撤销。')) return;
    try {
      await api.deleteGallery(uuid);
      toast.success('已删除');
      navigate('/galleries');
    } catch (err) {
      toast.error(err.message || '删除失败');
    }
  };

  const handleTransfer = async () => {
    const targetUuid = transferTarget.trim();
    if (!targetUuid) { toast.error('请输入目标用户UUID'); return; }
    if (!window.confirm('确定要转移此照片夹给该用户吗？你将成为普通成员。')) return;
    setTransferring(true);
    try {
      await api.transferGallery(uuid, targetUuid);
      toast.success('所有权已转移');
      setShowTransferPanel(false);
      fetchGallery();
    } catch (err) {
      toast.error(err.message || '转移失败');
    } finally {
      setTransferring(false);
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

  const roleLabel = (role) => {
    if (role === 'owner') return '拥有者';
    if (role === 'admin') return '管理员';
    return '成员';
  };

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
                  {gallery.is_archived ? (
                    <span className="badge badge-warning badge-sm">已归档</span>
                  ) : null}
                  {myRole && (
                    <span className={`badge badge-sm ${isOwner ? 'badge-primary' : canManage ? 'badge-secondary' : 'badge-ghost'}`}>
                      {roleLabel(myRole)}
                    </span>
                  )}
                </h1>
                {gallery.description && (
                  <p className="text-base-content/60 mt-1">{gallery.description}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canManage && !editMode && (
              <button className="btn btn-ghost btn-sm gap-1" onClick={() => { setEditMode(true); setEditName(gallery.name); setEditDesc(gallery.description || ''); }}>
                <FiEdit3 size={14} /> 编辑
              </button>
            )}
            {canManage && (
              <button
                className={`btn btn-ghost btn-sm gap-1 ${showCollabPanel ? 'btn-active' : ''}`}
                onClick={() => setShowCollabPanel(!showCollabPanel)}
              >
                <FiUsers size={14} /> 协同
              </button>
            )}
            {isOwner && (
              <button
                className="btn btn-ghost btn-sm gap-1"
                onClick={gallery.is_archived ? handleUnarchive : handleArchive}
              >
                {gallery.is_archived ? <FiRefreshCw size={14} /> : <FiArchive size={14} />}
                {gallery.is_archived ? '取消归档' : '归档'}
              </button>
            )}
            {isOwner && (
              <button
                className={`btn btn-ghost btn-sm gap-1 ${showTransferPanel ? 'btn-active' : ''}`}
                onClick={() => setShowTransferPanel(!showTransferPanel)}
              >
                <FiUserPlus size={14} /> 转移
              </button>
            )}
            <button
              className="btn btn-primary btn-sm gap-1"
              onClick={() => {
                setDownloadImageUuids(null);
                setShowDownloadModal(true);
              }}
              disabled={images.length === 0}
            >
              <FiDownload size={14} />
              下载全部
            </button>
            {isOwner && (
              <button className="btn btn-error btn-sm gap-1" onClick={handleDelete}>
                <FiTrash2 size={14} /> 删除
              </button>
            )}
          </div>
        </div>

        {showCollabPanel && canManage && (
          <div className="card bg-base-200 mt-4 p-4">
            <h3 className="font-medium mb-2 flex items-center gap-2"><FiUsers size={16} /> 协同用户</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {collaborators.map((c) => (
                <div key={c.user_uuid} className="badge badge-lg gap-1">
                  <span className="text-xs font-mono">{c.user_uuid.substring(0, 8)}...</span>
                  <span className="text-xs opacity-70">({roleLabel(c.role)})</span>
                  {c.role !== 'owner' && canManage && (
                    <button className="btn btn-ghost btn-xs" onClick={() => handleRemoveCollab(c.user_uuid)}>
                      <FiX size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="input input-sm input-bordered flex-1"
                placeholder="用户UUID"
                value={collabInput}
                onChange={(e) => setCollabInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddCollab(); }}
              />
              <select className="select select-sm select-bordered" value={collabRole} onChange={(e) => setCollabRole(e.target.value)}>
                <option value="user">成员</option>
                <option value="admin">管理员</option>
              </select>
              <button className="btn btn-sm btn-primary" onClick={handleAddCollab} disabled={collabSaving}>
                {collabSaving ? <span className="loading loading-spinner loading-xs"></span> : '添加'}
              </button>
            </div>
          </div>
        )}

        {showTransferPanel && isOwner && (
          <div className="card bg-base-200 mt-4 p-4">
            <h3 className="font-medium mb-2">转移所有权</h3>
            <p className="text-xs text-base-content/60 mb-2">转移后你将变为普通成员，无法撤销此操作</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="input input-sm input-bordered flex-1"
                placeholder="目标用户UUID"
                value={transferTarget}
                onChange={(e) => setTransferTarget(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleTransfer(); }}
              />
              <button className="btn btn-sm btn-warning" onClick={handleTransfer} disabled={transferring}>
                {transferring ? <span className="loading loading-spinner loading-xs"></span> : '确认转移'}
              </button>
            </div>
          </div>
        )}
      </div>

      {!gallery.is_archived && myRole && images.length > 0 && (
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
                className="btn btn-xs btn-ghost gap-1"
                onClick={() => {
                  setDownloadImageUuids([...selectedUuids]);
                  setShowDownloadModal(true);
                }}
                disabled={selectedUuids.size === 0}
              >
                <FiDownload size={13} />
                下载选中 ({selectedUuids.size})
              </button>
              <button
                className="btn btn-xs btn-error gap-1"
                onClick={handleRemoveSelected}
                disabled={selectedUuids.size === 0 || removing}
              >
                {removing ? <span className="loading loading-spinner loading-xs"></span> : <FiTrash2 size={13} />}
                移除选中
              </button>
            </>
          )}
        </div>
      )}

      {gallery.is_archived && (
        <div className="alert alert-warning mb-4">
          <FiArchive />
          <span>此照片夹已归档，无法添加或移除图片</span>
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

      {showDownloadModal && (
        <DownloadModal
          imageUuids={downloadImageUuids}
          downloadUrl={downloadImageUuids ? null : api.getGalleryDownloadUrl(uuid)}
          defaultName={gallery.name}
          onClose={() => setShowDownloadModal(false)}
        />
      )}
    </div>
  );
}
