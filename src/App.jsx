import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppConfigProvider } from './context/AppConfigContext';
import Navbar from './components/Navbar';
import GalleryPage from './pages/GalleryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminTagsPage from './pages/AdminTagsPage';
import AdminDuplicatesPage from './pages/AdminDuplicatesPage';
import AdminUserEditPage from './pages/AdminUserEditPage';
import AdminTagEditPage from './pages/AdminTagEditPage';
import AdminCategoryEditPage from './pages/AdminCategoryEditPage';
import AdminLogsPage from './pages/AdminLogsPage';
import AdminAuthCodesPage from './pages/AdminAuthCodesPage';
import UserPage from './pages/UserPage';
import SettingsPage from './pages/SettingsPage';
import TagPage from './pages/TagPage';
import CategoryPage from './pages/CategoryPage';
import UploadPage from './pages/UploadPage';
import GalleryListPage from './pages/GalleryListPage';
import GalleryDetailPage from './pages/GalleryDetailPage';
import { FiImage, FiFolder, FiTag, FiHome, FiSettings, FiShield, FiLogOut, FiLogIn, FiUserPlus, FiX, FiCopy, FiUploadCloud, FiActivity, FiFolderPlus, FiKey } from 'react-icons/fi';

const DRAWER_ID = 'nav-drawer';

function MobileDrawer() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeDrawer = () => {
    document.getElementById(DRAWER_ID)?.click();
  };

  return (
    <div className="drawer-side z-50">
      <label htmlFor={DRAWER_ID} aria-label="关闭菜单" className="drawer-overlay"></label>
      <div className="bg-base-200 min-h-full w-80 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold" onClick={closeDrawer}>
            <FiImage className="text-primary" />
            <span>ZustMedia</span>
          </Link>
          <label htmlFor={DRAWER_ID} className="btn btn-ghost btn-sm btn-circle lg:hidden">
            <FiX size={20} />
          </label>
        </div>

        <ul className="menu menu-lg w-full space-y-1">
          <li>
            <Link to="/" onClick={closeDrawer} className="flex items-center gap-3">
              <FiHome size={18} />
              首页
            </Link>
          </li>
          <li>
            <Link to="/category" onClick={closeDrawer} className="flex items-center gap-3">
              <FiFolder size={18} />
              分类
            </Link>
          </li>
          <li>
            <Link to="/tag" onClick={closeDrawer} className="flex items-center gap-3">
              <FiTag size={18} />
              标签
            </Link>
          </li>
          {user && (
            <li>
              <Link to="/galleries" onClick={closeDrawer} className="flex items-center gap-3">
                <FiFolderPlus size={18} />
                照片夹
              </Link>
            </li>
          )}
          {user && (
            <li>
              <Link to="/upload" onClick={closeDrawer} className="flex items-center gap-3">
                <FiUploadCloud size={18} />
                上传图片
              </Link>
            </li>
          )}
        </ul>

        <div className="divider my-2"></div>

        {user ? (
          <ul className="menu menu-lg w-full space-y-1">
            <li>
              <Link to={`/user/${user.uuid || user.slug || user.id}`} onClick={closeDrawer} className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <span className="text-sm">{user.username[0].toUpperCase()}</span>
                  </div>
                </div>
                <span>{user.username}</span>
                <span className={`badge badge-xs ${isAdmin ? 'badge-warning' : ''}`}>
                  {isAdmin ? '管理员' : '用户'}
                </span>
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin" onClick={closeDrawer} className="flex items-center gap-3">
                  <FiShield size={18} />
                  管理面板
                </Link>
              </li>
            )}
            {isAdmin && (
              <li>
                <Link to="/admin/auth-codes" onClick={closeDrawer} className="flex items-center gap-3">
                  <FiKey size={18} />
                  临时授权码
                </Link>
              </li>
            )}
            {isAdmin && (
              <li>
                <Link to="/admin/duplicates" onClick={closeDrawer} className="flex items-center gap-3">
                  <FiCopy size={18} />
                  重复图片
                </Link>
              </li>
            )}
            {isAdmin && (
              <li>
                <Link to="/admin/logs" onClick={closeDrawer} className="flex items-center gap-3">
                  <FiActivity size={18} />
                  操作日志
                </Link>
              </li>
            )}
            <li>
              <Link to="/settings" onClick={closeDrawer} className="flex items-center gap-3">
                <FiSettings size={18} />
                设置
              </Link>
            </li>
            <li>
              <button onClick={() => { handleLogout(); closeDrawer(); }} className="flex items-center gap-3">
                <FiLogOut size={18} />
                退出登录
              </button>
            </li>
          </ul>
        ) : (
          <ul className="menu menu-lg w-full space-y-1">
            <li>
              <Link to="/login" onClick={closeDrawer} className="flex items-center gap-3">
                <FiLogIn size={18} />
                登录
              </Link>
            </li>
            <li>
              <Link to="/register" onClick={closeDrawer} className="flex items-center gap-3">
                <FiUserPlus size={18} />
                注册
              </Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GalleryPage />} />
      <Route path="/user/:uuid" element={<UserPage />} />
      <Route path="/tag/:id?" element={<TagPage />} />
      <Route path="/category/:id?" element={<CategoryPage />} />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />
      <Route path="/galleries"
        element={
          <ProtectedRoute>
            <GalleryListPage />
          </ProtectedRoute>
        }
      />
      <Route path="/gallery/:uuid"
        element={
          <ProtectedRoute>
            <GalleryDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/new"
        element={
          <ProtectedRoute requireAdmin>
            <AdminUserEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <AdminUserEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute requireAdmin>
            <AdminCategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories/new"
        element={
          <ProtectedRoute requireAdmin>
            <AdminCategoryEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <AdminCategoryEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tags"
        element={
          <ProtectedRoute requireAdmin>
            <AdminTagsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tags/new"
        element={
          <ProtectedRoute requireAdmin>
            <AdminTagEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tags/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <AdminTagEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/duplicates"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDuplicatesPage />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/logs"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLogsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/auth-codes"
        element={
          <ProtectedRoute requireAdmin>
            <AdminAuthCodesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppConfigProvider>
        <AuthProvider>
          <div className="drawer min-h-screen">
            <input id={DRAWER_ID} type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col">
              <Navbar drawerId={DRAWER_ID} />
              <main className="container mx-auto px-4 py-6 max-w-7xl flex-1">
                <AppRoutes />
              </main>
              <footer className="footer footer-center p-4 text-base-content/40 text-sm">
                <div>ZustMedia 图库系统 &copy; {new Date().getFullYear()}</div>
              </footer>
            </div>
            <MobileDrawer />
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '10px',
                background: 'var(--b1)',
                color: 'var(--bc)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
            }}
          />
        </AuthProvider>
      </AppConfigProvider>
    </BrowserRouter>
  );
}
