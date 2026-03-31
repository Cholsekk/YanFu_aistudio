import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import { ToolItem } from '../types';
import { apiService } from '../services/apiService';
import { Popover, Spin } from 'antd';

interface ToolSelectorPopoverProps {
  children: React.ReactNode;
  onSelectTool: (provider: ToolItem, tool: any) => void;
}

export const ToolSelectorPopover: React.FC<ToolSelectorPopoverProps> = ({ children, onSelectTool }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'builtin' | 'mcp' | 'workflow'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({});
  const [providerDetails, setProviderDetails] = useState<Record<string, any[]>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTools();
    }
  }, [isOpen, activeTab]);

  const fetchTools = async () => {
    setLoading(true);
    try {
      let typeParam = '';
      if (activeTab === 'builtin') typeParam = 'builtin';
      else if (activeTab === 'mcp') typeParam = 'mcp';
      else if (activeTab === 'workflow') typeParam = 'workflow';
      
      const response = await apiService.fetchCollectionList(typeParam);
      if (response) {
        const rawTools = Array.isArray(response) ? response : (response as any).data || [];
        const mappedTools = rawTools.map((item: any) => {
          const name = item.provider || item.name || '';
          
          const label = typeof item.label === 'string' 
            ? { zh_Hans: item.label, en_US: item.label } 
            : { 
                zh_Hans: item.label?.zh_Hans || item.label?.en_US || name, 
                en_US: item.label?.en_US || item.label?.zh_Hans || name 
              };
            
          const description = typeof item.description === 'string'
            ? { zh_Hans: item.description, en_US: item.description }
            : { 
                zh_Hans: item.description?.zh_Hans || item.description?.en_US || '', 
                en_US: item.description?.en_US || item.description?.zh_Hans || '' 
              };

          return {
            ...item,
            id: item.id || name,
            name: name,
            author: item.author || '',
            description: description,
            icon: item.icon || '',
            label: label,
            type: item.type,
            labels: item.labels || [],
            tools: item.tools || []
          };
        });
        setTools(mappedTools);
      } else {
        setTools([]);
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProvider = async (provider: ToolItem) => {
    const isExpanded = expandedProviders[provider.id];
    setExpandedProviders(prev => ({ ...prev, [provider.id]: !isExpanded }));

    if (!isExpanded && !providerDetails[provider.id]) {
      setLoadingDetails(prev => ({ ...prev, [provider.id]: true }));
      try {
        let response;
        if (provider.type === 'builtin') {
          response = await apiService.fetchBuiltInToolList(provider.name);
        } else if (provider.type === 'api') {
          response = await apiService.fetchCustomToolList(provider.name);
        } else if (provider.type === 'workflow') {
          response = await apiService.fetchWorkflowToolDetail(provider.id);
        } else if (provider.type === 'mcp') {
          response = await apiService.fetchMcpProviderDetail(provider.id);
        }
        
        if (response) {
          let details = [];
          if (Array.isArray(response)) {
            details = response;
          } else if (response.tools && Array.isArray(response.tools)) {
            details = response.tools;
          } else if (response.tool) {
            details = [response.tool];
          } else if (response.data) {
            details = Array.isArray(response.data) ? response.data : (response.data.tools || [response.data]);
          }
          setProviderDetails(prev => ({ ...prev, [provider.id]: details }));
        }
      } catch (error) {
        console.error('Failed to fetch provider details:', error);
      } finally {
        setLoadingDetails(prev => ({ ...prev, [provider.id]: false }));
      }
    }
  };

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (tool.label?.zh_Hans || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [tools, searchQuery]);

  const groupedTools = useMemo(() => {
    const groups: Record<string, ToolItem[]> = {};
    filteredTools.forEach(tool => {
      const author = tool.author || '未知作者';
      if (!groups[author]) {
        groups[author] = [];
      }
      groups[author].push(tool);
    });
    return groups;
  }, [filteredTools]);

  const renderIcon = (iconData: any) => {
    if (!iconData) return <div className="w-5 h-5 bg-gray-200 rounded-md" />;
    
    let parsedIcon = iconData;
    if (typeof iconData === 'string') {
      if (iconData.startsWith('{')) {
        try {
          parsedIcon = JSON.parse(iconData);
        } catch (e) {
          // It's a URL string
        }
      } else {
        return <img src={iconData} alt="icon" className="w-5 h-5 rounded-md object-cover" />;
      }
    }
    
    if (parsedIcon && parsedIcon.content) {
      return (
        <div 
          className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs"
          style={{ background: parsedIcon.background }}
        >
          {parsedIcon.content.substring(0, 1)}
        </div>
      );
    }
    return <div className="w-5 h-5 bg-gray-200 rounded-md" />;
  };

  const content = (
    <div className="w-[320px] max-h-[500px] flex flex-col bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索工具..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-2 py-1 border-b border-gray-100 overflow-x-auto custom-scrollbar">
        {[
          { id: 'all', label: '全部' },
          { id: 'builtin', label: '内置' },
          { id: 'mcp', label: 'MCP' },
          { id: 'workflow', label: '工作流' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === tab.id ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spin size="small" />
          </div>
        ) : Object.keys(groupedTools).length > 0 ? (
          Object.entries(groupedTools).map(([author, authorTools]) => (
            <div key={author} className="mb-4 last:mb-0">
              <div className="px-2 py-1 text-xs text-gray-500 font-medium mb-1">
                {author}
              </div>
              <div className="space-y-0.5">
                {authorTools.map(tool => {
                  const isExpanded = expandedProviders[tool.id];
                  const details = providerDetails[tool.id];
                  const isLoadingDetails = loadingDetails[tool.id];

                  return (
                    <div key={tool.id}>
                      <div 
                        className="flex items-center justify-between px-2 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        onClick={() => handleToggleProvider(tool)}
                      >
                        <div className="flex items-center gap-2">
                          {renderIcon(tool.icon)}
                          <span className="text-sm text-gray-700">{tool.label?.zh_Hans || tool.name}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Expanded Tools */}
                      {isExpanded && (
                        <div className="ml-7 pl-2 border-l border-gray-100 mt-1 mb-2">
                          {isLoadingDetails ? (
                            <div className="py-2 px-2 text-xs text-gray-400">加载中...</div>
                          ) : details && details.length > 0 ? (
                            details.map((t: any) => (
                              <div 
                                key={t.name || t.id}
                                className="px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                                onClick={() => {
                                  onSelectTool(tool, t);
                                  setIsOpen(false);
                                }}
                              >
                                {t.label?.zh_Hans || t.name}
                              </div>
                            ))
                          ) : (
                            <div className="py-2 px-2 text-xs text-gray-400">暂无工具</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-sm text-gray-400">
            未找到相关工具
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Popover 
      content={content} 
      trigger="click" 
      placement="bottomLeft"
      open={isOpen}
      onOpenChange={setIsOpen}
      styles={{ container: { padding: 0 } }}
      arrow={false}
    >
      {children}
    </Popover>
  );
};
