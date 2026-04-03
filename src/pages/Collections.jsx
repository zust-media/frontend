import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import collectionService from '../services/collectionService';
import config from '../config';
import { FolderOpen, Plus, Trash2, Edit2, Download, Image } from 'lucide-react';

function Collections() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const response = await collectionService.getCollections();
      setCollections(response.data.data);
    } catch (err) {
      console.error('Failed to fetch collections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await collectionService.createCollection({
        name: newName,
        description: newDescription
      });
      setShowCreateModal(false);
      setNewName('');
      setNewDescription('');
      fetchCollections();
    } catch (err) {
      console.error('Failed to create collection:', err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingId) return;

    try {
      await collectionService.updateCollection(editingId, {
        name: editName,
        description: editDescription
      });
      setEditingId(null);
      fetchCollections();
    } catch (err) {
      console.error('Failed to update collection:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('collections.confirmDelete'))) return;

    try {
      await collectionService.deleteCollection(id);
      fetchCollections();
    } catch (err) {
      console.error('Failed to delete collection:', err);
    }
  };

  const handleDownload = async (collection) => {
    setDownloadingId(collection.id);
    try {
      const response = await collectionService.downloadCollection(collection.id, {});
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection.name}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download collection:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const startEdit = (collection) => {
    setEditingId(collection.id);
    setEditName(collection.name);
    setEditDescription(collection.description || '');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FolderOpen size={24} />
          {t('collections.title')}
        </h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          {t('collections.create')}
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12 text-base-content/60">
          <FolderOpen size={64} className="mx-auto mb-4 opacity-50" />
          <p>{t('collections.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <div key={collection.id} className="card bg-base-200 shadow">
              <div className="card-body">
                {editingId === collection.id ? (
                  <form onSubmit={handleUpdate}>
                    <input
                      type="text"
                      className="input input-bordered w-full mb-2"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <textarea
                      className="textarea textarea-bordered w-full mb-2"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder={t('collections.description')}
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-primary btn-sm">
                        {t('common.save')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditingId(null)}
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2
                      className="card-title cursor-pointer hover:text-primary"
                      onClick={() => navigate(`/collections/${collection.id}`)}
                    >
                      {collection.name}
                    </h2>
                    {collection.description && (
                      <p className="text-sm text-base-content/60 mb-2">
                        {collection.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-base-content/60 mb-4">
                      <Image size={14} />
                      <span>{collection.imageCount} {t('collections.images')}</span>
                    </div>
                    <div className="card-actions justify-end">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDownload(collection)}
                        disabled={downloadingId === collection.id || collection.imageCount === 0}
                      >
                        {downloadingId === collection.id ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <Download size={16} />
                        )}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => startEdit(collection)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => handleDelete(collection.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{t('collections.create')}</h3>
            <form onSubmit={handleCreate}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">{t('collections.name')}</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">{t('collections.description')}</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowCreateModal(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}></div>
        </div>
      )}
    </div>
  );
}

export default Collections;