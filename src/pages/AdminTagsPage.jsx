import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMetadata } from '../context/MetadataContext';
import { FiShield, FiArrowLeft, FiTrash2, FiEdit3, FiPlus } from 'react-icons/fi';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function AdminTagsPage() {
  const { user, isAdmin } = useAuth();
  const { refresh: refreshMetadata } = useMetadata();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTags();
      setTags(data.tags);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) { toast.error('仅管理员可访问'); return <Navigate to="/" replace />; }

  const handleDelete = async (tag) => {
    if (!window.confirm(`确定要删除标签「${tag.name}」吗？`)) return;
    try {
      await api.deleteTag(tag.id);
      toast.success('标签已删除');
      await refreshMetadata();
      fetchTags();
    } catch (err) { toast.error(err.message || '删除失败'); }
  };

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="btn btn-ghost btn-sm btn-circle"><FiArrowLeft size={18} /></Link>
          <FiShield className="text-warning text-2xl" />
          <h2 className="text-2xl font-bold">标签管理</h2>
        </div>
        <Link to="/admin/tags/new" className="btn btn-primary btn-sm gap-1">
          <FiPlus size={16} />
          添加标签
        </Link>
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead><tr><th>名称</th><th>图片数</th><th>操作</th></tr></thead>
              <tbody>
                {tags.length === 0 ? (
                  <tr><td colSpan={3} className="text-center text-base-content/40 py-4">暂无标签</td></tr>
                ) : (
                  tags.map((tag) => (
                    <tr key={tag.id}>
                      <td>
                        <Link to={`/tag/${tag.id}`} className="font-medium link link-hover">
                          #{tag.name}
                        </Link>
                      </td>
                      <td>{tag.image_count}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link to={`/admin/tags/${tag.id}/edit`} className="btn btn-xs btn-ghost">
                            <FiEdit3 size={12} />
                          </Link>
                          <button className="btn btn-xs btn-ghost text-error" onClick={() => handleDelete(tag)}>
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
