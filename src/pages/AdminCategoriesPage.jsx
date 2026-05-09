import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMetadata } from '../context/MetadataContext';
import { FiShield, FiArrowLeft, FiTrash2, FiEdit3, FiPlus } from 'react-icons/fi';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function AdminCategoriesPage() {
  const { user, isAdmin } = useAuth();
  const { refresh: refreshMetadata } = useMetadata();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data.categories);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) { toast.error('仅管理员可访问'); return <Navigate to="/" replace />; }

  const handleDelete = async (cat) => {
    if (!window.confirm(`确定要删除分类「${cat.name}」吗？其中的图片将变为无分类。`)) return;
    try {
      await api.deleteCategory(cat.id);
      toast.success('分类已删除');
      await refreshMetadata();
      fetchCategories();
    } catch (err) { toast.error(err.message || '删除失败'); }
  };

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="btn btn-ghost btn-sm btn-circle"><FiArrowLeft size={18} /></Link>
          <FiShield className="text-warning text-2xl" />
          <h2 className="text-2xl font-bold">分类管理</h2>
        </div>
        <Link to="/admin/categories/new" className="btn btn-primary btn-sm gap-1">
          <FiPlus size={16} />
          添加分类
        </Link>
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead><tr><th>名称</th><th>描述</th><th>图片数</th><th>操作</th></tr></thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <Link to={`/category/${cat.id}`} className="font-medium link link-hover">
                        {cat.name}
                      </Link>
                    </td>
                    <td className="text-xs text-base-content/50 max-w-[200px] truncate">{cat.description || '-'}</td>
                    <td>{cat.image_count}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link to={`/admin/categories/${cat.id}/edit`} className="btn btn-xs btn-ghost">
                          <FiEdit3 size={12} />
                        </Link>
                        <button
                          className="btn btn-xs btn-ghost text-error"
                          onClick={() => handleDelete(cat)}
                          disabled={cat.id === 1}
                          title={cat.id === 1 ? '默认分类不可删除' : '删除'}
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
