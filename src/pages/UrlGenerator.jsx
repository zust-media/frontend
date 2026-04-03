import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Copy, Check, Link } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import config from '../config';

function UrlGenerator() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [filename, setFilename] = useState('');
  const [enableWidth, setEnableWidth] = useState(true);
  const [enableHeight, setEnableHeight] = useState(false);
  const [enableQuality, setEnableQuality] = useState(true);
  const [enableWatermark, setEnableWatermark] = useState(false);
  const [width, setWidth] = useState('300');
  const [height, setHeight] = useState('');
  const [quality, setQuality] = useState('80');
  const [watermark, setWatermark] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [unsignedUrl, setUnsignedUrl] = useState('');
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const generateUrl = async () => {
    if (!filename) {
      setError(t('common.messages.error'));
      return;
    }

    setLoading(true);
    setError('');

    const params = {};
    if (enableWidth && width) params.width = width;
    if (enableHeight && height) params.height = height;
    if (enableQuality && quality) params.quality = quality;
    if (enableWatermark && watermark) params.watermark = watermark;

    try {
      const response = await fetch(`${config.api.baseUrl}/api/tools/generate-image-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          filename,
          ...params
        })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedUrl(data.data.signedUrl);
        setUnsignedUrl(data.data.unsignedUrl);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(t('common.messages.error'));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>{t('errors.forbidden')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Link size={24} />
        {t('urlGenerator.title')}
      </h1>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">{t('urlGenerator.filename')}</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="example.jpg"
            />
          </div>

          <div className="divider">{t('urlGenerator.parameters')}</div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={enableWidth}
                  onChange={(e) => setEnableWidth(e.target.checked)}
                />
                <span className="label-text">{t('urlGenerator.width')}</span>
              </label>
              <input
                type="number"
                className={`input input-bordered ${!enableWidth ? 'opacity-50' : ''}`}
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="300"
                disabled={!enableWidth}
              />
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={enableHeight}
                  onChange={(e) => setEnableHeight(e.target.checked)}
                />
                <span className="label-text">{t('urlGenerator.height')}</span>
              </label>
              <input
                type="number"
                className={`input input-bordered ${!enableHeight ? 'opacity-50' : ''}`}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={t('common.labels.all')}
                disabled={!enableHeight}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={enableQuality}
                  onChange={(e) => setEnableQuality(e.target.checked)}
                />
                <span className="label-text">{t('urlGenerator.quality')}</span>
              </label>
              <input
                type="number"
                className={`input input-bordered ${!enableQuality ? 'opacity-50' : ''}`}
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                min="1"
                max="100"
                disabled={!enableQuality}
              />
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={enableWatermark}
                  onChange={(e) => setEnableWatermark(e.target.checked)}
                />
                <span className="label-text">{t('urlGenerator.watermark')}</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${!enableWatermark ? 'opacity-50' : ''}`}
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                placeholder="m.png"
                disabled={!enableWatermark}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={generateUrl}
            disabled={loading || !filename}
          >
            {loading ? <span className="loading loading-spinner"></span> : t('urlGenerator.generate')}
          </button>

          {generatedUrl && (
            <div className="mt-6">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">{t('urlGenerator.signedUrl')}</span>
                </label>
                <div className="join w-full">
                  <input
                    type="text"
                    className="input input-bordered join-item flex-1 font-mono text-sm"
                    value={generatedUrl}
                    readOnly
                  />
                  <button
                    className={`btn join-item ${copied === 'signed' ? 'btn-success' : 'btn-outline'}`}
                    onClick={() => copyToClipboard(generatedUrl, 'signed')}
                  >
                    {copied === 'signed' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('urlGenerator.unsignedUrl')}</span>
                </label>
                <div className="join w-full">
                  <input
                    type="text"
                    className="input input-bordered join-item flex-1 font-mono text-sm"
                    value={unsignedUrl}
                    readOnly
                  />
                  <button
                    className={`btn join-item ${copied === 'unsigned' ? 'btn-success' : 'btn-outline'}`}
                    onClick={() => copyToClipboard(unsignedUrl, 'unsigned')}
                  >
                    {copied === 'unsigned' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <label className="label">
                  <span className="label-text-alt text-error">{t('urlGenerator.unsignedWarning')}</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UrlGenerator;