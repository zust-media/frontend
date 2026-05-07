import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = () => {
    // stays on the page so user can upload more
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiUploadCloud className="text-primary" />
          上传图片
        </h1>
        <button
          className="btn btn-ghost btn-sm gap-1"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft size={16} />
          返回
        </button>
      </div>

      {user ? (
        <ImageUploader onSuccess={handleSuccess} />
      ) : (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body text-center py-12">
            <FiUploadCloud size={48} className="mx-auto text-base-content/20" />
            <p className="mt-4 text-base-content/50">请先登录后再上传图片</p>
          </div>
        </div>
      )}
    </div>
  );
}
