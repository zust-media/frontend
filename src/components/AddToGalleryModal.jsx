import { useState, useEffect } from 'react';
import { FiPlus, FiCheck, FiFolder } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function AddToGalleryModal({ imageUuids, onClose }) {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    api.getGalleries().then((data) => {
      const userGalleries = (data.galleries || []).filter(
        (g) => g.creator_uuid
      );
      setGalleries(userGalleries);
    }).catch((err) => {
      toast.error(err.message || '加载照片夹失败');
    }).finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!selectedId) {
      toast.error('请选择一个照片夹');
      return;
    }
    setAdding(true);
    try {
      await api.addImagesToGallery(selectedId, imageUuids);
      toast.success(`已添加到照片夹`);
      onClose();
    } catch (err) {
      toast.error(err.message || '添加失败');
    } finally {
      setAdding(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error('请输入照片夹名称');
      return;
    }
    setAdding(true);
    try {
      const data = await api.createGallery({ name: newName.trim(), description: newDesc.trim() });
      await api.addImagesToGallery(data.gallery.uuid, imageUuids);
      toast.success(`已创建并添加到照片夹`);
      onClose();
    } catch (err) {
      toast.error(err.message || '创建失败');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FiFolder className="text-primary" />
          添加到照片夹
        </h3>
        <p className="text-sm text-base-content/60 mb-4">
          已选择 {imageUuids.length} 张图片
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md text-primary"></span>
          </div>
        ) : (
          <>
            {galleries.length > 0 && (
              <div className="mb-4">
                <label className="label pb-1">
                  <span className="label-text text-xs font-medium text-base-content/60">选择已有照片夹</span>
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {galleries.map((g) => (
                    <button
                      key={g.uuid}
                      className={`w-full text-left btn btn-sm justify-start gap-2 normal-case font-normal ${
                        selectedId === g.uuid ? 'btn-primary' : 'btn-ghost'
                      }`}
                      onClick={() => setSelectedId(g.uuid)}
                    >
                      <FiFolder size={14} />
                      <span className="flex-1 truncate">{g.name}</span>
                      <span className="text-xs text-base-content/40">{g.image_count || 0} 张</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!showCreate ? (
              <button
                className="btn btn-ghost btn-sm gap-1 mb-2"
                onClick={() => setShowCreate(true)}
              >
                <FiPlus size={14} /> 新建照片夹
              </button>
            ) : (
              <div className="bg-base-200 rounded-lg p-3 mb-4 space-y-2">
                <input
                  type="text"
                  placeholder="照片夹名称"
                  className="input input-sm input-bordered w-full"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                />
                <input
                  type="text"
                  placeholder="描述（可选）"
                  className="input input-sm input-bordered w-full"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                />
                <div className="flex gap-2">
                  <button className="btn btn-sm btn-primary" onClick={handleCreate} disabled={adding}>
                    {adding ? <span className="loading loading-spinner loading-xs"></span> : <FiCheck size={14} />}
                    创建并添加
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => setShowCreate(false)}>取消</button>
                </div>
              </div>
            )}

            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={onClose}>取消</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAdd}
                disabled={adding || !selectedId || galleries.length === 0}
              >
                {adding ? <span className="loading loading-spinner loading-xs"></span> : null}
                添加
              </button>
            </div>
          </>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose}>
        <button className="opacity-0">关闭</button>
      </div>
    </div>
  );
}
