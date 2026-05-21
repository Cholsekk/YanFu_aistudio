
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import IconPickerModal from './IconPickerModal';
import ModelSelect from './ModelSelect';
import { MessageSquare, FileText, Bot, GitBranch, Sparkles } from 'lucide-react';
import { AppItem, ModelTypeEnum } from '../types';
import { getIcon } from '../constants';
import { message, ConfigProvider } from 'antd';
import { apiService } from '../services/apiService';

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
    icon: '156',
    iconType: 'sys-icon' as 'icon' | 'image' | 'sys-icon',
    iconBgColor: 'bg-primary-600',
    iconUrl: '',
    builtIn: false,
    workflowCreateMethod: 'manual' as 'manual' | 'ai',
    modelProvider: '',
    modelName: '',
    instruction: ''
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
        iconUrl: initialData.icon_url || '',
        builtIn: initialData.builtIn || false
      });
    } else {
      setFormData({ 
        name: '', 
        description: '', 
        type: '对话助手', 
        subType: '对话助手',
        icon: '156',
        iconType: 'sys-icon',
        iconBgColor: 'bg-primary-600',
        iconUrl: '',
        builtIn: false,
        workflowCreateMethod: 'manual',
        modelProvider: '',
        modelName: '',
        instruction: ''
      });
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (formData.type === '工作流应用' && formData.workflowCreateMethod === 'ai' && !formData.modelName) {
      apiService.fetchDefaultModal(ModelTypeEnum.textGeneration).then(res => {
        if (res && res.model && res.provider) {
          const providerId = typeof res.provider === 'string' ? res.provider : res.provider.provider;
          setFormData(prev => ({ ...prev, modelName: res.model, modelProvider: providerId }));
        }
      }).catch(console.error);
    }
  }, [formData.type, formData.workflowCreateMethod, formData.modelName]);

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

    let finalIcon = formData.icon;
    if (typeof finalIcon === 'string' && finalIcon.includes('/file-preview')) {
      const match = finalIcon.match(/\/files\/([^\/]+)\/file-preview/);
      if (match && match[1]) {
        finalIcon = match[1];
      }
    }

    if (formData.type === '工作流应用' && formData.workflowCreateMethod === 'ai') {
      if (!formData.instruction.trim()) {
        message.warning('请输入生成工作流的提示词指令');
        return;
      }
    }

    onCreate({
      ...(initialData ? { id: initialData.id } : {}),
      name: formData.name,
      description: formData.description,
      typeLabel: formData.type,
      type: formData.type.includes('助手') ? '对话应用' : formData.type,
      mode: formData.type === '对话助手' ? (formData.subType === '对话助手工作流' ? 'advanced-chat' : 'chat') : undefined,
      icon: finalIcon,
      iconType: formData.iconType,
      iconBgColor: formData.iconBgColor,
      tags: initialData?.tags || [],
      builtIn: formData.builtIn,
      workflowCreateMethod: formData.type === '工作流应用' ? formData.workflowCreateMethod : undefined,
      modelProvider: formData.modelProvider,
      modelName: formData.modelName,
      instruction: formData.instruction
    });
    onClose();
  };

  const handleIconConfirm = (data: { icon: string; iconType: 'icon' | 'image' | 'sys-icon'; iconBgColor?: string; iconUrl?: string }) => {
    setFormData({ ...formData, icon: data.icon, iconType: data.iconType, iconBgColor: data.iconBgColor || 'bg-primary-600', iconUrl: data.iconUrl || '' });
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
                  <img src={formData.iconUrl || formData.icon || undefined} alt="icon" className="w-full h-full object-cover" />
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

              {formData.type === '对话助手' && (
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
              )}

              {formData.type === '工作流应用' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">创建方式</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        onClick={() => setFormData({...formData, workflowCreateMethod: 'manual'})}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                          formData.workflowCreateMethod === 'manual' ? 'border-primary-500 bg-primary-50/50' : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.workflowCreateMethod === 'manual' ? 'border-primary-500' : 'border-gray-300'}`}>
                          {formData.workflowCreateMethod === 'manual' && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary-600 text-sm">手动创建</span>
                          <GitBranch className="w-4 h-4 text-primary-600" />
                        </div>
                      </div>
                      
                      <div 
                        onClick={() => setFormData({...formData, workflowCreateMethod: 'ai'})}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                          formData.workflowCreateMethod === 'ai' ? 'border-amber-500 bg-amber-50/50' : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.workflowCreateMethod === 'ai' ? 'border-amber-500' : 'border-gray-300'}`}>
                          {formData.workflowCreateMethod === 'ai' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-amber-600 text-sm">AI 生成工作流</span>
                          <Sparkles className="w-4 h-4 text-amber-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {formData.workflowCreateMethod === 'ai' && (
                    <div className="space-y-4 p-5 bg-amber-50/30 rounded-xl border border-amber-100/50 shadow-sm">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">选择模型 <span className="text-amber-500 font-bold">*</span></label>
                        <ConfigProvider theme={{
                          token: {
                            colorPrimary: '#f59e0b',
                            colorPrimaryHover: '#d97706',
                            colorBorder: '#fde68a', // amber-200
                          }
                        }}>
                          <ModelSelect 
                            modelType={ModelTypeEnum.textGeneration}
                            value={formData.modelName || undefined}
                            onChange={(model, provider) => {
                              setFormData({...formData, modelName: model, modelProvider: provider});
                            }}
                            className="!w-fit min-w-[240px]"
                          />
                        </ConfigProvider>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          生成指令 <span className="text-amber-500 font-bold">*</span>
                        </label>
                        <textarea 
                          placeholder="描述您想生成的工作流功能，如: 建立一个处理客服咨询的流程，包含意图识别和自动回复"
                          className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition-all min-h-[120px] text-sm bg-white shadow-inner"
                          value={formData.instruction}
                          onChange={e => setFormData({...formData, instruction: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

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
