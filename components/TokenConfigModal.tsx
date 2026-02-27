import React, { useState } from 'react';
import { Key, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { apiService } from '../services/apiService';

interface TokenConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TokenConfigModal: React.FC<TokenConfigModalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState(localStorage.getItem('console_token') || '');
  const [tenantId, setTenantId] = useState(localStorage.getItem('console_tenant_id') || '');
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem('console_api_base_url') || 'http://192.168.1.201:5005');
  const [mockMode, setMockMode] = useState(localStorage.getItem('console_mock_mode') === 'true');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');
    
    try {
      // Temporarily override base URL for testing
      const originalBaseUrl = localStorage.getItem('console_api_base_url');
      localStorage.setItem('console_api_base_url', baseUrl);
      
      // Try to fetch tasks (page 1, 1 item)
      await apiService.getTasks(1, 1);
      
      setTestStatus('success');
      setTestMessage('连接成功！API 响应正常。');
      
      // Restore original if needed (though usually we want to keep it if successful)
    } catch (error: any) {
      setTestStatus('error');
      setTestMessage(error.message || '连接失败，请检查控制台日志。');
    }
  };

  const handleSave = () => {
    localStorage.setItem('console_token', token);
    localStorage.setItem('console_tenant_id', tenantId);
    localStorage.setItem('console_api_base_url', baseUrl);
    localStorage.setItem('console_mock_mode', mockMode.toString());
    onClose();
    // Optionally refresh the page or trigger a re-fetch
    window.location.reload();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="配置 Token & API" 
      maxWidth="max-w-md"
      footer={
        <>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
          >
            保存
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 py-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Key className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">鉴权配置</h3>
            <p className="text-xs text-gray-500">配置接口鉴权 Token 及 API 基础路径</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">API Base URL</label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://192.168.1.201:5005"
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
            />
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {testStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> : '测试连接'}
            </button>
          </div>
          {testMessage && (
            <div className={`text-xs flex flex-col gap-1.5 mt-1 ${testStatus === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              <div className="flex items-start gap-1.5">
                {testStatus === 'success' ? <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                <span className="whitespace-pre-wrap">{testMessage}</span>
              </div>
              {testStatus === 'error' && (testMessage.includes('Mixed Content') || testMessage.includes('Private Network Access') || testMessage.includes('Failed to fetch')) && (
                <button
                  onClick={() => setMockMode(true)}
                  className="self-start ml-5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  立即开启 Mock 模式 (推荐)
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">console_token</label>
          <textarea 
            rows={4}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="请输入您的 console_token"
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">tenant_id (可选)</label>
          <input 
            type="text"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="请输入您的 tenant_id"
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-900">Mock 模式</p>
            <p className="text-[10px] text-gray-500">开启后将使用本地模拟数据，不请求真实接口</p>
          </div>
          <button 
            onClick={() => setMockMode(!mockMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${mockMode ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mockMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TokenConfigModal;
