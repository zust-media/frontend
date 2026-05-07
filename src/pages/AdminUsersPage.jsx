import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiArrowLeft, FiTrash2, FiEdit3, FiUserPlus } from 'react-icons/fi';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function AdminUsersPage() {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listUsers();
      setUsers(data.users);
    } catch (err) {
      toast.error(err.message || '加载用户失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isAdmin) { toast.error('仅管理员可访问'); return <Navigate to="/" replace />; }

  const handleDelete = async (u) => {
    if (!window.confirm(`确定要删除用户「${u.nickname || u.username}」及其所有图片吗？此操作不可撤销。`)) return;
    try {
      await api.deleteUser(u.id);
      toast.success('用户已删除');
      fetchUsers();
    } catch (err) {
      toast.error(err.message || '删除失败');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="btn btn-ghost btn-sm btn-circle"><FiArrowLeft size={18} /></Link>
          <FiShield className="text-warning text-2xl" />
          <h2 className="text-2xl font-bold">用户管理</h2>
        </div>
        <Link to="/admin/users/new" className="btn btn-primary btn-sm gap-1">
          <FiUserPlus size={16} />
          添加用户
        </Link>
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>用户</th>
                  <th>角色</th>
                  <th>图片数</th>
                  <th>加入时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div>
                        <span className="font-medium">{u.nickname || u.username}</span>
                        {u.nickname && (
                          <span className="text-xs text-base-content/40 ml-1.5">@{u.username}</span>
                        )}
                      </div>
                      {u.id === currentUser?.id && <span className="badge badge-xs ml-1">我</span>}
                    </td>
                    <td>
                      <span className={`badge badge-xs ${u.role === 'admin' ? 'badge-warning' : ''}`}>
                        {u.role === 'admin' ? '管理员' : '用户'}
                      </span>
                    </td>
                    <td>{u.image_count}</td>
                    <td className="text-xs text-base-content/50">{u.created_at?.substring(0, 10)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/admin/users/${u.id}/edit`}
                          className="btn btn-xs btn-ghost"
                        >
                          <FiEdit3 size={12} />
                        </Link>
                        <button
                          className="btn btn-xs btn-ghost text-error"
                          onClick={() => handleDelete(u)}
                          disabled={u.role === 'admin' || u.id === currentUser?.id}
                          title={u.role === 'admin' ? '不能删除管理员' : u.id === currentUser?.id ? '不能删除自己' : '删除用户'}
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
