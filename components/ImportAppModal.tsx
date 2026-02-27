
import React, { useState } from 'react';
import Modal from './Modal';
import { UploadCloud } from 'lucide-react';

interface ImportAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (app: any) => void;
}

const ImportAppModal: React.FC<ImportAppModalProps> = ({ isOpen, onClose, onImport }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [url, setUrl] = useState('');

  const handleImport = () => {
    // Mock import logic
    onImport({
      name: activeTab === 'file' ? '导入的应用 (文件)' : '导入的应用 (URL)',
      description: '通过 DSL 导入的应用',
      type: '对话应用',
      typeLabel: '对话助手',
      icon: 'Cloud',
      iconBgColor: 'bg-green-600',
      tags: ['导入']
    });
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="导入 DSL"
      maxWidth="max-w-md"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium border border-gray-200">取消</button>
          <button 
            onClick={handleImport}
            disabled={activeTab === 'url' && !url}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
              (activeTab === 'url' && !url) 
                ? 'bg-blue-100 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            创建
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2 text-sm font-medium transition-all relative ${activeTab === 'file' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            文件
            {activeTab === 'file' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
          <button 
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 text-sm font-medium transition-all relative ${activeTab === 'url' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            URL
            {activeTab === 'url' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        </div>

        {activeTab === 'file' ? (
          <div className="border-2 border-dashed border-gray-100 rounded-xl py-12 flex flex-col items-center justify-center bg-gray-50/30 group hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
            </div>
            <p className="text-sm text-gray-500">
              拖拽文件至此，或者 <span className="text-blue-600 font-medium">选择文件</span>
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">DSL URL</label>
            <input 
              type="text" 
              placeholder="输入 DSL 文件的 URL" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportAppModal;
