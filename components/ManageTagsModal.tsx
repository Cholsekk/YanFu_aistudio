
import React, { useState } from 'react';
import Modal from './Modal';
import { Tag as TagIcon, Edit2, Trash2, Check, X } from 'lucide-react';

interface ManageTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTags: string[];
  onRenameTag: (oldName: string, newName: string) => void;
  onDeleteTag: (tagName: string) => void;
}

const ManageTagsModal: React.FC<ManageTagsModalProps> = ({ 
  isOpen, 
  onClose, 
  allTags, 
  onRenameTag, 
  onDeleteTag 
}) => {
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const handleStartEdit = (tag: string) => {
    setEditingTag(tag);
    setNewName(tag);
  };

  const handleSaveEdit = (oldName: string) => {
    if (newName.trim() && newName !== oldName) {
      onRenameTag(oldName, newName.trim());
    }
    setEditingTag(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="管理标签">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {allTags.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <TagIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>暂无标签</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {allTags.map(tag => (
              <div 
                key={tag} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-all"
              >
                {editingTag === tag ? (
                  <div className="flex-grow flex items-center gap-2">
                    <input 
                      autoFocus
                      type="text" 
                      className="flex-grow px-3 py-1.5 bg-white border border-blue-500 rounded-lg text-sm outline-none shadow-sm"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveEdit(tag)}
                    />
                    <button 
                      onClick={() => handleSaveEdit(tag)}
                      className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setEditingTag(null)}
                      className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg text-gray-400">
                        <TagIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{tag}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleStartEdit(tag)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="重命名"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { if(confirm(`确定要删除标签 "${tag}" 吗？这会从所有应用中移除该标签。`)) onDeleteTag(tag); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-end">
        <button 
          onClick={onClose}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md active:scale-95"
        >
          完成
        </button>
      </div>
    </Modal>
  );
};

export default ManageTagsModal;
