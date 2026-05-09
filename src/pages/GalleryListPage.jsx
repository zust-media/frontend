import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiFolder, FiPlus, FiDownload, FiTrash2, FiEdit3 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function GalleryListPage() {
  const { user } = useAuth();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchGalleries = useCallback(async () => {
    try {
      const data = await api.getGalleries();
      setGalleries(data.galleries || []);
    } catch (err) {
      toast.error(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGalleries();
  }, [fetchGalleries]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error('请输入照片夹名称');
      return;
    }
    setCreating(true);
    try {
      await api.createGallery({ name: newName.trim(), description: newDesc.trim() });
      toast.success('照片夹已创建');
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
      fetchGalleries();
    } catch (err) {
      toast.error(err.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (g) => {
    if (!window.confirm(`确定要删除照片夹「${g.name}」吗？`)) return;
    try {
      await api.deleteGallery(g.uuid);
      toast.success('照片夹已删除');
      fetchGalleries();
    } catch (err) {
      toast.error(err.message || '删除失败');
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <FiFolder size={48} className="mx-auto text-base-content/20" />
          <p className="text-base-content/60">请先登录</p>
          <Link to="/login" className="btn btn-primary btn-sm">去登录</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiFolder className="text-primary" />
          照片夹
        </h1>
        <button
          className="btn btn-primary btn-sm gap-1"
          onClick={() => setShowCreate(!showCreate)}
        >
          <FiPlus size={14} />
          新建
        </button>
      </div>

      {showCreate && (
        <div className="card bg-base-200 mb-6">
          <div className="card-body p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="form-control flex-1 min-w-[160px]">
                <label className="label pb-1"><span className="label-text text-xs">名称</span></label>
                <input
                  type="text"
                  placeholder="照片夹名称"
                  className="input input-sm input-bordered w-full"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                />
              </div>
              <div className="form-control flex-[2] min-w-[200px]">
                <label className="label pb-1"><span className="label-text text-xs">描述（可选）</span></label>
                <input
                  type="text"
                  placeholder="描述"
                  className="input input-sm input-bordered w-full"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                />
              </div>
              <button className="btn btn-sm btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? <span className="loading loading-spinner loading-xs"></span> : null}
                创建
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowCreate(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-16">
          <FiFolder size={48} className="mx-auto text-base-content/20 mb-3" />
          <p className="text-base-content/60">还没有照片夹</p>
          <p className="text-sm text-base-content/40 mt-1">创建一个照片夹来整理你的图片</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleries.map((g) => (
            <div key={g.uuid} className="card bg-base-200 hover:shadow-md transition-shadow">
              <div className="card-body p-4">
                <div className="flex items-start justify-between">
                  <Link
                    to={`/gallery/${g.uuid}`}
                    className="flex-1 min-w-0"
                  >
                    <h2 className="card-title text-base truncate flex items-center gap-2">
                      <FiFolder size={16} className="text-primary shrink-0" />
                      {g.name}
                    </h2>
                    {g.description && (
                      <p className="text-sm text-base-content/50 mt-1 line-clamp-2">{g.description}</p>
                    )}
                  </Link>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300">
                  <span className="text-xs text-base-content/40">
                    {g.image_count || 0} 张图片
                  </span>
                  <div className="flex gap-1">
                    <Link
                      to={`/gallery/${g.uuid}`}
                      className="btn btn-ghost btn-xs btn-square"
                      title="编辑"
                    >
                      <FiEdit3 size={13} />
                    </Link>
                    <button
                      className="btn btn-ghost btn-xs btn-square text-error"
                      onClick={() => handleDelete(g)}
                      title="删除"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
