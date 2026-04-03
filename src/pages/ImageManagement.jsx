import { useState, useEffect, useContext } from 'react';
import {
  Upload,
  Search,
  Trash2,
  Eye,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Filter,
  CheckSquare,
  Square,
} from 'lucide-react';
import { imageService, categoryService, tagService } from '../services/imageService';
import ImageUpload from '../components/ImageUpload';
import ImagePreviewModal from '../components/ImagePreviewModal';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function ImageManagement() {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const { user } = useContext(AuthContext);

  const canManageImage = (image) => {
    return user && (image.userId === user.id || user.role === 'admin' || user.role === 'super_admin');
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    fetchImages();
  }, [pagination.page, searchQuery, selectedCategory, selectedTags]);

  const fetchImages = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedTags.length > 0) params.tagIds = selectedTags.join(',');

      const response = await imageService.getImages(params);
      const responseData = response.data.data;
      setImages(Array.isArray(responseData.images) ? responseData.images : []);
      setPagination((prev) => ({
        ...prev,
        total: responseData.total || 0,
        totalPages: Math.ceil((responseData.total || 0) / pagination.pageSize),
      }));
    } catch (fetchErr) {
      setError(t('common.messages.error'));
      console.error(fetchErr);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data.data || []);
    } catch {
      console.error('Failed to fetch categories');
    }
  };

  const fetchTags = async () => {
    try {
      const response = await tagService.getTags();
      setTags(response.data.data || []);
    } catch {
      console.error('Failed to fetch tags');
    }
  };

  const handleSelectAll = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map((img) => img.id));
    }
  };

  const handleSelectImage = (id) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = async () => {
    if (selectedImages.length === 0) return;
    if (!confirm(t('common.messages.confirmDelete'))) return;

    try {
      await imageService.batchDelete(selectedImages);
      showToast(t('common.messages.operationSuccess'));
      setSelectedImages([]);
      fetchImages();
    } catch {
      showToast(t('common.messages.operationFailed'), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('common.messages.confirmDelete'))) return;

    try {
      await imageService.deleteImage(id);
      showToast(t('common.messages.operationSuccess'));
      fetchImages();
    } catch {
      showToast(t('common.messages.operationFailed'), 'error');
    }
  };

  const handlePreview = async (image) => {
    try {
      const response = await imageService.getImageById(image.id);
      const fullImage = response.data.data;
      setPreviewImage({
        ...image,
        ...fullImage,
        previewUrl: fullImage.url || image.url,
      });
      setShowPreviewModal(true);
    } catch {
      setPreviewImage({
        ...image,
        previewUrl: image.url || image.fileUrl,
      });
      setShowPreviewModal(true);
    }
  };

  const handleDownload = async (image) => {
    try {
      const url = image.url || image.fileUrl || image.previewUrl;
      const link = document.createElement('a');
      link.href = url;
      link.download = image.name || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      showToast(t('common.messages.operationFailed'), 'error');
    }
  };

  const handleEdit = (image) => {
    setEditImage(image);
    setEditCategory(image.categoryId || '');
    setEditTags(image.tags?.map((t) => t.id) || []);
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editImage) return;

    try {
      await imageService.updateImage(editImage.id, {
        categoryId: editCategory || null,
      });

      const currentTagIds = editImage.tags?.map((t) => t.id) || [];
      const tagsToAdd = editTags.filter((id) => !currentTagIds.includes(id));
      const tagsToRemove = currentTagIds.filter((id) => !editTags.includes(id));

      if (tagsToAdd.length > 0) {
        await imageService.addTags(editImage.id, tagsToAdd);
      }
      for (const tagId of tagsToRemove) {
        await imageService.removeTag(editImage.id, tagId);
      }

      showToast(t('common.messages.operationSuccess'));
      setShowEditModal(false);
      fetchImages();
    } catch {
      showToast(t('common.messages.operationFailed'), 'error');
    }
  };

  const handleTagToggle = (tagId) => {
    setEditTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, id]
    );
  };

  const handleFilterTagToggle = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, id]
    );
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchImages();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTags([]);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('images.title')}</h1>
        <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
          <Upload size={18} />
          {t('images.upload.title')}
        </button>
      </div>

      <div className="card bg-base-100 shadow mb-6">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="join w-full">
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  className="input input-bordered join-item flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} className="btn btn-primary join-item">
                  <Search size={18} />
                </button>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <select
                className="select select-bordered"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <option value="">{t('common.labels.all')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-outline">
                  <Filter size={18} />
                  {t('search.filters.tag')}
                  {selectedTags.length > 0 && (
                    <span className="badge badge-primary badge-sm ml-1">
                      {selectedTags.length}
                    </span>
                  )}
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 max-h-64 overflow-y-auto"
                >
                  {tags.map((tag) => (
                    <li key={tag.id}>
                      <label className="cursor-pointer">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={selectedTags.includes(tag.id)}
                          onChange={() => handleFilterTagToggle(tag.id)}
                        />
                        <span className="ml-2">{tag.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {(searchQuery || selectedCategory || selectedTags.length > 0) && (
                <button onClick={clearFilters} className="btn btn-ghost btn-sm">
                  <X size={16} />
                  {t('search.filters.clearAll')}
                </button>
              )}
            </div>
          </div>

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tagId) => {
                const tag = tags.find((t) => t.id === tagId);
                return (
                  <div key={tagId} className="badge badge-primary gap-2">
                    {tag?.name}
                    <button
                      onClick={() => handleFilterTagToggle(tagId)}
                      className="hover:text-error"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedImages.length > 0 && (
        <div className="alert alert-info mb-4">
          <div className="flex items-center gap-2">
            <span>{t('common.labels.total')} {selectedImages.length} {t('images.title').toLowerCase()}</span>
            <button onClick={() => setSelectedImages([])} className="btn btn-ghost btn-xs">
              {t('common.buttons.cancel')}
            </button>
          </div>
          <button onClick={handleBatchDelete} className="btn btn-error btn-sm">
            <Trash2 size={16} />
            {t('common.buttons.delete')}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={fetchImages} className="btn btn-sm">
            {t('common.buttons.submit')}
          </button>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto mb-4 text-base-content/30" size={64} />
          <p className="text-base-content/50">{t('images.list.noImages')}</p>
          <button onClick={() => setShowUploadModal(true)} className="btn btn-primary mt-4">
            {t('images.upload.selectFile')}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={handleSelectAll} className="btn btn-ghost btn-sm">
              {selectedImages.length === images.length ? (
                <CheckSquare size={18} />
              ) : (
                <Square size={18} />
              )}
              {t('common.labels.all')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`card bg-base-100 shadow transition-all ${
                  selectedImages.includes(image.id) ? 'ring-2 ring-primary' : ''
                }`}
              >
                <figure className="relative group">
                  <img
                    src={image.thumbnailUrl || image.url || image.fileUrl}
                    alt={image.name}
                    className="w-full h-40 object-cover cursor-pointer"
                    onClick={() => handlePreview(image)}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePreview(image)}
                      className="btn btn-ghost btn-circle btn-sm text-white"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDownload(image)}
                      className="btn btn-ghost btn-circle btn-sm text-white"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                  <label className="absolute top-2 left-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={selectedImages.includes(image.id)}
                      onChange={() => handleSelectImage(image.id)}
                    />
                  </label>
                </figure>
                <div className="card-body p-3">
                  <p className="font-medium truncate" title={image.name}>
                    {image.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-base-content/50">
                    <span>{t('images.preview.uploadedBy')} {image.uploaderName}</span>
                  </div>
                  {image.category && (
                    <div className="badge badge-outline badge-sm mt-1">
                      {image.category.name}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {image.tags?.slice(0, 3).map((tag) => (
                      <span key={tag.id} className="badge badge-ghost badge-xs">
                        {tag.name}
                      </span>
                    ))}
                    {image.tags?.length > 3 && (
                      <span className="badge badge-ghost badge-xs">
                        +{image.tags.length - 3}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-base-content/50 mt-1">
                    {new Date(image.createdAt || image.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="join">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="join-item btn btn-sm"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: pageNum }))
                      }
                      className={`join-item btn btn-sm ${
                        pagination.page === pageNum ? 'btn-active' : ''
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="join-item btn btn-sm"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showUploadModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <ImageUpload
              onUploadComplete={() => {
                showToast(t('images.upload.uploadSuccess'));
                fetchImages();
              }}
              onClose={() => setShowUploadModal(false)}
            />
          </div>
          <div className="modal-backdrop" onClick={() => setShowUploadModal(false)} />
        </div>
      )}

      {showPreviewModal && previewImage && (
        <ImagePreviewModal
          image={previewImage}
          onClose={() => setShowPreviewModal(false)}
          onDownload={handleDownload}
          onEdit={(img) => { setShowPreviewModal(false); handleEdit(img); }}
          onDelete={(id) => { setShowPreviewModal(false); handleDelete(id); }}
        />
      )}

      {showEditModal && editImage && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{t('common.buttons.edit')}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="avatar">
                <div className="w-24 rounded">
                  <img
                    src={editImage.thumbnailUrl || editImage.url || editImage.fileUrl}
                    alt={editImage.name}
                  />
                </div>
              </div>
              <div>
                <p className="font-medium">{editImage.name}</p>
                <p className="text-sm text-base-content/50">
                  {new Date(editImage.createdAt || editImage.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">{t('images.form.category')}</span>
              </label>
              <select
                className="select select-bordered"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              >
                <option value="">{t('common.labels.all')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">{t('images.form.tags')}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className={`badge badge-lg cursor-pointer ${
                      editTags.includes(tag.id)
                        ? 'badge-primary'
                        : 'badge-outline'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={editTags.includes(tag.id)}
                      onChange={() => handleTagToggle(tag.id)}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-action">
              <button onClick={() => setShowEditModal(false)} className="btn btn-ghost">
                {t('common.buttons.cancel')}
              </button>
              <button onClick={handleEditSubmit} className="btn btn-primary">
                {t('common.buttons.save')}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowEditModal(false)} />
        </div>
      )}

      {toast.show && (
        <div className={`toast toast-top toast-center z-50`}>
          <div className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageManagement;