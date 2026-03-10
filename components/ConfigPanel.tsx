import React from 'react';
import { X, Save, Trash2, Settings, Info, Play, MessageSquare, Database, Code2, Cpu, Plus } from 'lucide-react';
import { Node } from 'reactflow';
import { WorkflowNodeData } from './WorkflowEditor';

interface ConfigPanelProps {
  selectedNode: Node<WorkflowNodeData> | null;
  onClose: () => void;
  onUpdateNode: (id: string, data: Partial<WorkflowNodeData>) => void;
  onDeleteNode: (id: string) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  selectedNode, 
  onClose, 
  onUpdateNode,
  onDeleteNode
}) => {
  if (!selectedNode) return null;

  const { data } = selectedNode;

  return (
    <div className="absolute top-0 right-0 h-full w-[400px] bg-white shadow-2xl border-l border-gray-100 z-[100] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${data.color} text-white shadow-lg shadow-indigo-100`}>
            {data.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{data.label}</h3>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">节点配置</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onDeleteNode(selectedNode.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="删除节点"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="space-y-6">
          {/* Basic Info Section */}
          <section className="space-y-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Info className="w-3 h-3" />
              基础信息
            </h4>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">节点名称</label>
              <input 
                type="text" 
                value={data.label}
                onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              />
            </div>
          </section>

          {/* Dynamic Config based on type */}
          {selectedNode.data.type === 'llm' && (
            <section className="space-y-4">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Settings className="w-3 h-3" />
                模型配置
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">模型选择</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium">
                    <option>Gemini 1.5 Pro</option>
                    <option>Gemini 1.5 Flash</option>
                    <option>GPT-4o</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">System Prompt</label>
                  <textarea 
                    placeholder="输入系统提示词..."
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium min-h-[120px] resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Temperature</label>
                    <input type="number" step="0.1" defaultValue="0.7" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Max Tokens</label>
                    <input type="number" defaultValue="2048" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium" />
                  </div>
                </div>
              </div>
            </section>
          )}

          {selectedNode.data.type === 'knowledge' && (
            <section className="space-y-4">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Database className="w-3 h-3" />
                检索配置
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">选择知识库</label>
                  <div className="p-4 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                      <Plus className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 group-hover:text-indigo-600">关联知识库</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">Top K</label>
                  <input type="range" min="1" max="10" defaultValue="3" className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Fallback for other types */}
          {['llm', 'knowledge'].indexOf(selectedNode.data.type || '') === -1 && (
            <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-center gap-3">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <Settings className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">配置面板开发中</p>
                <p className="text-xs text-gray-400 mt-1">该节点的详细配置选项即将上线</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-50 bg-gray-50/50">
        <button 
          onClick={onClose}
          className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          保存配置
        </button>
      </div>
    </div>
  );
};
