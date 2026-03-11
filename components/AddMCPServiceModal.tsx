import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle, Pencil } from 'lucide-react';
import Modal from './Modal';
import IconPickerModal from './IconPickerModal';
import { getIcon } from '../constants';

interface Header {
  key: string;
  value: string;
}

interface AddMCPServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
  initialData?: any;
}

const AddMCPServiceModal: React.FC<AddMCPServiceModalProps> = ({ isOpen, onClose, onAdd, initialData }) => {
  const [activeTab, setActiveTab] = useState<'auth' | 'headers' | 'config'>('auth');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [formData, setFormData] = useState({
    server_url: initialData?.server_url || '',
    name: initialData?.name || '',
    server_identifier: initialData?.server_identifier || '',
    dynamicRegistration: initialData?.dynamicRegistration || false,
    clientId: initialData?.clientId || '',
    clientSecret: initialData?.clientSecret || '',
    timeout: initialData?.timeout || 30,
    sseTimeout: initialData?.sseTimeout || 300,
    icon: initialData?.icon || 'LayoutGrid',
    iconType: initialData?.iconType || 'icon',
    iconBgColor: initialData?.iconBgColor || 'bg-indigo-600'
  });
  const [headers, setHeaders] = useState<Header[]>(initialData?.headers || []);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          server_url: initialData.server_url || '',
          name: initialData.name || '',
          server_identifier: initialData.server_identifier || '',
          dynamicRegistration: initialData.dynamicRegistration || false,
          clientId: initialData.clientId || '',
          clientSecret: initialData.clientSecret || '',
          timeout: initialData.timeout || 30,
          sseTimeout: initialData.sseTimeout || 300,
          icon: initialData.icon || 'LayoutGrid',
          iconType: initialData.iconType || 'icon',
          iconBgColor: initialData.iconBgColor || 'bg-indigo-600'
        });
        setHeaders(initialData.headers || []);
      } else {
        setFormData({
          server_url: '',
          name: '',
          server_identifier: '',
          dynamicRegistration: false,
          clientId: '',
          clientSecret: '',
          timeout: 30,
          sseTimeout: 300,
          icon: 'LayoutGrid',
          iconType: 'icon',
          iconBgColor: 'bg-indigo-600'
        });
        setHeaders([]);
      }
    }
  }, [initialData, isOpen]);

  const isFormValid = formData.server_url.trim() !== '' && formData.name.trim() !== '' && formData.server_identifier.trim() !== '';

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const updateHeader = (index: number, field: keyof Header, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };
  const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index));

  const handleSubmit = () => {
    if (!isFormValid) return;
    onAdd({ ...formData, headers });
    onClose();
  };

  const handleIconConfirm = (data: { icon: string; iconType: 'icon' | 'image' | 'sys-icon'; iconBgColor?: string }) => {
    setFormData({ ...formData, icon: data.icon, iconType: data.iconType, iconBgColor: data.iconBgColor || 'bg-indigo-600' });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={initialData ? "修改 MCP 服务 (HTTP)" : "添加 MCP 服务 (HTTP)"}
        maxWidth="max-w-2xl"
        footer={
          <>
            <button onClick={onClose} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-semibold transition-all">取消</button>
            <button 
              onClick={handleSubmit} 
              disabled={!isFormValid}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initialData ? "保存" : "添加并授权"}
            </button>
          </>
        }
      >
        <div className="space-y-8 p-2">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2.5">服务端点 URL</label>
              <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="服务端点的 URL" value={formData.server_url} onChange={e => setFormData({...formData, server_url: e.target.value})} />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-grow">
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">名称</label>
                <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="命名你的 MCP 服务" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="flex-shrink-0">
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">图标</label>
                <button 
                  onClick={() => setIsIconPickerOpen(true)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200 overflow-hidden relative group"
                >
                  {formData.iconType === 'image' ? (
                    <img src={formData.icon} alt="icon" className="w-full h-full object-cover" />
                  ) : formData.iconType === 'sys-icon' ? (
                    <img src={`/sys_icons/Component ${formData.icon}.svg`} alt="icon" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full ${formData.iconBgColor} flex items-center justify-center`}>
                      {getIcon(formData.icon, "w-6 h-6")}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2.5">服务器标识符</label>
              <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="服务器唯一标识，例如 my-mcp-server" value={formData.server_identifier} onChange={e => setFormData({...formData, server_identifier: e.target.value})} />
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">工作空间内服务器的唯一标识。支持小写字母、数字、下划线和连字符，最多 24 个字符。</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
            {(['auth', 'headers', 'config'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === tab ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {tab === 'auth' ? '认证' : tab === 'headers' ? '请求头' : '配置'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'auth' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <span className="text-sm font-semibold text-indigo-900">使用动态客户端注册</span>
                  <button onClick={() => setFormData({...formData, dynamicRegistration: !formData.dynamicRegistration})} className={`w-12 h-6 rounded-full transition-colors relative ${formData.dynamicRegistration ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.dynamicRegistration ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                
                {!formData.dynamicRegistration && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">请将您的 OAuth 重定向 URL 配置为：</p>
                      <code className="bg-amber-100 px-2 py-1 rounded text-xs font-mono break-all">https://cloud.dify.ai/console/api/mcp/oauth/callback</code>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">客户端 ID</label>
                  <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="客户端 ID" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">客户端密钥</label>
                  <input type="password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="客户端密钥" value={formData.clientSecret} onChange={e => setFormData({...formData, clientSecret: e.target.value})} />
                </div>
              </div>
            )}

            {activeTab === 'headers' && (
              <div className="space-y-4">
                {headers.map((header, index) => (
                  <div key={index} className="flex gap-3">
                    <input type="text" className="w-1/3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="请求头名称" value={header.key} onChange={e => updateHeader(index, 'key', e.target.value)} />
                    <input type="text" className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="请求头值" value={header.value} onChange={e => updateHeader(index, 'value', e.target.value)} />
                    <button onClick={() => removeHeader(index)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
                <button onClick={addHeader} className="flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-all">
                  <Plus className="w-4 h-4" /> 添加请求头
                </button>
              </div>
            )}

            {activeTab === 'config' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">超时时间 (秒)</label>
                  <input type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={formData.timeout} onChange={e => setFormData({...formData, timeout: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">SSE 读取超时时间 (秒)</label>
                  <input type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={formData.sseTimeout} onChange={e => setFormData({...formData, sseTimeout: parseInt(e.target.value)})} />
                </div>
              </div>
            )}
          </div>
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

export default AddMCPServiceModal;
