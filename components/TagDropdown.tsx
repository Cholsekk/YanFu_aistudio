
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, Tag as TagIcon, Settings, CheckSquare, Square } from 'lucide-react';

interface TagDropdownProps {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tagName: string) => void;
  onCreateTag: (tagName: string) => void;
  onManageTags: () => void;
  onClose: () => void;
}

const TagDropdown: React.FC<TagDropdownProps> = ({ 
  allTags, 
  selectedTags, 
  onToggleTag, 
  onCreateTag, 
  onManageTags,
  onClose
}) => {
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filteredTags = useMemo(() => {
    return allTags.filter(tag => tag.toLowerCase().includes(search.toLowerCase()));
  }, [allTags, search]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim() && !allTags.includes(search.trim())) {
      onCreateTag(search.trim());
      setSearch('');
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
      onClick={e => e.stopPropagation()}
    >
      <div className="p-3 border-bottom border-gray-50">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-blue-500" />
          <form onSubmit={handleCreate}>
            <input 
              autoFocus
              type="text" 
              placeholder="搜索或者创建" 
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border-none rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
        {filteredTags.length > 0 ? (
          filteredTags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
              >
                <div className={`transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-300 group-hover:text-gray-400'}`}>
                  {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </div>
                <span className={`flex-grow text-left truncate ${isSelected ? 'font-medium text-gray-900' : ''}`}>
                  {tag}
                </span>
              </button>
            );
          })
        ) : (
          search.trim() ? (
            <button 
              onClick={() => { onCreateTag(search.trim()); setSearch(''); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>创建标签 "{search}"</span>
            </button>
          ) : (
            <div className="px-4 py-8 text-center text-gray-400 text-xs">
              暂无标签
            </div>
          )
        )}
      </div>

      <div className="border-t border-gray-50 p-1">
        <button 
          onClick={(e) => { e.stopPropagation(); onManageTags(); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all font-medium"
        >
          <TagIcon className="w-3.5 h-3.5" />
          管理标签
        </button>
      </div>
    </div>
  );
};

export default TagDropdown;
