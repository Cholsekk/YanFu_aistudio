import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Plus, Check, Key, Clock, Shield, AlertCircle } from 'lucide-react';
import { message, Modal, Button, Space, Tooltip, Popconfirm } from 'antd';
import { monitoringService } from '../services/monitoringService';
import { ApiKeyItemResponse } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, appId }) => {
  const [keys, setKeys] = useState<ApiKeyItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [newKey, setNewKey] = useState<{ id: string; token: string } | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchKeys();
    }
  }, [isOpen, appId]);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const response = await monitoringService.getApiKeys(appId);
      setKeys(response.data);
    } catch (error) {
      message.error('获取API密钥失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      const response = await monitoringService.createApiKey(appId);
      setNewKey({ id: response.id, token: response.token });
      setIsCreateKeyModalOpen(true);
      fetchKeys();
    } catch (error) {
      message.error('创建API密钥失败');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      await monitoringService.deleteApiKey(appId, keyId);
      message.success('删除成功');
      fetchKeys();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCopy = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopyingId(id);
      setTimeout(() => setCopyingId(null), 2000);
    }
    message.success('已复制到剪贴板');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '从未使用';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-2 text-gray-900">
            <Key className="w-5 h-5 text-indigo-600" />
            <span>API 密钥管理</span>
          </div>
        }
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={800}
        centered
        className="apiKeyModal"
        styles={{
          body: { padding: '24px' }
        }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">密钥列表</h4>
              <p className="text-xs text-gray-500 mt-1">管理用于访问后端 API 的凭据。请妥善保管您的密钥。</p>
            </div>
            <button 
              onClick={handleCreateKey}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              创建密钥
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/30">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-bottom border-gray-200">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">密钥 ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">创建时间</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">最后使用</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">加载中...</span>
                      </div>
                    </td>
                  </tr>
                ) : keys.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <AlertCircle className="w-8 h-8 opacity-20" />
                        <span className="text-sm">暂无 API 密钥</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  keys.map((key) => (
                    <tr key={key.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-indigo-600" />
                          </div>
                          <code className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            {key.id.substring(0, 8)}...
                          </code>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(key.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${key.last_used_at ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {key.last_used_at ? formatDate(key.last_used_at) : '从未使用'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip title="复制 Token">
                            <button 
                              onClick={() => handleCopy(key.token, key.id)}
                              className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg transition-all"
                            >
                              {copyingId === key.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </Tooltip>
                          <Popconfirm
                            title="删除密钥"
                            description="确定要删除此 API 密钥吗？此操作不可撤销。"
                            onConfirm={() => handleDeleteKey(key.id)}
                            okText="删除"
                            cancelText="取消"
                            okButtonProps={{ danger: true }}
                          >
                            <button className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Popconfirm>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2 text-emerald-600">
            <Check className="w-5 h-5" />
            <span>密钥创建成功</span>
          </div>
        }
        open={isCreateKeyModalOpen}
        onCancel={() => setIsCreateKeyModalOpen(false)}
        footer={[
          <button 
            key="close" 
            onClick={() => setIsCreateKeyModalOpen(false)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            我已保存
          </button>,
        ]}
        centered
        width={480}
      >
        <div className="space-y-4 py-2">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 leading-relaxed">
              这是您的 API 密钥。请立即复制并安全保存，<strong>此后将无法再次查看此密钥。</strong>
            </p>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
              <code className="flex-1 font-mono text-sm text-gray-800 break-all select-all">
                {newKey?.token}
              </code>
              <button 
                onClick={() => handleCopy(newKey?.token || '')}
                className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors border border-gray-200"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ApiKeyModal;
