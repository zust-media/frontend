import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiImage, FiLogOut, FiShield, FiSettings, FiTag, FiFolder, FiMenu, FiUploadCloud, FiFolderPlus } from 'react-icons/fi';
import ConnectionStatus from './ConnectionStatus';
import ThemeSwitcher from './ThemeSwitcher';

export default function Navbar({ drawerId }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar bg-base-200 shadow-md sticky top-0 z-40 flex-nowrap">
      <div className="flex-1 min-w-0 overflow-hidden flex items-center">
        <label htmlFor={drawerId} className="btn btn-ghost btn-sm btn-square lg:hidden mr-0">
          <FiMenu size={20} />
        </label>
        <Link to="/" className="btn btn-ghost text-xl gap-2 shrink-0">
          <FiImage className="text-primary" />
          <span className="hidden sm:inline">ZustMedia</span>
        </Link>
        <div className="hidden lg:flex items-center gap-0.5 ml-1">
          <Link to="/category" className="btn btn-ghost btn-sm gap-1 px-2 whitespace-nowrap">
            <FiFolder size={14} />
            分类
          </Link>
          <Link to="/tag" className="btn btn-ghost btn-sm gap-1 px-2 whitespace-nowrap">
            <FiTag size={14} />
            标签
          </Link>
          {user && (
            <Link to="/galleries" className="btn btn-ghost btn-sm gap-1 px-2 whitespace-nowrap">
              <FiFolderPlus size={14} />
              照片夹
            </Link>
          )}
        </div>
      </div>
      <div className="flex-none flex items-center gap-1 ml-auto">
        <ConnectionStatus />
        <ThemeSwitcher />

        {user && (
          <Link to="/upload" className="btn btn-ghost btn-sm gap-1">
            <FiUploadCloud size={16} />
            <span className="hidden sm:inline">上传</span>
          </Link>
        )}

        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-10">
                <span className="text-lg">{user.username[0].toUpperCase()}</span>
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-50 p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <Link to={`/user/${user.uuid || user.slug || user.id}`} className="flex items-center gap-2">
                  <span>{user.username}</span>
                  <span className={`text-xs ${isAdmin ? 'text-warning' : 'text-base-content/40'}`}>
                    {isAdmin ? '管理员' : '普通用户'}
                  </span>
                </Link>
              </li>
              <div className="divider my-0"></div>
              {isAdmin && (
                <li><Link to="/admin"><FiShield /> 管理面板</Link></li>
              )}
              <li><Link to="/settings"><FiSettings size={14} /> 设置</Link></li>
              <li><button onClick={handleLogout}><FiLogOut /> 退出登录</button></li>
            </ul>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">登录</Link>
            <Link to="/register" className="btn btn-primary btn-sm">注册</Link>
          </>
        )}
      </div>
    </div>
  );
}
