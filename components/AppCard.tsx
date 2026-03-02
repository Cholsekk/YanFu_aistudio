
import React, { useState, useRef, useEffect } from 'react';
import { AppItem, Tag } from '../types';
import { getIcon } from '../constants';
import { MoreHorizontal, ExternalLink, X, Plus } from 'lucide-react';
import TagDropdown from './TagDropdown';

interface AppCardProps {
  app: AppItem;
  viewMode: 'grid' | 'list';
  allTags: Tag[];
  onBindTag: (appId: string, tagId: string) => void;
  onUnbindTag: (appId: string, tagId: string) => void;
  onCreateTag: (tagName: string) => void;
  onEdit: (app: AppItem) => void;
  onDelete: (id: string) => void;
  onCopy: (app: AppItem) => void;
  onManageTags: () => void;
  onExport: (app: AppItem) => void;
  onConvertToWorkflow: (app: AppItem) => void;
  onClick?: () => void;
}

const AppCard: React.FC<AppCardProps> = ({ 
  app, 
  viewMode, 
  allTags,
  onBindTag,
  onUnbindTag,
  onCreateTag,
  onEdit, 
  onDelete, 
  onCopy, 
  onManageTags,
  onExport,
  onConvertToWorkflow,
  onClick 
}) => {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const removeTag = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    onUnbindTag(app.id, tagId);
  };

  const toggleTag = (tagId: string) => {
    const isBound = app.tags.some(t => t.id === tagId);
    if (isBound) {
      onUnbindTag(app.id, tagId);
    } else {
      onBindTag(app.id, tagId);
    }
  };

  const createTag = (tagName: string) => {
    // Check if tag already exists in allTags
    const existingTag = allTags.find(t => t.name === tagName);
    if (existingTag) {
      if (!app.tags.some(t => t.id === existingTag.id)) {
        onBindTag(app.id, existingTag.id);
      }
    } else {
      onCreateTag(tagName);
      // Note: We can't immediately bind the new tag because we don't have its ID yet.
      // The parent component handles creating the tag and refreshing the list.
      // Ideally, onCreateTag should return the new tag or Promise<Tag>, but for now we rely on refresh.
    }
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setIsMenuOpen(false);
  };

  const renderAppIcon = (isList: boolean) => {
    const containerClass = isList ? "w-8 h-8" : "w-11 h-11";
    const iconClass = isList ? "w-5 h-5" : "w-6 h-6";
    const paddingClass = isList ? "p-1.5" : "p-2.5";

    if (app.iconType === 'sys-icon') {
      return (
        <div className={`${containerClass} bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden`}>
          <img 
            src={`/sys_icons/Component ${app.icon}.svg`} 
            alt={app.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/sys_icons/Component 156.svg'; // Fallback
            }}
          />
        </div>
      );
    }

    if (app.iconType === 'image') {
      const src = app.icon_url || app.icon;
      return (
        <img 
          src={src || undefined} 
          alt={app.name} 
          className={`${containerClass} rounded-lg object-cover border border-gray-100`} 
        />
      );
    }

    // Default 'icon' (Lucide)
    return (
      <div className={`${app.iconBgColor} ${paddingClass} rounded-lg text-white flex items-center justify-center`}>
        {getIcon(app.icon, iconClass)}
      </div>
    );
  };

  const getTypeColor = (type: string) => {
    if (type.includes('对话')) return 'bg-blue-500';
    if (type.includes('智能体')) return 'bg-purple-500';
    if (type.includes('工作流')) return 'bg-orange-500';
    if (type.includes('文本')) return 'bg-green-500';
    return 'bg-gray-400';
  };

  const renderMenu = () => (
    <div 
      ref={menuRef}
      className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
      onClick={e => e.stopPropagation()}
    >
      <button onClick={(e) => handleAction(e, () => onEdit(app))} className="w-full flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
        编辑信息
      </button>
      <div className="h-px bg-gray-50 mx-2 my-1" />
      <button onClick={(e) => handleAction(e, () => onCopy(app))} className="w-full flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
        复制
      </button>
      <button onClick={(e) => handleAction(e, () => onExport(app))} className="w-full flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
        导出应用
      </button>
      {app.type === '对话应用' && (
        <>
          <div className="h-px bg-gray-50 mx-2 my-1" />
          <button onClick={(e) => handleAction(e, () => onConvertToWorkflow(app))} className="w-full flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
            迁移为workflow编排
          </button>
        </>
      )}
      <div className="h-px bg-gray-50 mx-2 my-1" />
      <button onClick={(e) => handleAction(e, () => onDelete(app.id))} className="w-full flex items-center px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors">
        删除
      </button>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 group flex items-center gap-4 cursor-pointer relative"
        onClick={onClick}
      >
        <div className="flex-shrink-0">
          {renderAppIcon(true)}
        </div>
        
        <div className="flex-grow flex items-center gap-6">
          <div className="w-1/4">
            <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">
              {app.name}
            </h3>
            <span className="text-[10px] text-gray-400 font-medium">{app.typeLabel} {app.category && `· ${app.category}`}</span>
          </div>
          <p className="text-xs text-gray-500 flex-grow line-clamp-1">{app.description}</p>
          <div className="flex gap-2 min-w-[200px] justify-end overflow-hidden">
            {app.tags.map(tag => (
              <span key={tag.id} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[10px] text-gray-500 font-medium whitespace-nowrap">
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-50"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {isMenuOpen && renderMenu()}
          <button className="p-1.5 text-blue-600 rounded-md bg-blue-50 hover:bg-blue-100">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 group relative flex flex-col h-full cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4 relative">
        <div className="flex items-start gap-4">
          {renderAppIcon(false)}
          <div>
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
              {app.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${getTypeColor(app.typeLabel)}`}></span>
              <span className="text-xs text-gray-500 font-medium">{app.typeLabel} {app.category && `· ${app.category}`}</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
            className={`text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50 transition-colors ${isMenuOpen ? 'bg-gray-100 text-gray-700' : ''}`}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {isMenuOpen && renderMenu()}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6 flex-grow line-clamp-2 leading-relaxed">
        {app.description}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-wrap gap-1.5 max-w-[70%]">
          {app.tags.map(tag => (
            <span key={tag.id} className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[10px] text-gray-500 font-medium group/tag hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors">
              {tag.name}
              <X className="w-2.5 h-2.5 cursor-pointer opacity-0 group-hover/tag:opacity-100" onClick={(e) => removeTag(e, tag.id)} />
            </span>
          ))}
          {isAddingTag ? (
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button 
                className="text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1 font-medium"
              >
                <Plus className="w-2.5 h-2.5" />
                添加标签
              </button>
              <TagDropdown 
                allTags={allTags}
                selectedTags={app.tags}
                onToggleTag={toggleTag}
                onCreateTag={createTag}
                onManageTags={() => { setIsAddingTag(false); onManageTags(); }}
                onClose={() => setIsAddingTag(false)}
              />
            </div>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsAddingTag(true); }}
              className="text-[10px] text-gray-400 border border-dashed border-gray-300 px-2 py-1 rounded hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-1"
            >
              <Plus className="w-2.5 h-2.5" />
              添加
            </button>
          )}
        </div>
        <button className="hidden group-hover:flex items-center gap-1 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all">
          进入应用
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default AppCard;
