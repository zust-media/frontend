import { useState, useRef, useEffect } from 'react';
import { FiUploadCloud, FiX, FiPlus, FiImage, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAppConfig } from '../context/AppConfigContext';
import { useMetadata } from '../context/MetadataContext';
import TagBadge from './TagBadge';

export default function ImageUploader({ onSuccess }) {
  const config = useAppConfig();
  const maxSize = config.maxFileSizeMB;
  const maxSizeBytes = config.maxFileSizeBytes;
  const maxBatch = config.maxBatchCount;
  const { tags: metaTags, refresh: refreshMeta } = useMetadata();

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagIds, setTagIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef(null);
  const blobUrlsRef = useRef(new Map());

  useEffect(() => {
    api.getCategories().then((d) => {
      const cats = d.categories || [];
      setCategories(cats);
      const uncat = cats.find((c) => c.id === 1);
      if (uncat) setCategoryId(String(uncat.id));
    }).catch(() => {});
  }, []);

  const getBlobUrl = (file) => {
    const map = blobUrlsRef.current;
    let url = map.get(file);
    if (!url) {
      url = URL.createObjectURL(file);
      map.set(file, url);
      return url;
    }
    return url;
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    addFiles(selected);
  };

  const addFiles = (selected) => {
    const validFiles = selected.filter((f) => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name}: 不是图片文件`);
        return false;
      }
      if (f.size > maxSizeBytes) {
        toast.error(`${f.name}: 文件超过${maxSize}MB`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => {
      const removed = prev[index];
      if (removed) {
        const url = blobUrlsRef.current.get(removed);
        if (url) {
          URL.revokeObjectURL(url);
          blobUrlsRef.current.delete(removed);
        }
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearAllFiles = () => {
    for (const url of blobUrlsRef.current.values()) {
      URL.revokeObjectURL(url);
    }
    blobUrlsRef.current.clear();
    setFiles([]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  };

  const addTag = async () => {
    const input = tagInput.trim();
    if (!input) return;
    const match = metaTags.find(
      (t) => t.name.toLowerCase() === input.toLowerCase()
    );
    if (match) {
      if (!tagIds.includes(match.id)) setTagIds([...tagIds, match.id]);
      setTagInput('');
      setShowSuggestions(false);
      return;
    }

    const computedSlug = /^[a-zA-Z0-9]+$/.test(input)
      ? input.toLowerCase()
      : input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const slug = (computedSlug && !/^[0-9]+$/.test(computedSlug)) ? computedSlug : undefined;

    try {
      const result = await api.createTag(input, slug);
      await refreshMeta();
      if (result.id) {
        setTagIds((prev) => prev.includes(result.id) ? prev : [...prev, result.id]);
      }
    } catch (err) {
      toast.error(err.message || '创建标签失败');
    }
    setTagInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tagId) => {
    setTagIds(tagIds.filter((id) => id !== tagId));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('请选择至少一个文件');
      return;
    }

    setUploading(true);

    try {
      if (files.length === 1) {
        const formData = new FormData();
        formData.append('file', files[0]);
        if (title) formData.append('title', title);
        if (tagIds.length > 0) formData.append('tags', JSON.stringify(tagIds));
        if (categoryId) formData.append('category_id', categoryId);
        await api.uploadImage(formData);
      } else {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });
        if (categoryId) formData.append('category_id', categoryId);
        await api.batchUpload(formData);
      }

      toast.success(files.length === 1 ? '上传成功！' : `成功上传 ${files.length} 个文件`);
      clearAllFiles();
      setTitle('');
      setTagIds([]);
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const previewFiles = files.slice(0, 10);
  const extraFiles = files.length > 10 ? files.slice(10) : [];

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-6">
        <h2 className="card-title text-lg mb-0 gap-2">
          <FiUploadCloud className="text-primary" />
          上传图片
        </h2>

        {files.length === 1 && (
          <fieldset className="fieldset">
            <legend className="fieldset-legend">标题</legend>
            <input
              type="text"
              className="input  input-sm"
              placeholder="输入图片标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </fieldset>
        )}

        <fieldset className="fieldset">
          <legend className="fieldset-legend">标签</legend>
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                className="input  input-sm flex-1"
                placeholder="输入标签后按回车"
                value={tagInput}
                onChange={(e) => { setTagInput(e.target.value); setShowSuggestions(true); }}
                onKeyDown={handleTagKeyDown}
                onFocus={() => tagInput && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
              <button className="btn btn-sm btn-outline" onClick={addTag} type="button">
                <FiPlus />
              </button>
            </div>
            {showSuggestions && tagInput && metaTags.filter((t) => t.name.toLowerCase().includes(tagInput.trim().toLowerCase()) && !tagIds.includes(t.id)).length > 0 && (
              <ul className="absolute z-10 top-full mt-1 w-full bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                {metaTags.filter((t) => t.name.toLowerCase().includes(tagInput.trim().toLowerCase()) && !tagIds.includes(t.id)).slice(0, 8).map((t) => (
                  <li key={t.id} className="px-3 py-1.5 text-sm cursor-pointer hover:bg-base-200"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!tagIds.includes(t.id)) setTagIds([...tagIds, t.id]);
                      setTagInput('');
                      setShowSuggestions(false);
                    }}>
                    {t.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {tagIds.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tagIds.map((tagId) => (
                <TagBadge key={tagId} tagId={tagId} onRemove={() => removeTag(tagId)} />
              ))}
            </div>
          )}
        </fieldset>

        {categories.length > 0 && (
          <fieldset className="fieldset">
            <legend className="fieldset-legend">分类</legend>
            <select
              className="select  select-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </fieldset>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-base-300 hover:border-primary/50 hover:bg-base-200'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <FiImage className="mx-auto text-3xl text-base-content/30 mb-2" />
          <p className="text-sm text-base-content/60">
            拖拽文件到此处，或 <span className="text-primary font-medium">点击选择</span>
          </p>
          <p className="text-xs text-base-content/40 mt-1">
            支持 JPG、PNG、GIF、WebP、SVG，单文件最大 {maxSize}MB，批量最多 {maxBatch} 个文件
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-base-content/60">
              已选择 {files.length} 个文件
              {files.length > 10 && (
                <span className="text-base-content/40 ml-1">（预览前 10 张）</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {previewFiles.map((file, index) => (
                <div key={`${file.name}-${file.size}-${file.lastModified}`} className="relative group">
                  <img
                    src={getBlobUrl(file)}
                    alt={file.name}
                    className="w-16 h-16 object-cover rounded-lg border border-base-300"
                  />
                  <button
                    className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  >
                    <FiX size={10} />
                  </button>
                  <p className="text-[10px] text-center truncate w-16 mt-1 text-base-content/60">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
            {extraFiles.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-base-content/60 bg-base-200 rounded-lg p-2 max-h-24 overflow-y-auto">
                {extraFiles.map((file, index) => (
                  <div key={`txt-${file.name}-${file.size}`} className="flex items-center gap-1">
                    <FiImage size={10} className="flex-shrink-0" />
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button
                      className="text-error hover:text-error/70 flex-shrink-0"
                      onClick={() => removeFile(index + 10)}
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
        >
          {uploading ? (
            <>
              <FiLoader className="animate-spin" />
              上传中...
            </>
          ) : (
            <>
              <FiUploadCloud />
              {files.length > 1 ? `批量上传 (${files.length})` : '上传'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
