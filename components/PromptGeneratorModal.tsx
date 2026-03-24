
import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu
} from 'lucide-react';
import { Input, Button, message } from 'antd';
import Modal from './Modal';
import { apiService } from '../services/apiService';
import { useAppDevHub } from '../context/AppContext';

const { TextArea } = Input;

const TEMPLATES: Record<string, { name: string; instruction: string }> = {
  pythonDebugger: { name: 'Python 代码助手', instruction: '一个帮你写和纠错程序的机器人' },
  translation: { name: '翻译机器人', instruction: '一个可以翻译多种语言的翻译器' },
  professionalAnalyst: { name: '职业分析师', instruction: ' 从长篇报告中提取洞察、识别风险并提炼关键信息' },
  excelFormulaExpert: { name: 'Excel 公式专家', instruction: '一个可以让小白用户理解、使用和创建 Excel 公式的对话机器人' },
  travelPlanning: { name: '旅行规划助手', instruction: '旅行规划助手是一个智能工具，旨在帮助用户轻松规划他们的旅行' },
  SQLSorcerer: { name: 'SQL 生成', instruction: '把自然语言转换成 SQL 查询语句' },
  GitGud: { name: 'Git 大师', instruction: '从用户提出的版本管理需求生成合适的 Git 命令' },
  meetingTakeaways: { name: '总结会议纪要', instruction: '将会议内容提炼总结，包括讨论主题、关键要点和待办事项' },
  writingsPolisher: { name: '润色文章', instruction: '用地道的编辑技巧改进我的文章' },
};

interface PromptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  modelConfig?: any;
}

const PromptGeneratorModal: React.FC<PromptGeneratorModalProps> = ({ isOpen, onClose, onGenerate, modelConfig }) => {
  const app = useAppDevHub();
  const [instruction, setInstruction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!instruction.trim()) return;
    setIsGenerating(true);
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
        model_config: formattedModelConfig
      });
      if (res && res.prompt) {
        onGenerate(res.prompt);
        onClose();
      }
    } catch (error) {
      console.error('Failed to generate prompt:', error);
      message.error('生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="提示词生成器"
      maxWidth="max-w-4xl"
      bodyClassName="p-0 flex h-[600px]"
      footer={null}
    >
      <div className="flex w-full h-full">
        {/* Left: Input Area */}
        <div className="w-1/2 p-6 border-r border-gray-100 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <p className="text-xs text-gray-500 leading-relaxed">
              提示词生成器为您优化提示词，以获得更高的质量和更好的结构。请写出清晰详细的说明。
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-bold text-gray-900">试一试</span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => setInstruction(template.instruction)}
                  className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <span className="text-gray-400 group-hover:text-blue-500 transition-colors"><Cpu className="w-3.5 h-3.5" /></span>
                  <span className="text-xs text-gray-600 font-medium truncate">{template.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 flex-grow flex flex-col">
            <span className="text-sm font-bold text-gray-900">指令</span>
            <div className="relative flex-grow">
              <TextArea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="描述您希望如何改进此提示词。例如：使其输出更简洁，保留核心要点。输出格式不正确，请严格遵循 JSON 格式。语气过于生硬，请使其更友好。"
                className="h-full rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm leading-relaxed resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={onClose} className="rounded-lg px-6">取消</Button>
            <Button 
              type="primary" 
              onClick={handleGenerate} 
              loading={isGenerating}
              disabled={!instruction.trim()}
              className="rounded-lg px-6 bg-blue-600"
              icon={<Sparkles className="w-4 h-4" />}
            >
              生成
            </Button>
          </div>
        </div>

        {/* Right: Preview Area */}
        <div className="w-1/2 bg-gray-50/50 flex items-center justify-center p-12 text-center">
          <div className="space-y-4 max-w-[280px]">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              在左侧描述您的用例，点击生成查看结果。
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PromptGeneratorModal;
