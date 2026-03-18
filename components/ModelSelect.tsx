import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Select, Tooltip, Spin, message } from 'antd';
import { Cpu, Search, Check, RefreshCw, Bot, AlertCircle, Settings, Star } from 'lucide-react';
import { apiService } from '../services/apiService';
import { Model, ModelTypeEnum, TypeWithI18N, ModelParameterRule } from '../types';

interface ModelSelectProps {
  value?: string;
  onChange?: (model: string, provider: string, rules?: ModelParameterRule[]) => void;
  modelType: ModelTypeEnum;
  className?: string;
  disableFetchRules?: boolean;
}

const getI18nText = (text: TypeWithI18N | string | undefined, lang: string = 'zh_Hans') => {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[lang] || text['en_US'] || '';
};

const ModelSelect: React.FC<ModelSelectProps> = ({ value, onChange, modelType, className = '', disableFetchRules = false }) => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const data = await apiService.fetchModelList(modelType);
        setModels(data || []);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [modelType]);

  const filteredModels = useMemo(() => {
    if (!searchQuery) return models;
    const query = searchQuery.toLowerCase();
    
    return models.map(provider => {
      const filteredItems = provider.models.filter(model => 
        model.model.toLowerCase().includes(query) || 
        getI18nText(model.label).toLowerCase().includes(query)
      );
      
      if (filteredItems.length > 0) {
        return {
          ...provider,
          models: filteredItems
        };
      }
      return null;
    }).filter(Boolean) as Model[];
  }, [models, searchQuery]);

  const selectedModelData = useMemo(() => {
    for (const provider of models) {
      const found = provider.models.find(m => m.model === value);
      if (found) {
        return { provider, model: found };
      }
    }
    return null;
  }, [models, value]);

  const handleSelect = async (modelValue: string, providerValue: string) => {
    if (disableFetchRules) {
      if (onChange) {
        onChange(modelValue, providerValue);
      }
      setIsOpen(false);
      return;
    }
    try {
      const rulesRes = await apiService.fetchModelParameterRules(providerValue, modelValue);
      if (onChange) {
        onChange(modelValue, providerValue, rulesRes.data);
      }
    } catch (e) {
      if (onChange) {
        onChange(modelValue, providerValue);
      }
    }
    setIsOpen(false);
  };

  const handleGetPayUrl = async (providerValue: string) => {
    try {
      const res = await apiService.getPayUrl(providerValue);
      if (res.url) {
        window.open(res.url, '_blank');
      } else {
        message.error('无法获取支付链接');
      }
    } catch (e) {
      message.error('获取支付链接失败');
    }
  };

  const handleSetDefault = async (modelValue: string, providerValue: string) => {
    try {
      await apiService.updateDefaultModel(modelValue, modelType, providerValue);
      message.success('已设置为默认模型');
    } catch (e) {
      message.error('设置默认模型失败');
    }
  };

  return (
    <Select
      className={`w-full custom-select ${className}`}
      value={value}
      open={isOpen}
      onDropdownVisibleChange={setIsOpen}
      dropdownMatchSelectWidth={false}
      dropdownStyle={{ width: '320px', padding: 0 }}
      labelRender={() => {
        if (!value) {
          return <span className="text-gray-400">请选择模型</span>;
        }
        
        if (selectedModelData) {
          return (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center bg-gray-50">
                {selectedModelData.provider.icon_small ? (
                  <img src={getI18nText(selectedModelData.provider.icon_small)} alt="icon" className="w-full h-full object-cover" />
                ) : (
                  <Bot className="w-3 h-3 text-gray-400" />
                )}
              </div>
              <span className="text-sm text-gray-900">{getI18nText(selectedModelData.model.label) || selectedModelData.model.model}</span>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-900">{value}</span>
          </div>
        );
      }}
      popupRender={() => (
        <div className="p-2 flex flex-col max-h-[400px]">
          <div className="relative mb-2 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索模型名称..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-primary-500/20 transition-all"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="overflow-y-auto flex-grow custom-scrollbar pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spin size="small" />
              </div>
            ) : filteredModels.length > 0 ? (
              filteredModels.map((provider) => (
                <div key={provider.provider} className="mb-3 last:mb-0">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {provider.icon_small && (
                        <img src={getI18nText(provider.icon_small)} alt="" className="w-3 h-3 object-contain" />
                      )}
                      {getI18nText(provider.label)}
                    </div>
                    {/* 暂时隐藏获取支付链接入口
                    <button 
                      className="text-primary-500 hover:text-primary-600 font-medium normal-case"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetPayUrl(provider.provider);
                      }}
                    >
                      获取支付链接
                    </button>
                    */}
                  </div>
                  <div className="space-y-0.5">
                    {provider.models.map((model) => {
                      const isSelected = value === model.model;
                      return (
                        <div 
                          key={model.model}
                          className={`px-3 py-2 flex items-center justify-between rounded-lg cursor-pointer transition-colors group ${
                            isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelect(model.model, provider.provider)}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex flex-col truncate">
                              <span className={`text-sm font-medium truncate ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                                {getI18nText(model.label) || model.model}
                              </span>
                              <span className="text-[10px] text-gray-400 truncate">
                                {model.model}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="opacity-0 group-hover:opacity-100 text-[10px] text-primary-500 hover:text-primary-600 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefault(model.model, provider.provider);
                              }}
                            >
                              设为默认
                            </button>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 text-primary-600" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">
                未找到匹配的模型
              </div>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 shrink-0">
            <button className="w-full py-2 text-xs text-primary-600 font-bold hover:bg-primary-50 rounded-lg transition-all flex items-center justify-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              模型管理与设置
            </button>
          </div>
        </div>
      )}
    />
  );
};

export default ModelSelect;
