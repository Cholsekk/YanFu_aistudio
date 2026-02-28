import React, { useState, useMemo, useEffect } from 'react';
import { ToolItem, ToolDetail, CredentialSchemaItem, CredentialData, Collection, ToolExtension, ToolCredential, WorkflowToolProviderRequest } from '../types';
import ToolAuthDrawer from './ToolAuthDrawer';
import ToolAuthSettingsDrawer from './ToolAuthSettingsDrawer';
import EditCustomToolModal from './EditCustomToolModal';
import { apiService } from '../services/apiService';
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
        "labels": []
    }
];

const LABEL_MAPPING: Record<string, string> = {
  search: '搜索',
  image: '图片',
  video: '视频',
  weather: '天气',
  finance: '金融',
  design: '设计',
  travel: '旅行',
  social: '社交',
  news: '新闻',
  medical: '医疗',
  productivity: '生产力',
  education: '教育',
  business: '商业',
  entertainment: '娱乐',
  utilities: '工具',
  other: '其他'
};

const TAG_COLORS = [
  { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
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
  const [allLabels, setAllLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string>('全部');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [labelSearchQuery, setLabelSearchQuery] = useState('');
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Collection | null>(null);
  const [toolDetail, setToolDetail] = useState<ToolExtension[] | null>(null);

  // Auth Settings Drawer state
  const [isAuthSettingsOpen, setIsAuthSettingsOpen] = useState(false);
  const [authSchema, setAuthSchema] = useState<ToolCredential[]>([]);
  const [authValues, setAuthValues] = useState<CredentialData>({});

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch tools on mount
  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    setError(null);
    try {
      const [toolsResponse, labelsResponse] = await Promise.all([
        apiService.fetchCollectionList(),
        apiService.fetchLabelList()
      ]);
      
      // Handle direct array response
      setTools(toolsResponse);

      // Handle labels
      const labels = labelsResponse;
      // If labels are objects, extract name/label. If strings, use directly.
      const processedLabels = labels.map((l: any) => typeof l === 'string' ? l : (l.name || l.label || l));
      setAllLabels(processedLabels.sort());
    } catch (err: any) {
      console.error('Failed to fetch tool providers or labels:', err);
      setError(err.message || '获取工具列表失败');
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToolClick = async (tool: Collection) => {
    setSelectedTool(tool);
    setIsDrawerOpen(true);
    setToolDetail(null);
    
    try {
      let response: ToolExtension[] = [];
      if (tool.type === 'builtin') {
        response = await apiService.fetchBuiltInToolList(tool.name);
      } else if (tool.type === 'api') {
        response = await apiService.fetchCustomToolList(tool.name);
      } else if (tool.type === 'workflow') {
        response = await apiService.fetchWorkflowToolList(tool.id);
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

  const handleAuthorize = async () => {
    if (!selectedTool) return;
    
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
      await apiService.updateBuiltInToolCredential(selectedTool.name, values);
      
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

  const filteredLabels = useMemo(() => {
    if (!labelSearchQuery) return allLabels;
    return allLabels.filter(label => {
      const labelName = label.toLowerCase();
      const labelText = (LABEL_MAPPING[label] || label).toLowerCase();
      const query = labelSearchQuery.toLowerCase();
      return labelName.includes(query) || labelText.includes(query);
    });
  }, [allLabels, labelSearchQuery]);

  const filteredTools = useMemo(() => {
    if (!Array.isArray(tools)) return [];
    
    return tools.filter(tool => {
      const matchesTab = activeTab === 'builtin' ? tool.type === 'builtin' : tool.type !== 'builtin';
      const matchesSearch = tool.label.zh_Hans.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tool.description.zh_Hans.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLabel = selectedLabel === '全部' || (tool.labels && tool.labels.includes(selectedLabel));
      
      return matchesTab && matchesSearch && matchesLabel;
    });
  }, [activeTab, searchQuery, selectedLabel, tools]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div>
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
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            内置工具
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'custom'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            自定义工具
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索工具名称或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-all bg-white min-w-[100px] justify-between
                ${selectedLabel !== '全部' ? 'border-blue-500 text-blue-600 bg-blue-50/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>{selectedLabel === '全部' ? '全部' : (LABEL_MAPPING[selectedLabel] || selectedLabel)}</span>
              </div>
              <ChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => { setIsFilterOpen(false); setLabelSearchQuery(''); }} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 overflow-hidden flex flex-col">
                  <div className="px-2 py-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="搜索标签..."
                        value={labelSearchQuery}
                        onChange={(e) => setLabelSearchQuery(e.target.value)}
                        className="w-full pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    <button
                      onClick={() => { setSelectedLabel('全部'); setIsFilterOpen(false); setLabelSearchQuery(''); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedLabel === '全部' ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-gray-600'}`}
                    >
                      全部
                    </button>
                    {filteredLabels.length > 0 ? (
                      filteredLabels.map(label => (
                        <button
                          key={label}
                          onClick={() => { setSelectedLabel(label); setIsFilterOpen(false); setLabelSearchQuery(''); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedLabel === label ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-gray-600'}`}
                        >
                          {LABEL_MAPPING[label] || label}
                        </button>
                      ))
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
      </div>

      {/* Grid Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4" />
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
              onClick={fetchTools}
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
                className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-blue-100 transition-all duration-300 flex flex-col h-full cursor-pointer relative overflow-hidden"
                onClick={() => handleToolClick(tool)}
              >
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                    {typeof tool.icon === 'string' ? (
                      <img src={tool.icon} alt={tool.label.zh_Hans} className="w-7 h-7 object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div style={{ backgroundColor: tool.icon.background }} className="w-full h-full flex items-center justify-center text-lg">
                        {tool.icon.content}
                      </div>
                    )}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${tool.is_team_authorization ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-300'}`} title={tool.is_team_authorization ? '已授权' : '未授权'} />
                </div>
                
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 text-base mb-1 group-hover:text-blue-600 transition-colors line-clamp-1" title={tool.label.zh_Hans}>{tool.label.zh_Hans}</h3>
                  <p className="text-xs text-gray-400 font-medium">{tool.author}</p>
                </div>
                
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-grow" title={tool.description.zh_Hans}>
                  {tool.description.zh_Hans}
                </p>
  
                <div className="flex flex-wrap gap-2 mt-auto">
                  {tool.labels && tool.labels.length > 0 ? (
                    tool.labels.map(label => {
                      const style = getTagStyle(label);
                      return (
                        <span 
                          key={label} 
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${style.bg} ${style.text} ${style.border}`}
                        >
                          {LABEL_MAPPING[label] || label}
                        </span>
                      );
                    })
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-100">
                      通用
                    </span>
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
    </div>
  );
};

export default ToolExtensions;
