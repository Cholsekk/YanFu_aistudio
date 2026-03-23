import React, { useState } from 'react';
import { Copy, ChevronDown, ChevronRight, Maximize2 } from 'lucide-react';

interface CodeBlockProps {
  title: string;
  content: any;
  maxHeight?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ title, content, maxHeight = '200px' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const jsonString = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b border-gray-200">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="text-gray-400 hover:text-gray-600">
            <Copy size={14} />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-gray-600">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
      <div 
        className={`p-3 overflow-auto transition-all duration-200 ${isExpanded ? 'max-h-[600px]' : `max-h-[${maxHeight}]`}`}
      >
        <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-words">
          {jsonString}
        </pre>
      </div>
    </div>
  );
};
