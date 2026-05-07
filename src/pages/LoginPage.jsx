import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiImage, FiUser, FiLock, FiLogIn, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error('请输入用户名和密码');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.success('登录成功！');
      navigate('/');
    } catch (err) {
      toast.error(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body p-8">
          <div className="text-center mb-4">
            <FiImage className="mx-auto text-4xl text-primary mb-2" />
            <h2 className="text-2xl font-bold">欢迎回来</h2>
            <p className="text-base-content/60 text-sm mt-1">登录 ZustMedia 图库系统</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend font-medium flex items-center gap-1">
                <FiUser size={14} /> 用户名
              </legend>
              <input
                type="text"
                className="input  w-full"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend font-medium flex items-center gap-1">
                <FiLock size={14} /> 密码
              </legend>
              <input
                type="password"
                className="input  w-full"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </fieldset>

            <button className="btn btn-primary w-full gap-2" type="submit" disabled={loading}>
              {loading ? <FiLoader className="animate-spin" /> : <FiLogIn />}
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="divider text-xs text-base-content/40">演示账号</div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-base-200 rounded-lg p-2">
              <div className="font-bold text-primary">admin</div>
              <div className="text-base-content/50">admin123</div>
              <div className="badge badge-warning badge-xs mt-1">管理员</div>
            </div>
            <div className="bg-base-200 rounded-lg p-2">
              <div className="font-bold">user</div>
              <div className="text-base-content/50">user123</div>
              <div className="badge badge-xs mt-1">普通用户</div>
            </div>
          </div>

          <p className="text-center text-sm text-base-content/60">
            还没有账号？{' '}
            <Link to="/register" className="text-primary hover:underline">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
