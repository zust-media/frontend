import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './layouts/SidebarLayout';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CategoryManagement from './pages/CategoryManagement';
import TagManagement from './pages/TagManagement';
import Search from './pages/Search';
import ImageManagement from './pages/ImageManagement';
import TagsGallery from './pages/TagsGallery';
import CategoriesGallery from './pages/CategoriesGallery';
import MyImages from './pages/MyImages';
import TagDetail from './pages/TagDetail';
import CategoryDetail from './pages/CategoryDetail';
import UserProfile from './pages/UserProfile';
import UrlGenerator from './pages/UrlGenerator';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SidebarLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="categories" element={<CategoriesGallery />} />
              <Route path="categories/:slug" element={<CategoryDetail />} />
              <Route path="tags" element={<TagsGallery />} />
              <Route path="tags/:slug" element={<TagDetail />} />
              <Route path="search" element={<Search />} />
              <Route path="images" element={<ImageManagement />} />
              <Route path="my-images" element={<MyImages />} />
              <Route path="url-generator" element={<UrlGenerator />} />
              <Route path="collections" element={<Collections />} />
              <Route path="collections/:id" element={<CollectionDetail />} />
            </Route>
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="u" element={<UserProfile />} />
            <Route path="u/:slug" element={<UserProfile />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;