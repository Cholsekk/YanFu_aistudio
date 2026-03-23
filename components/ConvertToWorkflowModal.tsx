import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import IconPickerModal from './IconPickerModal';
import { AlertTriangle, CheckSquare, Square } from 'lucide-react';
import { AppItem } from '../types';
import { getIcon } from '../constants';

interface ConvertToWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; deleteOriginal: boolean; icon: string; iconType: 'icon' | 'image' | 'sys-icon'; iconBgColor: string }) => void;
  app: AppItem | null;
}

const ConvertToWorkflowModal: React.FC<ConvertToWorkflowModalProps> = ({ isOpen, onClose, onConfirm, app }) => {
  const [name, setName] = useState('');
  const [deleteOriginal, setDeleteOriginal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Icon state
  const [icon, setIcon] = useState('156');
  const [iconType, setIconType] = useState<'icon' | 'image' | 'sys-icon'>('sys-icon');
  const [iconBgColor, setIconBgColor] = useState('bg-primary-600');
  const [iconUrl, setIconUrl] = useState('');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  useEffect(() => {
    if (app) {
      setName(app.name + ' (Workflow)');
      setDeleteOriginal(false);
      setShowDeleteConfirm(false);
      
      // Initialize icon state from app
      setIcon(app.icon);
      setIconType(app.iconType);
      setIconBgColor(app.iconBgColor || 'bg-primary-600');
      setIconUrl(app.icon_url || '');
    }
  }, [app, isOpen]);

  const handleToggleDelete = () => {
    if (!deleteOriginal) {
      // If turning ON, show confirmation first
      setShowDeleteConfirm(true);
    } else {
      // If turning OFF, just turn off
      setDeleteOriginal(false);
    }
  };

  const handleStartMigration = () => {
    onConfirm({ 
      name, 
      deleteOriginal,
      icon,
      iconType,
      iconBgColor
    });
    onClose();
  };

  const handleConfirmDelete = () => {
    setDeleteOriginal(true);
    setShowDeleteConfirm(false);
  };

  const handleIconConfirm = (data: { icon: string; iconType: 'icon' | 'image' | 'sys-icon'; iconBgColor?: string; iconUrl?: string }) => {
    setIcon(data.icon);
    setIconType(data.iconType);
    setIconUrl(data.iconUrl || '');
    if (data.iconBgColor) {
      setIconBgColor(data.iconBgColor);
    }
  };

  if (!app) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title=""
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div 
              className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900"
              onClick={handleToggleDelete}
            >
              {deleteOriginal ? (
                <CheckSquare className="w-5 h-5 text-primary-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm select-none">删除原应用</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onClose} 
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium border border-gray-200"
              >
                取消
              </button>
              <button 
                onClick={handleStartMigration} 
                className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                开始迁移
              </button>
            </div>
          </div>
        }
      >
        <div className="pt-2">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">迁移为workflow编排</h3>
          <p className="text-sm text-gray-500 mb-6">
            将为您创建一个使用workflow编排的新应用。新应用将不能够迁移回基础编排
          </p>

          <div className="mb-2 text-sm font-medium text-gray-700">新应用创建为</div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsIconPickerOpen(true)}
              className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0 hover:border-primary-300 transition-colors overflow-hidden group relative"
            >
              {iconType === 'image' ? (
                <img src={iconUrl || icon} alt="icon" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full ${iconBgColor} flex items-center justify-center text-white`}>
                  {getIcon(icon, "w-6 h-6")}
                </div>
              )}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </button>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              placeholder="输入新应用名称"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="relative z-[150]">
          <Modal
            isOpen={true}
            onClose={() => setShowDeleteConfirm(false)}
            title=""
            maxWidth="max-w-md"
            footer={
              <div className="flex gap-3 justify-end w-full">
                <button 
                  onClick={() => setShowDeleteConfirm(false)} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium border border-gray-200"
                >
                  取消
                </button>
                <button 
                  onClick={handleConfirmDelete} 
                  className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                >
                  确认
                </button>
              </div>
            }
          >
            <div className="pt-2">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">确认删除应用?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                删除应用将无法撤销。用户将不能访问你的应用，所有 Prompt 编排配置和日志均将一并被删除。
              </p>
            </div>
          </Modal>
        </div>
      )}

      <IconPickerModal 
        isOpen={isIconPickerOpen} 
        onClose={() => setIsIconPickerOpen(false)} 
        onConfirm={handleIconConfirm}
        initialValue={{ icon, iconType, iconBgColor }}
      />
    </>
  );
};

export default ConvertToWorkflowModal;
