import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { User, LogOut, Link as LinkIcon } from 'lucide-react';

const navItems = [
  { path: '/', labelKey: 'nav.dashboard', icon: 'home' },
  { path: '/images', labelKey: 'nav.images', icon: 'image' },
  { path: '/my-images', labelKey: 'nav.myImages', icon: 'user' },
  { path: '/tags', labelKey: 'nav.tags', icon: 'tag' },
  { path: '/categories', labelKey: 'nav.categories', icon: 'folder' },
  { path: '/search', labelKey: 'nav.search', icon: 'search' },
  { path: '/collections', labelKey: 'nav.collections', icon: 'folder-open' },
  { path: '/tasks', labelKey: 'nav.tasks', icon: 'task' },
  { path: '/my-tasks', labelKey: 'nav.myTasks', icon: 'star' },
  { path: '/url-generator', labelKey: 'nav.urlGenerator', icon: 'link', adminOnly: true },
  { path: '/admin', labelKey: 'admin.dashboard', icon: 'settings', adminOnly: true },
];

function SidebarLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="sidebar-drawer"
        type="checkbox"
        className="drawer-toggle"
        defaultChecked={isSidebarOpen}
      />
      <div className="drawer-content flex flex-col">
        <div className="navbar bg-base-300 w-full lg:hidden">
          <div className="flex-none">
            <label
              htmlFor="sidebar-drawer"
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
          <div className="flex-1 px-2 mx-2">ZUST Media</div>
        </div>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      <div className="drawer-side z-50">
        <label
          htmlFor="sidebar-drawer"
          className="drawer-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
        <aside className="menu bg-base-200 w-64 min-h-screen flex flex-col">
          <div className="p-4 text-2xl font-bold">ZUST Media</div>
          <ul className="flex-1 overflow-y-auto">
            {navItems
              .filter(item => !item.adminOnly || user?.role === 'admin' || user?.role === 'super_admin')
              .map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? 'active' : ''
                  }
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {t(item.labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="p-4 border-t border-base-300">
            <LanguageSwitcher />
          </div>
          {isAuthenticated && (
            <div className="p-4 border-t border-base-300" ref={dropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="btn btn-ghost btn-sm w-full justify-start flex items-center gap-2"
                >
                  <User size={18} />
                  <span className="flex-1 text-left">{user?.username || 'User'}</span>
                  <span className="text-xs">{isDropdownOpen ? '▼' : '▲'}</span>
                </button>
                {user?.role === 'super_admin' && <span className="badge badge-error badge-xs ml-1">Super Admin</span>}
                {user?.role === 'admin' && <span className="badge badge-primary badge-xs ml-1">Admin</span>}

                {isDropdownOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-base-100 rounded-lg shadow-lg border border-base-300 overflow-hidden">
                    <button
                      onClick={() => { setIsDropdownOpen(false); setIsSidebarOpen(false); navigate('/profile'); }}
                      className="btn btn-ghost btn-sm w-full justify-start gap-3"
                    >
                      <User size={18} />
                      {t('nav.profile')}
                    </button>
                    <button
                      onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                      className="btn btn-ghost btn-sm w-full justify-start gap-3 text-error"
                    >
                      <LogOut size={18} />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default SidebarLayout;