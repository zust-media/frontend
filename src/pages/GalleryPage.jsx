import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiGrid, FiRefreshCw, FiChevronLeft, FiChevronRight, FiX, FiCheckSquare, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useMetadata } from '../context/MetadataContext';
import ImageCard from '../components/ImageCard';
import ImageEditor from '../components/ImageEditor';
import Lightbox from '../components/Lightbox';
import BatchEditModal from '../components/BatchEditModal';
import AddToGalleryModal from '../components/AddToGalleryModal';
import MultiSelectBar from '../components/MultiSelectBar';
import useDevTools from '../hooks/useDevTools';

const SORT_OPTIONS = [
  { value: 'upload_time', label: '上传时间' },
  { value: 'relevance', label: '关联度' },
  { value: 'created_time', label: '拍摄时间' },
  { value: 'name', label: '文件名称' },
  { value: 'filesize', label: '文件大小' },
];

export default function GalleryPage() {
  const { user } = useAuth();
  const { tags: allTags, categories: allCategories, refresh: refreshMeta } = useMetadata();
  const [images, setImages] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [editingImage, setEditingImage] = useState(null);
  const [showMyOnly, setShowMyOnly] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [devMode, setDevMode] = useDevTools();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLoadDone = useRef(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [showAddToGallery, setShowAddToGallery] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedTags, setSelectedTags] = useState([]);
  const [tagMatch, setTagMatch] = useState('any');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [sort, setSort] = useState('upload_time');
  const [sortOrder, setSortOrder] = useState('desc');

  const hasActiveFilters = selectedTags.length > 0 || filterCategoryId || sort !== 'upload_time' || sortOrder !== 'desc';

  const fetchImages = useCallback(async (isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    else setRefreshing(true);

    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (showMyOnly) params.my = '1';
      if (selectedTags.length > 0) {
        params.tags = selectedTags.join(',');
        params.tag_match = tagMatch;
      }
      if (filterCategoryId) params.category_id = filterCategoryId;
      params.sort = sort;
      params.sort_order = sortOrder;

      const data = await api.getImages(params);
      setImages(data.images);
      setTotalPages(data.pagination.total_pages);
    } catch (err) {
      toast.error(err.message || '加载失败');
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [page, search, showMyOnly, selectedTags, tagMatch, filterCategoryId, sort, sortOrder]);

  const refresh = useCallback(() => {
    fetchImages();
    refreshMeta();
  }, [fetchImages, refreshMeta]);

  useEffect(() => {
    fetchImages(!initialLoadDone.current);
    initialLoadDone.current = true;
  }, [fetchImages]);

  useEffect(() => {
    const handleReconnected = () => { refresh(); };
    window.addEventListener('zustmedia:reconnected', handleReconnected);
    return () => window.removeEventListener('zustmedia:reconnected', handleReconnected);
  }, [refresh]);

  useEffect(() => {
    const uuid = searchParams.get('image');
    if (!uuid || lightboxImage) return;
    api.getImageByUuid(uuid).then((img) => {
      setLightboxImage(img);
    }).catch(() => {
      toast.error('图片不存在或已被删除');
    });
  }, [searchParams, lightboxImage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const toggleSelectTag = (id) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setFilterCategoryId('');
    setSort('upload_time');
    setSortOrder('desc');
    setPage(1);
  };

  const handleDelete = async (image) => {
    if (!window.confirm(`确定要删除 "${image.title || image.original_name}" 吗？此操作不可撤销。`)) return;
    try {
      await api.deleteImage(image.id);
      toast.success('删除成功');
      refresh();
    } catch (err) {
      toast.error(err.message || '删除失败');
    }
  };

  const openLightbox = useCallback((image) => {
    setLightboxImage(image);
    setSearchParams(image.uuid ? { image: image.uuid } : {}, { replace: true });
  }, [setSearchParams]);

  const closeLightbox = useCallback(() => {
    setLightboxImage(null);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const toggleSelectMode = () => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  };

  const toggleSelectImage = useCallback((image) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(image.id)) next.delete(image.id);
      else next.add(image.id);
      return next;
    });
  }, []);

  const selectAll = () => setSelectedIds(new Set(images.map((img) => img.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定要删除选中的 ${selectedIds.size} 张图片吗？此操作不可撤销。`)) return;
    try {
      const result = await api.batchDeleteImages([...selectedIds]);
      toast.success(result.message || `成功删除 ${result.deleted} 张图片`);
      setSelectedIds(new Set());
      setSelectMode(false);
      refresh();
    } catch (err) {
      toast.error(err.message || '批量删除失败');
    }
  };

  return (
    <>
      <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="join w-full">
            <input
              type="text"
              className="input  join-item w-full"
              placeholder="搜索图片标题或文件名..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary join-item" type="submit">
              <FiSearch size={18} />
            </button>
            {search && (
              <button
                className="btn btn-ghost join-item"
                type="button"
                onClick={() => { setSearch(''); setPage(1); }}
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </form>

        <div className="relative">
          <button
            className={`btn btn-sm gap-1 ${filterOpen || hasActiveFilters ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterOpen((v) => !v)}
          >
            <FiFilter size={14} />
            筛选
            {hasActiveFilters && <span className="badge badge-xs ml-0.5">{selectedTags.length + (filterCategoryId ? 1 : 0)}</span>}
          </button>
        </div>

        {user && (
          <label className="label cursor-pointer gap-2">
            <span className="label-text text-sm">只看我的</span>
            <input
              type="checkbox"
              className="toggle toggle-sm toggle-primary"
              checked={showMyOnly}
              onChange={(e) => { setShowMyOnly(e.target.checked); setPage(1); }}
            />
          </label>
        )}

        {user && (
          <button
            className={`btn btn-sm gap-1 ${selectMode ? 'btn-primary' : 'btn-ghost'}`}
            onClick={toggleSelectMode}
          >
            <FiCheckSquare size={14} />
            多选
          </button>
        )}

        <button className="btn btn-ghost btn-sm gap-1" onClick={refresh}>
          <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      {filterOpen && (
        <div className="card bg-base-100 shadow-md border border-base-300">
          <div className="card-body p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-medium">标签</legend>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <label className="label cursor-pointer gap-1.5">
                      <input
                        type="radio"
                        name="tagMatch"
                        className="radio radio-xs radio-primary"
                        checked={tagMatch === 'any'}
                        onChange={() => { setTagMatch('any'); setPage(1); }}
                      />
                      <span className="label-text text-xs">包含任一</span>
                    </label>
                    <label className="label cursor-pointer gap-1.5">
                      <input
                        type="radio"
                        name="tagMatch"
                        className="radio radio-xs radio-primary"
                        checked={tagMatch === 'all'}
                        onChange={() => { setTagMatch('all'); setPage(1); }}
                      />
                      <span className="label-text text-xs">包含全部</span>
                    </label>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-base-300 rounded-lg p-2 space-y-0.5 mt-1">
                    {allTags.length === 0 ? (
                      <p className="text-xs text-base-content/40 py-1 px-2">暂无标签</p>
                    ) : (
                      allTags.map((t) => (
                        <label key={t.id} className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-base-200">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-xs checkbox-primary"
                            checked={selectedTags.includes(t.id)}
                            onChange={() => toggleSelectTag(t.id)}
                          />
                          <span className="text-sm flex-1 truncate">{t.name}</span>
                          {t.image_count > 0 && (
                            <span className="text-xs text-base-content/30">{t.image_count}</span>
                          )}
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-medium">分类</legend>
                <select
                  className="select  select-sm"
                  value={filterCategoryId}
                  onChange={(e) => { setFilterCategoryId(e.target.value); setPage(1); }}
                >
                  <option value="">全部</option>
                  {allCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-medium">排序</legend>
                <select
                  className="select  select-sm"
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm font-medium">顺序</legend>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sortOrder"
                      className="radio radio-xs radio-primary"
                      checked={sortOrder === 'desc'}
                      onChange={() => { setSortOrder('desc'); setPage(1); }}
                    />
                    <span className="text-xs">降序</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sortOrder"
                      className="radio radio-xs radio-primary"
                      checked={sortOrder === 'asc'}
                      onChange={() => { setSortOrder('asc'); setPage(1); }}
                    />
                    <span className="text-xs">升序</span>
                  </label>
                </div>
              </fieldset>
            </div>

            {hasActiveFilters && (
              <button className="btn btn-ghost btn-sm self-start" onClick={clearFilters}>
                <FiX size={14} />
                清除筛选
              </button>
            )}
          </div>
        </div>
      )}

      {refreshing && (
        <div className="w-full h-1 bg-base-300 rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-loading-bar" />
        </div>
      )}

      {initialLoading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <FiGrid size={48} className="mx-auto text-base-content/20" />
          <p className="mt-4 text-base-content/50">
            {search || hasActiveFilters ? '没有找到匹配的图片' : '还没有图片，快去上传吧！'}
          </p>
        </div>
      ) : (
        <div className={refreshing ? 'opacity-60 transition-opacity duration-200' : 'transition-opacity duration-200'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onDelete={handleDelete}
                onEdit={setEditingImage}
                onImageClick={openLightbox}
                showActions={!!user}
                selectMode={selectMode}
                selected={selectedIds.has(image.id)}
                onToggleSelect={toggleSelectImage}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                className="btn btn-sm btn-ghost"
                disabled={page <= 1 || refreshing}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <FiChevronLeft />
              </button>
              <span className="text-sm px-3">
                第 {page} / {totalPages} 页
              </span>
              <button
                className="btn btn-sm btn-ghost"
                disabled={page >= totalPages || refreshing}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      )}

      {selectMode && (
        <MultiSelectBar
          count={selectedIds.size}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onAddToGallery={() => setShowAddToGallery(true)}
          onEdit={() => setShowBatchEdit(true)}
          onDelete={handleBatchDelete}
          onClose={toggleSelectMode}
        />
      )}

      {editingImage && (
        <ImageEditor
          image={editingImage}
          onClose={() => setEditingImage(null)}
          onSaved={refresh}
        />
      )}
      </div>

      {lightboxImage && (
        <Lightbox
          image={lightboxImage}
          devMode={devMode}
          onClose={closeLightbox}
        />
      )}

      {showBatchEdit && (
        <BatchEditModal
          ids={[...selectedIds]}
          onClose={() => setShowBatchEdit(false)}
          onSaved={refresh}
        />
      )}

      {showAddToGallery && (
        <AddToGalleryModal
          imageUuids={images.filter((img) => selectedIds.has(img.id)).map((img) => img.uuid).filter(Boolean)}
          onClose={() => {
            setShowAddToGallery(false);
            setSelectMode(false);
            setSelectedIds(new Set());
          }}
        />
      )}
    </>
  );
}
