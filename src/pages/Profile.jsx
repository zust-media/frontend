import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Profile() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isRegeneratingToken, setIsRegeneratingToken] = useState(false);
  const [tokenSuccess, setTokenSuccess] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [slugStatus, setSlugStatus] = useState(null);
  const [newSlug, setNewSlug] = useState('');
  const [slugSuccess, setSlugSuccess] = useState('');
  const [slugError, setSlugError] = useState('');
  const [isUpdatingSlug, setIsUpdatingSlug] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenConfirmPassword, setTokenConfirmPassword] = useState('');
  const [tokenModalError, setTokenModalError] = useState('');

  useEffect(() => {
    fetchCurrentUser();
    fetchSlugStatus();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      setCurrentUser(response.data.data);
      if (response.data.data.apiToken) {
        updateUser(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch current user');
    }
  };

  const fetchSlugStatus = async () => {
    try {
      const response = await authService.getSlugStatus();
      setSlugStatus(response.data.data);
      setNewSlug(response.data.data.slug || '');
    } catch (err) {
      console.error('Failed to fetch slug status');
    }
  };

  const handleCopyToken = async () => {
    const token = currentUser?.apiToken || user?.apiToken;
    if (token) {
      try {
        await navigator.clipboard.writeText(token);
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      } catch (err) {
        console.error('Failed to copy token');
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError(t('profile.password.mismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t('profile.password.tooShort'));
      return;
    }

    setIsLoadingPassword(true);

    try {
      await authService.changePassword(oldPassword, newPassword);
      setPasswordSuccess(t('profile.password.changeSuccess'));
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || t('profile.password.changeFailed'));
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleRegenerateTokenClick = () => {
    setShowTokenModal(true);
    setTokenConfirmPassword('');
    setTokenModalError('');
  };

  const handleConfirmRegenerateToken = async () => {
    if (!tokenConfirmPassword) {
      setTokenModalError(t('profile.apiToken.enterPassword'));
      return;
    }

    setIsRegeneratingToken(true);
    setTokenModalError('');

    try {
      await authService.changePassword(tokenConfirmPassword, tokenConfirmPassword);
    } catch (err) {
      if (err.response?.data?.message === '当前密码错误' || err.response?.status === 401) {
        setTokenModalError(t('profile.apiToken.incorrectPassword'));
        setIsRegeneratingToken(false);
        return;
      }
    }

    try {
      const response = await authService.regenerateToken();
      const newApiToken = response.data.data?.apiToken;
      if (newApiToken) {
        const updatedUser = { ...currentUser, apiToken: newApiToken };
        setCurrentUser(updatedUser);
        updateUser(updatedUser);
      }
      setTokenSuccess(t('profile.apiToken.regenerateSuccess'));
      setShowTokenModal(false);
      setTokenConfirmPassword('');
    } catch (err) {
      setTokenError(err.response?.data?.message || t('profile.apiToken.regenerateFailed'));
    } finally {
      setIsRegeneratingToken(false);
    }
  };

  const handleSlugUpdate = async (e) => {
    e.preventDefault();
    setSlugError('');
    setSlugSuccess('');

    if (!newSlug.trim()) {
      setSlugError(t('profile.slug.invalidSlug'));
      return;
    }

    if (newSlug === slugStatus?.slug) {
      setSlugError(t('profile.slug.sameSlug'));
      return;
    }

    setIsUpdatingSlug(true);

    try {
      await authService.updateSlug(newSlug);
      setSlugSuccess(t('profile.slug.updateSuccess'));
      fetchSlugStatus();
      const response = await authService.getCurrentUser();
      updateUser(response.data.data);
    } catch (err) {
      setSlugError(err.response?.data?.message || t('profile.slug.updateFailed'));
    } finally {
      setIsUpdatingSlug(false);
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (!newEmail.trim()) {
      setEmailError(t('profile.email.invalidEmail'));
      return;
    }

    if (!emailPassword) {
      setEmailError(t('profile.email.enterPassword'));
      return;
    }

    setIsUpdatingEmail(true);

    try {
      await authService.changeEmail(newEmail, emailPassword);
      setEmailSuccess(t('profile.email.updateSuccess'));
      setNewEmail('');
      setEmailPassword('');
      fetchCurrentUser();
    } catch (err) {
      setEmailError(err.response?.data?.message || t('profile.email.updateFailed'));
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>

      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title mb-4">{t('profile.info.title')}</h2>
          <div className="space-y-2">
            <p><span className="font-semibold">{t('profile.info.username')}:</span> {user?.username}</p>
            <p><span className="font-semibold">{t('profile.info.email')}:</span> {user?.email}</p>
            <p><span className="font-semibold">{t('profile.info.role')}:</span> {user?.role || 'user'}</p>
            <p><span className="font-semibold">{t('profile.info.profileUrl')}:</span> /u/{user?.slug || user?.id}</p>
          </div>
          <div className="divider">{t('profile.email.title')}</div>
          <form onSubmit={handleEmailUpdate}>
            <div className="form-control mb-2">
              <label className="label">
                <span className="label-text">{t('profile.email.newEmail')}</span>
              </label>
              <input
                type="email"
                className="input input-bordered"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={t('profile.email.newEmailPlaceholder')}
              />
            </div>
            <div className="form-control mb-2">
              <label className="label">
                <span className="label-text">{t('profile.email.password')}</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder={t('profile.email.passwordPlaceholder')}
              />
            </div>
            {emailSuccess && <div className="alert alert-success mb-2"><span>{emailSuccess}</span></div>}
            {emailError && <div className="alert alert-error mb-2"><span>{emailError}</span></div>}
            <button type="submit" className="btn btn-primary btn-sm" disabled={isUpdatingEmail}>
              {isUpdatingEmail ? <span className="loading loading-spinner"></span> : t('profile.email.updateButton')}
            </button>
          </form>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title mb-4">{t('profile.slug.title')}</h2>
          <div className="form-control mb-2">
            <label className="label">
              <span className="label-text">{t('profile.slug.publicUrl')}</span>
            </label>
            <div className="input-group">
              <input
                type="text"
                className="input input-bordered flex-1 font-mono text-sm"
                value={`/u/${slugStatus?.slug || user?.id}`}
                readOnly
              />
            </div>
          </div>
          {slugStatus?.canUpdate === false && (
            <p className="text-xs text-base-content/50 mb-2">
              {t('profile.slug.waitMessage', { days: slugStatus?.daysUntilCanUpdate })}
            </p>
          )}
          <form onSubmit={handleSlugUpdate}>
            <div className="flex gap-2 items-end">
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text">{t('profile.slug.changeUrl')}</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered font-mono text-sm"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="your-slug"
                  disabled={!slugStatus?.canUpdate}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!slugStatus?.canUpdate || isUpdatingSlug}
              >
                {isUpdatingSlug ? <span className="loading loading-spinner loading-sm"></span> : t('common.buttons.update')}
              </button>
            </div>
          </form>
          {slugSuccess && <div className="alert alert-success mt-2"><span>{slugSuccess}</span></div>}
          {slugError && <div className="alert alert-error mt-2"><span>{slugError}</span></div>}
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title mb-4">{t('profile.apiToken.title')}</h2>
          <div className="form-control mb-4">
            <div className="join w-full">
              <input
                type="text"
                className="input input-bordered font-mono text-sm flex-1 join-item"
                value={currentUser?.apiToken || user?.apiToken || ''}
                readOnly
              />
              <button
                className={`btn join-item ${copiedToken ? 'btn-success' : 'btn-outline'}`}
                onClick={handleCopyToken}
                disabled={!currentUser?.apiToken && !user?.apiToken}
              >
                {copiedToken ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          {tokenSuccess && (
            <div className="alert alert-success mb-4">
              <span>{tokenSuccess}</span>
            </div>
          )}
          {tokenError && (
            <div className="alert alert-error mb-4">
              <span>{tokenError}</span>
            </div>
          )}
          <button
            className="btn btn-outline btn-primary"
            onClick={handleRegenerateTokenClick}
          >
            {t('profile.apiToken.regenerateConfirm')}
          </button>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">{t('profile.password.title')}</h2>
          {passwordSuccess && (
            <div className="alert alert-success mb-4">
              <span>{passwordSuccess}</span>
            </div>
          )}
          {passwordError && (
            <div className="alert alert-error mb-4">
              <span>{passwordError}</span>
            </div>
          )}
          <form onSubmit={handlePasswordChange}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">{t('profile.password.oldPassword')}</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">{t('profile.password.newPassword')}</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">{t('profile.password.confirmPassword')}</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoadingPassword}>
              {isLoadingPassword ? <span className="loading loading-spinner"></span> : t('common.buttons.save')}
            </button>
          </form>
        </div>
      </div>

      <dialog className={`modal ${showTokenModal ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">{t('profile.apiToken.confirmTitle')}</h3>
          <p className="py-4">{t('profile.apiToken.confirmMessage')}</p>
          {tokenModalError && (
            <div className="alert alert-error mb-4">
              <span>{tokenModalError}</span>
            </div>
          )}
          <div className="form-control">
            <input
              type="password"
              className="input input-bordered"
              placeholder={t('profile.apiToken.enterPassword')}
              value={tokenConfirmPassword}
              onChange={(e) => setTokenConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmRegenerateToken()}
            />
          </div>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setShowTokenModal(false)}>
              {t('common.buttons.cancel')}
            </button>
            <button
              className="btn btn-error"
              onClick={handleConfirmRegenerateToken}
              disabled={isRegeneratingToken}
            >
              {isRegeneratingToken ? <span className="loading loading-spinner"></span> : t('common.buttons.confirm')}
            </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={() => setShowTokenModal(false)} />
      </dialog>
    </div>
  );
}

export default Profile;