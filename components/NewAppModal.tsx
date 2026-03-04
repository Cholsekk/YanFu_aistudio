
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import IconPickerModal from './IconPickerModal';
import { MessageSquare, FileText, Bot, GitBranch } from 'lucide-react';
import { AppItem } from '../types';
import { getIcon } from '../constants';
import { message } from 'antd';

interface NewAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (app: any) => void;
  initialData?: AppItem | null;
}

const NewAppModal: React.FC<NewAppModalProps> = ({ isOpen, onClose, onCreate, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '对话助手',
    subType: '对话助手',
    icon: 'MessageSquare',
    iconType: 'icon' as 'icon' | 'image' | 'sys-icon',
    iconBgColor: 'bg-primary-600',
    builtIn: false
  });
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        type: initialData.typeLabel || '对话助手',
        subType: '对话助手',
        icon: initialData.icon,
        iconType: initialData.iconType,
        iconBgColor: initialData.iconBgColor || 'bg-primary-600',
        builtIn: false // Default to false or fetch from initialData if available
      });
    } else {
      setFormData({ 
        name: '', 
        description: '', 
        type: '对话助手', 
        subType: '对话助手',
        icon: 'MessageSquare',
        iconType: 'icon',
        iconBgColor: 'bg-primary-600',
        builtIn: false
      });
    }
  }, [initialData, isOpen]);

  const types = [
    { id: '对话助手', title: '对话助手', desc: '使用大型语言模型构建基于聊天的助手', icon: <MessageSquare className="w-5 h-5" /> },
    { id: '文本生成应用', title: '文本生成应用', desc: '根据提示生成高质量文本的应用程序，例如生成文章、摘要、翻译等。', icon: <FileText className="w-5 h-5" /> },
    { id: '智能体应用', title: '智能体应用', desc: '构建一个智能Agent，可以自主选择工具来完成任务', icon: <Bot className="w-5 h-5" /> },
    { id: '工作流应用', title: '工作流', desc: '提供更多的自定义能力，适合有经验的用户。', icon: <GitBranch className="w-5 h-5" /> },
  ];

  const subTypes = ['对话助手', '对话助手工作流'];

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      message.error('应用名称不能为空');
      return;
    }

    onCreate({
      ...(initialData ? { id: initialData.id } : {}),
      name: formData.name,
      description: formData.description,
      typeLabel: formData.type,
      type: formData.type.includes('助手') ? '对话应用' : formData.type,
      icon: formData.icon,
      iconType: formData.iconType,
      iconBgColor: formData.iconBgColor,
      tags: initialData?.tags || [],
      builtIn: formData.builtIn
    });
    onClose();
  };

  const handleIconConfirm = (data: { icon: string; iconType: 'icon' | 'image' | 'sys-icon'; iconBgColor?: string }) => {
    setFormData({ ...formData, icon: data.icon, iconType: data.iconType, iconBgColor: data.iconBgColor || 'bg-primary-600' });
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={initialData ? "编辑应用" : "新建应用"}
        footer={
          <>
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium border border-gray-200">取消</button>
            <button 
              onClick={handleSubmit} 
              className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200"
            >
              {initialData ? '保存' : '创建'}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">图标 & 名称</label>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsIconPickerOpen(true)}
                className="w-12 h-12 rounded-xl border border-gray-100 flex items-center justify-center flex-shrink-0 hover:border-primary-300 transition-colors overflow-hidden group relative"
              >
                {formData.iconType === 'image' ? (
                  <img src={formData.icon || undefined} alt="icon" className="w-full h-full object-cover" />
                ) : formData.iconType === 'sys-icon' ? (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img 
                      src={`/sys_icons/Component ${formData.icon}.svg`} 
                      alt="icon" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/sys_icons/Component 156.svg';
                      }}
                    />
                  </div>
                ) : (
                  <div className={`w-full h-full ${formData.iconBgColor} flex items-center justify-center text-white`}>
                    {getIcon(formData.icon, "w-6 h-6")}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </div>
              </button>
              <input 
                type="text" 
                placeholder="请输入应用名称" 
                className="flex-grow px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <textarea 
              placeholder="描述该应用的应用场景及用途，如:XXX 小助手回答用户提出的 XXX 产品使用问题" 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all min-h-[100px] text-sm"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {initialData && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <div className="font-medium text-gray-900 text-sm">设置为内置应用</div>
                <div className="text-xs text-gray-500 mt-1">内置应用将对所有工作区成员可见</div>
              </div>
              <button 
                onClick={() => setFormData(prev => ({ ...prev, builtIn: !prev.builtIn }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.builtIn ? 'bg-primary-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.builtIn ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}

          {!initialData && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">类型</label>
                <div className="grid grid-cols-2 gap-4">
                  {types.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => setFormData({...formData, type: t.id})}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${
                        formData.type === t.id ? 'border-primary-50 bg-primary-50/50' : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.type === t.id ? 'border-primary-500' : 'border-gray-300'}`}>
                          {formData.type === t.id && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{t.title}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed pl-7">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">对话助手开发与调试</label>
                <div className="grid grid-cols-2 gap-4">
                  {subTypes.map(st => (
                    <div 
                      key={st}
                      onClick={() => setFormData({...formData, subType: st})}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                        formData.subType === st ? 'border-primary-500 bg-primary-50/50' : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.subType === st ? 'border-primary-500' : 'border-gray-300'}`}>
                        {formData.subType === st && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      <IconPickerModal 
        isOpen={isIconPickerOpen} 
        onClose={() => setIsIconPickerOpen(false)} 
        onConfirm={handleIconConfirm}
        initialValue={{ icon: formData.icon, iconType: formData.iconType, iconBgColor: formData.iconBgColor }}
      />
    </>
  );
};

export default NewAppModal;
