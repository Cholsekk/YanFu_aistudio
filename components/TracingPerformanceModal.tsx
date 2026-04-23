import React, { useState } from 'react';
import { 
  X, 
  ExternalLink,
  Lock,
  Trash2,
  Settings,
  HelpCircle,
  Activity,
  Zap,
  CheckCircle2,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TracingProvider, LangSmithConfig, LangFuseConfig, TracingConfig } from '@/types';

export const DOC_URLS = {
  [TracingProvider.langSmith]: 'https://docs.smith.langchain.com',
  [TracingProvider.langfuse]: 'https://langfuse.com/docs'
};

// Mock definitions for tracing providers
export const TRACING_PROVIDERS = [
  {
    id: TracingProvider.langSmith,
    name: 'LangSmith',
    description: '一个全方位的开发者平台，适用于 LLM 驱动应用程序生命周期的每个步骤。',
    logo: <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#111111]"><span className="text-white font-bold text-xs">🛠️</span></span>,
    link: DOC_URLS[TracingProvider.langSmith],
  },
  {
    id: TracingProvider.langfuse,
    name: 'Langfuse',
    description: '跟踪、评估、提示管理和指标，以调试和改进您的 LLM 应用程序。',
    logo: <span className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white"><span className="text-red-500 font-bold text-xs">🚀</span></span>,
    link: DOC_URLS[TracingProvider.langfuse],
  }
];

interface TracingPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: TracingConfig;
  initialEnabled?: boolean;
}

export const TracingPerformanceModal: React.FC<TracingPerformanceModalProps> = ({ 
  isOpen, 
  onClose,
  initialConfig,
  initialEnabled = false
}) => {
  const [config, setConfig] = useState<TracingConfig | null>(initialConfig || null);
  const [enabled, setEnabled] = useState<boolean>(initialEnabled);
  const [activeProvider, setActiveProvider] = useState<TracingProvider | null>(null);
  
  // Settings edit state
  const [isEditing, setIsEditing] = useState(false);
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});

  const handleConfigure = (providerId: string) => {
    setActiveProvider(providerId as TracingProvider);
    setIsEditing(true);
    setSettingsForm({}); // Reset form for new config
  }

  const handleSaveAndEnable = () => {
    // Save settings and enable
    if (activeProvider) {
      // Cast the generic map to the actual expected type
      const tracing_config = activeProvider === TracingProvider.langSmith 
        ? {
            api_key: settingsForm['api_key'] || '',
            project: settingsForm['project'] || '',
            endpoint: settingsForm['endpoint'] || ''
          } as LangSmithConfig
        : {
            public_key: settingsForm['public_key'] || '',
            secret_key: settingsForm['secret_key'] || '',
            host: settingsForm['host'] || ''
          } as LangFuseConfig;

      setConfig({
        tracing_provider: activeProvider,
        tracing_config
      });
      setEnabled(true);
      setIsEditing(false);
      setActiveProvider(null);
    }
  }

  const handleToggle = () => {
    if (config?.tracing_provider) {
      setEnabled(!enabled);
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-x-0 bottom-0 top-[120px] z-[50] flex justify-end bg-black/20 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="w-[450px] bg-white h-full shadow-2xl flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {isEditing && activeProvider ? (
            // Configuration Form View
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
                  配置 {TRACING_PROVIDERS.find(p => p.id === activeProvider)?.name}
                </h2>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 flex-1 space-y-6">
                <div className="space-y-4">
                  {activeProvider === TracingProvider.langSmith && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">
                          API Key <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="password"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                          placeholder="输入你的API Key"
                          value={settingsForm['api_key'] || ''}
                          onChange={e => setSettingsForm({...settingsForm, api_key: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">
                          项目 <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                          placeholder="输入你的项目"
                          value={settingsForm['project'] || ''}
                          onChange={e => setSettingsForm({...settingsForm, project: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">
                          Endpoint
                        </label>
                        <input 
                          type="text"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 outline-none"
                          placeholder="https://api.smith.langchain.com"
                          value={settingsForm['endpoint'] || ''}
                          onChange={e => setSettingsForm({...settingsForm, endpoint: e.target.value})}
                        />
                      </div>
                    </>
                  )}

                  {activeProvider === TracingProvider.langfuse && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">
                          Public Key <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                          placeholder="输入你的Public Key"
                          value={settingsForm['public_key'] || ''}
                          onChange={e => setSettingsForm({...settingsForm, public_key: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">
                          Secret Key <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="password"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                          placeholder="输入你的Secret Key"
                          value={settingsForm['secret_key'] || ''}
                          onChange={e => setSettingsForm({...settingsForm, secret_key: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">
                          Host
                        </label>
                        <input 
                          type="text"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 outline-none"
                          placeholder="https://cloud.langfuse.com"
                          value={settingsForm['host'] || ''}
                          onChange={e => setSettingsForm({...settingsForm, host: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-4 pt-8">
                  <div className="flex justify-end gap-2 shrink-0">
                    {/* Fake Delete Button for showcase */}
                    <button className="px-3 py-2 bg-gray-50 text-gray-400 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors shrink-0 whitespace-nowrap"
                    >
                      取消
                    </button>
                    <button 
                      onClick={handleSaveAndEnable}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm shrink-0 whitespace-nowrap"
                    >
                      保存并启用
                    </button>
                  </div>
                  <div className="flex justify-start">
                    <a 
                      href={TRACING_PROVIDERS.find(p => p.id === activeProvider)?.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[13px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors"
                    >
                      查看 {TRACING_PROVIDERS.find(p => p.id === activeProvider)?.name} 的文档 <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500 pb-8">
                <Lock className="w-3.5 h-3.5" />
                <span>您的密钥将使用 <span className="text-blue-600 font-medium">PKCS1_OAEP</span> 技术进行加密和存储。</span>
              </div>
            </div>
          ) : (
            // Overview View
            <div className="flex flex-col h-full bg-white">
              <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-transparent">
                <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
                  应用性能追踪
                </h2>
                <button 
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Enable Card */}
              <div className="p-5 mx-6 mt-4 rounded-2xl bg-blue-50/50 border border-blue-100 mb-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">追踪</span>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm font-medium text-gray-600">{enabled ? '已启用' : '已禁用'}</span>
                    </div>
                    {/* Toggle Switch */}
                    <button 
                      onClick={() => {
                        if (!config?.tracing_provider) {
                          // No provider configured yet, maybe open the first active config if exists
                        } else {
                          handleToggle();
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-200'} ${(config && config.tracing_provider) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  捕获应用程序执行的完整上下文，包括 LLM 调用、上下文、提示、HTTP 请求等，发送到第三方跟踪平台。
                </p>
              </div>

              {/* Providers List */}
              <div className="flex-1 px-6 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-500 mb-4 px-1">配置提供商以启用追踪</h3>
                <div className="space-y-4">
                  {TRACING_PROVIDERS.map((provider) => {
                    const isConfigured = config?.tracing_provider === provider.id;
                    
                    return (
                      <div key={provider.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 transition-all hover:shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {provider.logo}
                            <span className="text-[17px] font-bold text-gray-900 tracking-tight">{provider.name}</span>
                          </div>
                          
                          <button 
                            onClick={() => handleConfigure(provider.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                          >
                            {isConfigured ? <Settings className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5 rotate-90" />}
                            配置
                          </button>
                        </div>
                        <p className="text-[13px] text-gray-500 leading-relaxed ml-11">
                          {provider.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
