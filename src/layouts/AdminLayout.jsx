import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Settings, Users, BarChart3, Calendar, X } from 'lucide-react';

const adminNavItems = [
  { path: '/admin', labelKey: 'admin.dashboard', icon: BarChart3, exact: true },
  { path: '/admin/users', labelKey: 'admin.users.title', icon: Users },
  { path: '/admin/tasks', labelKey: 'tasks.adminTitle', icon: Calendar },
  { path: '/admin/settings', labelKey: 'admin.settings.title', icon: Settings },
];

function AdminLayout() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="admin-sidebar-drawer"
        type="checkbox"
        className="drawer-toggle"
        defaultChecked={false}
      />
      <div className="drawer-content flex flex-col">
        <div className="navbar bg-base-300 w-full lg:hidden">
          <div className="flex-none">
            <label
              htmlFor="admin-sidebar-drawer"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-5 w-5 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>
          <div className="flex-1 px-2 mx-2">Admin Panel</div>
        </div>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      <div className="drawer-side z-50">
        <label
          htmlFor="admin-sidebar-drawer"
          className="drawer-overlay"
        />
        <aside className="menu bg-base-200 w-64 min-h-screen flex flex-col">
          <div className="p-4 text-xl font-bold flex items-center justify-between">
            <span>Admin</span>
            <label
              htmlFor="admin-sidebar-drawer"
              className="lg:hidden btn btn-ghost btn-sm btn-circle"
            >
              <X size={18} />
            </label>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {adminNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    isActive ? 'active' : ''
                  }
                >
                  <item.icon size={18} />
                  {t(item.labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="p-4 border-t border-base-300">
            <button
              onClick={() => navigate('/')}
              className="btn btn-ghost btn-sm w-full"
            >
              {t('admin.backToSite')}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AdminLayout;