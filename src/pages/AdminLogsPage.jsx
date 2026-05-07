import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiArrowLeft, FiActivity, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const ACTION_LABELS = {
  'image.upload': '上传图片',
  'image.delete': '删除图片',
  'image.edit': '编辑图片',
  'image.batch_delete': '批量删除',
  'image.batch_update': '批量编辑',
  'user.create': '创建用户',
  'user.update': '修改用户',
  'user.delete': '删除用户',
  'tag.create': '创建标签',
  'tag.update': '编辑标签',
  'tag.delete': '删除标签',
  'category.create': '创建分类',
  'category.update': '编辑分类',
  'category.delete': '删除分类',
};

const ACTION_COLORS = {
  'image.upload': 'badge-success',
  'image.delete': 'badge-error',
  'image.edit': 'badge-info',
  'image.batch_delete': 'badge-error',
  'image.batch_update': 'badge-info',
  'user.create': 'badge-success',
  'user.update': 'badge-info',
  'user.delete': 'badge-error',
  'tag.create': 'badge-success',
  'tag.update': 'badge-info',
  'tag.delete': 'badge-error',
  'category.create': 'badge-success',
  'category.update': 'badge-info',
  'category.delete': 'badge-error',
};

export default function AdminLogsPage() {
  const { user, isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, total_pages: 0 });
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedUuid, setExpandedUuid] = useState(null);

  const fetchLogs = (page = 1) => {
    setLoading(true);
    const params = { page, limit: 50 };
    if (actionFilter) params.action = actionFilter;
    api.getLogs(params)
      .then((data) => {
        setLogs(data.logs);
        setPagination(data.pagination);
        setActions(data.actions);
      })
      .catch((err) => toast.error(err.message || '加载日志失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [actionFilter]);

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) { toast.error('仅管理员可访问'); return <Navigate to="/" replace />; }

  const renderDetail = (log) => {
    const d = log.data;
    if (!d || !d.detail) return null;

    if (log.action.endsWith('.edit') || log.action.endsWith('.update')) {
      return (
        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
          <div className="bg-base-200 rounded-lg p-3">
            <div className="text-xs text-base-content/40 mb-1">变更前</div>
            <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(d.detail.before, null, 2)}</pre>
          </div>
          <div className="bg-base-200 rounded-lg p-3">
            <div className="text-xs text-base-content/40 mb-1">变更后</div>
            <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(d.detail.after, null, 2)}</pre>
          </div>
        </div>
      );
    }

    if (log.action.endsWith('.upload') || log.action.endsWith('.create')) {
      const entity = d.detail.image || d.detail.user || d.detail.tag || d.detail.category;
      return entity ? (
        <div className="bg-base-200 rounded-lg p-3 mt-3 text-sm">
          <div className="text-xs text-base-content/40 mb-1">详情</div>
          <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(entity, null, 2)}</pre>
        </div>
      ) : null;
    }

    if (log.action.endsWith('.delete') || log.action === 'image.batch_delete') {
      const entity = d.detail.image || d.detail.user || d.detail.tag || d.detail.category;
      if (entity) {
        return (
          <div className="bg-base-200 rounded-lg p-3 mt-3 text-sm">
            <div className="text-xs text-base-content/40 mb-1">已删除内容</div>
            <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(entity, null, 2)}</pre>
          </div>
        );
      }
      if (d.detail.count !== undefined) {
        return (
          <div className="bg-base-200 rounded-lg p-3 mt-3 text-sm">
            <div className="text-xs text-base-content/40 mb-1">操作影响</div>
            <p>删除图片数量: <strong>{d.detail.count}</strong></p>
            {d.detail.image_uuids && (
              <p className="text-xs text-base-content/40 mt-1 break-all">
                UUID: {d.detail.image_uuids.join(', ')}
              </p>
            )}
          </div>
        );
      }
    }

    return (
      <div className="bg-base-200 rounded-lg p-3 mt-3 text-sm">
        <div className="text-xs text-base-content/40 mb-1">原始数据</div>
        <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(d, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="btn btn-ghost btn-sm btn-circle"><FiArrowLeft size={18} /></Link>
          <FiShield className="text-warning text-2xl" />
          <h2 className="text-2xl font-bold">操作日志</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-base-content/50">共 {pagination.total} 条</span>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className={`btn btn-xs ${!actionFilter ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActionFilter('')}
          >
            全部
          </button>
          {actions.map((a) => (
            <button
              key={a}
              className={`btn btn-xs ${actionFilter === a ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActionFilter(actionFilter === a ? '' : a)}
            >
              {ACTION_LABELS[a] || a}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : logs.length === 0 ? (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body text-center py-12">
            <FiActivity size={48} className="mx-auto text-base-content/20" />
            <p className="mt-4 text-base-content/50">暂无操作日志</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const isExpanded = expandedUuid === log.uuid;
            return (
              <div key={log.uuid} className="card bg-base-100 shadow-sm overflow-hidden">
                <div
                  className="card-body p-4 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => setExpandedUuid(isExpanded ? null : log.uuid)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`badge badge-xs ${ACTION_COLORS[log.action] || ''}`}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                        {log.data.entity_type && (
                          <span className="badge badge-xs badge-ghost">{log.data.entity_type}</span>
                        )}
                      </div>
                      <div className="text-xs text-base-content/40">
                        {log.operator_nickname || log.operator_username}
                        {log.operator_nickname && <span className="ml-1">(@{log.operator_username})</span>}
                        <span className="mx-2">·</span>
                        {log.created_at}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-base-content/30 mt-1">
                      {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                    </div>
                  </div>

                  {isExpanded && renderDetail(log)}
                </div>
              </div>
            );
          })}

          {pagination.total_pages > 1 && (
            <div className="flex justify-center gap-1 mt-4">
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`btn btn-xs ${p === pagination.page ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => fetchLogs(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
