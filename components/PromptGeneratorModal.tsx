
import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu,
  X
} from 'lucide-react';
import { Input, Button, message } from 'antd';
import { motion, AnimatePresence } from 'motion/react';
import Modal from './Modal';
import { apiService } from '../services/apiService';
import { useAppDevHub } from '../context/AppContext';

const { TextArea } = Input;

const TEMPLATES: Record<string, { name: string; instruction: string }> = {
  pythonDebugger: { name: 'Python 代码助手', instruction: '一个帮你写和纠错程序的机器人' },
  translation: { name: '翻译机器人', instruction: '一个可以翻译多种语言的翻译器' },
  meetingTakeaways: { name: '总结会议纪要', instruction: '将会议内容提炼总结，包括讨论主题、关键要点和待办事项' },
  writingsPolisher: { name: '润色文章', instruction: '用地道的编辑技巧改进我的文章' },
  professionalAnalyst: { name: '职业分析师', instruction: ' 从长篇报告中提取洞察、识别风险并提炼关键信息' },
  excelFormulaExpert: { name: 'Excel 公式专家', instruction: '一个可以让小白用户理解、使用和创建 Excel 公式的对话机器人' },
  travelPlanning: { name: '旅行规划助手', instruction: '旅行规划助手是一个智能工具，旨在帮助用户轻松规划他们的旅行' },
  SQLSorcerer: { name: 'SQL 生成', instruction: '把自然语言转换成 SQL 查询语句' },
  GitGud: { name: 'Git 大师', instruction: '从用户提出的版本管理需求生成合适的 Git 命令' },
};

interface PromptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: { prompt: string; variables?: string[]; opening_statement?: string }) => void;
  modelConfig?: any;
}

const PromptGeneratorModal: React.FC<PromptGeneratorModalProps> = ({ isOpen, onClose, onGenerate, modelConfig }) => {
  const app = useAppDevHub();
  const [instruction, setInstruction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ prompt: string; variables: string[]; opening_statement: string } | null>(null);

  const handleGenerate = async () => {
    if (!instruction.trim()) return;
    setIsGenerating(true);
    setResult(null);
    try {
      const formattedModelConfig = modelConfig ? {
        mode: app?.mode || 'chat',
        name: modelConfig.name,
        provider: modelConfig.provider,
        completion_params: {
          temperature: modelConfig.temperature,
          top_p: modelConfig.topP,
          presence_penalty: modelConfig.presencePenalty,
          frequency_penalty: modelConfig.frequencyPenalty,
          max_tokens: modelConfig.maxTokens,
          stop: []
        }
      } : undefined;

      const res = await apiService.generateRule({
        instruction: instruction,
        app_mode: app?.mode || 'chat',
        model_config: formattedModelConfig,
        no_variable: false
      });
      if (res && res.prompt) {
        setResult({
          prompt: res.prompt,
          variables: res.variables || [],
          opening_statement: res.opening_statement || ''
        });
      }
    } catch (error) {
      console.error('Failed to generate prompt:', error);
      message.error('生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onGenerate(result);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-6xl"
      bodyClassName="p-0 flex h-[700px]"
      footer={null}
      hideHeader
    >
      <div className="flex w-full h-full relative">
        {/* Close Button Overlay */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Input Area */}
        <div className="w-1/2 p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-blue-600">提示词生成器</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              提示词生成器使用配置的模型来优化提示词，以获得更高的质量和更好的结构。请写出清晰详细的说明。
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-900 shrink-0">试一试</span>
              <div className="h-[1px] bg-gray-100 flex-grow" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => setInstruction(template.instruction)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100/50 hover:bg-blue-50 hover:text-blue-600 transition-all text-left group border border-transparent hover:border-blue-100"
                >
                  <span className="text-gray-400 group-hover:text-blue-500 transition-colors"><Cpu className="w-3.5 h-3.5" /></span>
                  <span className="text-xs text-gray-600 group-hover:text-blue-600 font-medium">{template.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 flex-grow flex flex-col">
            <span className="text-sm font-bold text-gray-900">指令</span>
            <div className="relative flex-grow bg-gray-50 rounded-2xl p-4 flex flex-col">
              <TextArea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="描述您希望如何改进此提示词。例如：使其输出更简洁，保留核心要点。输出格式不正确，请严格遵循 JSON 格式。语气过于生硬，请使其更友好。"
                className="flex-grow border-none bg-transparent focus:ring-0 text-sm leading-relaxed resize-none p-0 custom-scrollbar"
                style={{ boxShadow: 'none' }}
              />
              <div className="flex justify-end mt-4">
                <Button 
                  type="primary" 
                  onClick={handleGenerate} 
                  loading={isGenerating}
                  disabled={!instruction.trim()}
                  className="rounded-xl px-6 bg-blue-100 text-blue-600 border-none hover:bg-blue-200 shadow-none flex items-center gap-2 h-10"
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  生成
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Preview/Edit Area */}
        <div className="w-1/2 border-l border-gray-100 flex flex-col p-8 relative overflow-hidden bg-white">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-grow flex flex-col items-center justify-center gap-4"
              >
                <div className="flex gap-1.5">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                    className="w-2.5 h-2.5 bg-blue-400 rounded-sm"
                  />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                    className="w-2.5 h-2.5 bg-blue-300 rounded-sm"
                  />
                </div>
                <p className="text-sm text-gray-400 font-medium tracking-wide">为您编排应用程序中...</p>
              </motion.div>
            ) : result !== null ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-grow flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2"
              >
                <h3 className="text-lg font-bold text-gray-900">生成的提示词</h3>
                
                <div className="flex flex-col border-2 border-blue-500 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/5">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-700">提示词</span>
                  </div>
                  <div className="relative bg-white p-4 min-h-[300px] flex flex-col">
                    <TextArea
                      value={result.prompt}
                      onChange={(e) => setResult({ ...result, prompt: e.target.value })}
                      placeholder="在这里写你的提示词，输入'{' 插入变量、输入'/' 插入提示内容块"
                      className="flex-grow border-none focus:ring-0 text-sm leading-relaxed resize-none p-0 custom-scrollbar"
                      style={{ boxShadow: 'none' }}
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-gray-400 font-mono">
                        {result.prompt.length}
                      </div>
                      <div className="w-8 h-1 bg-gray-100 rounded-full" />
                    </div>
                  </div>
                </div>

                {result.opening_statement && (
                  <div className="flex flex-col border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-500">开场白</span>
                    </div>
                    <div className="p-4 bg-white">
                      <TextArea
                        value={result.opening_statement}
                        onChange={(e) => setResult({ ...result, opening_statement: e.target.value })}
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        className="border-none focus:ring-0 text-sm leading-relaxed resize-none p-0"
                        style={{ boxShadow: 'none' }}
                      />
                    </div>
                  </div>
                )}

                {result.variables.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-500 px-1">识别到的变量</span>
                    <div className="flex flex-wrap gap-2">
                      {result.variables.map((v, i) => (
                        <span key={i} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-100">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-auto pt-4 sticky bottom-0 bg-white pb-2">
                  <Button 
                    onClick={() => setResult(null)}
                    className="rounded-xl px-6 h-10 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200"
                  >
                    取消
                  </Button>
                  <Button 
                    type="primary"
                    onClick={handleApply}
                    className="rounded-xl px-8 h-10 bg-blue-600 shadow-lg shadow-blue-600/20"
                  >
                    应用
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-grow flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-sm text-gray-400 leading-relaxed max-w-[280px] text-center">
                  {instruction.trim() ? "未生成任何内容，请尝试修改指令后重试。" : "在左侧描述您的用例，点击生成查看结果。"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
};

export default PromptGeneratorModal;
