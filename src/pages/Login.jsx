import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useContext(AuthContext);
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.login.messages.loginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-6">{t('auth.login.title')}</h1>
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">{t('auth.login.form.username')}</span>
              </label>
              <input
                type="text"
                placeholder={t('auth.login.form.usernamePlaceholder')}
                className="input input-bordered"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">{t('auth.login.form.password')}</span>
              </label>
              <input
                type="password"
                placeholder={t('auth.login.form.passwordPlaceholder')}
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <span className="loading loading-spinner"></span> : t('auth.login.buttons.login')}
              </button>
            </div>
          </form>
          <p className="text-center mt-4">
            {t('auth.login.messages.noAccount')}{' '}
            <Link to="/register" className="link link-primary">
              {t('auth.login.buttons.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;