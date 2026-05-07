import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiArrowLeft, FiTrash2, FiImage, FiCopy } from 'react-icons/fi';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function AdminDuplicatesPage() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedHash, setExpandedHash] = useState(null);

  const fetchDuplicates = () => {
    setLoading(true);
    api.getDuplicates()
      .then(setData)
      .catch((err) => toast.error(err.message || '加载失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDuplicates(); }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) { toast.error('仅管理员可访问'); return <Navigate to="/" replace />; }

  const handleDelete = async (image) => {
    if (!window.confirm(`确定要删除 "${image.title || image.original_name}" 吗？此操作不可撤销。`)) return;
    try {
      await api.deleteImage(image.id);
      toast.success('删除成功');
      fetchDuplicates();
    } catch (err) {
      toast.error(err.message || '删除失败');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="btn btn-ghost btn-sm btn-circle"><FiArrowLeft size={18} /></Link>
        <FiShield className="text-warning text-2xl" />
        <h2 className="text-2xl font-bold">重复图片</h2>
      </div>

      {!data || data.groups.length === 0 ? (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body text-center py-12">
            <FiImage size={48} className="mx-auto text-base-content/20" />
            <p className="mt-4 text-base-content/50">没有发现重复图片</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 text-sm text-base-content/60">
            <span><strong className="text-base-content">{data.total_groups}</strong> 个重复组</span>
            <span><strong className="text-base-content">{data.total_duplicate_images}</strong> 张重复图片</span>
          </div>

          {data.groups.map((group) => {
            const isExpanded = expandedHash === group.hash;
            const original = group.images.find((img) => !img.is_duplicate);
            const duplicates = group.images.filter((img) => img.is_duplicate);

            return (
              <div key={group.hash} className="card bg-base-100 shadow-md overflow-hidden">
                <div
                  className="card-body p-4 cursor-pointer hover:bg-base-200 transition-colors"
                  onClick={() => setExpandedHash(isExpanded ? null : group.hash)}
                >
                  <div className="flex items-center gap-3">
                    <FiCopy size={18} className="text-error flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {group.count} 张重复
                        <span className="badge badge-xs badge-error">{duplicates.length} 额外副本</span>
                      </div>
                      <div className="text-xs text-base-content/40 truncate font-mono mt-0.5">{group.hash.substring(0, 32)}...</div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-base-content/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-base-300">
                    {original && (
                      <div className="p-3 bg-success/5 border-b border-base-300">
                        <div className="text-xs font-medium text-success mb-2">原始文件（优先保留）</div>
                        <div className="flex items-start gap-3">
                          <img
                            src={original.thumbnail_url}
                            alt={original.original_name}
                            className="w-20 h-20 object-cover rounded-lg border border-base-300"
                          />
                          <div className="flex-1 min-w-0 text-sm space-y-0.5">
                            <div className="font-medium truncate">{original.title || original.original_name}</div>
                            <div className="text-xs text-base-content/50">{original.uploader_uuid ? original.uploader_uuid.substring(0, 8) : '未知'} · {formatSize(original.file_size)}</div>
                            <div className="text-xs text-base-content/30">{original.created_at}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="divide-y divide-base-300">
                      {group.images.filter((img) => img !== original).map((img) => (
                        <div key={img.id} className={`p-3 flex items-start gap-3 ${img.is_duplicate ? 'bg-error/5' : ''}`}>
                          <img
                            src={img.thumbnail_url}
                            alt={img.original_name}
                            className="w-20 h-20 object-cover rounded-lg border border-base-300"
                          />
                          <div className="flex-1 min-w-0 text-sm space-y-0.5">
                            <div className="font-medium truncate">{img.title || img.original_name}</div>
                            <div className="text-xs text-base-content/50">{img.uploader_uuid ? img.uploader_uuid.substring(0, 8) : '未知'} · {formatSize(img.file_size)}</div>
                            <div className="text-xs text-base-content/30">{img.created_at}</div>
                            {img.is_duplicate && (
                              <span className="badge badge-xs badge-error">重复副本</span>
                            )}
                          </div>
                          <button
                            className="btn btn-xs btn-ghost text-error flex-shrink-0"
                            onClick={(e) => { e.stopPropagation(); handleDelete(img); }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
