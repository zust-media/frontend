import { FiCheckSquare, FiTrash2, FiXCircle, FiEdit3 } from 'react-icons/fi';

export default function MultiSelectBar({ count, onSelectAll, onDeselectAll, onEdit, onDelete, onClose }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-3 bg-base-100 shadow-xl rounded-full px-5 py-3 border border-base-300">
        <span className="text-sm font-medium text-base-content/70">
          已选 <span className="text-primary font-bold">{count}</span> 张
        </span>
        <div className="w-px h-5 bg-base-300"></div>
        <button className="btn btn-sm btn-ghost gap-1" onClick={onSelectAll}>全选</button>
        <button className="btn btn-sm btn-ghost gap-1" onClick={onDeselectAll} disabled={count === 0}>取消</button>
        <div className="w-px h-5 bg-base-300"></div>
        <button className="btn btn-sm btn-ghost gap-1" disabled={count === 0} onClick={onEdit}>
          <FiEdit3 size={14} /> 编辑
        </button>
        <div className="w-px h-5 bg-base-300"></div>
        <button className="btn btn-sm btn-error gap-1" onClick={onDelete} disabled={count === 0}>
          <FiTrash2 size={14} /> 删除
        </button>
        <button className="btn btn-sm btn-ghost btn-circle" onClick={onClose} title="退出多选">
          <FiXCircle size={16} />
        </button>
      </div>
    </div>
  );
}
