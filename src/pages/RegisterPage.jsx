import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiImage, FiUser, FiLock, FiUserPlus, FiLoader, FiAlertCircle, FiRefreshCw, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form');

  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(true);

  const { register, superAdminExists } = useAuth();
  const navigate = useNavigate();

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const data = await api.getCaptcha();
      setCaptchaKey(data.captchaKey);
      setCaptchaImage(data.captchaImage);
      setCaptchaAnswer('');
    } catch (err) {
      toast.error(err.message || '加载验证码失败');
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = username.trim();
    if (!name) { toast.error('请输入用户名'); return; }
    if (name.length < 3) { toast.error('用户名至少3个字符'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) { toast.error('用户名只能包含字母、数字和下划线'); return; }
    if (password.length < 6) { toast.error('密码至少6个字符'); return; }
    if (password !== confirmPassword) { toast.error('两次输入的密码不一致'); return; }
    if (!captchaAnswer.trim()) { toast.error('请输入验证码答案'); return; }

    setLoading(true);

    try {
      setStep('verifying');
      const verifyResult = await api.verifyCaptcha(captchaKey, captchaAnswer.trim());

      setStep('registering');
      await register(name, password, verifyResult.regToken);

      toast.success('注册成功，请登录');
      navigate('/login');
    } catch (err) {
      const msg = err.message || '注册失败';
      toast.error(msg);
      fetchCaptcha();
    } finally {
      setLoading(false);
      setStep('form');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body p-8">
          <div className="text-center mb-4">
            <FiImage className="mx-auto text-4xl text-primary mb-2" />
            <h2 className="text-2xl font-bold">创建账号</h2>
            <p className="text-base-content/60 text-sm mt-1">
              {superAdminExists === false ? '欢迎使用 ZustMedia！请注册超级管理员账户以开始使用' : '注册加入 ZustMedia 图库系统'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend font-medium flex items-center gap-1">
                <FiUser size={14} /> 用户名
              </legend>
              <input
                type="text"
                className="input  w-full"
                placeholder="3-30位字母、数字或下划线"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                disabled={loading}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend font-medium flex items-center gap-1">
                <FiLock size={14} /> 密码
              </legend>
              <input
                type="password"
                className="input  w-full"
                placeholder="至少6个字符"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend font-medium flex items-center gap-1">
                <FiLock size={14} /> 确认密码
              </legend>
              <input
                type="password"
                className="input  w-full"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend font-medium flex items-center gap-1">
                <FiShield size={14} /> 验证码
              </legend>

              {captchaLoading ? (
                <div className="flex items-center justify-center h-[50px] bg-base-200 rounded-lg">
                  <span className="loading loading-spinner loading-xs"></span>
                </div>
              ) : captchaImage ? (
                <div
                  className="bg-base-200 rounded-lg p-2 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity border border-base-300"
                  onClick={fetchCaptcha}
                  title="点击刷新验证码"
                >
                  <img
                    src={`data:image/svg+xml;base64,${captchaImage}`}
                    alt="验证码"
                    className="h-[50px] w-auto"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[50px] bg-base-200 rounded-lg text-base-content/40 text-xs">
                  加载失败
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  className="input  input-sm flex-1"
                  placeholder="输入验证码结果"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square flex-shrink-0"
                  onClick={fetchCaptcha}
                  disabled={loading}
                  title="刷新验证码"
                >
                  <FiRefreshCw size={16} className={captchaLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </fieldset>

            <div className={`alert py-2 text-sm ${superAdminExists === false ? 'alert-warning' : 'alert-info'}`}>
              <FiAlertCircle />
              <span>{superAdminExists === false ? '您正在注册超级管理员账户，注册后即可管理整个系统' : '注册后默认为普通用户，管理员需由现有管理员手动设置'}</span>
            </div>

            <button className="btn btn-primary w-full gap-2" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  {step === 'verifying' ? '验证中...' : '注册中...'}
                </>
              ) : (
                <>
                  <FiUserPlus />
                  注册
                </>
              )}
            </button>
          </form>

          {superAdminExists !== false && (
          <p className="text-center text-sm text-base-content/60">
            已有账号？{' '}
            <Link to="/login" className="text-primary hover:underline">
              立即登录
            </Link>
          </p>
          )}
        </div>
      </div>
    </div>
  );
}
