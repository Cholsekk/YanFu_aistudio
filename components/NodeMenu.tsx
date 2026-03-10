import React, { useState, useMemo } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import { NODE_DEFINITIONS, NODE_CATEGORIES, TOOL_DEFINITIONS, NodeDefinition, ToolDefinition } from '../constants/nodeDefinitions';

interface NodeMenuProps {
  onAddNode: (definition: NodeDefinition) => void;
  onAddTool: (definition: ToolDefinition) => void;
  onClose: () => void;
}

export const NodeMenu: React.FC<NodeMenuProps> = ({ onAddNode, onAddTool, onClose }) => {
  const [activeTab, setActiveTab] = useState<'node' | 'tool'>('node');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeToolCategory, setActiveToolCategory] = useState('all');

  const filteredNodes = useMemo(() => {
    return NODE_DEFINITIONS.filter(node => 
      node.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredTools = useMemo(() => {
    return TOOL_DEFINITIONS.filter(tool => 
      tool.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      {/* Search Header */}
      <div className="p-3 border-bottom border-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input 
            autoFocus
            type="text"
            placeholder={activeTab === 'node' ? "搜索节点" : "搜索工具"}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-3 border-b border-gray-50">
        <button 
          onClick={() => setActiveTab('node')}
          className={`px-4 py-1.5 text-xs font-medium transition-all relative ${
            activeTab === 'node' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          节点
          {activeTab === 'node' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('tool')}
          className={`px-4 py-1.5 text-xs font-medium transition-all relative ${
            activeTab === 'tool' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          工具
          {activeTab === 'tool' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
        {activeTab === 'node' ? (
          <div className="py-2">
            {NODE_CATEGORIES.map(category => {
              const nodesInCategory = filteredNodes.filter(n => n.category === category.id);
              if (nodesInCategory.length === 0) return null;
              
              return (
                <div key={category.id} className="mb-2">
                  <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {category.label}
                  </div>
                  {nodesInCategory.map(node => (
                    <button
                      key={node.type}
                      onClick={() => onAddNode(node)}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-indigo-50/50 transition-colors group text-left"
                    >
                      <div className={`p-1.5 rounded-lg ${node.color} text-white shadow-sm group-hover:scale-110 transition-transform`}>
                        {node.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{node.label}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-2">
            {/* Tool Categories Filter */}
            <div className="px-3 mb-3 flex gap-1 overflow-x-auto no-scrollbar">
              {['全部', '内置', '自定义', '工作流'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveToolCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                    activeToolCategory === cat 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="px-4 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              Yanfu
            </div>
            {filteredTools.map(tool => (
              <button
                key={tool.id}
                onClick={() => onAddTool(tool)}
                className="w-full px-4 py-2 flex items-center justify-between hover:bg-indigo-50/50 transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white border border-gray-100 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{tool.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
