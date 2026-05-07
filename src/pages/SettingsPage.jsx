import { useState } from 'react';
import { FiSave, FiUser, FiLink, FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [slug, setSlug] = useState(user?.slug || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyUuid = async () => {
    try {
      await navigator.clipboard.writeText(user?.uuid || '');
      setCopied(true);
      toast.success('UUID 已复制');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({ nickname, slug, bio });
      await refreshUser();
      toast.success('设置已保存');
    } catch (err) {
      toast.error(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <FiUser />
        个人设置
      </h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-base">基本信息</h2>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">用户名</legend>
              <input
                type="text"
                className="input "
                value={user.username}
                disabled
              />
              <p className="fieldset-label text-base-content/40">用户名注册后不可修改</p>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">昵称</legend>
              <input
                type="text"
                className="input "
                placeholder="设置显示名称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={50}
              />
              <p className="fieldset-label text-base-content/40">显示在个人主页和评论中的名称</p>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">UUID</legend>
              <div className="join w-full">
                <input
                  type="text"
                  className="input  input-sm join-item flex-1 font-mono text-xs"
                  value={user.uuid || ''}
                  readOnly
                />
                <button
                  type="button"
                  className="btn btn-outline btn-sm join-item"
                  onClick={copyUuid}
                >
                  {copied ? <FiCheck size={14} className="text-success" /> : <FiCopy size={14} />}
                </button>
              </div>
              <p className="fieldset-label text-base-content/40">可通过 /user/{'{UUID}'} 访问你的主页</p>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">个性签名</legend>
              <textarea
                className="textarea "
                placeholder="介绍一下自己..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                rows={3}
              />
              <p className="fieldset-label text-base-content/40">{bio.length}/200</p>
            </fieldset>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-base flex items-center gap-2">
              <FiLink />
              个性地址
            </h2>
            <p className="text-sm text-base-content/60">
              设置后可通过 <code className="text-primary bg-base-200 px-1 rounded">/user/{'{你的地址}'}</code> 访问你的主页
            </p>
            <fieldset className="fieldset">
              <div className="input  flex items-center gap-2">
                <span className="text-base-content/40 text-sm">/user/</span>
                <input
                  type="text"
                  className="flex-1 min-w-0 bg-transparent outline-none"
                  placeholder="留空使用 UUID"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                  maxLength={40}
                />
              </div>
              <p className="fieldset-label text-base-content/40">只能包含字母、数字、连字符和下划线，最长40个字符</p>
            </fieldset>
          </div>
        </div>

        <button
          className="btn btn-primary w-full"
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              保存中...
            </>
          ) : (
            <>
              <FiSave size={16} />
              保存设置
            </>
          )}
        </button>
      </form>
    </div>
  );
}
