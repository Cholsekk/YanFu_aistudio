import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { CheckCircle2, Plus, MoreHorizontal, Trash2, Copy, Files, Settings } from 'lucide-react';
import { WorkflowNodeData } from './WorkflowEditor';

interface WorkflowNodeProps {
  data: WorkflowNodeData & { 
    onDelete?: () => void;
    onAddBefore?: (e?: React.MouseEvent) => void;
    onAddAfter?: (e?: React.MouseEvent) => void;
  };
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ data }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isMenuOpen]);

  return (
    <div className="group relative">
      {/* Add Before Button */}
      <button 
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          data.onAddBefore?.(e);
        }}
        className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-indigo-500 hover:text-white hover:bg-indigo-500 transition-all opacity-0 group-hover:opacity-100 z-30 shadow-md scale-90 hover:scale-110"
        title="在前面添加节点"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* Add After Button */}
      <button 
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          data.onAddAfter?.(e);
        }}
        className="absolute right-[-24px] top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-indigo-500 hover:text-white hover:bg-indigo-500 transition-all opacity-0 group-hover:opacity-100 z-30 shadow-md scale-90 hover:scale-110"
        title="在后面添加节点"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* More Options Button - Moved outside and positioned above with distance */}
      <div className="absolute -top-11 right-0 z-40" ref={menuRef}>
        <button 
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="w-8 h-8 bg-white/80 backdrop-blur-md border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in duration-200">
            <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
              节点操作
            </div>
            <button className="w-full px-3 py-2 text-left text-[12px] text-gray-700 hover:bg-gray-50 flex items-center justify-between group/item">
              <div className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-gray-600" />
                更改节点
              </div>
            </button>
            <button className="w-full px-3 py-2 text-left text-[12px] text-gray-700 hover:bg-gray-50 flex items-center justify-between group/item">
              <div className="flex items-center gap-2">
                <Copy className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-gray-600" />
                拷贝
              </div>
              <span className="text-[10px] text-gray-400">Ctrl C</span>
            </button>
            <button className="w-full px-3 py-2 text-left text-[12px] text-gray-700 hover:bg-gray-50 flex items-center justify-between group/item">
              <div className="flex items-center gap-2">
                <Files className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-gray-600" />
                复制
              </div>
              <span className="text-[10px] text-gray-400">Ctrl D</span>
            </button>
            <div className="h-px bg-gray-50 my-1" />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete?.();
                setIsMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-[12px] text-red-500 hover:bg-red-50 flex items-center justify-between group/item"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5 text-red-400 group-hover/item:text-red-500" />
                删除
              </div>
              <span className="text-[10px] text-red-300">Del</span>
            </button>
            <div className="h-px bg-gray-50 my-1" />
            <div className="px-3 py-2">
              <div className="text-[10px] text-gray-400 font-medium">关于</div>
              <div className="text-[9px] text-gray-500 mt-1 leading-relaxed">
                定义一个 workflow 流程的{data.label}
              </div>
              <div className="text-[9px] text-gray-400 mt-1">作者 Yanfu</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.06)] transition-all duration-300 min-w-[220px] overflow-hidden relative group/node">
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 ${data.color} relative overflow-hidden`}>
          {/* Subtle gloss overlay for premium feel without washing out color */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
          
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="p-1.5 bg-black/10 backdrop-blur-sm rounded-lg text-white shadow-sm flex items-center justify-center">
              {data.icon}
            </div>
            <span className="text-[13px] font-bold text-white tracking-wide drop-shadow-sm">
              {data.label}
            </span>
          </div>
          <div className="relative z-10">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-gray-50">
          {data.content ? (
            <div className="text-[11px] text-gray-600 leading-relaxed font-medium">
              {data.content}
            </div>
          ) : (
            <div className="py-2 flex items-center justify-center border border-dashed border-gray-100 rounded-lg">
              <span className="text-[10px] text-gray-400 italic font-normal">未配置节点参数</span>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="h-1 w-full bg-gray-50 flex">
          <div className={`h-full ${data.color} opacity-20 w-full`}></div>
        </div>

        {/* Handles */}
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-white !border-2 !border-gray-300 hover:!border-blue-400 !transition-colors !shadow-sm !-left-1.5"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-white !border-2 !border-gray-300 hover:!border-blue-400 !transition-colors !shadow-sm !-right-1.5"
        />
      </div>
    </div>
  );
};

export default WorkflowNode;
