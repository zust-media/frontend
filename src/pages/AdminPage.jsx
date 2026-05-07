import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiUsers, FiImage, FiTag, FiFolder, FiHardDrive, FiChevronRight, FiBarChart2, FiCopy, FiActivity } from 'react-icons/fi';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminStats().then(setStats).catch(() => toast.error('加载统计数据失败')).finally(() => setLoading(false));
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) { toast.error('仅管理员可访问'); return <Navigate to="/" replace />; }

  if (loading) {
    return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  if (!stats) {
    return <div className="text-center py-20"><p className="text-base-content/50">加载失败</p></div>;
  }

  const statCards = [
    { label: '用户总数', value: stats.totalUsers, icon: FiUsers, color: 'text-info', link: '/admin/users' },
    { label: '图片总数', value: stats.totalImages, icon: FiImage, color: 'text-primary', link: '/admin/images' },
    { label: '分类数量', value: stats.totalCategories, icon: FiFolder, color: 'text-accent', link: '/admin/categories' },
    { label: '标签数量', value: stats.totalTags, icon: FiTag, color: 'text-secondary', link: '/admin/tags' },
    { label: '存储使用', value: formatSize(stats.totalSize), icon: FiHardDrive, color: 'text-warning', link: null },
    { label: '重复图片', value: stats.duplicateCount || 0, icon: FiCopy, color: 'text-error', link: '/admin/duplicates' },
  ];

  const manageLinks = [
    { label: '用户管理', desc: '查看、修改角色、删除用户', icon: FiUsers, to: '/admin/users' },
    { label: '分类管理', desc: '创建、编辑、删除分类', icon: FiFolder, to: '/admin/categories' },
    { label: '标签管理', desc: '创建、删除标签', icon: FiTag, to: '/admin/tags' },
    { label: '重复图片', desc: '查看和管理重复上传的图片', icon: FiCopy, to: '/admin/duplicates' },
    { label: '操作日志', desc: '查看所有管理员操作记录', icon: FiActivity, to: '/admin/logs' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FiShield className="text-warning text-3xl" />
        <div>
          <h2 className="text-2xl font-bold">管理员面板</h2>
          <p className="text-base-content/60 text-sm">系统概览与管理</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => {
          const content = (
            <div className={`stat bg-base-100 shadow-md rounded-box p-4 ${card.link ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}>
              <div className="flex items-center gap-2 text-sm text-base-content/50 mb-1">
                <card.icon className={card.color} size={16} />
                {card.label}
              </div>
              <div className="text-xl font-bold">{card.value}</div>
            </div>
          );
          return card.link ? <Link key={card.label} to={card.link}>{content}</Link> : <div key={card.label}>{content}</div>;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title text-base gap-2">
              <FiBarChart2 className="text-info" />
              管理功能
            </h3>
            <div className="space-y-2 mt-2">
              {manageLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center justify-between p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <link.icon size={18} className="text-primary" />
                    <div>
                      <div className="font-medium text-sm">{link.label}</div>
                      <div className="text-xs text-base-content/50">{link.desc}</div>
                    </div>
                  </div>
                  <FiChevronRight size={16} className="text-base-content/30" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title text-base gap-2">
              <FiImage className="text-primary" />
              最近上传
            </h3>
            <div className="space-y-2 mt-2">
              {stats.recentImages?.length === 0 ? (
                <p className="text-sm text-base-content/40">暂无图片</p>
              ) : (
                stats.recentImages?.map((img) => (
                  <div key={img.id} className="flex items-center justify-between text-sm p-2 rounded bg-base-200">
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="truncate font-medium">{img.title || img.original_name}</div>
                      <div className="text-xs text-base-content/40">{img.uploader_uuid ? img.uploader_uuid.substring(0, 8) : ''} · {img.created_at?.substring(0, 16)}</div>
                    </div>
                    <span className="text-xs text-base-content/50 flex-shrink-0">{formatSize(img.file_size)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h3 className="card-title text-base gap-2">
            <FiUsers className="text-info" />
            上传排行
          </h3>
          {stats.topUploaders?.length === 0 ? (
            <p className="text-sm text-base-content/40">暂无数据</p>
          ) : (
            <div className="overflow-x-auto mt-2">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>UUID</th>
                    <th>角色</th>
                    <th>上传数</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topUploaders?.map((u, idx) => (
                    <tr key={u.uuid || idx}>
                      <td className="font-bold text-base-content/40">{idx + 1}</td>
                      <td className="font-medium font-mono text-xs">{u.uuid ? u.uuid.substring(0, 8) : u.username}</td>
                      <td><span className={`badge badge-xs ${u.role === 'admin' ? 'badge-warning' : ''}`}>{u.role === 'admin' ? '管理员' : '用户'}</span></td>
                      <td>{u.cnt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
