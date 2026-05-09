import { useState, useEffect, useRef } from 'react';
import { FiSave, FiX, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useMetadata } from '../context/MetadataContext';
import { api } from '../services/api';
import TagBadge from './TagBadge';
import UserDisplay from './UserDisplay';

export default function ImageEditor({ image, onClose, onSaved }) {
  const { tags: metaTags, categories: metaCats, getTagName, refresh } = useMetadata();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagIds, setTagIds] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const tagInputRef = useRef(null);

  const imageIdRef = useRef(null);

  useEffect(() => {
    if (image && image.id !== imageIdRef.current) {
      imageIdRef.current = image.id;
      setTitle(image.title || '');
      setDescription(image.description || '');
      setTagIds(Array.isArray(image.tags) ? image.tags.filter((id) => metaTags.some((t) => t.id === id)) : []);
      setCategoryId(image.category_id || '');
      setIsPublic(!!image.is_public);
    }
  }, [image, metaTags]);

  useEffect(() => {
    if (!image?.category_id && metaCats.length > 0) {
      setCategoryId(String(metaCats[0]?.id || ''));
    }
  }, [image, metaCats]);

  const addTag = async () => {
    const input = (tagInputRef.current?.value || '').trim();
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
      await refresh();
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateImage(image.id, {
        title,
        description,
        tags: tagIds,
        category_id: categoryId || null,
        is_public: isPublic,
      });
      toast.success('更新成功');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.message || '更新失败');
    } finally {
      setSaving(false);
    }
  };

  const suggestions = metaTags.filter(
    (t) => t.name.toLowerCase().includes(tagInput.trim().toLowerCase()) && !tagIds.includes(t.id)
  );
  if (!image) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">编辑图片信息</h3>
          <button className="btn btn-sm btn-ghost btn-circle" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <img
              src={api.getThumbUrl(null, image.thumbnail_url)}
              alt={image.title}
              className="w-32 h-32 object-cover rounded-lg border"
            />
            <div className="flex-1 text-sm space-y-1">
              <p><span className="text-base-content/60">原始文件名:</span> {image.original_name}</p>
              <p><span className="text-base-content/60">上传者:</span> <UserDisplay uuid={image.uploader_uuid} className="text-sm" /></p>
              <p><span className="text-base-content/60">大小:</span> {(image.file_size / 1024).toFixed(1)} KB</p>
              <p><span className="text-base-content/60">上传时间:</span> {image.created_at}</p>
            </div>
          </div>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-medium">分类</legend>
            <select
              className="select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {metaCats.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-medium">标题</legend>
            <input
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="图片标题"
            />
          </fieldset>

          <fieldset className="fieldset">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="label-text font-medium">公开图片</span>
              <span className="label-text text-base-content/40 text-xs">允许未登录访客查看此图片</span>
            </label>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-medium">描述</legend>
            <textarea
              className="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="图片描述"
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-medium">标签 (输入标签名搜索)</legend>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="输入标签名称"
                  value={tagInput}
                  ref={tagInputRef}
                  onChange={(e) => { setTagInput(e.target.value); setShowSuggestions(true); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  onFocus={() => tagInput && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
                <button className="btn btn-outline btn-sm" onClick={addTag} type="button">
                  <FiPlus />
                </button>
              </div>
              {showSuggestions && tagInput && suggestions.length > 0 && (
                <ul className="absolute z-10 top-full mt-1 w-full bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                  {suggestions.slice(0, 8).map((t) => (
                    <li
                      key={t.id}
                      className="px-3 py-1.5 text-sm cursor-pointer hover:bg-base-200"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (!tagIds.includes(t.id)) setTagIds([...tagIds, t.id]);
                        setTagInput('');
                        setShowSuggestions(false);
                      }}
                    >
                      {t.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {tagIds.map((tagId) => (
                <TagBadge key={tagId} tagId={tagId} onRemove={() => removeTag(tagId)} />
              ))}
            </div>
          </fieldset>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>取消</button>
          <button className="btn btn-primary gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-sm"></span> : <FiSave />}
            保存
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}>
        <button className="cursor-default">关闭</button>
      </div>
    </dialog>
  );
}
