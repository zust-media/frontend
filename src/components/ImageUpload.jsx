import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { imageService, categoryService, tagService } from '../services/imageService';
import { useTranslation } from 'react-i18next';

function ImageUpload({ onUploadComplete, onClose }) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useState(() => {
    const fetchFilterData = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          categoryService.getCategories(),
          tagService.getTags(),
        ]);
        setCategories(catRes.data.data || []);
        setTags(tagRes.data.data || []);
      } catch (filterErr) {
        console.error('Failed to fetch categories/tags:', filterErr);
      }
    };
    fetchFilterData();
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/')
    );
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      (file) => file.type.startsWith('image/')
    );
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const imageFiles = newFiles.filter((file) => file.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...imageFiles]);

    const newPreviews = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError(t('common.messages.error'));
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        if (selectedCategory) {
          formData.append('categoryId', selectedCategory);
        }
        if (selectedTags.length > 0) {
          formData.append('tagIds', JSON.stringify(selectedTags));
        }

        setUploadProgress((prev) => ({ ...prev, [i]: 0 }));

        try {
          await imageService.uploadImages(formData);
          setUploadProgress((prev) => ({ ...prev, [i]: 100 }));
        } catch (uploadErr) {
          console.error(`Failed to upload ${files[i].name}:`, uploadErr);
          setUploadProgress((prev) => ({ ...prev, [i]: -1 }));
        }
      }

      if (onUploadComplete) {
        onUploadComplete();
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      setError(t('images.upload.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t('images.upload.title')}</h3>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <X size={18} />
        </button>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-base-300 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          multiple
          className="hidden"
        />
        <ImageIcon className="mx-auto mb-4 text-base-content/50" size={48} />
        <p className="text-base-content/70 mb-2">
          {t('images.upload.dragDrop')}
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-primary btn-sm"
        >
          {t('images.upload.selectFile')}
        </button>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="avatar">
                <div className="w-20 rounded">
                  <img src={preview.preview} alt={preview.name} />
                </div>
              </div>
              {uploadProgress[index] === 100 && (
                <div className="absolute top-0 right-0 bg-success rounded-full p-0.5">
                  <Check size={12} className="text-white" />
                </div>
              )}
              {uploadProgress[index] === -1 && (
                <div className="absolute top-0 right-0 bg-error rounded-full p-0.5">
                  <X size={12} className="text-white" />
                </div>
              )}
              <button
                onClick={() => removeFile(index)}
                className="absolute top-0 left-0 bg-error text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              <p className="text-xs truncate mt-1" title={preview.name}>
                {preview.name}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="form-control">
        <label className="label">
          <span className="label-text">{t('images.form.category')}</span>
        </label>
        <select
          className="select select-bordered"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">{t('images.form.selectCategory')}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">{t('images.form.tags')}</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label
              key={tag.id}
              className={`badge badge-lg cursor-pointer ${
                selectedTags.includes(tag.id)
                  ? 'badge-primary'
                  : 'badge-outline'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={selectedTags.includes(tag.id)}
                onChange={() => handleTagToggle(tag.id)}
              />
              {tag.name}
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn btn-ghost">
          {t('common.buttons.cancel')}
        </button>
        <button
          onClick={handleUpload}
          className="btn btn-primary"
          disabled={files.length === 0 || isUploading}
        >
          {isUploading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              {t('images.upload.uploading')}
            </>
          ) : (
            <>
              <Upload size={16} />
              {t('common.buttons.upload')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ImageUpload;