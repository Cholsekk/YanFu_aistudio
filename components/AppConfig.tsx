
import React, { useState, useRef, useEffect } from 'react';
import { 
  Wand2, 
  Plus, 
  Settings2, 
  MessageSquare, 
  Send, 
  RotateCcw, 
  ChevronDown,
  Info,
  Trash2,
  Maximize2,
  Layout,
  Bot,
  Type,
  AlignLeft,
  List,
  Hash,
  CheckSquare,
  Database,
  Search,
  Sparkles,
  Cpu,
  Sliders
} from 'lucide-react';
import { 
  Input, 
  Button, 
  Slider, 
  Select, 
  Switch, 
  Tooltip, 
  Divider, 
  Empty,
  Badge,
  Space,
  Dropdown,
  MenuProps,
  message
} from 'antd';
import { motion, AnimatePresence } from 'motion/react';
import PromptGeneratorModal from './PromptGeneratorModal';
import KnowledgeBaseModal from './KnowledgeBaseModal';
import ModelSelect from './ModelSelect';
import { ModelTypeEnum, ModelParameterRule } from '../types';

const { TextArea } = Input;

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  type?: string;
  icon?: any;
  temperature: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  maxTokens: number;
  responseFormat: string;
  rules?: ModelParameterRule[];
}

const DEFAULT_MODEL: ModelConfig = {
  id: 'gpt-3.5-turbo-0125',
  name: 'gpt-3.5-turbo-0125',
  provider: 'OpenAI',
  type: 'GPT-3.5',
  icon: <Cpu className="w-4 h-4" />,
  temperature: 0.7,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
  maxTokens: 512,
  responseFormat: 'text'
};

interface Variable {
  id: string;
  name: string;
  type: string;
  value?: any;
  options?: string[];
}

interface KnowledgeBase {
  id: string;
  name: string;
  count: number;
}

const AppConfig: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isMultiModel, setIsMultiModel] = useState(false);
  const [models, setModels] = useState<ModelConfig[]>([DEFAULT_MODEL]);
  const [messages, setMessages] = useState<Record<string, { role: 'user' | 'assistant'; content: string }[]>>({
    [DEFAULT_MODEL.id]: []
  });
  const [isStreaming, setIsStreaming] = useState<Record<string, boolean>>({});
  const [inputValue, setInputValue] = useState('');
  const [showParams, setShowParams] = useState<string | null>(null);
  const [metadataFilter, setMetadataFilter] = useState('disabled');
  const [manualFilters, setManualFilters] = useState<{ key: string; value: string }[]>([]);

  const onPublish = () => {
    const hide = message.loading('正在发布配置...', 0);
    setTimeout(() => {
      hide();
      message.success('配置发布成功！');
    }, 1500);
  };

  const addVariable = (type: string) => {
    const newVar: Variable = {
      id: `var-${Date.now()}`,
      name: `变量_${variables.length + 1}`,
      type,
      value: type === 'checkbox' ? false : type === 'number' ? 0 : '',
      options: type === 'select' ? ['选项1', '选项2'] : undefined
    };
    setVariables([...variables, newVar]);
  };

  const variableMenuItems: MenuProps['items'] = [
    { key: 'text', label: '文本', icon: <Type className="w-4 h-4" />, onClick: () => addVariable('text') },
    { key: 'paragraph', label: '段落', icon: <AlignLeft className="w-4 h-4" />, onClick: () => addVariable('paragraph') },
    { key: 'select', label: '下拉选项', icon: <List className="w-4 h-4" />, onClick: () => addVariable('select') },
    { key: 'number', label: '数字', icon: <Hash className="w-4 h-4" />, onClick: () => addVariable('number') },
    { key: 'checkbox', label: '复选框', icon: <CheckSquare className="w-4 h-4" />, onClick: () => addVariable('checkbox') },
    { type: 'divider' },
    { key: 'api', label: '基于 API 的变量', icon: <Database className="w-4 h-4" />, onClick: () => addVariable('api') },
  ];

  const addKnowledgeBase = () => {
    setIsKBModalOpen(true);
  };

  const handleKBAdd = (selected: any[]) => {
    const newKBs = selected.map(kb => ({
      id: kb.id,
      name: kb.name,
      count: Math.floor(Math.random() * 100) + 10
    }));
    setKnowledgeBases([...knowledgeBases, ...newKBs]);
  };

  const loadPreset = (preset: string) => {
    const presets: Record<string, Partial<ModelConfig>> = {
      'creative': { temperature: 1.2, topP: 0.95, presencePenalty: 0.1 },
      'precise': { temperature: 0.1, topP: 0.1, presencePenalty: 0 },
      'balanced': { temperature: 0.7, topP: 1, presencePenalty: 0 },
    };
    const config = presets[preset];
    if (config) {
      setModels(models.map(m => ({ ...m, ...config })));
    }
  };

  const metadataMenuItems: MenuProps['items'] = [
    { key: 'disabled', label: '禁用', children: [{ key: 'disabled_desc', label: '禁用元数据过滤', disabled: true }] },
    { key: 'auto', label: '自动', children: [{ key: 'auto_desc', label: '根据用户查询自动生成元数据过滤条件', disabled: true }] },
    { key: 'manual', label: '手动', children: [{ key: 'manual_desc', label: '手动添加元数据过滤条件', disabled: true }] },
  ];

  const chatEndRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToBottom = (modelId: string) => {
    chatEndRefs.current[modelId]?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    models.forEach(model => scrollToBottom(model.id));
  }, [messages, models]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || Object.values(isStreaming).some(s => s)) return;

    const userContent = inputValue;
    setInputValue('');

    // Add user message to configured models
    setMessages(prev => {
      const next = { ...prev };
      models.forEach(model => {
        if (model.name) {
          next[model.id] = [...(next[model.id] || []), { role: 'user', content: userContent }];
        }
      });
      return next;
    });

    // Start streaming for each configured model
    models.forEach(model => {
      if (!model.name) return;
      
      setIsStreaming(prev => ({ ...prev, [model.id]: true }));
      
      // Add empty assistant message
      setMessages(prev => ({
        ...prev,
        [model.id]: [...(prev[model.id] || []), { role: 'assistant', content: '' }]
      }));

      const targetResponse = `这是来自 ${model.name} 的流式回复。为了模拟真实效果，我会逐字输出。在实际应用中，这里将对接真实的流式 API 接口。`;
      let currentContent = "";
      let charIndex = 0;

      const interval = setInterval(() => {
        setMessages(prev => {
          const modelMsgs = [...(prev[model.id] || [])];
          if (modelMsgs.length > 0) {
            const lastMsg = modelMsgs[modelMsgs.length - 1];
            if (lastMsg.role === 'assistant') {
              // Append next character
              const nextChar = targetResponse[charIndex];
              if (nextChar !== undefined) {
                currentContent += nextChar;
                modelMsgs[modelMsgs.length - 1] = { ...lastMsg, content: currentContent };
                charIndex++;
              } else {
                clearInterval(interval);
                setIsStreaming(p => ({ ...p, [model.id]: false }));
              }
            }
          }
          return { ...prev, [model.id]: modelMsgs };
        });
      }, 30);
    });
  };

  const addModel = () => {
    if (models.length >= 4) return;
    const newId = `model-${Date.now()}`;
    const newModel = { ...DEFAULT_MODEL, id: newId, name: '' };
    setModels([...models, newModel]);
    setMessages({ ...messages, [newId]: [] });
    if (!isMultiModel) setIsMultiModel(true);
  };

  const removeModel = (id: string) => {
    if (models.length <= 1) return;
    setModels(models.filter(m => m.id !== id));
    const newMsgs = { ...messages };
    delete newMsgs[id];
    setMessages(newMsgs);
  };

  const updateModelParam = (id: string, param: keyof ModelConfig | 'model_info', value: any, extra?: { provider: string; rules?: ModelParameterRule[] }) => {
    setModels(models.map(m => {
      if (m.id === id) {
        if (param === 'model_info') {
          const { provider, rules } = extra || { provider: '' };
          return { 
            ...m, 
            name: value, 
            provider: provider || m.provider,
            rules: rules || m.rules,
            // Reset params to defaults if rules are provided
            ...(rules ? rules.reduce((acc, rule) => {
              if (rule.default !== undefined) {
                const keyMap: Record<string, keyof ModelConfig> = {
                  'temperature': 'temperature',
                  'top_p': 'topP',
                  'presence_penalty': 'presencePenalty',
                  'frequency_penalty': 'frequencyPenalty',
                  'max_tokens': 'maxTokens'
                };
                const configKey = keyMap[rule.name];
                if (configKey) {
                  acc[configKey] = rule.default as any;
                }
              }
              return acc;
            }, {} as any) : {})
          };
        }
        if (param === 'name') {
          const modelInfo: Record<string, { type: string; icon: any }> = {
            'gpt-3.5-turbo-0125': { type: 'GPT-3.5', icon: <Cpu className="w-4 h-4" /> },
            'gpt-4-turbo': { type: 'GPT-4', icon: <Sparkles className="w-4 h-4" /> },
          };
          const info = modelInfo[value];
          return { ...m, name: value, type: info?.type || m.type, icon: info?.icon || m.icon };
        }
        return { ...m, [param]: value };
      }
      return m;
    }));
  };

  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isKBModalOpen, setIsKBModalOpen] = useState(false);

  const handleAutoGenerate = () => {
    if (isAutoGenerating) return;
    setIsAutoGenerating(true);
    const targetPrompt = "你是一个专业的人工智能助手。请根据用户的输入，提供准确、简洁且有帮助的回答。你可以处理各种任务，包括代码编写、文本翻译、创意写作和逻辑分析。";
    let currentText = "";
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < targetPrompt.length) {
        currentText += targetPrompt[index];
        setPrompt(currentText);
        index++;
      } else {
        clearInterval(interval);
        setIsAutoGenerating(false);
      }
    }, 30);
  };

  const resetChat = () => {
    const newMsgs: Record<string, { role: 'user' | 'assistant'; content: string }[] > = {};
    models.forEach(m => newMsgs[m.id] = []);
    setMessages(newMsgs);
  };

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      {/* Left Configuration Area */}
      <div className="w-[480px] flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 overflow-y-auto flex-grow space-y-4 custom-scrollbar">
          {/* Prompt Section Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<Wand2 className="w-3.5 h-3.5 text-primary-600" />}
                  className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 flex items-center gap-1.5 text-xs font-medium"
                  onClick={() => setIsPromptModalOpen(true)}
                >
                  提示词生成器
                </Button>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<Sparkles className={`w-3.5 h-3.5 text-primary-600 ${isAutoGenerating ? 'animate-spin' : ''}`} />}
                  className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 flex items-center gap-1.5 text-xs font-medium"
                  onClick={handleAutoGenerate}
                  disabled={isAutoGenerating}
                >
                  {isAutoGenerating ? '生成中...' : '自动生成'}
                </Button>
              </div>
            </div>
            <div className="relative group">
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="在这里写你的提示词，输入 '{' 插入变量、输入 '/' 插入提示内容块"
                autoSize={{ minRows: 8, maxRows: 15 }}
                className="rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm leading-relaxed"
              />
            </div>
          </motion.div>

          {/* Variables Section Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">变量</span>
                <Tooltip title="变量能使用用户输入表单引入提示词或开场白">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <Dropdown menu={{ items: variableMenuItems }} placement="bottomRight" trigger={['click']}>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<Plus className="w-3.5 h-3.5" />}
                  className="text-gray-500 hover:text-primary-600 hover:bg-gray-50 flex items-center gap-1 text-xs font-medium"
                >
                  添加
                </Button>
              </Dropdown>
            </div>
            {variables.length > 0 ? (
              <div className="space-y-2">
                <AnimatePresence>
                  {variables.map((v, i) => (
                    <motion.div 
                      key={v.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 group/var"
                    >
                      <div className="w-6 h-6 rounded bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                        {v.type === 'text' && <Type className="w-3 h-3" />}
                        {v.type === 'paragraph' && <AlignLeft className="w-3 h-3" />}
                        {v.type === 'select' && <List className="w-3 h-3" />}
                        {v.type === 'number' && <Hash className="w-3 h-3" />}
                        {v.type === 'checkbox' && <CheckSquare className="w-3 h-3" />}
                        {v.type === 'api' && <Database className="w-3 h-3" />}
                      </div>
                      <Input 
                        size="small" 
                        placeholder="变量名" 
                        value={v.name}
                        className="text-xs border-none bg-transparent focus:bg-white transition-colors"
                        onChange={(e) => {
                          const newVars = [...variables];
                          newVars[i].name = e.target.value;
                          setVariables(newVars);
                        }}
                      />
                      <div className="flex items-center gap-1 opacity-0 group-hover/var:opacity-100 transition-opacity">
                        <Tooltip title="设置">
                          <Button type="text" size="small" icon={<Settings2 className="w-3 h-3 text-gray-400" />} />
                        </Tooltip>
                        <Trash2 
                          className="w-3.5 h-3.5 text-gray-300 hover:text-red-500 cursor-pointer transition-colors" 
                          onClick={() => setVariables(variables.filter((_, idx) => idx !== i))}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-4 text-center">
                <p className="text-[11px] text-gray-400">变量能使用用户输入表单引入提示词或开场白，你可以试试在提示词中输入 {"{{input}}"}</p>
              </div>
            )}
          </motion.div>

          {/* Knowledge Base Section Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">知识库</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<Settings2 className="w-3.5 h-3.5" />}
                  className="text-gray-500 hover:text-primary-600 hover:bg-gray-50 flex items-center gap-1 text-xs font-medium"
                >
                  召回设置
                </Button>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<Plus className="w-3.5 h-3.5" />}
                  className="text-gray-500 hover:text-primary-600 hover:bg-gray-50 flex items-center gap-1 text-xs font-medium"
                  onClick={addKnowledgeBase}
                >
                  添加
                </Button>
              </div>
            </div>
            {knowledgeBases.length > 0 ? (
              <div className="space-y-2">
                <AnimatePresence>
                  {knowledgeBases.map((kb, i) => (
                    <motion.div 
                      key={kb.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 group/kb"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-700">{kb.name}</p>
                          <p className="text-[10px] text-gray-400">{kb.count} 个分段</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/kb:opacity-100 transition-opacity">
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-500" />} 
                          onClick={() => setKnowledgeBases(knowledgeBases.filter(item => item.id !== kb.id))}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-4 text-center">
                <p className="text-[11px] text-gray-400">您可以导入知识库作为上下文</p>
              </div>
            )}
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">元数据过滤</span>
                  <Tooltip title="根据元数据对知识库进行过滤">
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  </Tooltip>
                </div>
                <Select 
                  value={metadataFilter}
                  onChange={setMetadataFilter}
                  size="small"
                  className="w-24"
                  options={[
                    { value: 'disabled', label: '禁用' },
                    { value: 'auto', label: '自动' },
                    { value: 'manual', label: '手动' }
                  ]}
                />
              </div>
              
              <AnimatePresence>
                {metadataFilter === 'manual' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    {manualFilters.map((filter, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input 
                          size="small" 
                          placeholder="键" 
                          value={filter.key}
                          className="text-xs"
                          onChange={(e) => {
                            const newFilters = [...manualFilters];
                            newFilters[idx].key = e.target.value;
                            setManualFilters(newFilters);
                          }}
                        />
                        <Input 
                          size="small" 
                          placeholder="值" 
                          value={filter.value}
                          className="text-xs"
                          onChange={(e) => {
                            const newFilters = [...manualFilters];
                            newFilters[idx].value = e.target.value;
                            setManualFilters(newFilters);
                          }}
                        />
                        <Trash2 
                          className="w-3.5 h-3.5 text-gray-300 hover:text-red-500 cursor-pointer" 
                          onClick={() => setManualFilters(manualFilters.filter((_, i) => i !== idx))}
                        />
                      </div>
                    ))}
                    <Button 
                      type="dashed" 
                      size="small" 
                      block 
                      icon={<Plus className="w-3 h-3" />}
                      className="text-[10px]"
                      onClick={() => setManualFilters([...manualFilters, { key: '', value: '' }])}
                    >
                      添加过滤条件
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-white">
          <Button 
            type="primary" 
            block 
            size="large"
            className="h-12 rounded-xl font-bold shadow-lg shadow-primary-500/20 bg-gradient-to-r from-primary-600 to-primary-500 border-none hover:scale-[1.02] transition-transform"
            onClick={onPublish}
          >
            发布
          </Button>
        </div>
      </div>

      {/* Right Debug Area */}
      <div className="flex-grow flex flex-col bg-gray-50/50">
        {/* Debug Header */}
        <div className="h-14 border-b border-gray-100 px-6 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-900">调试与预览</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {!isMultiModel && (
                <div className="flex items-center gap-2">
                  <ModelSelect
                    className="w-48"
                    value={models[0].name}
                    modelType={ModelTypeEnum.textGeneration}
                    onChange={(m, provider, rules) => updateModelParam(models[0].id, 'model_info', m, { provider, rules })}
                  />
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<Settings2 className="w-4 h-4" />}
                    className="text-gray-400 hover:text-primary-600"
                    onClick={() => setShowParams(models[0].id)}
                  />
                </div>
              )}
              <Button 
                type={isMultiModel ? 'default' : 'primary'}
                size="small"
                className={`rounded-lg px-3 text-xs font-bold ${!isMultiModel ? 'bg-primary-600 border-none shadow-sm' : ''}`}
                onClick={() => {
                  if (!isMultiModel) {
                    // Entering multi-model mode: reset to exactly 2 models
                    const newId = `model-${Date.now()}`;
                    const firstModel = models[0];
                    const secondModel = { ...DEFAULT_MODEL, id: newId, name: '' };
                    setModels([firstModel, secondModel]);
                    setMessages({
                      [firstModel.id]: messages[firstModel.id] || [],
                      [newId]: []
                    });
                    setIsMultiModel(true);
                  } else {
                    // Exiting multi-model mode: keep only the first model
                    setModels([models[0]]);
                    setIsMultiModel(false);
                  }
                }}
              >
                {isMultiModel ? '退出多模型' : '多模型调试'}
              </Button>
            </div>
            {isMultiModel && (
              <>
                <div className="w-px h-4 bg-gray-200"></div>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<Plus className="w-3.5 h-3.5" />}
                  className="text-primary-600 hover:text-primary-700 font-medium text-xs"
                  onClick={addModel}
                  disabled={models.length >= 4}
                >
                  添加模型({models.length}/4)
                </Button>
              </>
            )}
            <div className="w-px h-4 bg-gray-200"></div>
            <Button 
              type="text" 
              size="small" 
              icon={<RotateCcw className="w-4 h-4" />}
              className="text-gray-400 hover:text-primary-600 transition-colors"
              onClick={resetChat}
            />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-hidden relative p-4">
          <div className={`h-full grid gap-4 overflow-y-auto custom-scrollbar max-w-[1400px] mx-auto ${
            !isMultiModel || models.length === 1 ? 'grid-cols-1' :
            models.length === 2 ? 'grid-cols-2' :
            models.length === 3 ? 'grid-cols-3' :
            'grid-cols-2'
          }`}>
            {(isMultiModel ? models : [models[0]]).map((model, index) => (
              <div 
                key={model.id} 
                className={`flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative`}
              >
                {/* Model Header */}
                <div className="h-12 px-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 italic">#{index + 1}</span>
                    <ModelSelect
                      className="w-44"
                      value={model.name}
                      modelType={ModelTypeEnum.textGeneration}
                      onChange={(m, provider, rules) => updateModelParam(model.id, 'model_info', m, { provider, rules })}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip title="参数设置">
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<Settings2 className="w-3.5 h-3.5" />} 
                        className="text-gray-400 hover:text-primary-600"
                        onClick={() => setShowParams(model.id)}
                      />
                    </Tooltip>
                    {isMultiModel && models.length > 1 && (
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<Trash2 className="w-3.5 h-3.5" />} 
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => removeModel(model.id)}
                      />
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-5 space-y-5 custom-scrollbar bg-gray-50/10">
                  {messages[model.id]?.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-xs text-gray-400 font-medium">开始对话</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {messages[model.id]?.map((msg, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-primary-600 text-white rounded-tr-none' 
                              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                          }`}>
                            {msg.content}
                            {msg.role === 'assistant' && isStreaming[model.id] && i === messages[model.id].length - 1 && (
                              <span className="inline-block w-1.5 h-4 ml-1 bg-primary-500 animate-pulse align-middle" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  <div ref={el => { chatEndRefs.current[model.id] = el; }} />
                </div>

                {/* Parameter Sidebar Overlay */}
                <AnimatePresence>
                  {showParams === model.id && (
                    <motion.div 
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="absolute inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-gray-100 z-30 flex flex-col"
                    >
                      <div className="h-14 px-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0">
                        <div className="flex items-center gap-2">
                          <Settings2 className="w-4 h-4 text-primary-600" />
                          <span className="text-sm font-bold text-gray-900">参数设置</span>
                        </div>
                        <Button type="text" size="small" icon={<Plus className="w-4 h-4 rotate-45" />} onClick={() => setShowParams(null)} />
                      </div>
                      <div className="p-6 space-y-8 overflow-y-auto flex-grow custom-scrollbar">
                        {(model.rules || [
                          { label: { zh_Hans: '温度 (Temperature)', en_US: 'Temperature' }, name: 'temperature', min: 0, max: 2, type: 'slider', precision: 1 },
                          { label: { zh_Hans: 'Top P', en_US: 'Top P' }, name: 'top_p', min: 0, max: 1, type: 'slider', precision: 2 },
                          { label: { zh_Hans: '存在惩罚', en_US: 'Presence Penalty' }, name: 'presence_penalty', min: -2, max: 2, type: 'slider', precision: 1 },
                          { label: { zh_Hans: '频率惩罚', en_US: 'Frequency Penalty' }, name: 'frequency_penalty', min: -2, max: 2, type: 'slider', precision: 1 },
                          { label: { zh_Hans: '最大标记 (Max Tokens)', en_US: 'Max Tokens' }, name: 'max_tokens', min: 1, max: 4096, type: 'slider', precision: 0 },
                        ]).map((rule: any) => {
                          const keyMap: Record<string, keyof ModelConfig> = {
                            'temperature': 'temperature',
                            'top_p': 'topP',
                            'presence_penalty': 'presencePenalty',
                            'frequency_penalty': 'frequencyPenalty',
                            'max_tokens': 'maxTokens'
                          };
                          const configKey = keyMap[rule.name];
                          if (!configKey) return null;
                          
                          const label = typeof rule.label === 'string' ? rule.label : (rule.label?.zh_Hans || rule.label?.en_US || rule.name);

                          return (
                            <div key={rule.name} className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-gray-500">{label}</span>
                                <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-[10px] font-bold font-mono border border-primary-100">
                                  {(model as any)[configKey]}
                                </span>
                              </div>
                              <Slider 
                                min={rule.min ?? 0} 
                                max={rule.max ?? 1} 
                                step={rule.precision ? 1 / Math.pow(10, rule.precision) : (rule.name === 'max_tokens' ? 1 : 0.1)} 
                                value={(model as any)[configKey]} 
                                onChange={v => updateModelParam(model.id, configKey, v)}
                                tooltip={{ open: false }}
                                className="m-0"
                              />
                            </div>
                          );
                        })}
                        <Divider className="my-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500">回复格式</span>
                          <Select 
                            size="small" 
                            value={model.responseFormat} 
                            className="w-28"
                            onChange={v => updateModelParam(model.id, 'responseFormat', v)}
                            options={[{ value: 'text', label: '文本' }, { value: 'json', label: 'JSON' }]}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto relative">
            <motion.div 
              whileFocus={{ scale: 1.01 }}
              className="relative flex items-center bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10 transition-all px-4 py-2 shadow-sm"
            >
              <Input 
                placeholder="和 Bot 聊天" 
                variant="borderless"
                className="flex-grow text-sm py-2"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleSendMessage}
                disabled={Object.values(isStreaming).some(s => s)}
              />
              <Button 
                type="primary" 
                icon={<Send className="w-4 h-4" />} 
                className="rounded-xl h-10 w-10 flex items-center justify-center p-0 shadow-lg shadow-primary-500/20 bg-primary-600 border-none hover:scale-110 transition-transform disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={Object.values(isStreaming).some(s => s)}
              />
            </motion.div>
            <div className="mt-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-[10px] text-white shadow-sm">
                  <Bot className="w-3 h-3" />
                </div>
                <span className="text-[11px] text-gray-500 font-medium">功能已开启</span>
              </div>
              <Button type="link" size="small" className="text-[11px] text-primary-600 p-0 flex items-center gap-1 hover:gap-2 transition-all">
                管理 <Layout className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
      <PromptGeneratorModal 
        isOpen={isPromptModalOpen} 
        onClose={() => setIsPromptModalOpen(false)} 
        onGenerate={(newPrompt) => setPrompt(newPrompt)}
      />
      
      <KnowledgeBaseModal 
        isOpen={isKBModalOpen} 
        onClose={() => setIsKBModalOpen(false)} 
        onAdd={handleKBAdd}
      />
    </div>
  );
};

export default AppConfig;
