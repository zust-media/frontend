import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '../../services/adminService';

function Settings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ show: false, type: '', text: '' });

  const [thumbnail, setThumbnail] = useState({ defaultWidth: 300, defaultQuality: 80 });
  const [watermark, setWatermark] = useState({
    marginX: 0.04,
    marginY: 0.04,
    opacity: 0.8,
    sizeRatio: 0.1,
    position: 'bottom-left'
  });
  const [upload, setUpload] = useState({
    maxFileSize: 104857600,
    allowedTypes: []
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminService.getSettings();
      const data = response.data.data;
      setSettings(data);
      if (data.thumbnail) setThumbnail(data.thumbnail);
      if (data.watermark) setWatermark(data.watermark);
      if (data.upload) setUpload(data.upload);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateSettings({
        thumbnail,
        watermark,
        upload
      });
      setMessage({ show: true, type: 'success', text: t('admin.settings.saved') });
      setTimeout(() => setMessage({ show: false, type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ show: true, type: 'error', text: t('admin.settings.saveFailed') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('admin.settings.title')}</h1>

      {message.show && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">{t('admin.settings.thumbnail')}</h2>
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('admin.settings.defaultWidth')}</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={thumbnail.defaultWidth}
                onChange={(e) => setThumbnail({ ...thumbnail, defaultWidth: parseInt(e.target.value) })}
                min={100}
                max={2000}
              />
            </div>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">{t('admin.settings.defaultQuality')}</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={thumbnail.defaultQuality}
                onChange={(e) => setThumbnail({ ...thumbnail, defaultQuality: parseInt(e.target.value) })}
                min={10}
                max={100}
              />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">{t('admin.settings.watermark')}</h2>
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('admin.settings.watermarkPosition')}</span>
              </label>
              <select
                className="select select-bordered"
                value={watermark.position}
                onChange={(e) => setWatermark({ ...watermark, position: e.target.value })}
              >
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
                <option value="center-left">Center Left</option>
                <option value="center">Center</option>
                <option value="center-right">Center Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('admin.settings.marginX')}</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input input-bordered"
                  value={watermark.marginX}
                  onChange={(e) => setWatermark({ ...watermark, marginX: parseFloat(e.target.value) })}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('admin.settings.marginY')}</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input input-bordered"
                  value={watermark.marginY}
                  onChange={(e) => setWatermark({ ...watermark, marginY: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('admin.settings.watermarkOpacity')}</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="input input-bordered"
                  value={watermark.opacity}
                  onChange={(e) => setWatermark({ ...watermark, opacity: parseFloat(e.target.value) })}
                  min={0}
                  max={1}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('admin.settings.watermarkSize')}</span>
                </label>
                <input
                  type="number"
                  step="0.05"
                  className="input input-bordered"
                  value={watermark.sizeRatio}
                  onChange={(e) => setWatermark({ ...watermark, sizeRatio: parseFloat(e.target.value) })}
                  min={0.05}
                  max={1}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">{t('admin.settings.upload')}</h2>
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('admin.settings.maxFileSize')} (bytes)</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={upload.maxFileSize}
                onChange={(e) => setUpload({ ...upload, maxFileSize: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          className={`btn btn-primary ${saving ? 'loading' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '' : t('admin.settings.save')}
        </button>
      </div>
    </div>
  );
}

export default Settings;