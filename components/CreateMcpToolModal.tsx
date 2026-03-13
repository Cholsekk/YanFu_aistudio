
import React, { useState, useEffect } from 'react';
import { McpProvider, McpProviderRequest, McpProviderUpdateRequest } from '../types';
import { X, Info, Edit2, Globe, Server, Tag as TagIcon } from 'lucide-react';
import IconPickerModal from './IconPickerModal';
import Modal from './Modal';
import { SYS_ICON_IDS } from '../constants';
import * as LucideIcons from 'lucide-react';

interface CreateMcpToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: McpProvider | null;
  onSave: (data: McpProviderRequest | McpProviderUpdateRequest) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const CreateMcpToolModal: React.FC<CreateMcpToolModalProps> = ({
  isOpen,
  onClose,
  provider,
  onSave,
  onDelete
}) => {
  const [name, setName] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [serverIdentifier, setServerIdentifier] = useState('');
  const [icon, setIcon] = useState<string | { content: string; background: string }>({ content: 'Globe', background: '#f0f9ff' });
  const [iconUrl, setIconUrl] = useState<string>('');
  const [iconType, setIconType] = useState<'icon' | 'image' | 'sys-icon'>('icon');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isDynamicRegistration, setIsDynamicRegistration] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [timeout, setTimeoutVal] = useState<number | undefined>(undefined);
  const [sseReadTimeout, setSseReadTimeout] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'basic' | 'auth' | 'config'>('basic');

  useEffect(() => {
    if (provider && isOpen) {
      setName(provider.name || '');
      setServerUrl(provider.server_url || '');
      setServerIdentifier(provider.server_identifier || '');
      setIsDynamicRegistration(provider.is_dynamic_registration || false);
      setClientId(provider.authentication?.client_id || '');
      setClientSecret(provider.authentication?.client_secret || '');
      setTimeoutVal(provider.configuration?.timeout);
      setSseReadTimeout(provider.configuration?.sse_read_timeout);
      
      let initialIcon: any = provider.icon;
      try {
        if (typeof provider.icon === 'string') {
          const trimmedIcon = provider.icon.trim();
          if (trimmedIcon.startsWith('{')) {
            initialIcon = JSON.parse(trimmedIcon);
          } else if (!trimmedIcon.includes('/') && !trimmedIcon.startsWith('http') && !trimmedIcon.startsWith('data:')) {
            initialIcon = { content: trimmedIcon, background: provider.icon_background || '#f0f9ff' };
          }
        }
      } catch (e) {
        console.warn('Failed to parse icon JSON:', e);
      }
      setIcon(initialIcon || { content: 'Globe', background: provider.icon_background || '#f0f9ff' });
      setIconUrl(provider.icon_url || '');
      setIconType((provider as any).icon_type || 'icon');
    } else if (isOpen) {
      // Reset for new provider
      setName('');
      setServerUrl('');
      setServerIdentifier('');
      setIcon({ content: 'Globe', background: '#f0f9ff' });
      setIconUrl('');
    }
  }, [provider, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name || !serverUrl || !serverIdentifier) {
      alert('请填写所有必填字段');
      return;
    }

    setIsSaving(true);
    try {
      const iconStr = typeof icon === 'string' ? icon : JSON.stringify(icon);
      const iconBackground = typeof icon === 'object' ? icon.background : '';

      const auth = (clientId || clientSecret) ? { client_id: clientId, client_secret: clientSecret } : undefined;
      const config = (timeout !== undefined || sseReadTimeout !== undefined) ? { timeout, sse_read_timeout: sseReadTimeout } : undefined;

      if (provider) {
        const updateData: McpProviderUpdateRequest = {
          provider_id: provider.id,
          name,
          server_url: serverUrl,
          server_identifier: serverIdentifier,
          icon: iconStr,
          icon_type: iconType,
          icon_background: iconBackground,
          is_dynamic_registration: isDynamicRegistration,
          authentication: auth,
          configuration: config
        };
        await onSave(updateData);
      } else {
        const createData: McpProviderRequest = {
          name,
          server_url: serverUrl,
          server_identifier: serverIdentifier,
          icon: iconStr,
          icon_type: iconType,
          icon_background: iconBackground,
          is_dynamic_registration: isDynamicRegistration,
          is_team_authorization: false,
          authentication: auth,
          configuration: config
        };
        await onSave(createData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save MCP provider:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!provider || !onDelete) return;
    try {
      await onDelete(provider.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete MCP provider:', error);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleIconConfirm = (data: { icon: string; iconType: 'icon' | 'image' | 'sys-icon'; iconBgColor?: string; iconUrl?: string }) => {
    setIconType(data.iconType);
    if (data.iconType === 'icon') {
      setIcon({ content: data.icon, background: data.iconBgColor || '#f0f9ff' });
      setIconUrl('');
    } else if (data.iconType === 'sys-icon') {
      setIcon(data.icon);
      setIconUrl('');
    } else {
      setIcon(data.icon);
      setIconUrl(data.iconUrl || '');
    }
  };

  const getInitialIconValue = () => {
    if (iconType === 'sys-icon') {
      return { icon: icon as string, iconType: 'sys-icon' as const };
    }
    if (typeof icon === 'string') {
      return { icon, iconType: 'image' as const, iconUrl };
    }
    return { icon: icon.content, iconType: 'icon' as const, iconBgColor: icon.background };
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />

      <Modal
        isOpen={true}
        onClose={onClose}
        title={provider ? '编辑 MCP 工具提供商' : '添加 MCP 工具提供商'}
        maxWidth="max-w-2xl"
        zIndex="z-[110]"
        footer={
          <div className="flex justify-between items-center w-full">
            {provider ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
              >
                < LucideIcons.Trash2 className="w-4 h-4" />
                删除
              </button>
            ) : <div />}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium border border-gray-200 bg-white"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors text-sm font-medium shadow-sm shadow-primary-200 disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        }
      >
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-100 mb-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'basic' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              基本设置
            </button>
            <button
              onClick={() => setActiveTab('auth')}
              className={`py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'auth' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              认证
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'config' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              配置
            </button>
          </div>
          {/* Content */}
          {activeTab === 'basic' && (
            <>
              {/* Icon & Name */}
              <div className="flex gap-6 items-start">
                <div 
                  onClick={() => setIsIconPickerOpen(true)}
                  className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all group relative overflow-hidden"
                >
                  {typeof icon === 'string' ? (
                    <img src={iconUrl || (iconType === 'sys-icon' ? `/sys_icons/Component ${icon}.svg` : icon) || undefined} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div style={{ backgroundColor: icon.background }} className="w-full h-full flex items-center justify-center text-2xl text-white">
                      {(LucideIcons as any)[icon.content] ? React.createElement((LucideIcons as any)[icon.content], { className: "w-8 h-8" }) : icon.content}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit2 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-grow space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                      名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="例如: Weather MCP Server"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Server URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  服务器 URL <span className="text-red-500">*</span>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      MCP 服务器的 HTTP/HTTPS 地址。
                    </div>
                  </div>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="http://example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Server Identifier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  服务器标识符 <span className="text-red-500">*</span>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      用于唯一标识该 MCP 服务器。
                    </div>
                  </div>
                </label>
                <div className="relative">
                  <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={serverIdentifier}
                    onChange={(e) => setServerIdentifier(e.target.value)}
                    placeholder="weather-server-01"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'auth' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">动态注册</h4>
                  <p className="text-xs text-gray-500 mt-0.5">启用后将支持 MCP 动态注册流程</p>
                </div>
                <button
                  onClick={() => setIsDynamicRegistration(!isDynamicRegistration)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDynamicRegistration ? 'bg-primary-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDynamicRegistration ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Client ID</label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="输入 Client ID"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Secret</label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="输入 Client Secret"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  超时时间 (秒)
                </label>
                <input
                  type="number"
                  value={timeout || ''}
                  onChange={(e) => setTimeoutVal(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="默认超时时间"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  SSE 读取超时 (秒)
                </label>
                <input
                  type="number"
                  value={sseReadTimeout || ''}
                  onChange={(e) => setSseReadTimeout(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="SSE 读取超时时间"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </Modal>

      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onConfirm={handleIconConfirm}
        initialValue={getInitialIconValue()}
      />

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">删除 MCP 提供商?</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              删除后将无法使用该提供商提供的工具。此操作不可逆。
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
              >
                取消
              </button>
              <button 
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all shadow-sm"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateMcpToolModal;
