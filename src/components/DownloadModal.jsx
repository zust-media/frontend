import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function DownloadModal({
  imageUuids,
  downloadUrl,
  defaultName,
  onClose,
}) {
  const [format, setFormat] = useState('jpeg');
  const [quality, setQuality] = useState('85');
  const [width, setWidth] = useState('');
  const [watermark, setWatermark] = useState('');
  const [zipName, setZipName] = useState(defaultName || '');
  const [downloading, setDownloading] = useState(false);

  const buildParams = () => {
    const p = new URLSearchParams();
    if (format !== 'jpeg') p.set('format', format);
    if (quality !== '85') p.set('q', quality);
    if (width) p.set('w', width);
    if (watermark) p.set('m', watermark);
    if (zipName) p.set('filename', zipName);
    return p.toString();
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');

      if (downloadUrl) {
        const qs = buildParams();
        const url = qs ? `${downloadUrl}?${qs}` : downloadUrl;
        const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          throw new Error(data.error || '下载失败');
        }
        const blob = await resp.blob();
        triggerDownload(blob);
      } else if (imageUuids && imageUuids.length > 0) {
        const qs = buildParams();
        const url = qs ? `${api.batchDownloadUrl()}?${qs}` : api.batchDownloadUrl();
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ image_uuids: imageUuids }),
        });
        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          throw new Error(data.error || '下载失败');
        }
        const blob = await resp.blob();
        triggerDownload(blob);
      }
    } catch (err) {
      toast.error(err.message || '下载失败');
    } finally {
      setDownloading(false);
    }
  };

  const triggerDownload = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${zipName || 'download'}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FiDownload className="text-primary" />
          下载设置
        </h3>

        <div className="space-y-3">
          <div className="form-control">
            <label className="label pb-1"><span className="label-text text-xs">格式</span></label>
            <select className="select select-sm select-bordered" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label pb-1"><span className="label-text text-xs">质量 ({quality})</span></label>
            <input type="range" min="1" max="100" value={quality} className="range range-sm range-primary"
              onChange={(e) => setQuality(e.target.value)} />
          </div>

          <div className="form-control">
            <label className="label pb-1"><span className="label-text text-xs">宽度（像素，留空为自动）</span></label>
            <input type="number" placeholder="如 2048" className="input input-sm input-bordered w-full"
              value={width} onChange={(e) => setWidth(e.target.value)} />
          </div>

          <div className="form-control">
            <label className="label pb-1"><span className="label-text text-xs">水印文件（可选）</span></label>
            <input type="text" placeholder="水印文件名" className="input input-sm input-bordered w-full"
              value={watermark} onChange={(e) => setWatermark(e.target.value)} />
          </div>

          <div className="form-control">
            <label className="label pb-1"><span className="label-text text-xs">ZIP 文件名</span></label>
            <input type="text" placeholder="下载包名称" className="input input-sm input-bordered w-full"
              value={zipName} onChange={(e) => setZipName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDownload(); }} />
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>取消</button>
          <button className="btn btn-primary btn-sm gap-1" onClick={handleDownload} disabled={downloading}>
            {downloading ? <span className="loading loading-spinner loading-xs"></span> : <FiDownload size={14} />}
            开始下载
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}>
        <button className="opacity-0">关闭</button>
      </div>
    </div>
  );
}
