import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiDownload, FiCamera, FiInfo, FiMaximize, FiClock, FiMapPin, FiAperture, FiZap, FiCopy, FiLink, FiCheck, FiTool, FiFolder } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useMetadata } from '../context/MetadataContext';
import TagBadge from './TagBadge';
import UserDisplay from './UserDisplay';

const exifLabels = {
  make: '相机制造商',
  model: '相机型号',
  lens: '镜头',
  focalLength: '焦距',
  aperture: '光圈',
  shutterSpeed: '快门速度',
  iso: '感光度',
  dateTaken: '拍摄时间',
  flash: '闪光灯',
  exposureCompensation: '曝光补偿',
  gps: 'GPS 位置',
  dimensions: '分辨率',
  software: '软件',
  copyright: '版权',
};

const exifIcons = {
  make: FiCamera,
  model: FiCamera,
  lens: FiCamera,
  focalLength: FiMaximize,
  aperture: FiAperture,
  shutterSpeed: FiClock,
  iso: FiZap,
  dateTaken: FiClock,
  flash: FiZap,
  exposureCompensation: FiAperture,
  gps: FiMapPin,
  dimensions: FiMaximize,
  software: FiInfo,
  copyright: FiInfo,
};

const PRESETS = [
  { label: '缩略图', icon: '🖼', w: 480, q: 75 },
  { label: '小图', icon: '📱', w: 800, q: 80 },
  { label: '中图', icon: '💻', w: 1600, q: 85 },
  { label: '大图', icon: '🖥', w: 2560, q: 85 },
  { label: '原画质', icon: '🎯', q: 100 },
  { label: '下载', icon: '⬇', q: 85, dl: '1' },
  { label: '加水印', icon: '🔏', w: 1600, q: 85, m: 'watermark.png' },
];

function DevLinkPanel({ image, visible }) {
  const [customW, setCustomW] = useState('');
  const [customQ, setCustomQ] = useState('85');
  const [customM, setCustomM] = useState('');
  const [generatedLinks, setGeneratedLinks] = useState([]);
  const [loadingIdx, setLoadingIdx] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const filename = image?.filename;

  const generateLink = useCallback(async (params, label) => {
    if (!filename) return;
    setLoadingIdx(label);
    try {
      const data = await api.signUrl(filename, params);
      setGeneratedLinks((prev) => {
        const filtered = prev.filter((l) => l.label !== label);
        return [{ ...data, label }, ...filtered];
      });
    } catch {
      toast.error('生成链接失败');
    } finally {
      setLoadingIdx(null);
    }
  }, [filename]);

  const handlePreset = (preset) => {
    const { label, ...params } = preset;
    generateLink(params, label);
  };

  const handleCustom = () => {
    const params = {};
    if (customW) params.w = parseInt(customW);
    if (customQ) params.q = parseInt(customQ);
    if (customM) params.m = customM;
    const label = `${customW || '原宽'}px / Q${customQ || '85'}${customM ? ' +水印' : ''}`;
    generateLink(params, label);
  };

  const copyLink = async (url, label) => {
    try {
      await navigator.clipboard.writeText(api.resolveImageUrl(url));
      setCopiedIdx(label);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  if (!visible) return null;

  return (
    <>
      <div className="divider my-1 text-xs text-base-content/40">开发者工具</div>

      <div className="grid grid-cols-3 gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className="btn btn-xs btn-outline gap-1"
            disabled={loadingIdx === p.label}
            onClick={() => handlePreset(p)}
          >
            {loadingIdx === p.label ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <span className="text-xs">{p.icon}</span>
            )}
            <span className="text-xs truncate">{p.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-1.5 bg-base-200 rounded-lg p-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-base-content/50 w-5">W</span>
          <input
            type="number"
            className="input input-xs  flex-1"
            placeholder="宽度 (px)"
            value={customW}
            onChange={(e) => setCustomW(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-base-content/50 w-5">Q</span>
          <input
            type="range"
            min="1"
            max="100"
            value={customQ}
            onChange={(e) => setCustomQ(e.target.value)}
            className="range range-xs range-primary flex-1"
          />
          <span className="text-xs text-base-content/60 w-7 text-right">{customQ}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-base-content/50 w-5">M</span>
          <input
            type="text"
            className="input input-xs  flex-1"
            placeholder="水印文件名(可选)"
            value={customM}
            onChange={(e) => setCustomM(e.target.value)}
          />
        </div>
        <button
          className="btn btn-xs btn-primary w-full"
          onClick={handleCustom}
        >
          <FiLink size={12} />
          生成链接
        </button>
      </div>

      {generatedLinks.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {generatedLinks.map((link) => (
            <div key={link.label} className="bg-base-200 rounded-lg p-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium truncate flex-1 mr-1">{link.label}</span>
                <button
                  className="btn btn-xs btn-ghost btn-square"
                  onClick={() => copyLink(link.url, link.label)}
                  title="复制链接"
                >
                  {copiedIdx === link.label ? <FiCheck size={12} className="text-success" /> : <FiCopy size={12} />}
                </button>
              </div>
              <code className="text-xs text-base-content/60 break-all block select-all">
                {link.url}
              </code>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function Lightbox({ image, devMode, onClose }) {
  const { user } = useAuth();
  const { getCategoryName, categoryMap } = useMetadata();
  const [loadedImageId, setLoadedImageId] = useState(null);
  const [devPanelVisible, setDevPanelVisible] = useState(false);
  const [imgStyle, setImgStyle] = useState({});
  const viewRef = useRef(null);

  useEffect(() => {
    setDevPanelVisible(!!devMode);
  }, [devMode]);

  useEffect(() => {
    setLoadedImageId(null);
    setImgStyle({});
  }, [image?.id]);

  const previewUrl = image ? api.getPreviewUrl(image.filename, image.preview_url) : '';
  const thumbUrl = image ? api.getThumbUrl(image.filename, image.thumbnail_url) : '';
  const downloadUrl = image ? api.getDownloadUrl(image.filename, image.download_url) : '';
  const exif = image?.exif || {};
  const hasExif = Object.keys(exif).length > 0;
  const imageLoaded = loadedImageId === image?.id;

  const handleImageLoad = (e) => {
    const img = e.target;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const view = viewRef.current;
    if (!view || !natW || !natH) return;
    const maxW = view.clientWidth;
    const maxH = view.clientHeight;
    const scale = Math.min(maxW / natW, maxH / natH);
    setImgStyle({ width: Math.round(natW * scale), height: Math.round(natH * scale) });
    setLoadedImageId(image?.id);
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.scrollbarGutter = 'auto';
    document.body.style.overflow = 'hidden';
    document.body.style.scrollbarGutter = 'auto';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.documentElement.style.overflow = '';
      document.documentElement.style.scrollbarGutter = '';
      document.body.style.overflow = '';
      document.body.style.scrollbarGutter = '';
    };
  }, [handleKeyDown]);

  if (!image) return null;

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatMP = () => {
    const dims = exif?.dimensions;
    if (!dims) return null;
    const match = String(dims).match(/(\d+)\s*[x×]\s*(\d+)/i);
    if (!match) return null;
    const mp = (parseInt(match[1]) * parseInt(match[2])) / 1000000;
    return mp.toFixed(1) + 'MP';
  };

  return (
    <div className="modal modal-open z-[9999]" onClick={onClose}>
      <div
        className="modal-box max-w-[95vw] w-auto max-h-[95vh] h-auto p-0 overflow-y-auto lg:overflow-hidden bg-base-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-4 py-2 bg-base-200 border-b border-base-300 flex-shrink-0">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="font-bold text-sm truncate">{image.title || image.original_name}</h3>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {devMode && (
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setDevPanelVisible((v) => !v)}
                title={devPanelVisible ? '隐藏开发者工具' : '显示开发者工具'}
              >
                <FiTool size={18} className={devPanelVisible ? 'text-primary' : ''} />
              </button>
            )}
            {user && (
              <a
                href={downloadUrl}
                download={image.original_name}
                className="btn btn-ghost btn-sm btn-circle"
                title="下载"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiDownload size={18} />
              </a>
            )}
            <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose} title="关闭 (Esc)">
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* 主体：图片 + 信息面板 */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          <div
            ref={viewRef}
            className="flex-1 flex items-center justify-center min-h-[50vh] lg:min-h-0 relative"
          >
            {!imageLoaded && (
              <img
                src={thumbUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl scale-105"
              />
            )}

            {!imageLoaded && (
              <span className="loading loading-spinner loading-lg text-primary absolute z-10"></span>
            )}

            <img
              key={image?.id}
              src={previewUrl}
              alt={image.title || image.original_name}
              className="block transition-opacity duration-300"
              style={{ opacity: imageLoaded ? 1 : 0, ...imgStyle }}
              onLoad={handleImageLoad}
            />
          </div>

        <div className="w-full lg:w-80 bg-base-100 overflow-y-auto flex-shrink-0 border-t lg:border-t-0 lg:border-l border-base-300">
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-bold text-base truncate">{image.title || image.original_name}</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {Array.isArray(image.tags) && image.tags.map((tagId) => (
                  <TagBadge key={tagId} tagId={tagId} />
                ))}
              </div>
              <div className="text-xs text-base-content/50 mt-2 space-y-0.5">
                <div className="flex items-center gap-1">上传者: <UserDisplay uuid={image.uploader_uuid} className="text-xs" /></div>
                {image.category_id && (
                  <div className="flex items-center gap-1">
                    分类:{' '}
                    {categoryMap[image.category_id]?.slug ? (
                      <Link
                        to={`/category/${categoryMap[image.category_id].slug}`}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <FiFolder size={10} />
                        {getCategoryName(image.category_id)}
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1">
                        <FiFolder size={10} />
                        {getCategoryName(image.category_id)}
                      </span>
                    )}
                  </div>
                )}
                <div>文件名: {image.original_name}</div>
                <div>类型: {image.mime_type}</div>
                <div>大小: {formatSize(image.file_size)}</div>
                {formatMP() && <div>像素量: {formatMP()}</div>}
                <div>上传时间: {image.created_at}</div>
              </div>
            </div>

            {hasExif && (
              <>
                <div className="divider my-1 text-xs text-base-content/40">文件信息</div>
                <div className="space-y-2">
                  {Object.entries(exifLabels).map(([key, label]) => {
                    const value = exif[key];
                    if (!value) return null;
                    const Icon = exifIcons[key] || FiInfo;
                    return (
                      <div key={key} className="flex items-start gap-2 text-sm">
                        <Icon size={14} className="text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-base-content/40">{label}</div>
                          <div className="text-base-content/80 break-all">{value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {!hasExif && (
              <>
                <div className="divider my-1 text-xs text-base-content/40">文件信息</div>
                <div className="text-xs text-base-content/30 text-center py-2">
                  此图片不包含 EXIF 信息，或信息已被移除
                </div>
              </>
            )}

            <DevLinkPanel image={image} visible={devPanelVisible} key={image?.id} />
          </div>
        </div>
        </div>
      </div>

      <div className="modal-backdrop">
        <button className="cursor-default">关闭</button>
      </div>
    </div>
  );
}
