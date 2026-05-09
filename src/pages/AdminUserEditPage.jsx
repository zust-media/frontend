import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiArrowLeft, FiSave, FiTrash2, FiShield } from 'react-icons/fi';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function AdminUserEditPage() {
  const { id } = useParams();
  const { user: currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const isNew = !id || id === 'new';

  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(isNew ? 'user' : '');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [existingUser, setExistingUser] = useState(null);

  useEffect(() => {
    const uid = parseInt(id);
    if (isNaN(uid)) return;
    setLoading(true);
    api.listUsers()
      .then((data) => {
        const u = data.users.find((u) => u.id === uid);
        if (!u) {
          toast.error('用户不存在');
          navigate('/admin/users', { replace: true });
          return;
        }
        setExistingUser(u);
        setUsername(u.username);
        setNickname(u.nickname || '');
        setRole(u.role);
        setSlug(u.slug || '');
      })
      .catch((err) => toast.error(err.message || '加载失败'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isAdmin) { toast.error('仅管理员可访问'); return <Navigate to="/" replace />; }

  const handleSave = async () => {
    const name = username.trim();
    if (!name) return toast.error('用户名不能为空');
    if (name.length < 3) return toast.error('用户名至少3个字符');
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return toast.error('用户名只能包含字母、数字和下划线');

    if (isNew && !password) return toast.error('密码不能为空');
    if (password && password.length < 6) return toast.error('密码至少6个字符');

    setSaving(true);
    try {
      const payload = { username: name, nickname: nickname.trim(), role, slug: slug.trim() || undefined };
      if (password) payload.password = password;

      if (isNew) {
        await api.createUser(payload);
        toast.success('用户已创建');
      } else {
        await api.updateUser(id, payload);
        toast.success('用户已更新');
      }
      navigate('/admin/users', { replace: true });
    } catch (err) {
      toast.error(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    if (!window.confirm(`确定要删除用户「${existingUser?.username}」及其所有图片吗？此操作不可撤销。`)) return;
    try {
      await api.deleteUser(existingUser.uuid);
      toast.success('用户已删除');
      navigate('/admin/users', { replace: true });
    } catch (err) {
      toast.error(err.message || '删除失败');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/users" className="btn btn-ghost btn-sm btn-circle">
            <FiArrowLeft size={18} />
          </Link>
          <FiUser size={20} className="text-primary" />
          <h2 className="text-xl font-bold">{isNew ? '新建用户' : '编辑用户'}</h2>
        </div>
        {!isNew && existingUser && existingUser.id !== currentUser?.id && existingUser.role !== 'admin' && existingUser.role !== 'super_admin' && (
          <button className="btn btn-sm btn-ghost text-error" onClick={handleDelete}>
            <FiTrash2 size={16} />
            删除
          </button>
        )}
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body space-y-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend font-medium">用户名</legend>
            <input
              type="text"
              className="input  w-full"
              placeholder="3-30位字母、数字或下划线"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-medium">个性地址</legend>
            <input
              type="text"
              className="input  w-full font-mono"
              placeholder="留空使用 UUID"
              value={slug}
              onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
              maxLength={40}
            />
            <p className="fieldset-label text-base-content/40">只能是字母、数字、下划线或连字符，不能是纯数字或UUID格式</p>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-medium">昵称</legend>
            <input
              type="text"
              className="input  w-full"
              placeholder="显示名称（中文、任意字符）"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-medium">
              密码 {!isNew && <span className="text-xs text-base-content/40 font-normal">（留空则不修改）</span>}
            </legend>
            <input
              type="password"
              className="input  w-full"
              placeholder={isNew ? '至少6个字符' : '输入新密码（留空保持不变）'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-medium flex items-center gap-1.5">
              <FiShield size={14} />
              权限组
            </legend>
            <select
              className="select  w-full"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={!isNew && existingUser?.id === currentUser?.id}
            >
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
              <option value="super_admin">超级管理员</option>
            </select>
            {!isNew && existingUser?.id === currentUser?.id && (
              <p className="fieldset-label text-base-content/40">不能修改自己的权限组</p>
            )}
          </fieldset>

          {existingUser && (
            <div className="bg-base-200 rounded-lg p-3 space-y-1 text-sm">
              <div className="text-xs text-base-content/40 mb-1">其他信息</div>
              <div>UUID: <code className="text-xs">{existingUser.uuid}</code></div>
              <div>注册时间: {existingUser.created_at}</div>
            </div>
          )}

          <button className="btn btn-primary w-full gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-xs"></span> : <FiSave size={16} />}
            {saving ? '保存中...' : isNew ? '创建用户' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  );
}
