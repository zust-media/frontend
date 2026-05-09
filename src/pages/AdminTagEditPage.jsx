import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMetadata } from '../context/MetadataContext';
import { FiTag, FiArrowLeft, FiSave, FiTrash2 } from 'react-icons/fi';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function AdminTagEditPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { refresh: refreshMetadata } = useMetadata();
  const navigate = useNavigate();
  const isNew = !id || id === 'new' || isNaN(parseInt(id));

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [imageCount, setImageCount] = useState(0);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const uid = parseInt(id);
    if (isNaN(uid)) return;
    setLoading(true);
    api.getTags()
      .then((data) => {
        const t = data.tags.find((t) => t.id === uid);
        if (!t) { toast.error('标签不存在'); navigate('/admin/tags', { replace: true }); return; }
        setName(t.name);
        setSlug(t.slug || '');
        setImageCount(t.image_count || 0);
      })
      .catch((err) => toast.error(err.message || '加载失败'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) { toast.error('仅管理员可访问'); return <Navigate to="/" replace />; }

  const handleSave = async () => {
    const n = name.trim();
    if (!n) return toast.error('标签名称不能为空');
    setSaving(true);
    try {
      if (isNew) {
        await api.createTag(n, slug.trim() || undefined);
        toast.success('标签已创建');
      } else {
        await api.updateTag(parseInt(id), { name: n, slug: slug.trim() || undefined });
        toast.success('标签已更新');
      }
      await refreshMetadata();
      navigate('/admin/tags', { replace: true });
    } catch (err) {
      toast.error(err.message || '保存失败');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (isNew) return;
    if (!window.confirm(`确定要删除标签「${name}」吗？所有关联的图片标签关系将被清除。`)) return;
    try {
      await api.deleteTag(parseInt(id));
      toast.success('标签已删除');
      await refreshMetadata();
      navigate('/admin/tags', { replace: true });
    } catch (err) { toast.error(err.message || '删除失败'); }
  };

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/tags" className="btn btn-ghost btn-sm btn-circle"><FiArrowLeft size={18} /></Link>
          <FiTag size={20} className="text-primary" />
          <h2 className="text-xl font-bold">{isNew ? '新建标签' : '编辑标签'}</h2>
        </div>
        {!isNew && (
          <button className="btn btn-sm btn-ghost text-error" onClick={handleDelete}>
            <FiTrash2 size={16} /> 删除
          </button>
        )}
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body space-y-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend font-medium">标签名称</legend>
            <input
              type="text"
              className="input  w-full"
              placeholder="标签名称"
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

          {!isNew && (
            <div className="bg-base-200 rounded-lg p-3 text-sm">
              <div className="text-xs text-base-content/40 mb-1">其他信息</div>
              <div>关联图片: <strong>{imageCount}</strong> 张</div>
            </div>
          )}

          <button className="btn btn-primary w-full gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-xs"></span> : <FiSave size={16} />}
            {saving ? '保存中...' : isNew ? '创建标签' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  );
}
