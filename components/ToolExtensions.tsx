import React, { useState, useMemo, useEffect } from 'react';
import { ToolItem, ToolDetail, CredentialSchemaItem, CredentialData, Collection, ToolExtension, ToolCredential, WorkflowToolProviderRequest, WorkflowToolProviderResponse, McpProvider } from '../types';
import ToolAuthDrawer from './ToolAuthDrawer';
import ToolAuthSettingsDrawer from './ToolAuthSettingsDrawer';
import EditCustomToolModal from './EditCustomToolModal';
import CreateMcpToolModal from './CreateMcpToolModal';
import MCPServices from './MCPServices';
import SkillsTab from './SkillsTab';
import { apiService } from '../services/apiService';
import { getIcon, SYSTEM_ICONS } from '../constants';
import * as LucideIcons from 'lucide-react';
import { 
  Search, 
  Globe, 
  Bot, 
  Flame, 
  Palette, 
  BarChart, 
  MapPin, 
  Send, 
  MessageSquare, 
  Table, 
  FileText,
  ChevronDown,
  Filter,
  ExternalLink,
  ShieldCheck,
  Info
} from 'lucide-react';

const MOCK_TOOL_DETAIL: ToolDetail[] = [
    {
        "author": "Yash Parmar, Kalo Chin",
        "name": "tavily_search",
        "label": {
            "en_US": "Tavily Search",
            "zh_Hans": "Tavily 搜索",
            "pt_BR": "Tavily Search",
            "ja_JP": "Tavily Search"
        },
        "description": {
            "en_US": "A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events. Input should be a search query.",
            "zh_Hans": "一个为全面、准确和可信结果而优化的搜索引擎。适用于回答关于时事的问题。输入应该是一个搜索查询。",
            "pt_BR": "A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events. Input should be a search query.",
            "ja_JP": "A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events. Input should be a search query."
        },
        "parameters": [
            {
                "name": "query",
                "label": {
                    "en_US": "Query",
                    "zh_Hans": "查询",
                    "pt_BR": "Query",
                    "ja_JP": "Query"
                },
                "human_description": {
                    "en_US": "The search query you want to execute",
                    "zh_Hans": "您想要执行的搜索查询",
                    "pt_BR": "The search query you want to execute",
                    "ja_JP": "The search query you want to execute"
                },
                "placeholder": null,
                "type": "string",
                "form": "llm",
                "llm_description": "The search query you want to execute",
                "required": true,
                "default": null,
                "min": null,
                "max": null,
                "options": null
            }
        ]
    },
    {
        "author": "Yash Parmar, Kalo Chin",
        "name": "tavily_extract",
        "label": {
            "en_US": "Tavily Extract",
            "zh_Hans": "Tavily 提取",
            "pt_BR": "Tavily Extract",
            "ja_JP": "Tavily Extract"
        },
        "description": {
            "en_US": "A tool for extracting raw content from a given URL. Input should be a URL.",
            "zh_Hans": "一个用于从给定 URL 提取原始内容的工具。输入应该是一个 URL。",
            "pt_BR": "A tool for extracting raw content from a given URL. Input should be a URL.",
            "ja_JP": "A tool for extracting raw content from a given URL. Input should be a URL."
        },
        "parameters": [
            {
                "name": "url",
                "label": {
                    "en_US": "URL",
                    "zh_Hans": "URL",
                    "pt_BR": "URL",
                    "ja_JP": "URL"
                },
                "human_description": {
                    "en_US": "The URL you want to extract content from",
                    "zh_Hans": "您想要提取内容的 URL",
                    "pt_BR": "The URL you want to extract content from",
                    "ja_JP": "The URL you want to extract content from"
                },
                "placeholder": null,
                "type": "string",
                "form": "llm",
                "llm_description": "The URL you want to extract content from",
                "required": true,
                "default": null,
                "min": null,
                "max": null,
                "options": null
            }
        ]
    }
];

const MOCK_CUSTOM_TOOL_DETAIL: ToolDetail[] = [
    {
        "author": "szyl",
        "name": "text_generation_workflow",
        "label": {
            "en_US": "Text Generation Workflow",
            "zh_Hans": "文本生成应用（workflow编排）",
            "pt_BR": "Text Generation Workflow",
            "ja_JP": "Text Generation Workflow"
        },
        "description": {
            "en_US": "Text generation workflow",
            "zh_Hans": "文本生成应用（workflow编排）",
            "pt_BR": "Text generation workflow",
            "ja_JP": "Text generation workflow"
        },
        "parameters": [
            {
                "name": "query",
                "label": {
                    "en_US": "Query",
                    "zh_Hans": "query",
                    "pt_BR": "Query",
                    "ja_JP": "Query"
                },
                "human_description": {
                    "en_US": "Input query",
                    "zh_Hans": "输入查询",
                    "pt_BR": "Input query",
                    "ja_JP": "Input query"
                },
                "placeholder": null,
                "type": "string",
                "form": "llm",
                "llm_description": "Input query",
                "required": true,
                "default": null,
                "min": null,
                "max": null,
                "options": null
            }
        ]
    },
    {
        "author": "szyl",
        "name": "network_information_retrieval",
        "label": {
            "en_US": "网络搜索工具",
            "zh_Hans": "网络搜索工具",
            "pt_BR": "网络搜索工具",
            "ja_JP": "网络搜索工具"
        },
        "description": {
            "en_US": "用于进行网络信息检索",
            "zh_Hans": "用于进行网络信息检索",
            "pt_BR": "用于进行网络信息检索",
            "ja_JP": "用于进行网络信息检索"
        },
        "parameters": [
            {
                "name": "querys",
                "label": {
                    "en_US": "querys",
                    "zh_Hans": "querys",
                    "pt_BR": "querys",
                    "ja_JP": "querys"
                },
                "human_description": {
                    "en_US": "搜索文本列表，如[“法国的首都”, “巴黎的人口”]",
                    "zh_Hans": "搜索文本列表，如[“法国的首都”, “巴黎的人口”]",
                    "pt_BR": "搜索文本列表，如[“法国的首都”, “巴黎的人口”]",
                    "ja_JP": "搜索文本列表，如[“法国的首都”, “巴黎的人口”]"
                },
                "placeholder": null,
                "type": "string",
                "form": "llm",
                "llm_description": "搜索文本列表，如[“法国的首都”, “巴黎的人口”]",
                "required": true,
                "default": null,
                "min": null,
                "max": null,
                "options": null
            }
          ],
          "labels": []
    }
];

const MOCK_TOOLS: ToolItem[] = [
    {
        "id": "google",
        "author": "Yanfu",
        "name": "google",
        "description": {
            "zh_Hans": "GoogleSearch",
            "en_US": "Google",
            "pt_BR": "Google",
            "ja_JP": "Google"
        },
        "icon": "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
        "label": {
            "zh_Hans": "Google",
            "en_US": "Google",
            "pt_BR": "Google",
            "ja_JP": "Google"
        },
        "type": "builtin",
        "team_credentials": {
            "serpapi_api_key": ""
        },
        "is_team_authorization": false,
        "allow_delete": true,
        "tools": [],
        "labels": [
            "search"
        ]
    },
    {
        "id": "bing",
        "author": "Yanfu",
        "name": "bing",
        "description": {
            "zh_Hans": "Bing 搜索",
            "en_US": "Bing Search",
            "pt_BR": "Bing Search",
            "ja_JP": "Bing Search"
        },
        "icon": "https://cdn-icons-png.flaticon.com/512/300/300218.png",
        "label": {
            "zh_Hans": "Bing",
            "en_US": "Bing",
            "pt_BR": "Bing",
            "ja_JP": "Bing"
        },
        "type": "builtin",
        "team_credentials": {
            "subscription_key": "",
            "server_url": "",
            "allow_entities": "",
            "allow_web_pages": "",
            "allow_computation": "",
            "allow_news": "",
            "allow_related_searches": ""
        },
        "is_team_authorization": false,
        "allow_delete": true,
        "tools": [],
        "labels": [
            "search"
        ]
    },
    {
        "id": "searxng",
        "author": "Junytang",
        "name": "searxng",
        "description": {
            "zh_Hans": "开源免费的互联网元搜索引擎",
            "en_US": "A free internet metasearch engine.",
            "pt_BR": "A free internet metasearch engine.",
            "ja_JP": "A free internet metasearch engine."
        },
        "icon": "https://docs.searxng.org/_static/searxng-wordmark.svg",
        "label": {
            "zh_Hans": "SearXNG",
            "en_US": "SearXNG",
            "pt_BR": "SearXNG",
            "ja_JP": "SearXNG"
        },
        "type": "builtin",
        "team_credentials": {
            "searxng_base_url": ""
        },
        "is_team_authorization": true,
        "allow_delete": true,
        "tools": [],
        "labels": [
            "search",
            "productivity"
        ]
    },
    {
        "id": "tavily",
        "author": "Yash Parmar, Kalo Chin",
        "name": "tavily",
        "description": {
            "zh_Hans": "一个强大的原生AI搜索引擎和网页内容提取工具，提供高度相关的搜索结果和网页原始内容提取。",
            "en_US": "A powerful AI-native search engine and web content extraction tool that provides highly relevant search results and raw content extraction from web pages.",
            "pt_BR": "A powerful AI-native search engine and web content extraction tool that provides highly relevant search results and raw content extraction from web pages.",
            "ja_JP": "A powerful AI-native search engine and web content extraction tool that provides highly relevant search results and raw content extraction from web pages."
        },
        "icon": "https://tavily.com/images/logo.png",
        "label": {
            "zh_Hans": "Tavily",
            "en_US": "Tavily",
            "pt_BR": "Tavily",
            "ja_JP": "Tavily"
        },
        "type": "builtin",
        "team_credentials": {
            "tavily_api_key": ""
        },
        "is_team_authorization": true,
        "allow_delete": true,
        "tools": [],
        "labels": [
            "search"
        ]
    },
    {
        "id": "webscraper",
        "author": "Yanfu",
        "name": "webscraper",
        "description": {
            "zh_Hans": "一个用于抓取网页的工具。",
            "en_US": "Web Scrapper tool kit is used to scrape web",
            "pt_BR": "Web Scrapper tool kit is used to scrape web",
            "ja_JP": "Web Scrapper tool kit is used to scrape web"
        },
        "icon": "https://cdn-icons-png.flaticon.com/512/1005/1005141.png",
        "label": {
            "zh_Hans": "网页抓取",
            "en_US": "WebScraper",
            "pt_BR": "WebScraper",
            "ja_JP": "WebScraper"
        },
        "type": "builtin",
        "team_credentials": {},
        "is_team_authorization": true,
        "allow_delete": false,
        "tools": [],
        "labels": [
            "productivity"
        ]
    },
    {
        "id": "spark",
        "author": "Onelevenvy",
        "name": "spark",
        "description": {
            "zh_Hans": "讯飞星火平台工具",
            "en_US": "Spark Platform Toolkit",
            "pt_BR": "Pacote de Ferramentas da Plataforma Spark",
            "ja_JP": "Spark Platform Toolkit"
        },
        "icon": "https://xinghuo.xfyun.cn/static/img/logo.png",
        "label": {
            "zh_Hans": "讯飞星火",
            "en_US": "Spark",
            "pt_BR": "Spark",
            "ja_JP": "Spark"
        },
        "type": "builtin",
        "team_credentials": {
            "APPID": "",
            "APISecret": "",
            "APIKey": ""
        },
        "is_team_authorization": true,
        "allow_delete": true,
        "tools": [],
        "labels": [
            "image"
        ]
    },
    {
        "id": "stepfun",
        "author": "Stepfun",
        "name": "stepfun",
        "description": {
            "zh_Hans": "阶跃星辰绘画",
            "en_US": "Image-1X",
            "pt_BR": "Image-1X",
            "ja_JP": "Image-1X"
        },
        "icon": "https://www.stepfun.com/favicon.ico",
        "label": {
            "zh_Hans": "阶跃星辰绘画",
            "en_US": "Image-1X",
            "pt_BR": "Image-1X",
            "ja_JP": "Image-1X"
        },
        "type": "builtin",
        "team_credentials": {
            "stepfun_api_key": "",
            "stepfun_base_url": ""
        },
        "is_team_authorization": true,
        "allow_delete": true,
        "tools": [],
        "labels": [
            "image",
            "productivity"
        ]
    },
    {
        "id": "yahoo",
        "author": "Yanfu",
        "name": "yahoo",
        "description": {
            "zh_Hans": "雅虎财经，获取并整理出最新的新闻、股票报价等一切你想要的财经信息。",
            "en_US": "Finance, and Yahoo! get the latest news, stock quotes, and interactive chart with Yahoo!",
            "pt_BR": "Finance, and Yahoo! get the latest news, stock quotes, and interactive chart with Yahoo!",
            "ja_JP": "Finance, and Yahoo! get the latest news, stock quotes, and interactive chart with Yahoo!"
        },
        "icon": "https://s.yimg.com/cv/apiv2/default/20180828/Yahoo_finance_logo.png",
        "label": {
            "zh_Hans": "雅虎财经",
            "en_US": "YahooFinance",
            "pt_BR": "YahooFinance",
            "ja_JP": "YahooFinance"
        },
        "type": "builtin",
        "team_credentials": {},
        "is_team_authorization": true,
        "allow_delete": false,
        "tools": [],
        "labels": [
            "business",
            "finance"
        ]
    },
    {
        "id": "gaode",
        "author": "CharlieWei",
        "name": "gaode",
        "description": {
            "zh_Hans": "高德开放平台服务工具包。",
            "en_US": "Autonavi Open Platform service toolkit.",
            "pt_BR": "Kit de ferramentas de serviço Autonavi Open Platform.",
            "ja_JP": "Autonavi Open Platform service toolkit."
        },
        "icon": "https://a.amap.com/pc/static/favicon.ico",
        "label": {
            "zh_Hans": "高德",
            "en_US": "Autonavi",
            "pt_BR": "Autonavi",
            "ja_JP": "Autonavi"
        },
        "type": "builtin",
        "team_credentials": {
            "api_key": ""
        },
        "is_team_authorization": true,
        "allow_delete": true,
        "tools": [],
        "labels": [
            "utilities",
            "productivity",
            "travel",
            "weather"
        ]
    },
    {
        "id": "dingtalk",
        "author": "Bowen Liang",
        "name": "dingtalk",
        "description": {
            "zh_Hans": "钉钉群机器人",
            "en_US": "DingTalk group robot",
            "pt_BR": "DingTalk group robot",
            "ja_JP": "DingTalk group robot"
        },
        "icon": "https://img.alicdn.com/tfs/TB1N.tXb7T2gK0jSZFvXXc_nXXa-64-64.png",
        "label": {
            "zh_Hans": "钉钉",
            "en_US": "DingTalk",
            "pt_BR": "DingTalk",
            "ja_JP": "DingTalk"
        },
        "type": "builtin",
        "team_credentials": {},
        "is_team_authorization": true,
        "allow_delete": false,
        "tools": [],
        "labels": [
            "social",
            "productivity"
        ]
    },
    {
        "id": "feishu",
        "author": "Arkii Sun",
        "name": "feishu",
        "description": {
            "zh_Hans": "飞书群机器人",
            "en_US": "Feishu group bot",
            "pt_BR": "Feishu group bot",
            "ja_JP": "Feishu group bot"
        },
        "icon": "https://sf3-cn.feishucdn.com/obj/eden-cn/hmnit_uh_ijul/feishu-logo.png",
        "label": {
            "zh_Hans": "飞书",
            "en_US": "Feishu",
            "pt_BR": "Feishu",
            "ja_JP": "Feishu"
        },
        "type": "builtin",
        "team_credentials": {},
        "is_team_authorization": true,
        "allow_delete": false,
        "tools": [],
        "labels": [
            "social",
            "productivity"
        ]
    },
    {
        "id": "567dd8af-fd80-4a7e-82ef-f9c8a511fefd",
        "author": "szyl",
        "name": "测试",
        "description": {
            "zh_Hans": "Retrieves current weather data for a location.",
            "en_US": "Retrieves current weather data for a location.",
            "pt_BR": "Retrieves current weather data for a location.",
            "ja_JP": "Retrieves current weather data for a location."
        },
        "icon": {
            "content": "🕵️",
            "background": "#FEF7C3"
        },
        "label": {
            "zh_Hans": "测试",
            "en_US": "测试",
            "pt_BR": "测试",
            "ja_JP": "测试"
        },
        "type": "api",
        "team_credentials": {},
        "is_team_authorization": true,
        "allow_delete": true,
        "tools": [],
        "labels": []
    },
    {
        "id": "3abb6542-f735-412f-abb4-858efdc7613a",
        "author": "szyl",
        "name": "文本生成应用（workflow编排）",
        "description": {
            "zh_Hans": "",
            "en_US": "",
            "pt_BR": "",
            "ja_JP": ""
        },
        "icon": {
            "content": "🤖",
            "background": "#D5F5F6"
        },
        "label": {
            "zh_Hans": "文本生成应用（workflow编排）",
            "en_US": "文本生成应用（workflow编排）",
            "pt_BR": "文本生成应用（workflow编排）",
            "ja_JP": "文本生成应用（workflow编排）"
        },
        "type": "workflow",
        "team_credentials": {},
        "is_team_authorization": true,
        "allow_delete": true,
        "tools": [],
        "labels": [],
        "workflow_app_id": "3abb6542-f735-412f-abb4-858efdc7613a"
    }
];


const TAG_COLORS = [
  { bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-200' },
  { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
];

const getTagStyle = (label: string) => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
};

const ToolExtensions: React.FC = () => {
  const [tools, setTools] = useState<Collection[]>([]);
  const [allLabels, setAllLabels] = useState<any[]>([]);
  const labelMap = useMemo(() => {
    const map: Record<string, string> = {};
    allLabels.forEach((label: any) => {
      const name = typeof label === 'string' ? label : label.name;
      const zh = typeof label === 'string' ? label : (label.label?.zh_Hans || label.name);
      map[name] = zh;
    });
    return map;
  }, [allLabels]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'builtin' | 'workflow' | 'mcp' | 'skills'>(() => {
    const savedTab = sessionStorage.getItem('toolExtensionsTab');
    return (savedTab === 'custom' ? 'builtin' : savedTab as any) || 'builtin';
  });

  useEffect(() => {
    sessionStorage.setItem('toolExtensionsTab', activeTab);
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string>('全部');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [labelSearchQuery, setLabelSearchQuery] = useState('');
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Collection | null>(null);
  const [toolDetail, setToolDetail] = useState<ToolExtension[] | WorkflowToolProviderResponse | McpProvider | null>(null);

  // Auth Settings Drawer state
  const [isAuthSettingsOpen, setIsAuthSettingsOpen] = useState(false);
  const [authSchema, setAuthSchema] = useState<ToolCredential[]>([]);
  const [authValues, setAuthValues] = useState<CredentialData>({});

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // MCP Modal state
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [selectedMcpProvider, setSelectedMcpProvider] = useState<McpProvider | null>(null);

  // Fetch tools when tab changes
  useEffect(() => {
    if (activeTab !== 'skills') {
      fetchTools(activeTab);
    }
  }, [activeTab]);

  const fetchTools = async (type?: string) => {
    setLoading(true);
    setError(null);
    try {
      const [toolsResponse, labelsResponse] = await Promise.all([
        apiService.fetchCollectionList(type),
        apiService.fetchLabelList()
      ]);
      
      // Map ToolProvider to Collection safely
      const mappedTools: Collection[] = toolsResponse.map((item: any) => {
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
          team_credentials: item.team_credentials || {},
          is_team_authorization: item.is_team_authorization || false,
          allow_delete: item.allow_delete || false,
          labels: item.labels || [],
          is_authorized: item.is_valid !== undefined ? item.is_valid : item.is_authorized,
          tools: item.tools || []
        };
      });

      setTools(mappedTools);

      // Handle labels
      const labels = labelsResponse;
      // Store full label objects to access zh_Hans
      setAllLabels(labels);
    } catch (err: any) {
      console.error('Failed to fetch tool providers or labels:', err);
      setError(err.message || '获取工具列表失败');
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToolClick = async (tool: Collection) => {
    console.log('Tool clicked:', tool);
    console.log('Tool workflow_app_id:', tool.workflow_app_id);
    setSelectedTool(tool);
    setIsDrawerOpen(true);
    setToolDetail(null);
    
    try {
      let response: ToolExtension[] | WorkflowToolProviderResponse | McpProvider | null = null;
      if (tool.type === 'builtin') {
        response = await apiService.fetchBuiltInToolList(tool.name);
      } else if (tool.type === 'api') {
        response = await apiService.fetchCustomToolList(tool.name);
      } else if (tool.type === 'workflow') {
        response = await apiService.fetchWorkflowToolDetail(tool.id);
      } else if (tool.type === 'mcp') {
        response = await apiService.fetchMcpProviderDetail(tool.id);
      }
      
      setToolDetail(response);
    } catch (error) {
      console.error('Failed to fetch tool details:', error);
      setToolDetail([]);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedTool(null);
      setToolDetail(null);
    }, 300); // Wait for transition
  };

  // MCP Auth Schema
  const MCP_AUTH_SCHEMA: ToolCredential[] = [
    {
      name: 'client_id',
      label: { zh_Hans: 'APP ID', en_US: 'APP ID' },
      help: null,
      placeholder: { zh_Hans: '请输入你的 APP ID', en_US: 'Please enter your APP ID' },
      type: 'text-input',
      required: true,
      default: ''
    },
    {
      name: 'client_secret',
      label: { zh_Hans: 'APP Secret', en_US: 'APP Secret' },
      help: null,
      placeholder: { zh_Hans: '请输入你的 APP Secret', en_US: 'Please enter your APP Secret' },
      type: 'secret-input',
      required: true,
      default: ''
    }
  ];

  const handleAuthorize = async () => {
    if (!selectedTool) return;
    
    if (selectedTool.type === 'mcp') {
      setAuthSchema(MCP_AUTH_SCHEMA);
      setAuthValues({
        client_id: selectedTool.authentication?.client_id || '',
        client_secret: selectedTool.authentication?.client_secret || ''
      });
      setIsAuthSettingsOpen(true);
      return;
    }

    try {
      // Fetch schema and existing credentials
      const schemaResponse = await apiService.fetchBuiltInToolCredentialSchema(selectedTool.name);
      const credentialsResponse = await apiService.fetchBuiltInToolCredential(selectedTool.name);
      
      setAuthSchema(schemaResponse);
      
      // Map ToolCredential[] to CredentialData
      const initialValues: CredentialData = {};
      if (Array.isArray(credentialsResponse)) {
        credentialsResponse.forEach(cred => {
          initialValues[cred.name] = cred.default || '';
        });
      }
      
      setAuthValues(initialValues);
      setIsAuthSettingsOpen(true);
    } catch (error) {
      console.error('Failed to fetch credentials info:', error);
    }
  };

  const handleSaveAuth = async (values: CredentialData) => {
    if (!selectedTool) return;
    
    try {
      if (selectedTool.type === 'mcp') {
        // 1. Update MCP provider with new credentials
        const detail = await apiService.fetchMcpProviderDetail(selectedTool.id);
        await apiService.updateMcpProvider({
          provider_id: selectedTool.id,
          name: detail.name,
          server_url: detail.server_url,
          icon: detail.icon,
          icon_type: detail.icon_type || 'sys-icon',
          server_identifier: detail.server_identifier,
          authentication: {
            client_id: values.client_id,
            client_secret: values.client_secret
          }
        });

        // 2. Initiate OAuth redirect
        const authResponse = await apiService.authMcpProvider(selectedTool.id);
        if (authResponse && (authResponse.url || authResponse.redirect_url)) {
          localStorage.setItem('mcp_auth_provider_id', selectedTool.id);
          window.location.href = authResponse.url || authResponse.redirect_url;
          return;
        }
      } else {
        await apiService.updateBuiltInToolCredential(selectedTool.name, values);
      }
      
      // Refresh tool list to show updated auth status
      await fetchTools();
      
      // Update selected tool state if it's still open
      setSelectedTool(prev => prev ? { ...prev, is_team_authorization: true } : null);
      
      setIsAuthSettingsOpen(false);
    } catch (error) {
      console.error('Failed to save credentials:', error);
    }
  };

  const handleEditTool = async () => {
    if (!selectedTool) return;
    
    if (selectedTool.type === 'mcp') {
      try {
        const detail = await apiService.fetchMcpProviderDetail(selectedTool.id);
        setSelectedMcpProvider(detail);
        setIsMcpModalOpen(true);
      } catch (error) {
        console.error('Failed to fetch MCP detail for editing:', error);
      }
      return;
    }

    try {
      // Fetch labels as requested
      const labelsResponse = await apiService.fetchLabelList();
      const labels = labelsResponse;
      const processedLabels = labels.map((l: any) => typeof l === 'string' ? l : (l.name || l.label || l));
      setAllLabels(processedLabels.sort());
      
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch labels for editing:', error);
      // Still open the modal even if labels fetch fails, using existing labels
      setIsEditModalOpen(true);
    }
  };

  const handleSaveTool = async (updatedTool: any) => {
    try {
      // Determine which API to call based on tool type
      if (updatedTool.type === 'api') {
        await apiService.updateCustomCollection(updatedTool);
      } else if (updatedTool.type === 'workflow') {
        const payload: WorkflowToolProviderRequest & { workflow_tool_id: string } = {
          label: updatedTool.label,
          name: updatedTool.name,
          icon: updatedTool.icon,
          description: updatedTool.description?.zh_Hans || updatedTool.description?.en_US || '',
          parameters: (updatedTool.parameters || []).map((p: any) => ({
            name: p.name,
            form: p.form,
            description: p.human_description?.zh_Hans || p.human_description?.en_US || p.description || '',
            required: p.required,
            type: p.type
          })),
          labels: updatedTool.labels,
          privacy_policy: updatedTool.team_credentials?.privacy_policy || '',
          workflow_tool_id: updatedTool.id
        };
        await apiService.saveWorkflowToolProvider(payload);
      } else if (updatedTool.type === 'mcp') {
        await apiService.updateMcpProvider(updatedTool);
      }
      
      // Refresh tool list
      await fetchTools();
      
      // Update selected tool in drawer if it's the same one
      if (selectedTool && selectedTool.id === updatedTool.id) {
        setSelectedTool(updatedTool);
      }
      
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to save tool:', error);
      throw error;
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    try {
      if (!selectedTool) return;
      
      if (selectedTool.type === 'api') {
        await apiService.removeCustomCollection(selectedTool.name);
      } else if (selectedTool.type === 'workflow') {
        await apiService.deleteWorkflowTool(toolId);
      } else if (selectedTool.type === 'mcp') {
        await apiService.deleteMcpProvider(toolId);
      }
      
      // Refresh tool list
      await fetchTools();
      
      setIsEditModalOpen(false);
      setIsDrawerOpen(false);
      setSelectedTool(null);
    } catch (error) {
      console.error('Failed to delete tool:', error);
      throw error;
    }
  };

  const handleDeleteMcp = async (id: string) => {
    try {
      await apiService.deleteMcpProvider(id);
      await fetchTools();
      setIsDrawerOpen(false);
      setSelectedTool(null);
    } catch (error) {
      console.error('Failed to delete MCP provider:', error);
    }
  };

  const handleSaveMcp = async (data: any) => {
    try {
      if ('provider_id' in data) {
        await apiService.updateMcpProvider(data);
      } else {
        await apiService.createMcpProvider(data);
      }
      await fetchTools();
    } catch (error) {
      console.error('Failed to save MCP provider:', error);
    }
  };

  const filteredLabels = useMemo(() => {
    if (!labelSearchQuery) return allLabels;
    return allLabels.filter(labelObj => {
      const labelName = typeof labelObj === 'string' ? labelObj : labelObj.name;
      const labelDisplay = typeof labelObj === 'string' ? labelObj : (labelObj.label?.zh_Hans || labelObj.name);
      const query = labelSearchQuery.toLowerCase();
      return labelName.toLowerCase().includes(query) || labelDisplay.toLowerCase().includes(query);
    });
  }, [allLabels, labelSearchQuery]);

  const filteredTools = useMemo(() => {
    if (!Array.isArray(tools)) return [];
    
    return tools.filter(tool => {
      let matchesTab = false;
      if (activeTab === 'builtin') {
        matchesTab = tool.type === 'builtin';
      } else if (activeTab === 'workflow') {
        matchesTab = tool.type === 'workflow';
      } else if (activeTab === 'mcp') {
        matchesTab = tool.type === 'mcp';
      }

      const matchesSearch = tool.label.zh_Hans.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tool.description.zh_Hans.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLabel = selectedLabel === '全部' || (tool.labels && tool.labels.includes(selectedLabel));
      
      // Filter out 'model' type
      if (tool.type === 'model') {
        return false;
      }

      return matchesTab && matchesSearch && matchesLabel;
    });
  }, [activeTab, searchQuery, selectedLabel, tools]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="hidden">
        <h2 className="text-2xl font-bold text-gray-900">工具拓展</h2>
        <p className="text-sm text-gray-500 mt-1">管理和配置您的AI插件、数据源及第三方集成工具。</p>
      </div>

      {/* Toolbar Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm z-20 relative">
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100/80 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setActiveTab('builtin')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'builtin'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            内置工具
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'workflow'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            工作流
          </button>
          <button
            onClick={() => setActiveTab('mcp')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'mcp'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            MCP工具
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'skills'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            SKILLS
          </button>
        </div>

        {/* Search & Filter */}
        {activeTab !== 'mcp' && activeTab !== 'skills' && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="tool-search"
                autoComplete="off"
                placeholder="搜索工具名称或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-all bg-white min-w-[100px] justify-between
                  ${selectedLabel !== '全部' ? 'border-primary-500 text-primary-600 bg-primary-50/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>{(() => {
                    if (selectedLabel === '全部') return '全部';
                    const labelObj = allLabels.find((l: any) => (typeof l === 'string' ? l : l.name) === selectedLabel);
                    return typeof labelObj === 'string' ? labelObj : (labelObj?.label?.zh_Hans || selectedLabel);
                  })()}</span>
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('.tool-auth-drawer, .tool-auth-settings-drawer, .tool-param-drawer, .edit-custom-tool-modal')) {
                        return;
                      }
                      setIsFilterOpen(false);
                      setLabelSearchQuery('');
                    }} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 overflow-hidden flex flex-col">
                    <div className="px-2 py-2 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                        <input
                          type="text"
                          name="label-search"
                          autoComplete="off"
                          placeholder="搜索标签..."
                          value={labelSearchQuery}
                          onChange={(e) => setLabelSearchQuery(e.target.value)}
                          className="w-full pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      <button
                        onClick={() => { setSelectedLabel('全部'); setIsFilterOpen(false); setLabelSearchQuery(''); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedLabel === '全部' ? 'text-primary-600 font-medium bg-primary-50/50' : 'text-gray-600'}`}
                      >
                        全部
                      </button>
                      {filteredLabels.length > 0 ? (
                        filteredLabels.map(labelObj => {
                          const labelName = typeof labelObj === 'string' ? labelObj : labelObj.name;
                          const labelDisplay = typeof labelObj === 'string' ? labelObj : (labelObj.label?.zh_Hans || labelObj.name);
                          return (
                            <button
                              key={labelName}
                              onClick={() => { setSelectedLabel(labelName); setIsFilterOpen(false); setLabelSearchQuery(''); }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedLabel === labelName ? 'text-primary-600 font-medium bg-primary-50/50' : 'text-gray-600'}`}
                            >
                              {labelDisplay}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-3 text-xs text-gray-400 text-center">
                          未找到相关标签
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Grid Section */}
      {activeTab === 'mcp' ? (
        <MCPServices isEmbedded={true} />
      ) : activeTab === 'skills' ? (
        <SkillsTab />
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium">加载工具列表中...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-red-50/30 rounded-2xl border border-dashed border-red-200">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <Info className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">网络连接异常</h3>
          <p className="text-sm text-red-600 max-w-md mb-6 leading-relaxed">
            {error}
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchTools(activeTab)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
            >
              重试连接
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('console_mock_mode', 'true');
                window.location.reload();
              }}
              className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              使用模拟数据
            </button>
          </div>
        </div>
      ) : filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map(tool => {
            return (
              <div 
                key={tool.id} 
                className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-primary-100 transition-all duration-300 flex flex-col h-full cursor-pointer relative overflow-hidden"
                onClick={() => handleToolClick(tool)}
              >
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-primary-50 text-primary-600 p-1.5 rounded-lg">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                    {(() => {
                      let iconObj = tool.icon;
                      
                      // If iconObj is an object that has an icon property, use that
                      if (typeof iconObj === 'object' && iconObj !== null && (iconObj as any).icon) {
                        iconObj = (iconObj as any).icon;
                      }

                      if (typeof iconObj === 'string') {
                        try {
                          const trimmed = iconObj.trim();
                          if (trimmed.startsWith('{')) {
                            iconObj = JSON.parse(trimmed);
                          } else if (/^\d+$/.test(trimmed)) {
                            return <img src={`/sys_icons/Component ${trimmed}.svg`} alt={tool.label.zh_Hans} className="w-full h-full object-cover" />;
                          } else if (!trimmed.includes('/') && !trimmed.startsWith('http') && !trimmed.startsWith('data:')) {
                            const systemIcon = SYSTEM_ICONS.find(i => i.name === trimmed);
                            iconObj = { 
                              content: trimmed, 
                              background: systemIcon ? systemIcon.bgColor : '#f0f9ff' 
                            };
                          }
                        } catch (e) {
                          // ignore error, treat as string
                        }
                      }

                      if (typeof iconObj === 'string') {
                        return <img src={iconObj || undefined} alt={tool.label.zh_Hans} className="w-7 h-7 object-contain" referrerPolicy="no-referrer" />;
                      } else if (iconObj && typeof iconObj === 'object') {
                        const IconComponent = (LucideIcons as any)[(iconObj as any).content];
                        const isTailwindBg = (iconObj as any).background?.startsWith('bg-');
                        return (
                          <div 
                            style={!isTailwindBg ? { backgroundColor: (iconObj as any).background } : undefined} 
                            className={`w-full h-full flex items-center justify-center text-lg text-white ${isTailwindBg ? (iconObj as any).background : ''}`}
                          >
                            {IconComponent ? <IconComponent className="w-7 h-7" /> : (iconObj as any).content}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${tool.is_authorized ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-300'}`} title={tool.is_authorized ? '已授权' : '未授权'} />
                </div>
                
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 text-base mb-1 group-hover:text-primary-600 transition-colors line-clamp-1" title={tool.label.zh_Hans}>{tool.label.zh_Hans}</h3>
                  <p className="text-xs text-gray-400 font-medium">{tool.author}</p>
                </div>
                
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-grow" title={tool.description.zh_Hans}>
                  {tool.description.zh_Hans}
                </p>
  
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {tool.labels && tool.labels.length > 0 ? (
                      tool.labels.map(label => {
                        const style = getTagStyle(label);
                        return (
                          <span 
                            key={label} 
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${style.bg} ${style.text} ${style.border}`}
                          >
                            {labelMap[label] || label}
                          </span>
                        );
                      })
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-100">
                        通用
                      </span>
                    )}
                  </div>
                  {tool.type === 'mcp' && tool.tools && (
                    <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      <Bot className="w-3 h-3" />
                      {tool.tools.length} 个工具
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
          <Search className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">未找到相关工具</p>
          <p className="text-sm mt-1">尝试更换搜索关键词或筛选条件</p>
        </div>
      )}

      <ToolAuthDrawer 
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        tool={selectedTool}
        toolDetail={toolDetail}
        onAuthorize={handleAuthorize}
        onEdit={handleEditTool}
      />

      <ToolAuthSettingsDrawer
        isOpen={isAuthSettingsOpen}
        onClose={() => setIsAuthSettingsOpen(false)}
        schema={authSchema}
        initialValues={authValues}
        onSave={handleSaveAuth}
      />

      <EditCustomToolModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tool={selectedTool}
        toolDetail={toolDetail}
        allLabels={allLabels}
        onSave={handleSaveTool}
        onDelete={handleDeleteTool}
      />

      <CreateMcpToolModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
        provider={selectedMcpProvider}
        onSave={handleSaveMcp}
        onDelete={handleDeleteMcp}
      />
    </div>
  );
};

export default ToolExtensions;
