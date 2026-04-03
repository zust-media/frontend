import { useTranslation } from 'react-i18next';

function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">{t('dashboard.stats.totalImages')}</h2>
            <p className="text-4xl font-bold">0</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">{t('dashboard.stats.totalTags')}</h2>
            <p className="text-4xl font-bold">0</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">{t('dashboard.stats.totalCategories')}</h2>
            <p className="text-4xl font-bold">0</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">{t('dashboard.stats.totalUsers')}</h2>
            <p className="text-4xl font-bold">0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard