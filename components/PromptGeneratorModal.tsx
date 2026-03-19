
import React, { useState } from 'react';
import { 
  Wand2, 
  Sparkles, 
  Cpu, 
  Code, 
  Languages, 
  FileText, 
  UserCircle, 
  Table, 
  Plane, 
  Database, 
  GitBranch,
  X
} from 'lucide-react';
import { Input, Button, Select, Space } from 'antd';
import Modal from './Modal';

const { TextArea } = Input;

interface PromptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}

const EXAMPLES = [
  { id: 'python', label: 'Python 代码助手', icon: <Code className="w-3.5 h-3.5" />, prompt: '你是一个专业的 Python 开发者，请帮我编写高质量的代码。' },
  { id: 'translate', label: '翻译机器人', icon: <Languages className="w-3.5 h-3.5" />, prompt: '你是一个精通多国语言的翻译官，请帮我进行准确的翻译。' },
  { id: 'summary', label: '总结会议纪要', icon: <FileText className="w-3.5 h-3.5" />, prompt: '请帮我总结以下会议内容，提取关键决策和待办事项。' },
  { id: 'polish', label: '润色文章', icon: <Sparkles className="w-3.5 h-3.5" />, prompt: '请帮我润色以下文章，使其更加专业、流畅。' },
  { id: 'career', label: '职业分析师', icon: <UserCircle className="w-3.5 h-3.5" />, prompt: '你是一个资深的职业规划师，请根据我的简历提供建议。' },
  { id: 'excel', label: 'Excel 公式专家', icon: <Table className="w-3.5 h-3.5" />, prompt: '请帮我编写 Excel 公式来处理以下数据需求。' },
  { id: 'travel', label: '旅行规划助手', icon: <Plane className="w-3.5 h-3.5" />, prompt: '请帮我规划一份详细的旅行行程。' },
  { id: 'sql', label: 'SQL 生成', icon: <Database className="w-3.5 h-3.5" />, prompt: '请根据我的需求生成高效的 SQL 查询语句。' },
  { id: 'git', label: 'Git 大师', icon: <GitBranch className="w-3.5 h-3.5" />, prompt: '你是一个 Git 专家，请帮我解决版本控制相关的问题。' },
];

const PromptGeneratorModal: React.FC<PromptGeneratorModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [instruction, setInstruction] = useState('');
  const [idealOutput, setIdealOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!instruction.trim()) return;
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      onGenerate(`[已优化提示词] ${instruction}\n\n${idealOutput ? `理想输出参考：${idealOutput}` : ''}`);
      setIsGenerating(false);
      onClose();
    }, 1500);
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
              提示词生成器使用配置的模型来优化提示词，以获得更高的质量和更好的结构。请写出清晰详细的说明。
            </p>
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-[10px] text-white">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-gray-700">gpt-3.5-turbo-0125</span>
                <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 text-[10px] rounded font-bold">CHAT</span>
              </div>
              <Wand2 className="w-4 h-4 text-blue-500" />
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-bold text-gray-900">试一试</span>
            <div className="grid grid-cols-2 gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setInstruction(ex.prompt)}
                  className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <span className="text-gray-400 group-hover:text-blue-500 transition-colors">{ex.icon}</span>
                  <span className="text-xs text-gray-600 font-medium truncate">{ex.label}</span>
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
              <div className="absolute bottom-3 left-3 text-[10px] text-gray-400">
                输入 / 来 插入上下文
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-1 cursor-pointer group">
              <span className="text-sm font-bold text-gray-900">理想输出</span>
              <span className="text-xs text-gray-400 font-normal">(可选)</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <TextArea
              value={idealOutput}
              onChange={(e) => setIdealOutput(e.target.value)}
              placeholder="输入您期望的输出示例..."
              autoSize={{ minRows: 2, maxRows: 4 }}
              className="rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm leading-relaxed"
            />
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

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);
