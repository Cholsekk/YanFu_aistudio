import React, { useState } from 'react';
import { Copy, Maximize2 } from 'lucide-react';

interface CodeBlockProps {
  title: string;
  content: any;
  maxHeight?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ title, content, maxHeight = '200px' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const jsonString = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  const lines = jsonString.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
  };

  return (
    <div className="bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="text-zinc-500 hover:text-zinc-300">
            <Copy size={14} />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-zinc-500 hover:text-zinc-300">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
      <div 
        className={`p-0 overflow-auto transition-all duration-200 ${isExpanded ? 'max-h-[600px]' : `max-h-[${maxHeight}]`}`}
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, index) => (
              <tr key={index}>
                <td className="text-zinc-600 text-right pr-4 pl-2 select-none w-8 border-r border-zinc-800/50">{index + 1}</td>
                <td className="text-zinc-300 pl-4 pr-3 py-0.5 whitespace-pre">{line}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
