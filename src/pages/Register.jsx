import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';

function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    captchaCode: '',
  });
  const [sessionToken, setSessionToken] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  const loadCaptcha = async () => {
    setIsPreparing(true);
    try {
      const response = await authService.prepareRegister();
      const { sessionToken, captcha } = response.data.data;
      setSessionToken(sessionToken);
      setCaptchaImage(captcha);
      setFormData({ ...formData, captchaCode: '' });
    } catch (err) {
      setError(err.response?.data?.message || t('common.messages.error'));
    } finally {
      setIsPreparing(false);
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.captchaCode) {
      setError(t('common.messages.error'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('profile.password.mismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('profile.password.tooShort'));
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        sessionToken,
        captchaCode: formData.captchaCode,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.register.messages.registerFailed'));
      if (err.response?.data?.message?.includes('验证码')) {
        loadCaptcha();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-6">{t('auth.register.title')}</h1>
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">{t('auth.register.form.username')}</span>
              </label>
              <input
                type="text"
                name="username"
                placeholder={t('auth.register.form.usernamePlaceholder')}
                className="input input-bordered"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">{t('auth.register.form.email')}</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder={t('auth.register.form.emailPlaceholder')}
                className="input input-bordered"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">{t('auth.register.form.password')}</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder={t('auth.register.form.passwordPlaceholder')}
                className="input input-bordered"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">{t('auth.register.form.confirmPassword')}</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder={t('auth.register.form.confirmPasswordPlaceholder')}
                className="input input-bordered"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">{t('auth.register.form.captcha')}</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="captchaCode"
                  placeholder={t('auth.register.form.captchaPlaceholder')}
                  className="input input-bordered flex-1"
                  value={formData.captchaCode}
                  onChange={handleChange}
                  maxLength={4}
                  required
                />
                <button
                  type="button"
                  onClick={loadCaptcha}
                  className="btn btn-outline"
                  disabled={isPreparing}
                >
                  {isPreparing ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: captchaImage }} className="h-8" />
                  )}
                </button>
              </div>
            </div>
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? <span className="loading loading-spinner"></span> : t('auth.register.buttons.register')}
              </button>
            </div>
          </form>
          <p className="text-center mt-4">
            {t('auth.register.messages.hasAccount')}{' '}
            <Link to="/login" className="link link-primary">
              {t('auth.register.buttons.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;