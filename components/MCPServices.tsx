import React, { useState } from 'react';
import { Plus, Search, Globe, Info, ExternalLink, X, ShieldCheck, MoreHorizontal, Zap } from 'lucide-react';

// Mock data for MCP Services
const MOCK_MCP_SERVICES = [
  {
    id: '1',
    name: 'Composio Notion MCP',
    host: 'https://mcp.composio.dev/notion/abc',
    status: 'authorized',
    tools: 5,
    updatedAt: '3分钟前'
  },
  {
    id: '2',
    name: 'Zapier AI Actions',
    host: 'https://actions.zapier.com/mcp/sse',
    status: 'authorized',
    tools: 5,
    updatedAt: '3分钟前'
  },
  {
    id: '3',
    name: 'Gmail MCP',
    host: 'https://mcp.gmail.com/sse',
    status: 'unconfigured',
    tools: 0,
    updatedAt: '3分钟前'
  }
];

const MOCK_TOOLS = [
    {
        "name": "read_query",
        "description": "Execute a SELECT query on the IoTDB. Please use table sql_dialect when generating SQL queries.\n\nArgs:\n    query_sql: The SQL query to execute (using TABLE dialect, time using ISO 8601 format, e.g. 2017-11-01T00:08:00.000)",
        "parameters": {
            "properties": {
                "query_sql": {
                    "title": "Query Sql",
                    "type": "string"
                }
            },
            "required": [
                "query_sql"
            ],
            "type": "object"
        }
    },
    {
        "name": "list_tables",
        "description": "List all tables in the IoTDB database.",
        "parameters": {
            "properties": {},
            "type": "object"
        }
    },
    {
        "name": "describe_table",
        "description": "Get the schema information for a specific table\nArgs:\n    table_name: name of the table to describe",
        "parameters": {
            "properties": {
                "table_name": {
                    "title": "Table Name",
                    "type": "string"
                }
            },
            "required": [
                "table_name"
            ],
            "type": "object"
        }
    },
    {
        "name": "export_table_query",
        "description": "Execute a query and export the results to a CSV or Excel file.\n\nArgs:\n    query_sql: The SQL query to execute (using TABLE dialect, time using ISO 8601 format, e.g. 2017-11-01T00:08:00.000)\n    format: Export format, either \"csv\" or \"excel\" (default: \"csv\")\n    filename: Optional filename for the exported file. If not provided, a unique filename will be generated.\n            \nSQL Syntax:\n    SELECT ⟨select_list⟩\n      FROM ⟨tables⟩\n      [WHERE ⟨condition⟩]\n      [GROUP BY ⟨groups⟩]\n      [HAVING ⟨group_filter⟩]\n      [FILL ⟨fill_methods⟩]\n      [ORDER BY ⟨order_expression⟩]\n      [OFFSET ⟨n⟩]\n      [LIMIT ⟨n⟩];\n\nReturns:\n    Information about the exported file and a preview of the data (max 10 rows)",
        "parameters": {
            "properties": {
                "query_sql": {
                    "title": "Query Sql",
                    "type": "string"
                },
                "format": {
                    "default": "csv",
                    "title": "Format",
                    "type": "string"
                },
                "filename": {
                    "default": null,
                    "title": "Filename",
                    "type": "string"
                }
            },
            "required": [
                "query_sql"
            ],
            "type": "object"
        }
    }
];

const MCPServices: React.FC = () => {
  const [services] = useState(MOCK_MCP_SERVICES);
  const [selectedService, setSelectedService] = useState<typeof MOCK_MCP_SERVICES[0] | null>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);

  const handleSelectService = async (service: typeof MOCK_MCP_SERVICES[0]) => {
    setSelectedService(service);
    if (service.status === 'authorized') {
      setLoadingTools(true);
      // 模拟请求
      await new Promise(resolve => setTimeout(resolve, 500));
      setTools(MOCK_TOOLS);
      setLoadingTools(false);
    } else {
      setTools([]);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">MCP 服务</h2>
          <p className="text-sm text-gray-500 mt-2">管理和配置您的 MCP 服务连接，扩展应用能力。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Add Service Card */}
        <div className="bg-white rounded-2xl border-2 border-dashed border-primary-300 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all min-h-[180px] group">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center border border-primary-200 mb-4 shadow-sm group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6 text-primary-600" />
          </div>
          <span className="text-sm font-semibold text-primary-700">添加 MCP 服务 (HTTP)</span>
        </div>

        {/* Service Cards */}
        {services.map(service => (
          <div 
            key={service.id}
            className={`bg-white rounded-2xl border p-6 flex flex-col cursor-pointer hover:shadow-lg transition-all ${service.status === 'authorized' ? 'border-gray-100' : 'border-red-100'}`}
            onClick={() => handleSelectService(service)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{service.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{service.tools} 个工具 · 更新于 {service.updatedAt}</p>
                </div>
              </div>
              <MoreHorizontal className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </div>
            <p className="text-xs text-gray-500 truncate mb-4 bg-gray-50 p-2 rounded-lg font-mono">{service.host}</p>
            <div className="mt-auto flex justify-end">
              {service.status === 'authorized' ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 已授权
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> 未配置服务 ●
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Drawer for Service Details */}
      {selectedService && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={() => setSelectedService(null)} />
          <div className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-[70] p-8 border-l border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <Globe className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">{selectedService.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedService.host}</p>
                </div>
              </div>
              <button onClick={() => setSelectedService(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            
            {selectedService.status === 'authorized' ? (
              <div className="flex-grow overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">{tools.length} 个工具已包含</h4>
                  <button className="text-xs text-primary-600 font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" /> 更新
                  </button>
                </div>
                <div className="space-y-3">
                  {loadingTools ? (
                    <p className="text-sm text-gray-400">加载中...</p>
                  ) : (
                    tools.map((tool, index) => (
                      <div key={index} className="p-4 border border-gray-100 rounded-xl hover:border-primary-100 hover:bg-primary-50/30 transition-all">
                        <h5 className="font-bold text-sm text-gray-900 mb-1">{tool.name}</h5>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{tool.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <>
                <button className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold mb-8 shadow-lg shadow-primary-200 transition-all">
                  授权
                </button>
                
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                  <Info className="w-12 h-12 mb-4 opacity-30" />
                  <p className="text-sm font-bold text-gray-700">需要授权</p>
                  <p className="text-xs mt-2 text-gray-400">授权后，工具将显示在这里。</p>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MCPServices;
