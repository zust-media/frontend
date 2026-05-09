import { useState, useEffect } from 'react';
import { FiSave, FiX, FiLoader, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useMetadata } from '../context/MetadataContext';
import TagBadge from './TagBadge';

export default function BatchEditModal({ ids, onClose, onSaved }) {
  const { tags: metaTags, getTagName, refresh: refreshMeta } = useMetadata();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [checkedTags, setCheckedTags] = useState(new Set());
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!ids || ids.length === 0) return;
    setLoading(true);
    api.getBatchInfo(ids)
      .then((data) => {
        setInfo(data);
        setCategoryId(data.common_category_id ?? '');
        setCheckedTags(new Set(data.common_tags || []));
      })
      .catch((err) => toast.error(err.message || '加载失败'))
      .finally(() => setLoading(false));
  }, [ids]);

  const toggleTag = (tagId) => {
    setCheckedTags((prev) => {
      const next = new Set(prev);
      next.has(tagId) ? next.delete(tagId) : next.add(tagId);
      return next;
    });
  };

  const addTagFromInput = async () => {
    const input = tagInput.trim().toLowerCase();
    if (!input) return;
    const match = metaTags.find(
      (t) => t.name.toLowerCase() === input || t.name.toLowerCase().includes(input)
    );
    if (match) {
      setCheckedTags((prev) => {
        const next = new Set(prev);
        next.add(match.id);
        return next;
      });
    } else {
      const originalInput = tagInput.trim();
      const computedSlug = /^[a-zA-Z0-9]+$/.test(originalInput)
        ? originalInput.toLowerCase()
        : originalInput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const slug = (computedSlug && !/^[0-9]+$/.test(computedSlug)) ? computedSlug : undefined;
      try {
        const result = await api.createTag(originalInput, slug);
        await refreshMeta();
        if (result.id) {
          setCheckedTags((prev) => {
            const next = new Set(prev);
            next.add(result.id);
            return next;
          });
        }
      } catch (err) {
        toast.error(err.message || '创建标签失败');
      }
    }
    setTagInput('');
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    if (!info) return;
    setSaving(true);

    const originalCommon = new Set(info.common_tags || []);
    const originalCategoryId = info.common_category_id ?? '';
    const newCategoryId = categoryId || '';

    const payload = {};

    if (newCategoryId !== String(originalCategoryId)) {
      payload.category_id = newCategoryId ? parseInt(newCategoryId) : null;
    }

    payload.is_public = isPublic;

    const addTags = [...checkedTags].filter((id) => !originalCommon.has(id));
    const removeTags = [...originalCommon].filter((id) => !checkedTags.has(id));

    if (addTags.length > 0) payload.add_tags = addTags;
    if (removeTags.length > 0) payload.remove_tags = removeTags;

    if (newCategoryId === String(originalCategoryId) && addTags.length === 0 && removeTags.length === 0) {
      delete payload.category_id;
    }

    try {
      const result = await api.batchUpdateImages([...ids], payload);
      toast.success(result.message);
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (!ids || ids.length === 0) return null;

  const suggestions = tagInput
    ? metaTags.filter((t) => t.name.toLowerCase().includes(tagInput.trim().toLowerCase()) && !checkedTags.has(t.id)).slice(0, 8)
    : [];

  return (
    <div className="modal modal-open z-[9999]" onClick={onClose}>
      <div className="modal-box max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">批量编辑 ({ids.length} 个)</h3>
          <button className="btn btn-sm btn-ghost btn-circle" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <FiLoader className="animate-spin text-primary text-2xl" />
          </div>
        ) : !info ? (
          <p className="text-center py-6 text-base-content/50">加载失败</p>
        ) : (
          <div className="space-y-5">
            <fieldset className="fieldset">
              <legend className="fieldset-legend font-medium">分类</legend>
              <select
                className="select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">{info.common_category_id === null ? '· 分类不一致 ·' : '（保持原有）'}</option>
                {(info.categories || []).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {info.common_category_id === null && (
                <p className="fieldset-label text-base-content/40">所选图片的分类各不相同，留空则不修改分类</p>
              )}
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
                <span className="label-text text-base-content/40 text-xs">允许未登录访客查看所选图片</span>
              </label>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend font-medium">标签</legend>

              <div className="relative mb-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-sm flex-1"
                    placeholder="输入标签名称后按回车添加"
                    value={tagInput}
                    onChange={(e) => { setTagInput(e.target.value); setShowSuggestions(true); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTagFromInput(); } }}
                    onFocus={() => tagInput && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  />
                  <button className="btn btn-sm btn-outline" onClick={addTagFromInput} type="button">
                    <FiPlus />
                  </button>
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-10 top-full mt-1 w-full bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                    {suggestions.map((t) => (
                      <li key={t.id} className="px-3 py-1.5 text-sm cursor-pointer hover:bg-base-200"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setTagInput('');
                          setCheckedTags((prev) => { const next = new Set(prev); next.add(t.id); return next; });
                        }}>
                        {t.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {checkedTags.size > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {[...checkedTags].map((tagId) => (
                    <TagBadge key={tagId} tagId={tagId} onRemove={() => toggleTag(tagId)} />
                  ))}
                </div>
              )}

              {info.all_tags.length === 0 && checkedTags.size === 0 ? (
                <p className="text-sm text-base-content/40 py-2">所选图片暂无标签</p>
              ) : info.all_tags.length > 0 ? (
                <div className="max-h-40 overflow-y-auto border border-base-300 rounded-lg p-3 space-y-1">
                  {info.all_tags.map((t) => {
                    const isCommon = (info.common_tags || []).includes(t.id);
                    const isChecked = checkedTags.has(t.id);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-base-200 ${
                          !isCommon && !isChecked ? 'text-base-content/40' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-xs checkbox-primary"
                          checked={isChecked}
                          onChange={() => toggleTag(t.id)}
                        />
                        <span className="text-sm">{getTagName(t.id)}</span>
                        {t.count < info.count && (
                          <span className="text-xs text-base-content/30 ml-auto">{t.count}/{info.count}</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              ) : null}

              <p className="fieldset-label text-base-content/40">
                勾选的标签将应用到所有选中图片
              </p>
            </fieldset>
          </div>
        )}

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>取消</button>
          <button
            className="btn btn-primary gap-2"
            onClick={handleSave}
            disabled={loading || saving}
          >
            {saving ? <span className="loading loading-spinner loading-sm"></span> : <FiSave size={16} />}
            保存
          </button>
        </div>
      </div>
      <div className="modal-backdrop">
        <button className="cursor-default">关闭</button>
      </div>
    </div>
  );
}
