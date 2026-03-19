
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
  Bot
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
  Space
} from 'antd';

const { TextArea } = Input;

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  temperature: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  maxTokens: number;
  responseFormat: string;
}

const DEFAULT_MODEL: ModelConfig = {
  id: 'gpt-3.5-turbo-0125',
  name: 'gpt-3.5-turbo-0125',
  provider: 'OpenAI',
  temperature: 0.7,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
  maxTokens: 512,
  responseFormat: 'text'
};

const AppConfig: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [variables, setVariables] = useState<{ name: string; value: string }[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<{ id: string; name: string }[]>([]);
  const [isMultiModel, setIsMultiModel] = useState(false);
  const [models, setModels] = useState<ModelConfig[]>([DEFAULT_MODEL]);
  const [messages, setMessages] = useState<Record<string, { role: 'user' | 'assistant'; content: string }[]>>({
    [DEFAULT_MODEL.id]: []
  });
  const [inputValue, setInputValue] = useState('');
  const [showParams, setShowParams] = useState<string | null>(null);

  const chatEndRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToBottom = (modelId: string) => {
    chatEndRefs.current[modelId]?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    models.forEach(model => scrollToBottom(model.id));
  }, [messages, models]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessages = { ...messages };
    models.forEach(model => {
      const modelMsgs = [...(newMessages[model.id] || [])];
      modelMsgs.push({ role: 'user', content: inputValue });
      // Simulate assistant response
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [model.id]: [...(prev[model.id] || []), { role: 'assistant', content: `这是来自 ${model.name} 的模拟回复。` }]
        }));
      }, 500);
      newMessages[model.id] = modelMsgs;
    });

    setMessages(newMessages);
    setInputValue('');
  };

  const addModel = () => {
    if (models.length >= 4) return;
    const newId = `model-${Date.now()}`;
    const newModel = { ...DEFAULT_MODEL, id: newId };
    setModels([...models, newModel]);
    setMessages({ ...messages, [newId]: [] });
  };

  const removeModel = (id: string) => {
    if (models.length <= 1) return;
    setModels(models.filter(m => m.id !== id));
    const newMsgs = { ...messages };
    delete newMsgs[id];
    setMessages(newMsgs);
  };

  const updateModelParam = (id: string, param: keyof ModelConfig, value: any) => {
    setModels(models.map(m => m.id === id ? { ...m, [param]: value } : m));
  };

  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

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
    <div className="flex h-full bg-gray-50/50 overflow-hidden">
      {/* Left Configuration Area */}
      <div className="w-[450px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-6 overflow-y-auto flex-grow space-y-6 custom-scrollbar">
          {/* Prompt Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">提示词</span>
                <Tooltip title="在这里编写您的提示词，输入 '{' 插入变量">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <Button 
                type="text" 
                size="small" 
                icon={<Wand2 className={`w-3.5 h-3.5 text-primary-600 ${isAutoGenerating ? 'animate-spin' : ''}`} />}
                className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 flex items-center gap-1.5 text-xs font-medium"
                onClick={handleAutoGenerate}
                disabled={isAutoGenerating}
              >
                {isAutoGenerating ? '生成中...' : '自动生成'}
              </Button>
            </div>
            <div className="relative group">
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="在这里写你的提示词，输入 '{' 插入变量、输入 '/' 插入提示内容块"
                autoSize={{ minRows: 12, maxRows: 20 }}
                className="rounded-xl border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-gray-400 font-mono">
                {prompt.length}
              </div>
            </div>
          </div>

          {/* Variables Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">变量</span>
                <Tooltip title="变量能使用用户输入表单引入提示词或开场白">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <Button 
                type="text" 
                size="small" 
                icon={<Plus className="w-3.5 h-3.5" />}
                className="text-gray-500 hover:text-primary-600 hover:bg-gray-50 flex items-center gap-1 text-xs font-medium"
                onClick={() => setVariables([...variables, { name: '', value: '' }])}
              >
                添加
              </Button>
            </div>
            {variables.length > 0 ? (
              <div className="space-y-2">
                {variables.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <Input 
                      size="small" 
                      placeholder="变量名" 
                      value={v.name}
                      className="text-xs"
                      onChange={(e) => {
                        const newVars = [...variables];
                        newVars[i].name = e.target.value;
                        setVariables(newVars);
                      }}
                    />
                    <Trash2 
                      className="w-3.5 h-3.5 text-gray-300 hover:text-red-500 cursor-pointer transition-colors" 
                      onClick={() => setVariables(variables.filter((_, idx) => idx !== i))}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-4 text-center">
                <p className="text-[11px] text-gray-400">变量能使用用户输入表单引入提示词或开场白，你可以试试在提示词中输入 {"{{input}}"}</p>
              </div>
            )}
          </div>

          {/* Knowledge Base Section */}
          <div className="space-y-3">
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
                >
                  添加
                </Button>
              </div>
            </div>
            <div className="bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-4 text-center">
              <p className="text-[11px] text-gray-400">您可以导入知识库作为上下文</p>
            </div>
          </div>

          {/* Metadata Filtering */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">元数据过滤</span>
                <Tooltip title="根据元数据对知识库进行过滤">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <Select 
                defaultValue="disabled" 
                size="small"
                className="w-24"
                options={[{ value: 'disabled', label: '禁用' }, { value: 'enabled', label: '启用' }]}
              />
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-white">
          <Button 
            type="primary" 
            block 
            className="h-10 rounded-xl font-bold shadow-lg shadow-primary-500/20"
          >
            保存配置
          </Button>
        </div>
      </div>

      {/* Right Debug Area */}
      <div className="flex-grow flex flex-col bg-white">
        {/* Debug Header */}
        <div className="h-14 border-b border-gray-100 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-900">调试与预览</span>
            <Badge status="processing" text={<span className="text-[10px] text-gray-400">实时预览已开启</span>} />
          </div>
          <div className="flex items-center gap-3">
            <Button 
              type="text" 
              size="small" 
              icon={<RotateCcw className="w-4 h-4" />}
              className="text-gray-400 hover:text-primary-600 transition-colors"
              onClick={resetChat}
            />
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            {!isMultiModel ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:border-primary-500 transition-all" onClick={() => setShowParams(models[0].id)}>
                  <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center text-[10px] text-white font-bold">G</div>
                  <span className="text-xs font-medium text-gray-700">{models[0].name}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
                <Button 
                  type="primary" 
                  size="small"
                  className="rounded-lg text-xs"
                  onClick={() => setIsMultiModel(true)}
                >
                  发布
                </Button>
              </div>
            ) : (
              <Button 
                type="text" 
                size="small"
                icon={<Plus className="w-3.5 h-3.5" />}
                className="text-primary-600 hover:bg-primary-50 text-xs font-medium"
                onClick={addModel}
                disabled={models.length >= 4}
              >
                添加模型({models.length}/4)
              </Button>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-hidden relative flex">
          <div className={`flex-grow flex ${isMultiModel ? 'divide-x divide-gray-100' : ''} overflow-x-auto custom-scrollbar`}>
            {models.map((model, index) => (
              <div 
                key={model.id} 
                className={`flex flex-col min-w-[350px] flex-grow relative ${isMultiModel ? 'bg-gray-50/30' : 'bg-white'}`}
              >
                {/* Model Header in Multi-view */}
                {isMultiModel && (
                  <div className="h-10 px-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 italic">#{index + 1}</span>
                      <Select
                        size="small"
                        value={model.id}
                        className="w-32"
                        bordered={false}
                        options={[{ value: model.id, label: model.name }]}
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
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<Trash2 className="w-3.5 h-3.5" />} 
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => removeModel(model.id)}
                      />
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {messages[model.id]?.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                      <MessageSquare className="w-12 h-12 mb-4 text-gray-300" />
                      <p className="text-sm text-gray-400">开始与您的应用对话</p>
                    </div>
                  ) : (
                    messages[model.id]?.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={el => { chatEndRefs.current[model.id] = el; }} />
                </div>

                {/* Parameter Sidebar Overlay */}
                {showParams === model.id && (
                  <div className="absolute inset-y-0 right-0 w-72 bg-white shadow-2xl border-l border-gray-100 z-30 animate-in slide-in-from-right duration-300">
                    <div className="h-12 px-4 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">参数设置</span>
                      <Button type="text" size="small" icon={<Trash2 className="w-4 h-4" />} onClick={() => setShowParams(null)} />
                    </div>
                    <div className="p-5 space-y-6 overflow-y-auto h-[calc(100%-48px)] custom-scrollbar">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">温度 (Temperature)</span>
                            <span className="font-mono font-bold text-primary-600">{model.temperature}</span>
                          </div>
                          <Slider 
                            min={0} max={2} step={0.1} 
                            value={model.temperature} 
                            onChange={v => updateModelParam(model.id, 'temperature', v)}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Top P</span>
                            <span className="font-mono font-bold text-primary-600">{model.topP}</span>
                          </div>
                          <Slider 
                            min={0} max={1} step={0.05} 
                            value={model.topP} 
                            onChange={v => updateModelParam(model.id, 'topP', v)}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">最大标记 (Max Tokens)</span>
                            <span className="font-mono font-bold text-primary-600">{model.maxTokens}</span>
                          </div>
                          <Slider 
                            min={1} max={4096} step={1} 
                            value={model.maxTokens} 
                            onChange={v => updateModelParam(model.id, 'maxTokens', v)}
                          />
                        </div>
                        <Divider className="my-4" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">回复格式</span>
                          <Select 
                            size="small" 
                            value={model.responseFormat} 
                            className="w-24"
                            onChange={v => updateModelParam(model.id, 'responseFormat', v)}
                            options={[{ value: 'text', label: '文本' }, { value: 'json', label: 'JSON' }]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto relative">
            <div className="relative flex items-center bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10 transition-all px-4 py-2 shadow-sm">
              <Input 
                placeholder="和 Bot 聊天" 
                variant="borderless"
                className="flex-grow text-sm py-2"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleSendMessage}
              />
              <Button 
                type="primary" 
                icon={<Send className="w-4 h-4" />} 
                className="rounded-xl h-10 w-10 flex items-center justify-center p-0 shadow-lg shadow-primary-500/20"
                onClick={handleSendMessage}
              />
            </div>
            <div className="mt-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] text-white">
                  <Bot className="w-3 h-3" />
                </div>
                <span className="text-[11px] text-gray-500">功能已开启</span>
              </div>
              <Button type="link" size="small" className="text-[11px] text-primary-600 p-0 flex items-center gap-1">
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
    </div>
  );
};

export default AppConfig;
