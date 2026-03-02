
import React, { useState } from 'react';
import Modal from './Modal';
import { Tag as TagIcon, Edit2, Trash2, Check, X, Plus } from 'lucide-react';
import { Tag } from '../types';

interface ManageTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  onRenameTag: (tagId: string, newName: string) => void;
  onDeleteTag: (tagId: string) => void;
  onCreateTag: (name: string) => void;
}

const ManageTagsModal: React.FC<ManageTagsModalProps> = ({ 
  isOpen, 
  onClose, 
  tags, 
  onRenameTag, 
  onDeleteTag,
  onCreateTag
}) => {
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleStartEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditName(tag.name);
  };

  const handleSaveEdit = (tagId: string) => {
    if (editName.trim()) {
      onRenameTag(tagId, editName.trim());
    }
    setEditingTagId(null);
  };

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      onCreateTag(newTagName.trim());
      setNewTagName('');
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="管理标签">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {/* Create New Tag Section */}
        <div className="mb-4">
          {isCreating ? (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <input 
                autoFocus
                type="text" 
                className="flex-grow px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20"
                placeholder="输入标签名称..."
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateTag()}
              />
              <button 
                onClick={handleCreateTag}
                className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsCreating(false)}
                className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">新建标签</span>
            </button>
          )}
        </div>

        {tags.length === 0 && !isCreating ? (
          <div className="py-8 text-center text-gray-400">
            <TagIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>暂无标签</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tags.map(tag => (
              <div 
                key={tag.id} 
                className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-all h-12"
              >
                {editingTagId === tag.id ? (
                  <div className="flex-grow flex items-center gap-1 min-w-0">
                    <input 
                      autoFocus
                      type="text" 
                      className="flex-grow min-w-0 px-2 py-1 bg-white border border-blue-500 rounded text-sm outline-none shadow-sm"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveEdit(tag.id)}
                    />
                    <button 
                      onClick={() => handleSaveEdit(tag.id)}
                      className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setEditingTagId(null)}
                      className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="p-1.5 bg-white rounded-lg text-gray-400 shrink-0">
                        <TagIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 truncate" title={tag.name}>{tag.name}</span>
                      {tag.binding_count > 0 && (
                        <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 text-[10px] rounded-full shrink-0">
                          {tag.binding_count}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button 
                        onClick={() => handleStartEdit(tag)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="重命名"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => { if(confirm(`确定要删除标签 "${tag.name}" 吗？这会从所有应用中移除该标签。`)) onDeleteTag(tag.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
