import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '../../services/adminService';
import { Search, Trash2, UserX, RefreshCw, Plus, X } from 'lucide-react';

function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' });
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search
      });
      setUsers(response.data.data.users);
      setPagination(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUser(userId, { role: newRole });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleDisableToggle = async (userId, disabled) => {
    try {
      await adminService.updateUser(userId, { disabled: !disabled });
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle disable:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm(t('admin.users.confirmDelete'))) return;
    try {
      await adminService.deleteUser(userId);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    try {
      await adminService.createUser(newUser);
      setShowCreateModal(false);
      setNewUser({ username: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Failed to create user');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('admin.users.title')}</h1>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" size={18} />
          <input
            type="text"
            placeholder={t('admin.users.searchPlaceholder')}
            className="input input-bordered w-full pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
          />
        </div>
        <button className="btn btn-ghost" onClick={fetchUsers}>
          <RefreshCw size={18} />
        </button>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          {t('admin.users.create')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>{t('admin.users.username')}</th>
                  <th>{t('admin.users.email')}</th>
                  <th>{t('admin.users.role')}</th>
                  <th>{t('admin.users.status')}</th>
                  <th>{t('admin.users.registeredAt')}</th>
                  <th>{t('admin.users.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.role === 'super_admin' ? (
                        <span className="badge badge-error">{t('admin.users.roles.super_admin')}</span>
                      ) : (
                        <select
                          className="select select-bordered select-sm w-full max-w-xs"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          <option value="user">{t('admin.users.roles.user')}</option>
                          <option value="admin">{t('admin.users.roles.admin')}</option>
                        </select>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${user.disabled ? 'badge-error' : 'badge-success'}`}>
                        {user.disabled ? t('admin.users.disabled') : t('admin.users.active')}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className={`btn btn-ghost btn-sm ${user.disabled ? 'text-success' : 'text-error'}`}
                          onClick={() => handleDisableToggle(user.id, user.disabled)}
                          disabled={user.role === 'super_admin'}
                          title={user.disabled ? t('admin.users.enable') : t('admin.users.disable')}
                        >
                          <UserX size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() => handleDelete(user.id)}
                          disabled={user.role === 'super_admin'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <button
                className="btn btn-sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                Previous
              </button>
              <span className="btn btn-sm btn-disabled">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                className="btn btn-sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{t('admin.users.create')}</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-sm btn-circle">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              {createError && (
                <div className="alert alert-error mb-4">
                  <span>{createError}</span>
                </div>
              )}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">{t('admin.users.username')}</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">{t('admin.users.email')}</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">{t('admin.users.password')}</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">{t('admin.users.role')}</span>
                </label>
                <select
                  className="select select-bordered"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="user">{t('admin.users.roles.user')}</option>
                  <option value="admin">{t('admin.users.roles.admin')}</option>
                </select>
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowCreateModal(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowCreateModal(false)} />
        </div>
      )}
    </div>
  );
}

export default Users;