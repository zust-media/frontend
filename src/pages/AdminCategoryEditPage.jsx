import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiFolder, FiArrowLeft, FiSave, FiTrash2 } from 'react-icons/fi';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function AdminCategoryEditPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isNew = !id || id === 'new' || isNaN(parseInt(id));

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageCount, setImageCount] = useState(0);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const uid = parseInt(id);
    if (isNaN(uid)) return;
    setLoading(true);
    api.getCategories()
      .then((data) => {
        const c = data.categories.find((c) => c.id === uid);
        if (!c) { toast.error('分类不存在'); navigate('/admin/categories', { replace: true }); return; }
        setName(c.name);
        setSlug(c.slug || '');
        setDescription(c.description || '');
        setImageCount(c.image_count || 0);
      })
      .catch((err) => toast.error(err.message || '加载失败'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) { toast.error('仅管理员可访问'); return <Navigate to="/" replace />; }

  const handleSave = async () => {
    const n = name.trim();
    if (!n) return toast.error('分类名称不能为空');
    setSaving(true);
    try {
      if (isNew) {
        await api.createCategory({ name: n, slug: slug.trim() || undefined, description: description.trim() });
        toast.success('分类已创建');
      } else {
        await api.updateCategory(parseInt(id), { name: n, slug: slug.trim(), description: description.trim() });
        toast.success('分类已更新');
      }
      navigate('/admin/categories', { replace: true });
    } catch (err) {
      toast.error(err.message || '保存失败');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (isNew) return;
    if (!window.confirm(`确定要删除分类「${name}」吗？其中的图片将变为无分类。`)) return;
    try {
      await api.deleteCategory(parseInt(id));
      toast.success('分类已删除');
      navigate('/admin/categories', { replace: true });
    } catch (err) { toast.error(err.message || '删除失败'); }
  };

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/categories" className="btn btn-ghost btn-sm btn-circle"><FiArrowLeft size={18} /></Link>
          <FiFolder size={20} className="text-primary" />
          <h2 className="text-xl font-bold">{isNew ? '新建分类' : '编辑分类'}</h2>
        </div>
        {!isNew && slug !== 'uncategorized' && (
          <button className="btn btn-sm btn-ghost text-error" onClick={handleDelete}>
            <FiTrash2 size={16} /> 删除
          </button>
        )}
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body space-y-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend font-medium">分类名称</legend>
            <input
              type="text"
              className="input  w-full"
              placeholder="分类名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-medium">Slug</legend>
            <input
              type="text"
              className="input  w-full font-mono"
              placeholder="留空自动生成"
              value={slug}
              onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase())}
            />
            <p className="fieldset-label text-base-content/40">用作 URL 标识，只能包含字母数字和连字符</p>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-medium">描述</legend>
            <textarea
              className="textarea  w-full"
              placeholder="描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </fieldset>

          {!isNew && (
            <div className="bg-base-200 rounded-lg p-3 text-sm">
              <div className="text-xs text-base-content/40 mb-1">其他信息</div>
              <div>关联图片: <strong>{imageCount}</strong> 张</div>
            </div>
          )}

          <button className="btn btn-primary w-full gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-xs"></span> : <FiSave size={16} />}
            {saving ? '保存中...' : isNew ? '创建分类' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  );
}
