import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIGeneratingModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
}

const AIGeneratingModal: React.FC<AIGeneratingModalProps> = ({ 
  isOpen, 
  title = 'AI 正在为您生成工作流...',
  description = '正在为工作流排兵布阵，请耐心等待'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* 遮罩层，不绑定 onClick */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      <div className="bg-white rounded-2xl shadow-2xl relative z-10 flex flex-col items-center justify-center p-10 max-w-sm w-full mx-auto animate-in zoom-in-95 duration-300">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-75" />
          <div className="relative bg-amber-50 text-amber-500 w-20 h-20 rounded-full flex items-center justify-center shadow-inner">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-amber-400" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{title}</h3>
        <p className="text-sm text-gray-500 text-center animate-pulse">{description}</p>
      </div>
    </div>
  );
};

export default AIGeneratingModal;
