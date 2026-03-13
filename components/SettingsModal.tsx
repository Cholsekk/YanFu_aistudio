import React, { useState } from 'react';
import { X, ChevronRight, Settings, Shield, FileText, User, Globe, ChevronDown } from 'lucide-react';
import Modal from './Modal';
import IconPickerModal from './IconPickerModal';
import { getIcon } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const [name, setName] = useState('智能制造智能体');
  const [description, setDescription] = useState('');
  const [useCustomIcon, setUseCustomIcon] = useState(false);
  const [language, setLanguage] = useState('zh');
  const [showWorkflow, setShowWorkflow] = useState(true);
  const [copyright, setCopyright] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [disclaimer, setDisclaimer] = useState('');
  
  // Icon state
  const [icon, setIcon] = useState('Bot');
  const [iconType, setIconType] = useState<'icon' | 'image' | 'sys-icon'>('icon');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const handleIconConfirm = (data: { icon: string; iconType: 'icon' | 'image' | 'sys-icon'; iconBgColor?: string; iconUrl?: string }) => {
    setIcon(data.icon);
    setIconType(data.iconType);
    setIsIconPickerOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="WebApp 设置" maxWidth="max-w-2xl">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-40 border-r border-gray-100 p-3 space-y-1">
          <button 
            onClick={() => setActiveTab('basic')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'basic' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings className="w-4 h-4" /> 基础设置
          </button>
          <button 
            onClick={() => setActiveTab('advanced')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'advanced' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Shield className="w-4 h-4" /> 高级设置
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4">
          {activeTab === 'basic' ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-900">WebApp 名称</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsIconPickerOpen(true)}
                    className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    {getIcon(icon, "w-6 h-6")}
                  </button>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-900">WebApp 描述</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="请输入 WebApp 的描述" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl h-20 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <label className="text-xs font-semibold text-gray-900">使用 WebApp 图标替换 🤖</label>
                  <p className="text-[10px] text-gray-500 mt-0.5">是否使用 WebApp 图标替换分享的应用界面中的 🤖</p>
                </div>
                <button onClick={() => setUseCustomIcon(!useCustomIcon)} className={`w-10 h-5 rounded-full transition-colors ${useCustomIcon ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${useCustomIcon ? 'translate-x-5.5' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-900 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> 语言</label>
                <div className="relative">
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 pr-8"
                  >
                    <option value="zh">简体中文</option>
                    <option value="en">English</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-900">版权</label>
                <input type="text" value={copyright} onChange={(e) => setCopyright(e.target.value)} placeholder="请输入作者或组织名称" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-900">隐私政策</label>
                <input type="text" value={privacyPolicy} onChange={(e) => setPrivacyPolicy(e.target.value)} placeholder="请输入隐私政策链接" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-900">自定义免责声明</label>
                <textarea value={disclaimer} onChange={(e) => setDisclaimer(e.target.value)} placeholder="请输入免责声明" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl h-20 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
        <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">取消</button>
        <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-200 transition-all">保存</button>
      </div>
      
      <IconPickerModal 
        isOpen={isIconPickerOpen} 
        onClose={() => setIsIconPickerOpen(false)} 
        onConfirm={handleIconConfirm}
        initialValue={{ icon, iconType }}
      />
    </Modal>
  );
};

export default SettingsModal;
