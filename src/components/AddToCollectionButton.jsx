import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import collectionService from '../services/collectionService';
import { useTranslation } from 'react-i18next';
import { FolderPlus } from 'lucide-react';

function AddToCollectionButton({ imageId, onSuccess, onError }) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchCollections = async () => {
    try {
      const response = await collectionService.getCollections();
      setCollections(response.data.data);
    } catch (err) {
      console.error('Failed to fetch collections:', err);
    }
  };

  const handleOpen = async () => {
    setShowModal(true);
    await fetchCollections();
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    if (selectedIds.length === 0) return;

    setLoading(true);
    try {
      for (const collectionId of selectedIds) {
        await collectionService.addImages(collectionId, [imageId]);
      }
      setShowModal(false);
      setSelectedIds([]);
      if (onSuccess) onSuccess();
    } catch (err) {
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="btn btn-ghost btn-sm" onClick={handleOpen}>
        <FolderPlus size={16} />
      </button>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{t('collections.addToCollection')}</h3>
            {collections.length === 0 ? (
              <p className="py-4 text-base-content/60">{t('collections.empty')}</p>
            ) : (
              <div className="py-4 max-h-60 overflow-y-auto">
                {collections.map(c => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => toggleSelect(c.id)}
                    />
                    <span>{c.name}</span>
                    <span className="text-base-content/60 text-sm">({c.imageCount})</span>
                  </label>
                ))}
              </div>
            )}
            <div className="modal-action">
              <button className="btn" onClick={() => setShowModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAdd}
                disabled={selectedIds.length === 0 || loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : t('common.confirm')}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
        </div>
      )}
    </>
  );
}

export default AddToCollectionButton;