import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiKey, FiPlus, FiTrash2, FiArrowLeft, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function AdminAuthCodesPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState('24');
  const [maxUses, setMaxUses] = useState('');
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState(null);

  const fetchCodes = useCallback(async () => {
    try {
      const data = await api.request('/admin/auth-codes');
      setCodes(data.codes || []);
    } catch (err) {
      toast.error(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const data = await api.request('/admin/auth-codes', {
        method: 'POST',
        body: JSON.stringify({
          hours: parseInt(hours) || 24,
          max_uses: maxUses ? parseInt(maxUses) : null,
        }),
      });
      setNewCode(data.code);
      toast.success('授权码已生成');
      fetchCodes();
    } catch (err) {
      toast.error(err.message || '生成失败');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除此授权码吗？')) return;
    try {
      await api.request(`/admin/auth-codes/${id}`, { method: 'DELETE' });
      toast.success('已删除');
      fetchCodes();
    } catch (err) {
      toast.error(err.message || '删除失败');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('已复制'));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/admin" className="btn btn-ghost btn-sm gap-1 mb-4">
        <FiArrowLeft size={14} />
        返回管理面板
      </Link>

      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <FiKey className="text-primary" />
        临时授权码管理
      </h1>

      <div className="card bg-base-200 mb-6">
        <div className="card-body p-4">
          <h3 className="font-medium mb-3">生成新授权码</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="form-control">
              <label className="label pb-1"><span className="label-text text-xs">有效期（小时）</span></label>
              <input
                type="number"
                className="input input-sm input-bordered w-24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                min="1"
              />
            </div>
            <div className="form-control">
              <label className="label pb-1"><span className="label-text text-xs">最大使用次数（可选）</span></label>
              <input
                type="number"
                className="input input-sm input-bordered w-32"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="不限制"
                min="1"
              />
            </div>
            <button className="btn btn-sm btn-primary gap-1" onClick={handleCreate} disabled={creating}>
              {creating ? <span className="loading loading-spinner loading-xs"></span> : <FiPlus size={14} />}
              生成
            </button>
          </div>

          {newCode && (
            <div className="mt-3 p-3 bg-success/10 border border-success/30 rounded-lg">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono break-all flex-1">{newCode}</code>
                <button className="btn btn-ghost btn-xs btn-square" onClick={() => copyToClipboard(newCode)}>
                  <FiCopy size={14} />
                </button>
              </div>
              <p className="text-xs text-success/70 mt-1">请立即复制此授权码，页面关闭后将无法再次查看</p>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : codes.length === 0 ? (
        <p className="text-base-content/50 py-10 text-center">暂无授权码</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>授权码</th>
                <th>有效期至</th>
                <th>使用次数</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id}>
                  <td>
                    <code className="text-xs font-mono">{c.code?.substring(0, 20)}...</code>
                  </td>
                  <td className="text-xs">{new Date(c.expires_at).toLocaleString()}</td>
                  <td className="text-xs">
                    {c.use_count}{c.max_uses ? ` / ${c.max_uses}` : ''}
                  </td>
                  <td className="text-xs">{new Date(c.created_at).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-ghost btn-xs btn-square text-error" onClick={() => handleDelete(c.id)}>
                      <FiTrash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
