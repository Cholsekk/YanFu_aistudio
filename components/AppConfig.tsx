
import React, { useState, useRef, useEffect } from 'react';
import { 
  Wand2, 
  Plus, 
  Settings2, 
  Settings,
  MessageSquare, 
  Send, 
  RotateCcw, 
  Mic,
  Type,
  Quote, 
  ChevronDown,
  Info,
  ShieldCheck,
  AlignLeft,
  List,
  Hash,
  CheckSquare,
  Database,
  Search,
  Sparkles,
  Cpu,
  Sliders,
  PlayCircle,
  Store,
  Code,
  FileText,
  ArrowUpRight,
  Paperclip,
  Trash2
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
  message,
  Popover,
  Modal,
  Checkbox,
  Drawer
} from 'antd';
import { motion, AnimatePresence } from 'motion/react';
import PromptGeneratorModal from './PromptGeneratorModal';
import KnowledgeBaseModal from './KnowledgeBaseModal';
import ModelSelect from './ModelSelect';
import VariableEditModal, { Variable } from './VariableEditModal';
import { ModelTypeEnum, ModelParameterRule } from '../types';
import { apiService } from '../services/apiService';

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

interface KnowledgeBase {
  id: string;
  name: string;
  count: number;
}

const features = [
  { id: 'opening', name: '对话开场白', desc: '在对话型应用中，让 AI 主动说第一段话可以拉近与用户间的距离。', icon: MessageSquare, color: 'bg-blue-500' },
  { id: 'suggestion', name: '下一步问题建议', desc: '设置下一步问题建议可以让用户更好的对话。', icon: MessageSquare, color: 'bg-sky-500' },
  { id: 'tts', name: '文字转语音', desc: '文本可以转换成语音。', icon: Type, color: 'bg-indigo-500' },
  { id: 'stt', name: '语音转文字', desc: '您可以使用语音输入。', icon: Mic, color: 'bg-purple-500' },
  { id: 'citation', name: '引用和归属', desc: '显示源文档和生成内容的归属部分。', icon: Quote, color: 'bg-orange-500' },
  { id: 'content_check', name: '内容审查', desc: '您可以调用审查 API 或者维护敏感词库来使模型更安全地输出。', icon: ShieldCheck, color: 'bg-emerald-500' },
  { id: 'annotation', name: '标注回复', desc: '启用后，将标注用户的回复，以便在用户重复提问时快速响应。', icon: MessageSquare, color: 'bg-blue-500' },
  { id: 'attachment', name: '上传附件', desc: '支持上传图片、文档等附件。', icon: Plus, color: 'bg-amber-500' },
];

const AppConfig: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isMultiModel, setIsMultiModel] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});

  const handleVariableChange = (id: string, value: any) => {
    setVariableValues(prev => ({ ...prev, [id]: value }));
  };
  const [models, setModels] = useState<ModelConfig[]>([DEFAULT_MODEL]);
  const [messages, setMessages] = useState<Record<string, { role: 'user' | 'assistant'; content: string }[]>>({
    [DEFAULT_MODEL.id]: []
  });
  const [isStreaming, setIsStreaming] = useState<Record<string, boolean>>({});
  const [inputValue, setInputValue] = useState('');
  const [showParams, setShowParams] = useState<string | null>(null);
  const [showFeaturesDrawer, setShowFeaturesDrawer] = useState(false);
  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>({
    opening: true,
    suggestion: true,
    tts: false,
    stt: false,
    citation: false,
    content_check: false,
    annotation: false,
    attachment: false,
  });
  const [metadataFilter, setMetadataFilter] = useState('disabled');
  const [manualFilters, setManualFilters] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    const fetchDefaultModel = async () => {
      try {
        const res = await apiService.fetchDefaultModal(ModelTypeEnum.textGeneration);
        if (res && res.model && res.provider) {
          let rules: ModelParameterRule[] = [];
          try {
            const rulesRes = await apiService.fetchModelParameterRules(res.provider.provider, res.model);
            rules = rulesRes.data || [];
          } catch (e) {
            console.error('Failed to fetch model parameter rules:', e);
          }
          
          const newModel: ModelConfig = {
            ...DEFAULT_MODEL,
            id: res.model,
            name: res.model,
            provider: res.provider.provider,
            rules,
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
          
          setModels([newModel]);
          setMessages({ [newModel.id]: [] });
        }
      } catch (e) {
        console.error('Failed to fetch default model:', e);
      }
    };
    fetchDefaultModel();
  }, []);

  const onPublish = () => {
    const hide = message.loading('正在发布配置...', 0);
    setTimeout(() => {
      hide();
      message.success('配置发布成功！');
    }, 1500);
  };

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
    const newModels = models.filter(m => m.id !== id);
    setModels(newModels);
    const newMsgs = { ...messages };
    delete newMsgs[id];
    setMessages(newMsgs);
    if (newModels.length === 1) {
      setIsMultiModel(false);
    }
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
                <span className="text-sm font-bold text-gray-900">提示词</span>
                <Tooltip title="提示词用于对 AI 的回复做出一系列指令和约束。可插入表单变量，例如 {{input}}。这段提示词不会被最终用户所看到。">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
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
            className="bg-gray-50/50 rounded-xl border border-gray-200 p-4 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">{"{x} 变量"}</span>
                <Tooltip title="变量将以表单形式让用户在对话前填写，用户填写的表单内容将自动替换提示词中的变量。">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <Button 
                type="text" 
                size="small" 
                icon={<Plus className="w-3.5 h-3.5" />}
                className="text-gray-500 hover:text-primary-600 hover:bg-gray-100 flex items-center gap-1 text-xs font-medium"
                onClick={() => {
                  setEditingVariable({
                    id: `var-${Date.now()}`,
                    name: 'key',
                    displayName: '',
                    type: 'text',
                    maxLength: 48,
                    required: true
                  });
                  setIsVariableModalOpen(true);
                }}
              >
                添加
              </Button>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 bg-white">
                <div className="col-span-4">变量 KEY</div>
                <div className="col-span-4">字段名称</div>
                <div className="col-span-2 text-center">可选</div>
                <div className="col-span-2 text-right">操作</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-50">
                <AnimatePresence>
                  {variables.length > 0 ? variables.map((v, i) => (
                    <motion.div 
                      key={v.id} 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-gray-50 bg-white group/var transition-colors"
                    >
                      <div className="col-span-4 flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex items-center justify-center w-6 h-6 rounded bg-blue-50 text-blue-500">
                          {v.type === 'text' && <Type className="w-3.5 h-3.5" />}
                          {v.type === 'paragraph' && <AlignLeft className="w-3.5 h-3.5" />}
                          {v.type === 'select' && <CheckSquare className="w-3.5 h-3.5" />}
                          {v.type === 'number' && <Hash className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-mono text-gray-700">{v.name || 'key'}</span>
                      </div>
                      <div className="col-span-4 text-sm text-gray-500">
                        {v.displayName}
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <Switch 
                          size="small" 
                          checked={!v.required} 
                          onChange={(checked) => {
                            const newVars = [...variables];
                            newVars[i].required = !checked;
                            setVariables(newVars);
                          }} 
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-3">
                        <Settings 
                          className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" 
                          onClick={() => {
                            setEditingVariable(v);
                            setIsVariableModalOpen(true);
                          }}
                        />
                        <Trash2 
                          className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" 
                          onClick={() => setVariables(variables.filter((_, idx) => idx !== i))}
                        />
                      </div>
                    </motion.div>
                  )) : (
                    <div className="py-8 text-center text-gray-400 text-xs bg-white">
                      暂无变量，点击右上角添加
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
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
                  <Tooltip title="元数据过滤是使用元数据属性（例如标签、类别或访问权限）来细化和控制系统内相关信息的检索过程。">
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  </Tooltip>
                </div>
                <Select 
                  value={metadataFilter}
                  onChange={setMetadataFilter}
                  size="small"
                  className="w-32"
                  options={[
                    { value: 'disabled', label: '禁用', title: '禁用元数据过滤' },
                    { value: 'auto', label: '自动', title: '根据用户查询自动生成元数据过滤条件' },
                    { value: 'manual', label: '手动', title: '手动添加元数据过滤条件' }
                  ]}
                  optionRender={(option) => (
                    <div className="py-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-[10px] text-gray-500">{option.data.title}</div>
                    </div>
                  )}
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
          <Popover 
            placement="topRight" 
            trigger="click"
            styles={{ container: { padding: '12px', borderRadius: '12px' } }}
            content={
              <div className="w-64">
                <div className="mb-3">
                  <div className="text-gray-600 text-sm mb-1">当前草稿未发布</div>
                  <div className="text-gray-400 text-xs">自动保存 ·</div>
                </div>
                <Button 
                  type="primary" 
                  block 
                  className="mb-2 bg-blue-600 h-10 rounded-lg font-medium" 
                  onClick={onPublish}
                >
                  发布
                </Button>
                <div className="space-y-1 mt-2">
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-600 group transition-colors">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" />
                      <span className="text-sm">运行</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50/50 rounded-lg cursor-pointer text-blue-600 transition-colors">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      <span className="text-sm font-medium">发布到应用市场</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-600 group transition-colors">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      <span className="text-sm">嵌入网站</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-600 group transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">访问 API</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            }
          >
            <Button 
              type="primary" 
              block 
              size="large"
              className="h-12 rounded-xl font-bold shadow-lg shadow-primary-500/20 bg-gradient-to-r from-primary-600 to-primary-500 border-none hover:scale-[1.02] transition-transform"
            >
              发布
            </Button>
          </Popover>
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
            {!isMultiModel ? (
              <div className="flex items-center gap-3">
                <ModelSelect
                  className="w-48"
                  value={models[0].name}
                  modelType={ModelTypeEnum.textGeneration}
                  onChange={(m, provider, rules) => updateModelParam(models[0].id, 'model_info', m, { provider, rules })}
                />
                <Tooltip title="添加模型对比">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<Plus className="w-4 h-4" />}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                    onClick={() => {
                      const newId = `model-${Date.now()}`;
                      const firstModel = models[0];
                      const secondModel = { ...DEFAULT_MODEL, id: newId, name: '' };
                      setModels([firstModel, secondModel]);
                      setMessages({
                        [firstModel.id]: messages[firstModel.id] || [],
                        [newId]: []
                      });
                      setIsMultiModel(true);
                    }}
                  />
                </Tooltip>
                <div className="w-px h-4 bg-gray-200"></div>
                <Tooltip title="重置对话">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<RotateCcw className="w-4 h-4" />}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                    onClick={resetChat}
                  />
                </Tooltip>
                <div className="w-px h-4 bg-gray-200"></div>
                <Tooltip title="参数设置">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<Settings2 className="w-4 h-4" />}
                    className={`text-gray-400 hover:text-primary-600 transition-colors ${showParams === models[0].id ? 'text-primary-600 bg-primary-50' : ''}`}
                    onClick={() => setShowParams(showParams === models[0].id ? null : models[0].id)}
                  />
                </Tooltip>
              </div>
            ) : (
              <div className="flex items-center gap-3">
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
                <Button
                  type="text"
                  size="small"
                  className="text-gray-400 hover:text-primary-600 transition-colors text-xs"
                  onClick={() => setIsMultiModel(false)}
                >
                  切换单模型
                </Button>
                <div className="w-px h-4 bg-gray-200"></div>
                <Tooltip title="重置对话">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<RotateCcw className="w-4 h-4" />}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                    onClick={resetChat}
                  />
                </Tooltip>
                <div className="w-px h-4 bg-gray-200"></div>
                <Tooltip title="全局设置">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<Settings2 className="w-4 h-4" />}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                    // In multi-model mode, global settings might be different, but for now we can just toggle a global state or do nothing
                  />
                </Tooltip>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
          {/* Variables Area */}
          {variables.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 shrink-0 max-w-[1400px] w-full mx-auto">
              <div className="text-sm font-bold text-gray-900 mb-4">变量</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {variables.map(v => (
                  <div key={v.id} className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      {v.displayName || v.name}
                      {!v.required && <span className="text-gray-400 font-normal ml-1">(选填)</span>}
                    </div>
                    {v.type === 'text' && (
                      <Input 
                        placeholder={v.displayName || v.name} 
                        value={variableValues[v.id] || ''}
                        onChange={(e) => handleVariableChange(v.id, e.target.value)}
                        className="bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 h-10 rounded-lg transition-colors"
                      />
                    )}
                    {v.type === 'paragraph' && (
                      <Input.TextArea 
                        placeholder={v.displayName || v.name} 
                        value={variableValues[v.id] || ''}
                        onChange={(e) => handleVariableChange(v.id, e.target.value)}
                        autoSize={{ minRows: 3, maxRows: 6 }}
                        className="bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 rounded-lg transition-colors"
                      />
                    )}
                    {v.type === 'number' && (
                      <Input 
                        type="number"
                        placeholder={v.displayName || v.name} 
                        value={variableValues[v.id] || ''}
                        onChange={(e) => handleVariableChange(v.id, e.target.value)}
                        className="bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 h-10 rounded-lg transition-colors"
                      />
                    )}
                    {v.type === 'select' && (
                      <Select 
                        placeholder={v.displayName || v.name} 
                        value={variableValues[v.id]}
                        onChange={(val) => handleVariableChange(v.id, val)}
                        className="w-full h-10"
                        options={v.options?.map(o => ({ label: o, value: o })) || []}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`flex-grow max-w-[1400px] w-full mx-auto ${
            isMultiModel ? 'grid gap-4 grid-cols-2' : 'flex flex-col'
          }`}>
            {(isMultiModel ? models : [models[0]]).map((model, index) => (
              <div 
                key={model.id} 
                className={`flex flex-col min-h-[400px] relative ${
                  isMultiModel ? 'bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden' : ''
                }`}
              >
                {/* Model Header (Only in multi-model) */}
                {isMultiModel && (
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
                      {models.length > 1 && (
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
                )}

                {/* Messages */}
                <div className={`flex-grow overflow-y-auto custom-scrollbar relative ${isMultiModel ? 'p-5 space-y-5 bg-gray-50/10' : 'py-5 space-y-5'}`}>
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
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto space-y-3">
            <motion.div 
              whileFocus={{ scale: 1.01 }}
              className="relative flex items-center bg-white rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all px-4 py-2 shadow-sm"
            >
              {enabledFeatures.attachment && (
                <Button type="text" icon={<Paperclip className="w-4 h-4 text-gray-400" />} className="p-0 w-8 h-8 flex items-center justify-center" />
              )}
              {enabledFeatures.stt && (
                <Button type="text" icon={<Mic className="w-4 h-4 text-gray-400" />} className="p-0 w-8 h-8 flex items-center justify-center" />
              )}
              <Input 
                placeholder="和言复对话，获取您需要的信息" 
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
                className="rounded-full h-10 w-10 flex items-center justify-center p-0 shadow-lg shadow-blue-500/20 bg-blue-600 border-none hover:scale-110 transition-transform disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={Object.values(isStreaming).some(s => s)}
              />
            </motion.div>
            
            <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/50 rounded-xl border border-blue-100/50">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {Object.entries(enabledFeatures).filter(([_, enabled]) => enabled).map(([id, _]) => {
                    const feature = features.find(f => f.id === id);
                    if (!feature) return null;
                    return (
                      <div key={id} className={`w-6 h-6 ${feature.color} rounded-md flex items-center justify-center text-white shadow-sm border border-white`}>
                        <feature.icon className="w-3.5 h-3.5" />
                      </div>
                    );
                  })}
                </div>
                <span className="text-xs text-blue-800 font-medium">功能已开启</span>
              </div>
              <Button 
                type="link" 
                size="small" 
                className="text-xs text-blue-600 p-0 flex items-center gap-1 hover:gap-2 transition-all font-medium"
                onClick={() => setShowFeaturesDrawer(true)}
              >
                管理 <ArrowUpRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Global Parameter Sidebar Overlay */}
        <AnimatePresence>
          {showParams && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-gray-100 z-30 flex flex-col"
            >
              {(() => {
                const model = models.find(m => m.id === showParams);
                if (!model) return null;
                return (
                  <>
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
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FeaturesDrawer 
        isOpen={showFeaturesDrawer} 
        onClose={() => setShowFeaturesDrawer(false)} 
        enabledFeatures={enabledFeatures}
        setEnabledFeatures={setEnabledFeatures}
      />

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

      <Modal
        title={<span className="text-base font-bold text-gray-900">编辑变量</span>}
        open={isVariableModalOpen}
        onCancel={() => setIsVariableModalOpen(false)}
        footer={null}
        width={480}
        className="custom-modal"
      >
        {editingVariable && (
          <div className="space-y-6 pt-4">
            {/* Field Type */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">字段类型</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'text', label: '文本', icon: <Type className="w-5 h-5 mb-1" /> },
                  { id: 'paragraph', label: '段落', icon: <AlignLeft className="w-5 h-5 mb-1" /> },
                  { id: 'select', label: '下拉选项', icon: <CheckSquare className="w-5 h-5 mb-1" /> },
                  { id: 'number', label: '数字', icon: <Hash className="w-5 h-5 mb-1" /> }
                ].map(type => (
                  <div 
                    key={type.id}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                      editingVariable.type === type.id 
                        ? 'border-blue-500 bg-blue-50/50 text-blue-600' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                    onClick={() => setEditingVariable({ ...editingVariable, type: type.id })}
                  >
                    {type.icon}
                    <span className="text-xs">{type.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Variable Name */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">变量名称</div>
              <Input 
                placeholder="请输入" 
                value={editingVariable.name}
                onChange={e => setEditingVariable({ ...editingVariable, name: e.target.value })}
                className="bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 hover:bg-gray-100 h-10 rounded-lg"
              />
            </div>

            {/* Display Name */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">显示名称</div>
              <Input 
                placeholder="请输入" 
                value={editingVariable.displayName}
                onChange={e => setEditingVariable({ ...editingVariable, displayName: e.target.value })}
                className="bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 hover:bg-gray-100 h-10 rounded-lg"
              />
            </div>

            {/* Max Length */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">最大长度</div>
              <Input 
                type="number"
                value={editingVariable.maxLength}
                onChange={e => setEditingVariable({ ...editingVariable, maxLength: parseInt(e.target.value) || 0 })}
                className="bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 hover:bg-gray-100 h-10 rounded-lg"
              />
            </div>

            {/* Required */}
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={editingVariable.required}
                onChange={e => setEditingVariable({ ...editingVariable, required: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">必填</span>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button onClick={() => setIsVariableModalOpen(false)} className="h-9 rounded-lg px-5">取消</Button>
              <Button 
                type="primary" 
                className="bg-blue-600 h-9 rounded-lg px-5"
                onClick={() => {
                  const existingIndex = variables.findIndex(v => v.id === editingVariable.id);
                  if (existingIndex >= 0) {
                    const newVars = [...variables];
                    newVars[existingIndex] = editingVariable;
                    setVariables(newVars);
                  } else {
                    setVariables([...variables, editingVariable]);
                  }
                  setIsVariableModalOpen(false);
                }}
              >
                保存
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const FeaturesDrawer = ({ 
  isOpen, 
  onClose, 
  enabledFeatures, 
  setEnabledFeatures 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  enabledFeatures: Record<string, boolean>;
  setEnabledFeatures: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) => {
  return (
    <Drawer title="功能" open={isOpen} onClose={onClose} size="default">
      <div className="text-sm text-gray-500 mb-4">增强 web app 用户体验</div>
      <div className="space-y-3">
        {features.map(f => (
          <div key={f.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <div className={`w-10 h-10 rounded-lg ${f.color} flex items-center justify-center text-white shrink-0`}>
              <f.icon className="w-5 h-5" />
            </div>
            <div className="flex-grow">
              <div className="font-bold text-gray-900">{f.name}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </div>
            <Switch 
              size="small" 
              checked={enabledFeatures[f.id]}
              onChange={(checked) => setEnabledFeatures(prev => ({ ...prev, [f.id]: checked }))}
            />
          </div>
        ))}
      </div>
    </Drawer>
  );
};

export default AppConfig;
