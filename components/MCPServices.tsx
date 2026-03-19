import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Globe, Info, ExternalLink, X, ShieldCheck, MoreHorizontal, Zap, Edit2, Trash2 } from 'lucide-react';
import { Tooltip, message } from 'antd';
import dayjs from 'dayjs';
import MCPServiceModal from './AddMCPServiceModal';
import ToolAuthSettingsDrawer from './ToolAuthSettingsDrawer';
import { getIcon } from '../constants';
import { apiService } from '../services/apiService';
import { McpProviderRequest, McpProviderUpdateRequest, ToolCredential } from '../types';

// Mock data for MCP Services
const MOCK_MCP_SERVICES = [
  {
    id: '1',
    name: 'Composio Notion MCP',
    server_url: 'https://mcp.composio.dev/notion/abc',
    status: 'authorized',
    tools: 5,
    updatedAt: '2026-03-12 11:35:00',
    updated_at: 1741779300,
    server_identifier: 'composio-notion',
    clientId: '',
    clientSecret: '',
    timeout: 30,
    sseTimeout: 300,
    icon: 'LayoutGrid',
    iconType: 'icon' as 'icon' | 'image' | 'sys-icon',
    iconBgColor: 'bg-indigo-600',
    is_team_authorization: true
  },
  {
    id: '2',
    name: 'Zapier AI Actions',
    server_url: 'https://actions.zapier.com/mcp/sse',
    status: 'authorized',
    tools: 5,
    updatedAt: '2026-03-12 11:30:00',
    updated_at: 1741779000,
    server_identifier: 'zapier-actions',
    clientId: '',
    clientSecret: '',
    timeout: 30,
    sseTimeout: 300,
    icon: 'LayoutGrid',
    iconType: 'icon' as 'icon' | 'image' | 'sys-icon',
    iconBgColor: 'bg-indigo-600',
    is_team_authorization: true
  },
  {
    id: '3',
    name: 'Gmail MCP',
    server_url: 'https://mcp.gmail.com/sse',
    status: 'unconfigured',
    tools: 0,
    updatedAt: '2026-03-12 11:25:00',
    updated_at: 1741778700,
    server_identifier: 'gmail-mcp',
    clientId: '',
    clientSecret: '',
    timeout: 30,
    sseTimeout: 300,
    icon: 'LayoutGrid',
    iconType: 'icon' as 'icon' | 'image' | 'sys-icon',
    iconBgColor: 'bg-indigo-600',
    is_team_authorization: false
  }
];

const MOCK_TOOLS = [
    {
        "name": "read_query",
        "label": {
            "en_US": "read_query",
            "zh_Hans": "read_query"
        },
        "description": {
            "en_US": "Execute a SELECT query on the IoTDB. Please use table sql_dialect when generating SQL queries.\n\nArgs:\n    query_sql: The SQL query to execute (using TABLE dialect, time using ISO 8601 format, e.g. 2017-11-01T00:08:00.000)",
            "zh_Hans": "在 IoTDB 上执行 SELECT 查询。生成 SQL 查询时请使用 table sql_dialect。\n\n参数：\n    query_sql: 要执行的 SQL 查询（使用 TABLE 方言，时间使用 ISO 8601 格式，例如 2017-11-01T00:08:00.000）"
        },
        "parameters": [
            {
                "name": "query_sql",
                "label": {
                    "en_US": "query_sql",
                    "zh_Hans": "查询 SQL"
                },
                "required": true,
                "type": "string",
                "human_description": {
                    "en_US": "The SQL query to execute",
                    "zh_Hans": "要执行的 SQL 查询"
                }
            }
        ]
    },
    {
        "name": "list_tables",
        "label": {
            "en_US": "list_tables",
            "zh_Hans": "列出表"
        },
        "description": {
            "en_US": "List all tables in the IoTDB database.",
            "zh_Hans": "列出 IoTDB 数据库中的所有表。"
        },
        "parameters": []
    }
];

const MCPServices: React.FC = () => {
  const [services, setServices] = useState<any[]>(MOCK_MCP_SERVICES);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [drawerMenuOpen, setDrawerMenuOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [isAuthSettingsOpen, setIsAuthSettingsOpen] = useState(false);
  const [isSavingAuth, setIsSavingAuth] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchServices();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const query = searchQuery.toLowerCase();
    return services.filter(s => 
      s.name.toLowerCase().includes(query) || 
      (s.server_identifier || s.identifier || '').toLowerCase().includes(query) ||
      s.server_url.toLowerCase().includes(query)
    );
  }, [services, searchQuery]);

  const fetchServices = async () => {
    try {
      const data = await apiService.fetchCollectionList('mcp');
      if (data && data.length > 0) {
        const mapped = data.map((item: any) => {
          let name = item.label?.zh_Hans || item.label?.en_US || item.name || item.provider || '';
          if (typeof name === 'object' && name !== null) {
            name = name.zh_Hans || name.en_US || JSON.stringify(name);
          }
          const id = item.id || item.provider || (typeof item.name === 'string' ? item.name : '') || '';
          
          return {
            id: id,
            name: name,
            server_url: item.server_url || '',
            status: item.is_team_authorization ? 'authorized' : 'unconfigured',
            tools: item.tools?.length || 0,
            updatedAt: item.updated_at ? dayjs(item.updated_at * 1000).format('YYYY-MM-DD HH:mm:ss') : '刚刚',
            updated_at: item.updated_at,
            identifier: item.server_identifier || id,
            icon: item.icon || 'LayoutGrid',
            iconType: item.icon_type || (typeof item.icon === 'string' && item.icon.startsWith('http') ? 'image' : 'icon'),
            iconBgColor: item.icon_background || 'bg-indigo-600',
            iconUrl: item.icon_url || '',
            rawTools: item.tools || [],
            is_team_authorization: item.is_team_authorization
          };
        });
        setServices(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch MCP services:', error);
    }
  };

  const renderServiceIcon = (service: any, containerClass: string, iconClass: string) => {
    const isUrl = typeof service.icon === 'string' && (service.icon.startsWith('http') || service.icon.startsWith('/'));

    if (service.iconType === 'sys-icon') {
      return (
        <div className={`${containerClass} bg-gray-50 flex items-center justify-center overflow-hidden`}>
          <img 
            src={`/sys_icons/Component ${service.icon}.svg`} 
            alt={service.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/sys_icons/Component 156.svg';
            }}
          />
        </div>
      );
    }

    if (service.iconType === 'image' || isUrl) {
      const src = service.iconUrl || service.icon_url || service.icon;
      return (
        <img 
          src={src || undefined} 
          alt={service.name} 
          className={`${containerClass} object-cover border border-gray-100`} 
          referrerPolicy="no-referrer"
        />
      );
    }

    return (
      <div className={`${containerClass} ${service.iconBgColor || 'bg-indigo-600'} text-white flex items-center justify-center`}>
        {getIcon(service.icon, iconClass)}
      </div>
    );
  };

  // Removed menuRef and handleClickOutside logic

  const handleAddService = async (data: any) => {
    try {
      const filteredHeaders = (data.headers || []).filter((h: any) => h.key && h.value);

      const requestData: McpProviderRequest = {
        name: data.name,
        server_url: data.server_url,
        icon: data.icon,
        icon_type: data.iconType,
        icon_background: data.iconBgColor,
        server_identifier: data.server_identifier,
        is_dynamic_registration: data.is_dynamic_registration,
        authentication: data.authentication,
        configuration: data.configuration,
        headers: filteredHeaders,
      };
      await apiService.createMcpProvider(requestData);
      message.success('添加成功');
      fetchServices();
    } catch (error: any) {
      console.error('Failed to add MCP service:', error);
      message.error('添加失败: ' + (error.message || '未知错误'));
    }
  };

  const handleUpdateService = async (data: any) => {
    if (!editingService) return;
    try {
      const filteredHeaders = (data.headers || []).filter((h: any) => h.key && h.value);

      const requestData: McpProviderUpdateRequest = {
        provider_id: editingService.id,
        name: data.name,
        server_url: data.server_url,
        icon: data.icon,
        icon_type: data.iconType,
        icon_background: data.iconBgColor,
        server_identifier: data.server_identifier,
        is_dynamic_registration: data.is_dynamic_registration,
        authentication: data.authentication,
        configuration: data.configuration,
        headers: filteredHeaders,
      };
      await apiService.updateMcpProvider(requestData);
      message.success('更新成功');
      setEditingService(null);
      fetchServices();
    } catch (error: any) {
      console.error('Failed to update MCP service:', error);
      message.error('更新失败: ' + (error.message || '未知错误'));
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await apiService.deleteMcpProvider(id);
      setServices(services.filter(s => s.id !== id));
      setMenuOpenId(null);
      message.success('删除成功');
    } catch (error: any) {
      console.error('Failed to delete MCP service:', error);
      message.error('删除失败: ' + (error.message || '未知错误'));
    }
  };

  const handleEditClick = async (service: any) => {
    setMenuOpenId(null);
    try {
      const detail = await apiService.fetchMcpProviderDetail(service.id);
      let nameStr = detail?.name || service.name;
      if (typeof nameStr === 'object' && nameStr !== null) {
        nameStr = nameStr.zh_Hans || nameStr.en_US || JSON.stringify(nameStr);
      }
        const extra = detail?.extra || {};
        const fullService = {
          ...service,
          name: nameStr,
          server_url: detail?.server_url || service.server_url || '',
          server_identifier: detail?.server_identifier || service.identifier || '',
          icon: detail?.icon || service.icon,
          iconType: detail?.icon_type || (typeof detail?.icon === 'string' && detail.icon.startsWith('http') ? 'image' : service.iconType),
          iconBgColor: detail?.icon_background || service.iconBgColor,
          updatedAt: detail?.updated_at ? dayjs(detail.updated_at * 1000).format('YYYY-MM-DD HH:mm:ss') : service.updatedAt,
          updated_at: detail?.updated_at || service.updated_at,
          is_dynamic_registration: detail?.is_dynamic_registration,
          authentication: detail?.authentication,
          configuration: detail?.configuration,
          headers: detail?.headers || []
        };
      setEditingService(fullService);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch MCP details for edit:', error);
      setEditingService(service);
      setIsModalOpen(true);
    }
  };

  const handleSelectService = async (service: any) => {
    if (menuOpenId) {
      setMenuOpenId(null);
      return;
    }
    
    let fullService = service;
    try {
      const detail = await apiService.fetchMcpProviderDetail(service.id);
      
      let nameStr = detail?.name || service.name;
      if (typeof nameStr === 'object' && nameStr !== null) {
        nameStr = nameStr.zh_Hans || nameStr.en_US || JSON.stringify(nameStr);
      }

        const extra = detail?.extra || {};
        fullService = {
          ...service,
          name: nameStr,
          server_url: detail?.server_url || service.server_url || '',
          identifier: detail?.server_identifier || service.identifier || '',
          icon: detail?.icon || service.icon,
          iconType: detail?.icon_type || (typeof detail?.icon === 'string' && detail.icon.startsWith('http') ? 'image' : service.iconType),
          iconBgColor: detail?.icon_background || service.iconBgColor,
          iconUrl: detail?.icon_url || service.iconUrl || '',
          is_team_authorization: detail?.is_team_authorization, // Ensure this is mapped
          updatedAt: detail?.updated_at ? dayjs(detail.updated_at * 1000).format('YYYY-MM-DD HH:mm:ss') : service.updatedAt,
          updated_at: detail?.updated_at || service.updated_at,
          is_dynamic_registration: detail?.is_dynamic_registration,
          authentication: detail?.authentication,
          configuration: detail?.configuration,
          headers: detail?.headers || []
        };
      setSelectedService(fullService);

      if (fullService.is_team_authorization) {
        setLoadingTools(true);
        let fetchedTools = detail?.tools || service.rawTools;
        if (fetchedTools) {
          if (!Array.isArray(fetchedTools)) {
            fetchedTools = Object.values(fetchedTools);
          }
          setTools(fetchedTools);
        } else {
          // 模拟请求
          await new Promise(resolve => setTimeout(resolve, 500));
          setTools(MOCK_TOOLS);
        }
        setLoadingTools(false);
      } else {
        setTools([]);
      }
    } catch (error) {
      console.error('Failed to fetch MCP details:', error);
      setSelectedService(service);
      if (service.is_team_authorization) {
        setTools(Array.isArray(service.rawTools) ? service.rawTools : []);
      } else {
        setTools([]);
      }
    }
  };

  const handleSaveAuthSettings = async (values: any) => {
    if (!selectedService) return;
    setIsSavingAuth(true);
    try {
      // 1. Call the MCP auth interface directly
      await apiService.authMcpProvider(selectedService.id, values.authorization_code);
      
      message.success('授权成功');
      setIsAuthSettingsOpen(false);
      
      // 3. Seamlessly refresh the detail drawer state
      // We fetch the latest detail to get the updated authorization status and tools
      const detail = await apiService.fetchMcpProviderDetail(selectedService.id);
      
      let nameStr = detail?.name || selectedService.name;
      if (typeof nameStr === 'object' && nameStr !== null) {
        nameStr = nameStr.zh_Hans || nameStr.en_US || JSON.stringify(nameStr);
      }

      const updatedService = {
        ...selectedService,
        name: nameStr,
        is_team_authorization: detail?.is_team_authorization,
        authentication: detail?.authentication,
        tools: detail?.tools?.length || 0,
        updatedAt: detail?.updated_at ? dayjs(detail.updated_at * 1000).format('YYYY-MM-DD HH:mm:ss') : selectedService.updatedAt,
        updated_at: detail?.updated_at || selectedService.updated_at,
      };
      
      // Update the selected service state - this triggers the "seamless" UI update in the drawer
      setSelectedService(updatedService);
      
      // 4. Update tools list if authorized
      if (detail?.is_team_authorization) {
        setLoadingTools(true);
        let fetchedTools = detail?.tools || [];
        if (fetchedTools && !Array.isArray(fetchedTools)) {
          fetchedTools = Object.values(fetchedTools);
        }
        setTools(fetchedTools);
        setLoadingTools(false);
      } else {
        setTools([]);
      }
      
      // 5. Refresh the main services list in the background
      fetchServices();
    } catch (error: any) {
      console.error('Failed to authorize MCP service:', error);
      message.error('授权失败: ' + (error.message || '未知错误'));
    } finally {
      setIsSavingAuth(false);
    }
  };

  const mcpAuthSchema = useMemo(() => {
    const serviceName = selectedService?.name || 'MCP';
    return [
      {
        name: 'authorization_code',
        label: { zh_Hans: 'OAuth 授权码', en_US: 'OAuth Authorization Code' },
        help: null,
        placeholder: { zh_Hans: `请输入您的${serviceName} OAuth 授权码`, en_US: `Enter your ${serviceName} OAuth authorization code` },
        type: 'secret-input',
        required: false,
        default: ''
      }
    ] as ToolCredential[];
  }, [selectedService?.name]);

  return (
    <div className="flex flex-col gap-8 p-8 min-h-screen font-sans text-gray-900 bg-[#F9FAFB]">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      <div className="relative flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200/80 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">MCP 服务</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed">
            管理和配置您的 MCP 服务连接，扩展应用能力。已连接的服务将自动同步工具。
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索服务名称或标识符..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={handleRefresh}
            className={`p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm ${isRefreshing ? 'animate-spin' : ''}`}
            title="刷新列表"
          >
            <Zap className={`w-4 h-4 ${isRefreshing ? 'text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Transparent overlay for closing menu */}
      {menuOpenId && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} />
      )}

      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Add Service Card (Always First) */}
        {!searchQuery && (
          <div 
            className="group relative bg-gradient-to-br from-indigo-50/50 to-white rounded-2xl border-2 border-dashed border-indigo-200 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 ease-out min-h-[220px]"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-indigo-100 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-300">
              <Plus className="w-6 h-6 text-indigo-500 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-bold text-indigo-900 group-hover:text-indigo-700 transition-colors">添加新服务</span>
            <p className="text-xs text-indigo-400 mt-2 text-center px-4 leading-relaxed">连接新的 MCP 服务器以扩展工具集</p>
          </div>
        )}

        {/* Service Cards */}
        {filteredServices.map(service => (
          <div 
            key={service.id}
            className={`group relative bg-white rounded-2xl border border-gray-100 p-5 flex flex-col cursor-pointer shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden ${menuOpenId === service.id ? 'z-50 ring-2 ring-indigo-500/20' : ''}`}
            onClick={() => handleSelectService(service)}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Status Indicator */}
            <div className="absolute top-5 right-5">
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                  service.status === 'authorized' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${service.status === 'authorized' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  {service.status === 'authorized' ? '已授权' : '待配置'}
                </div>
            </div>

            <div className="flex items-start gap-4 mb-5">
              {renderServiceIcon(service, "w-14 h-14 rounded-2xl shrink-0 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300", "w-7 h-7")}
              <div className="flex-1 min-w-0 pr-4 pt-1">
                <h3 className="font-bold text-gray-900 text-lg truncate leading-tight group-hover:text-indigo-600 transition-colors">{service.name}</h3>
                <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]">{service.server_identifier || service.identifier}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5 text-gray-500 cursor-pointer" title="工具数量">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{service.tools}</span>
                 </div>
                  <Tooltip title={`更新时间: ${service.updatedAt}`} arrow={false}>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="text-xs">{service.updatedAt}</span>
                    </div>
                  </Tooltip>
               </div>
               
               <div className="relative">
                <div 
                  className={`p-2 rounded-lg transition-all cursor-pointer ${menuOpenId === service.id ? 'bg-gray-100 text-gray-900' : 'text-gray-300 hover:bg-gray-50 hover:text-gray-600'}`}
                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === service.id ? null : service.id); }}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </div>
                {menuOpenId === service.id && (
                    <div className="absolute right-0 bottom-full mb-2 w-36 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(service); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            <Edit2 className="w-3.5 h-3.5" /> 修改配置
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteService(service.id); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> 删除服务
                        </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">未找到相关服务</h3>
          <p className="text-sm text-gray-500 mt-1">尝试调整搜索关键词</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-700"
          >
            清除搜索
          </button>
        </div>
      )}

      {/* Modal */}
      <MCPServiceModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingService(null); }} 
        onAdd={editingService ? handleUpdateService : handleAddService}
        initialData={editingService}
      />

      {/* Drawer for Service Details */}
      {selectedService && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={() => setSelectedService(null)} />
          <div className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-[70] p-8 border-l border-gray-100 flex flex-col">
            
            {/* Transparent overlay for closing drawer menu */}
            {drawerMenuOpen && (
              <div className="fixed inset-0 z-[75]" onClick={() => setDrawerMenuOpen(false)} />
            )}

            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                {renderServiceIcon(selectedService, "w-14 h-14 rounded-2xl shrink-0 shadow-sm", "w-7 h-7")}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-xl">{selectedService.name}</h3>
                    {selectedService.is_team_authorization && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 已授权
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{selectedService.server_url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setDrawerMenuOpen(!drawerMenuOpen)} 
                    className={`p-2 rounded-full transition-colors ${drawerMenuOpen ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                  >
                    <MoreHorizontal className="w-6 h-6" />
                  </button>
                  {drawerMenuOpen && (
                    <div className="absolute right-0 top-12 w-32 bg-white rounded-xl shadow-xl border border-gray-100 z-[80] p-1">
                      <button 
                        onClick={() => { 
                          setDrawerMenuOpen(false); 
                          handleEditClick(selectedService); 
                        }} 
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" /> 修改
                      </button>
                      <button 
                        onClick={() => { 
                          setDrawerMenuOpen(false); 
                          handleDeleteService(selectedService.id); 
                          setSelectedService(null);
                        }} 
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" /> 删除
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedService(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 mb-8">
              <button 
                onClick={() => setIsAuthSettingsOpen(true)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {selectedService.is_team_authorization ? '更新授权' : '授权'}
              </button>
              
              {!selectedService.is_team_authorization && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                  <Info className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm font-bold text-gray-700">需要授权</p>
                  <p className="text-xs mt-1 text-gray-400">授权后，工具将显示在这里。</p>
                </div>
              )}
            </div>
            
            {selectedService.is_team_authorization && (
              <div className="flex-grow overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">{tools?.length || 0} 个工具已包含</h4>
                  <button 
                    onClick={() => handleSelectService(selectedService)}
                    className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700 transition-colors"
                  >
                    <Zap className="w-3 h-3" /> 更新
                  </button>
                </div>
                <div className="space-y-3">
                  {loadingTools ? (
                    <p className="text-sm text-gray-400">加载中...</p>
                  ) : (
                    (tools || []).map((tool: any, index: number) => {
                      const descText = typeof tool.description === 'string' 
                        ? tool.description 
                        : (tool.description?.zh_Hans || tool.description?.en_US || JSON.stringify(tool.description) || '');
                      const nameText = typeof tool.label === 'object' && tool.label !== null
                        ? (tool.label.zh_Hans || tool.label.en_US || tool.name)
                        : (typeof tool.name === 'string' ? tool.name : (tool.name?.zh_Hans || tool.name?.en_US || JSON.stringify(tool.name) || ''));
                      return (
                        <div 
                          key={index} 
                          className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition-all cursor-pointer group relative overflow-hidden"
                          onClick={() => setSelectedTool(tool)}
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">{nameText}</h5>
                              {tool.parameters?.length > 0 && (
                                <span className="text-[10px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-100 font-mono">
                                  {tool.parameters.length} params
                                </span>
                              )}
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                              <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                          </div>
                          <Tooltip 
                            title={descText} 
                            placement="left" 
                            arrow={false}
                            styles={{ container: { maxWidth: '300px', fontSize: '12px', lineHeight: '1.5', borderRadius: '12px', padding: '12px' } }}
                          >
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{descText}</p>
                          </Tooltip>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Auth Settings Drawer */}
      <ToolAuthSettingsDrawer
        isOpen={isAuthSettingsOpen}
        onClose={() => setIsAuthSettingsOpen(false)}
        schema={mcpAuthSchema}
        initialValues={{
          authorization_code: selectedService?.authentication?.authorization_code || ''
        }}
        onSave={handleSaveAuthSettings}
        isLoading={isSavingAuth}
      />

      {/* Tool Details Modal */}
      {selectedTool && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={() => setSelectedTool(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {typeof selectedTool.label === 'object' && selectedTool.label !== null
                      ? (selectedTool.label.zh_Hans || selectedTool.label.en_US || selectedTool.name)
                      : (typeof selectedTool.name === 'string' ? selectedTool.name : (selectedTool.name?.zh_Hans || selectedTool.name?.en_US || JSON.stringify(selectedTool.name)))}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-mono">{selectedTool.name}</code>
                    <span className="text-[10px] text-gray-400">•</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">MCP Tool</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedTool(null)} className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Description */}
                <div className="lg:col-span-1 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5" />
                      描述
                    </h4>
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100/50">
                      {typeof selectedTool.description === 'string' 
                        ? selectedTool.description 
                        : (selectedTool.description?.zh_Hans || selectedTool.description?.en_US || JSON.stringify(selectedTool.description) || '无描述')}
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">元数据</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">参数数量</span>
                        <span className="text-xs font-bold text-gray-900">{selectedTool.parameters?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">所属服务</span>
                        <span className="text-xs font-bold text-indigo-600">{selectedService?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Parameters */}
                <div className="lg:col-span-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    参数详情 (Parameters)
                  </h4>
                  
                  {Array.isArray(selectedTool.parameters) && selectedTool.parameters.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {selectedTool.parameters.map((param: any, pIdx: number) => {
                        const paramLabel = param.label?.zh_Hans || param.label?.en_US || param.name;
                        const paramDesc = param.human_description?.zh_Hans || param.human_description?.en_US || '';
                        return (
                          <div key={pIdx} className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-gray-900">{paramLabel}</span>
                                  {param.required && (
                                    <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-md font-bold border border-red-100">必填</span>
                                  )}
                                </div>
                                <code className="text-[10px] text-gray-400 font-mono block">{param.name}</code>
                              </div>
                              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border border-indigo-100">{param.type}</span>
                            </div>
                            {paramDesc && (
                              <p className="text-xs text-gray-500 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                                {paramDesc}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-gray-900 rounded-2xl p-6 overflow-x-auto shadow-2xl border border-gray-800">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] text-gray-500 font-mono ml-2">parameters.json</span>
                      </div>
                      <pre className="text-xs text-indigo-300 font-mono leading-relaxed">
                        {JSON.stringify(selectedTool.parameters, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedTool(null)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCPServices;
