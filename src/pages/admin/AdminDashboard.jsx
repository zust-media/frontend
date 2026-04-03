import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '../../services/adminService';
import { Image as ImageIcon, Tag, Folder, Users } from 'lucide-react';

function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('admin.dashboard')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <ImageIcon size={32} className="text-primary" />
              <div>
                <h2 className="text-sm text-base-content/60">{t('admin.stats.totalImages')}</h2>
                <p className="text-3xl font-bold">{stats?.totalImages || 0}</p>
                <p className="text-xs text-success">+{stats?.newImages || 0} {t('admin.stats.today')}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <Tag size={32} className="text-secondary" />
              <div>
                <h2 className="text-sm text-base-content/60">{t('admin.stats.totalTags')}</h2>
                <p className="text-3xl font-bold">{stats?.totalTags || 0}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <Folder size={32} className="text-accent" />
              <div>
                <h2 className="text-sm text-base-content/60">{t('admin.stats.totalCategories')}</h2>
                <p className="text-3xl font-bold">{stats?.totalCategories || 0}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <Users size={32} className="text-info" />
              <div>
                <h2 className="text-sm text-base-content/60">{t('admin.stats.totalUsers')}</h2>
                <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-success">+{stats?.newUsers || 0} {t('admin.stats.today')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title text-lg">{t('admin.stats.collections')}</h2>
            <p className="text-4xl font-bold">{stats?.totalCollections || 0}</p>
            <p className="text-xs text-success">+{stats?.newCollections || 0} {t('admin.stats.today')}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title text-lg">{t('admin.stats.storage')}</h2>
            <p className="text-4xl font-bold">{formatBytes(stats?.totalStorageBytes || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;