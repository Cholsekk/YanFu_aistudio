import { DataSet, Role, Department, Member, DataSetListResponse, Fetcher, ScheduledTask, TaskLog, WorkflowToolProviderRequest, WorkflowToolProviderResponse, CustomParamSchema, CustomCollectionBackend, ToolItem, ToolDetail, Collection, ToolExtension, ToolCredential, CredentialData, Label, Tag, McpProvider, McpProviderRequest, McpProviderUpdateRequest, McpTool, ToolProvider, CreateApiKeyResponse, ApiKeysListResponse, ModelProvider, Model, DefaultModelResponse, ModelLoadBalancingConfig, ModelTypeEnum, CommonResponse, ModelParameterRule, AutomaticRes, CodeGenRes, IOnData, IOnCompleted, IOnFile, IOnThought, IOnMessageEnd, IOnMessageReplace, IOnError, ChatPromptConfig, CompletionPromptConfig, ModelModeType, ModelConfig, UpdateAppModelConfigResponse } from '../types';
import { getTenantId, getToken } from '../utils/auth';

export const getBaseUrl = () => {
  return localStorage.getItem('console_api_base_url') || 'http://192.168.1.201:5005';
};

const isMockMode = () => {
  return localStorage.getItem('console_mock_mode') === 'true';
};

interface ApiResponse<T> {
  items?: T[];
  logs?: T[];
  total?: number;
  pages?: number;
  current_page?: number;
  per_page?: number;
  pagination?: {
    page: number;
    per_page: number;
    total_pages: number;
    total_items: number;
  };
}

const API_PREFIX = '/console/api';

class ApiService {
  private getAuthHeader() {
    const token = getToken();
    const tenantId = getTenantId();
    const headers: Record<string, string> = {};

    if (token) {
      console.log('[API] Using token:', token.substring(0, 8) + '...');
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('[API] No console_token found');
    }

    if (tenantId) {
      console.log('[API] Using tenant_id:', tenantId);
      headers['X-Tenant-ID'] = tenantId;
    }

    return headers;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    // Ensure endpoint starts with API_PREFIX if it doesn't already
    const fullEndpoint = endpoint.startsWith(API_PREFIX) ? endpoint : `${API_PREFIX}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    if (isMockMode()) {
      console.log(`[Mock API] ${options.method || 'GET'} ${fullEndpoint}`);
      return this.getMockResponse(fullEndpoint);
    }

    const baseUrl = getBaseUrl();
    
    // Use the server-side proxy to bypass Mixed Content and Private Network Access issues
    // The proxy is mounted at /api-proxy on the same origin
    const url = `/api-proxy${fullEndpoint}`;
    
    // Automatically stringify body if it's an object and not a special type
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData) && !(options.body instanceof Blob)) {
      options.body = JSON.stringify(options.body);
    }

    const headers = {
      'x-target-base-url': baseUrl, // Tell the proxy where to send the request
      ...this.getAuthHeader(),
      ...options.headers,
    } as Record<string, string>;

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('api-unauthorized'));
        throw new Error('鉴权失败：请检查您的 Token 配置');
      }

      if (response.status === 204) {
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.message || `请求失败，状态码: ${response.status}`;
        throw new Error(message);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API Request Error:', error);
      
      // If the error is still "Failed to fetch", it might be a proxy error or the proxy itself is unreachable
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error(`网络连接失败：无法通过代理连接到 ${baseUrl}。请确保后端服务已启动并可访问。`);
      }
      
      throw error;
    }
  }

  private async get<T>(endpoint: string, params: any = {}, options: any = {}): Promise<T> {
    const queryString = new URLSearchParams(params as any).toString();
    const fullUrl = queryString ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryString}` : endpoint;
    return this.request(fullUrl, { ...options, method: 'GET' });
  }

  private async post<T>(endpoint: string, options: any = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'POST' });
  }

  private async ssePost(endpoint: string, options: any, callbacks: any) {
    const { onData, onCompleted, onThought, onFile, onError, getAbortController, onMessageEnd, onMessageReplace } = callbacks;
    const fullEndpoint = endpoint.startsWith(API_PREFIX) ? endpoint : `${API_PREFIX}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const baseUrl = getBaseUrl();
    const url = `/api-proxy${fullEndpoint}`;
    
    const abortController = new AbortController();
    if (getAbortController) {
      getAbortController(abortController);
    }

    const headers = {
      'x-target-base-url': baseUrl,
      ...this.getAuthHeader(),
      ...options.headers,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    } as Record<string, string>;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(options.body),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `SSE Request Failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') {
              if (onCompleted) onCompleted();
              continue;
            }
            try {
              const data = JSON.parse(dataStr);
              // Handle different event types based on PDF callbacks
              if (data.event === 'thought' && onThought) onThought(data);
              else if (data.event === 'file' && onFile) onFile(data);
              else if (data.event === 'message_end' && onMessageEnd) onMessageEnd(data);
              else if (data.event === 'message_replace' && onMessageReplace) onMessageReplace(data);
              else if (onData) onData(data);
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
      if (onCompleted) onCompleted();
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      if (onError) onError(error);
      else throw error;
    }
  }

  private getMockResponse(endpoint: string) {
    // Mock for export app only, as requested
    if (endpoint.match(/\/apps\/[^\/]+\/export/)) {
      return {
        data: "app:\n  description: ''\n  icon: '156'\n  icon_background: null\n"
      };
    }

    // Mock for scheduled tasks logs
    const logsMatch = endpoint.match(/\/scheduled-tasks\/([^\/]+)\/logs/);
    if (logsMatch) {
      const taskId = logsMatch[1];
      let mockLogs: any[] = [];

      if (taskId === 'task-1') {
        mockLogs = [
          {
            id: 'log-1-0',
            task_id: 'task-1',
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            status: 'running',
            result: null,
          },
          {
            id: 'log-1-1',
            task_id: 'task-1',
            start_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            end_time: new Date(Date.now() - 1000 * 60 * 60 * 24 + 4500).toISOString(),
            status: 'success',
            result: '{"message": "Daily summary completed", "records": 1250}',
          },
          {
            id: 'log-1-2',
            task_id: 'task-1',
            start_time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            end_time: new Date(Date.now() - 1000 * 60 * 60 * 48 + 5000).toISOString(),
            status: 'success',
            result: '{"message": "Daily summary completed", "records": 1100}',
          },
          {
            id: 'log-1-3',
            task_id: 'task-1',
            start_time: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
            end_time: new Date(Date.now() - 1000 * 60 * 60 * 72 + 12000).toISOString(),
            status: 'failed',
            error_message: 'Connection timed out after 10000ms. Remote server did not respond.',
          }
        ];
      } else if (taskId === 'task-2') {
        mockLogs = [
          {
            id: 'log-2-1',
            task_id: 'task-2',
            start_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            end_time: new Date(Date.now() - 1000 * 60 * 30 + 800).toISOString(),
            status: 'success',
            result: '{"status": "healthy", "services": {"db": "up", "cache": "up", "api": "up"}}',
          },
          {
            id: 'log-2-2',
            task_id: 'task-2',
            start_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            end_time: new Date(Date.now() - 1000 * 60 * 60 + 750).toISOString(),
            status: 'success',
            result: '{"status": "healthy", "services": {"db": "up", "cache": "up", "api": "up"}}',
          },
          {
            id: 'log-2-3',
            task_id: 'task-2',
            start_time: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            end_time: new Date(Date.now() - 1000 * 60 * 90 + 900).toISOString(),
            status: 'success',
            result: '{"status": "healthy", "services": {"db": "up", "cache": "up", "api": "up"}}',
          },
          {
            id: 'log-2-4',
            task_id: 'task-2',
            start_time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            end_time: new Date(Date.now() - 1000 * 60 * 120 + 200).toISOString(),
            status: 'failed',
            error_message: '503 Service Unavailable: Cache service down',
          }
        ];
      } else if (taskId === 'task-3') {
        mockLogs = [
          {
            id: 'log-3-1',
            task_id: 'task-3',
            start_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
            end_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 + 15000).toISOString(),
            status: 'success',
            result: '{"sent": 450, "failed": 0, "template": "monthly_report"}',
          },
          {
            id: 'log-3-2',
            task_id: 'task-3',
            start_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
            end_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60 + 14000).toISOString(),
            status: 'success',
            result: '{"sent": 420, "failed": 0, "template": "monthly_report"}',
          }
        ];
      } else {
        // Default logs for other tasks
        mockLogs = [
          {
            id: `log-${taskId}-1`,
            task_id: taskId,
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            status: 'success',
            result: '{"message": "Task executed successfully"}',
          }
        ];
      }

      return { logs: mockLogs, pagination: { total_items: mockLogs.length, page: 1, per_page: 10, total_pages: 1 } };
    }

    // Mock for scheduled tasks list
    if (endpoint.includes('/scheduled-tasks')) {
      const mockTasks = [
        {
          id: 'task-1',
          name: '每日数据汇总',
          description: '每天凌晨 2 点汇总前一天的业务数据',
          app_id: 'app-1',
          app_name: '数据分析应用',
          appType: 'internal',
          api_endpoint: '/api/v1/summary/daily',
          method: 'POST',
          request_body: { type: 'full' },
          status: 'active',
          schedule_type: 'cron',
          schedule_expression: '0 2 * * *',
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2023-06-20T14:30:00Z',
          last_executed_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        },
        {
          id: 'task-2',
          name: '系统健康检查',
          description: '每 30 分钟检查一次核心服务状态',
          app_id: 'app-2',
          app_name: '运维监控',
          appType: 'internal',
          api_endpoint: '/health/check',
          method: 'GET',
          request_body: {},
          status: 'active',
          schedule_type: 'interval',
          schedule_expression: '1800',
          created_at: '2023-03-10T09:15:00Z',
          updated_at: '2023-03-10T09:15:00Z',
          last_executed_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: 'task-3',
          name: '月度报表发送',
          description: '每月 1 号发送月度报表邮件',
          app_id: null,
          app_name: '邮件服务',
          appType: 'external',
          api_endpoint: 'https://api.email-service.com/send',
          method: 'POST',
          request_body: { template: 'monthly_report' },
          status: 'inactive',
          schedule_type: 'cron',
          schedule_expression: '0 9 1 * *',
          created_at: '2023-05-01T08:00:00Z',
          updated_at: '2023-05-01T08:00:00Z',
          last_executed_at: '2023-06-01T09:00:00Z',
        }
      ];
      return { items: mockTasks, total: 3, pages: 1, current_page: 1, per_page: 10 };
    }

    // Mock for explore apps (custom apps)
    if (endpoint.includes('/explore/apps')) {
      const mockExploreApps = [
        {
            "id": "bee57668-def8-4b28-89c5-2c74771d669d",
            "app": {
                "id": "d5585488-b99f-4c9a-a071-46d613dd145f",
                "name": "Custom App 001",
                "mode": "custom",
                "icon": "156",
                "icon_type": "sys-icon",
                "icon_url": null,
                "icon_background": "",
                "url": "https://ais-pre-hlwgf37flgnosfuabem26z-249758729543.europe-west2.run.app/"
            },
            "app_id": "72d1e7cf-c837-4d0e-8b7f-b9e761655771",
            "description": "A custom application for testing",
            "copyright": "Yanfu.AI",
            "privacy_policy": "",
            "custom_disclaimer": "",
            "category": "e01afa29-dac2-4a29-a66f-9a5f639e9305",
            "position": 0,
            "is_listed": true,
            "label_type": "free",
            "label_name": "免费使用",
            "is_token_verified": false,
            "login_api": "",
            "jwt_api": "",
            "default_username": null,
            "default_password": null,
            "is_menu": false,
            "menus": null,
            "created_by": "c90c0746-f226-4ddf-b7cd-e04318fc018d"
        },
        {
            "id": "bee57668-def8-4b28-89c5-2c74771d669e",
            "app": {
                "id": "d5585488-b99f-4c9a-a071-46d613dd1460",
                "name": "Custom App 002",
                "mode": "custom",
                "icon": "157",
                "icon_type": "sys-icon",
                "icon_url": null,
                "icon_background": "",
                "url": "https://ais-pre-hlwgf37flgnosfuabem26z-249758729543.europe-west2.run.app/"
            },
            "app_id": "72d1e7cf-c837-4d0e-8b7f-b9e761655772",
            "description": "Another custom application",
            "copyright": "Yanfu.AI",
            "privacy_policy": "",
            "custom_disclaimer": "",
            "category": "e01afa29-dac2-4a29-a66f-9a5f639e9305",
            "position": 1,
            "is_listed": true,
            "label_type": "free",
            "label_name": "免费使用",
            "is_token_verified": false,
            "login_api": "",
            "jwt_api": "",
            "default_username": null,
            "default_password": null,
            "is_menu": false,
            "menus": null,
            "created_by": "c90c0746-f226-4ddf-b7cd-e04318fc018d"
        }
      ];
      return { data: mockExploreApps, total: 2, page: 1, limit: 100, has_more: false };
    }

    // Mock for apps list
    if (endpoint.includes('/apps')) {
      const mockApps = [
        {
          id: 'app-1',
          name: '数据分析应用',
          description: '用于分析业务数据的应用',
          mode: 'workflow',
          enable_site: true,
          enable_api: true,
          api_rpm: 60,
          api_rph: 3600,
          is_demo: false,
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          id: 'app-2',
          name: '运维监控',
          description: '监控系统状态',
          mode: 'agent-chat',
          enable_site: false,
          enable_api: true,
          api_rpm: 100,
          api_rph: 6000,
          is_demo: false,
          created_at: '2023-02-01T00:00:00Z',
        },
        {
          id: 'app-3',
          name: '客户服务助手',
          description: '自动回复客户咨询',
          mode: 'chat',
          enable_site: true,
          enable_api: true,
          api_rpm: 30,
          api_rph: 1800,
          is_demo: true,
          created_at: '2023-03-01T00:00:00Z',
        }
      ];
      return { data: mockApps, total: 3, page: 1, limit: 20, has_more: false };
    }

    // Mock for tool providers
    if (endpoint.includes('/tool-providers')) {
      return [
        {
          id: 'serpapi',
          author: 'SerpApi',
          name: 'serpapi',
          description: {
            zh_Hans: 'Google 搜索、Bing 搜索、百度搜索等。',
            en_US: 'Google Search, Bing Search, Baidu Search, etc.'
          },
          icon: 'https://ais-pre-46u3df4et4zukjelu4matx-246257553977.europe-west2.run.app/console/api/workspaces/current/tool-provider/builtin/serpapi/icon',
          label: {
            zh_Hans: 'SerpApi',
            en_US: 'SerpApi'
          },
          type: 'builtin',
          is_team_authorization: true,
          allow_delete: false,
          tools: [],
          labels: ['search']
        },
        {
          id: 'google',
          author: 'Google',
          name: 'google',
          description: {
            zh_Hans: 'Google 搜索、Gmail、Google 日历等。',
            en_US: 'Google Search, Gmail, Google Calendar, etc.'
          },
          icon: 'https://ais-pre-46u3df4et4zukjelu4matx-246257553977.europe-west2.run.app/console/api/workspaces/current/tool-provider/builtin/google/icon',
          label: {
            zh_Hans: 'Google',
            en_US: 'Google'
          },
          type: 'builtin',
          is_team_authorization: false,
          allow_delete: false,
          tools: [],
          labels: ['search', 'productivity']
        },
        {
          id: "567dd8af-fd80-4a7e-82ef-f9c8a511fefd",
          author: "szyl",
          name: "测试",
          description: {
            "zh_Hans": "Retrieves current weather data for a location.",
            "en_US": "Retrieves current weather data for a location.",
            "pt_BR": "Retrieves current weather data for a location.",
            "ja_JP": "Retrieves current weather data for a location."
          },
          icon: {
            "content": "🕵️",
            "background": "#FEF7C3"
          },
          label: {
            "zh_Hans": "测试",
            "en_US": "测试",
            "pt_BR": "测试",
            "ja_JP": "测试"
          },
          type: "api",
          team_credentials: {},
          is_team_authorization: true,
          allow_delete: true,
          tools: [],
          labels: []
        },
        {
          id: "3abb6542-f735-412f-abb4-858efdc7613a",
          author: "szyl",
          name: "文本生成应用（workflow编排）",
          description: {
            "zh_Hans": "文本生成应用（workflow编排）",
            "en_US": "Text Generation Workflow",
            "pt_BR": "Text Generation Workflow",
            "ja_JP": "Text Generation Workflow"
          },
          icon: {
            "content": "🤖",
            "background": "#D5F5F6"
          },
          label: {
            "zh_Hans": "文本生成应用（workflow编排）",
            "en_US": "Text Generation Workflow",
            "pt_BR": "Text Generation Workflow",
            "ja_JP": "Text Generation Workflow"
          },
          type: "workflow",
          team_credentials: {},
          is_team_authorization: true,
          allow_delete: true,
          tools: [],
          labels: [],
          workflow_app_id: "3abb6542-f735-412f-abb4-858efdc7613a"
        }
      ];
    }

    // Mock for custom tool details
    if (endpoint.includes('/tool-provider/api/tools')) {
      return [
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
    }

    // Mock for workflow tool detail
    if (endpoint.includes('/tool-provider/workflow/get')) {
      return {
        workflow_app_id: "3abb6542-f735-412f-abb4-858efdc7613a",
        workflow_tool_id: "3abb6542-f735-412f-abb4-858efdc7613a",
        label: "文本生成应用（workflow编排）",
        name: "text_generation_workflow",
        icon: {
          content: "🤖",
          background: "#D5F5F6"
        },
        description: "Text generation workflow",
        synced: true,
        tool: {
          author: "szyl",
          name: "text_generation_workflow",
          label: {
            en_US: "Text Generation Workflow",
            zh_Hans: "文本生成应用（workflow编排）",
            pt_BR: "Text Generation Workflow",
            ja_JP: "Text Generation Workflow"
          },
          description: {
            en_US: "Text generation workflow",
            zh_Hans: "文本生成应用（workflow编排）",
            pt_BR: "Text generation workflow",
            ja_JP: "Text generation workflow"
          },
          labels: [],
          parameters: [
            {
              name: "query",
              label: {
                en_US: "Query",
                zh_Hans: "query",
                pt_BR: "Query",
                ja_JP: "Query"
              },
              human_description: {
                en_US: "Input query",
                zh_Hans: "输入查询",
                pt_BR: "Input query",
                ja_JP: "Input query"
              },
              llm_description: "Input query",
              type: "string",
              form: "llm",
              required: true,
              default: ""
            }
          ],
          output_schema: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "Generated text"
              }
            }
          }
        },
        privacy_policy: ""
      };
    }

    // Mock for tool labels
    if (endpoint.includes('/tool-labels')) {
      return [
        'search', 'image', 'video', 'weather', 'finance', 'design', 
        'travel', 'social', 'news', 'medical', 'productivity', 
        'education', 'business', 'entertainment', 'utilities', 'other'
      ];
    }

    return {};
  }

  async exportApp(appId: string, includeSecret: boolean = false): Promise<{ data: string }> {
    return this.request(`/apps/${appId}/export?include_secret=${includeSecret}`);
  }

  async importApp(data: { 
    data: string; 
    name?: string; 
    description?: string; 
    icon_type?: 'icon' | 'image' | 'sys-icon'; 
    icon?: string; 
    icon_background?: string 
  }): Promise<any> {
    return this.request('/apps/import', {
      method: 'POST',
      body: data as any
    });
  }

  async importAppFromUrl(data: { 
    url: string; 
    name?: string; 
    description?: string; 
    icon?: string; 
    icon_background?: string 
  }): Promise<any> {
    return this.request('/apps/import/url', {
      method: 'POST',
      body: data as any
    });
  }

  async importDSL(data: { 
    mode: string; 
    yaml_content?: string; 
    yaml_url?: string; 
    app_id?: string; 
    name?: string; 
    description?: string; 
    icon_type?: 'icon' | 'image' | 'sys-icon'; 
    icon?: string; 
    icon_background?: string 
  }): Promise<any> {
    return this.request('/apps/imports', {
      method: 'POST',
      body: data as any
    });
  }

  async confirmDSLImport(import_id: string): Promise<any> {
    return this.request(`/apps/imports/${import_id}/confirm`, {
      method: 'POST',
      body: { import_id } as any
    });
  }

  async convertAppToWorkflow(appID: string, data: { 
    name: string; 
    icon_type: 'icon' | 'image' | 'sys-icon'; 
    icon: string; 
    icon_background?: string | null 
  }): Promise<{ new_app_id: string }> {
    return this.request(`/apps/${appID}/convert-to-workflow`, {
      method: 'POST',
      body: data as any
    });
  }

  async getRoles(): Promise<{ result: string; data: Role[] }> {
    return this.request('/workspaces/current/roles');
  }

  async getDepartments(): Promise<{ result: string; data: Department[] }> {
    return this.request('/workspaces/current/depts');
  }

  async getMembers(params: any = {}): Promise<{ accounts: Member[] }> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/workspaces/current/members${queryString ? `?${queryString}` : ''}`);
  }

  async updateDatasetSetting(datasetId: string, body: Partial<Pick<DataSet,
    'name' | 'description' | 'permission' | 'partial_member_list' | 'indexing_technique' | 'retrieval_model' | 'embedding_model' | 'embedding_model_provider'
  >>): Promise<DataSet> {
    return this.request(`/datasets/${datasetId}`, {
      method: 'PATCH',
      body: body as any
    });
  }

  async getApps(params: Record<string, any> = { page: 1, limit: 30, built_in: false }): Promise<any> {
    const tenantId = getTenantId();
    const queryParams = { ...params };
    
    // Check if we should use the explore endpoint for custom apps
    if (queryParams.is_custom_app_list) {
      const exploreParams = new URLSearchParams();
      if (tenantId) {
        exploreParams.append('tenant_id', tenantId);
      }
      // Only include limit if provided, default to 100 if not specified in params but usually it is
      if (queryParams.limit) {
        exploreParams.append('limit', queryParams.limit.toString());
      }
      
      return this.request(`/explore/apps?${exploreParams.toString()}`);
    }

    // For other apps, do not include tenant_id
    const queryString = new URLSearchParams(queryParams as any).toString();
    return this.request(`/apps?${queryString}`);
  }

  async fetchAppDetail(id: string): Promise<any> {
    return this.request(`/apps/${id}`);
  }

  async getAppDetail(id: string): Promise<any> {
    return this.request(`/explore/apps/${id}`);
  }

  async createApp(data: { 
    name: string; 
    icon_type?: 'icon' | 'image' | 'sys-icon'; 
    icon?: string; 
    icon_background?: string; 
    mode: string; 
    description?: string; 
    built_in?: boolean;
    config?: any 
  }): Promise<any> {
    return this.request('/apps', {
      method: 'POST',
      body: data as any
    });
  }

  async createCustomApp(data: any): Promise<any> {
    const tenantId = getTenantId();
    if (!tenantId) {
      throw new Error('鉴权失败：请检查您的 Token 和 tenant_id 配置');
    }
    return this.request('/explore/apps', {
      method: 'POST',
      body: { ...data, tenant_id: tenantId } as any
    });
  }

  async getAppCategories(): Promise<any> {
    const tenantId = getTenantId();
    if (!tenantId) {
      throw new Error('鉴权失败：请检查您的 Token 和 tenant_id 配置');
    }
    return this.request(`/explore/apps/categories?tenant_id=${tenantId}`);
  }

  async addAppCategory(category: string): Promise<any> {
    const tenantId = getTenantId();
    if (!tenantId) {
      throw new Error('鉴权失败：请检查您的 Token 和 tenant_id 配置');
    }
    return this.request('/explore/apps/categories', {
      method: 'POST',
      body: { tenant_id: tenantId, category } as any
    });
  }

  async updateAppCategory(categoryId: string, category: string): Promise<any> {
    const tenantId = getTenantId();
    if (!tenantId) {
      throw new Error('鉴权失败：请检查您的 Token 和 tenant_id 配置');
    }
    return this.request('/explore/apps/categories', {
      method: 'PUT',
      body: { tenant_id: tenantId, category_id: categoryId, category } as any
    });
  }

  async deleteAppCategory(categoryId: string): Promise<any> {
    const tenantId = getTenantId();
    if (!tenantId) {
      throw new Error('鉴权失败：请检查您的 Token 和 tenant_id 配置');
    }
    return this.request('/explore/apps/categories', {
      method: 'DELETE',
      body: { tenant_id: tenantId, category_id: categoryId } as any
    });
  }

  async updateApp(appID: string, data: { 
    name: string; 
    icon_type: 'icon' | 'image' | 'sys-icon'; 
    icon: string; 
    icon_background?: string; 
    description: string; 
    use_icon_as_answer_icon?: boolean; 
    built_in?: boolean;
    config?: any;
    category?: string;
  }): Promise<any> {
    return this.request(`/apps/${appID}`, {
      method: 'PUT',
      body: data as any
    });
  }

  async updateAppModelConfig(appId: string, body: ModelConfig): Promise<UpdateAppModelConfigResponse> {
    return this.request(`/apps/${appId}/model-config`, {
      method: 'POST',
      body: body as any
    });
  }

  async createApiKey(appId: string): Promise<CreateApiKeyResponse> {
    return this.request(`/apps/${appId}/api-keys`, {
      method: 'POST',
      body: JSON.stringify({})
    });
  }

  async getApiKeys(appId: string): Promise<ApiKeysListResponse> {
    return this.request(`/apps/${appId}/api-keys`, {
      method: 'GET'
    });
  }

  async deleteApiKey(appId: string, keyId: string): Promise<any> {
    return this.request(`/apps/${appId}/api-keys/${keyId}`, {
      method: 'DELETE'
    });
  }

  async updateCustomApp(data: any): Promise<any> {
    return this.request('/explore/apps', {
      method: 'PUT',
      body: data as any
    });
  }

  async copyApp(appID: string, data: { 
    name: string; 
    icon_type: 'icon' | 'image' | 'sys-icon'; 
    icon: string; 
    icon_background?: string | null; 
    mode: string; 
    description?: string;
    config?: any;
  }): Promise<any> {
    return this.request(`/apps/${appID}/copy`, {
      method: 'POST',
      body: data as any
    });
  }

  async deleteApp(appID: string): Promise<void> {
    return this.request(`/apps/${appID}`, {
      method: 'DELETE'
    });
  }

  async deleteCustomApp(appID: string): Promise<void> {
    return this.request('/explore/apps', {
      method: 'DELETE',
      body: { id: appID } as any
    });
  }

  async getTasks(page: number, perPage: number, taskName?: string): Promise<ApiResponse<ScheduledTask>> {
    let url = `/scheduled-tasks?page=${page}&per_page=${perPage}`;
    if (taskName) {
      url += `&task_name=${encodeURIComponent(taskName)}`; // Doc says 'name' for filtering? Actually doc doesn't specify filter param name in list, but usually it's name. Let's assume 'name' or check if I should stick to 'task_name'. The doc summary says "Get Task List", but doesn't detail query params. I'll stick to 'name' as it's more standard, or keep 'task_name' if I'm unsure. Wait, the doc doesn't show list params. I'll keep it as is or change to 'name' if I want to be safe. Let's assume 'name' based on the field name.
    }
    return this.request(url);
  }

  async createTask(task: Partial<ScheduledTask>): Promise<ScheduledTask> {
    return this.request('/scheduled-tasks', {
      method: 'POST',
      body: task as any,
    });
  }

  async updateTask(id: string, task: Partial<ScheduledTask>): Promise<ScheduledTask> {
    return this.request(`/scheduled-tasks/${id}`, {
      method: 'PUT',
      body: task as any,
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request(`/scheduled-tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTaskStatus(id: string): Promise<void> {
    return this.request(`/scheduled-tasks/${id}/toggle`, {
      method: 'POST',
    });
  }

  async getTaskLogs(id: string, page: number, perPage: number): Promise<ApiResponse<TaskLog>> {
    return this.request(`/scheduled-tasks/${id}/logs?page=${page}&per_page=${perPage}`);
  }

  // --- Tool Extension APIs ---

  // 1. 工具集合管理
  async fetchCollectionList(type?: string): Promise<ToolProvider[]> {
    const url = type ? `/workspaces/current/tool-providers?type=${type}` : '/workspaces/current/tool-providers';
    return this.request(url);
  }

  async fetchBuiltInToolList(collectionName: string): Promise<ToolExtension[]> {
    return this.request(`/workspaces/current/tool-provider/builtin/${collectionName}/tools`);
  }

  async fetchCustomToolList(collectionName: string): Promise<ToolExtension[]> {
    return this.request(`/workspaces/current/tool-provider/api/tools?provider=${collectionName}`);
  }

  async fetchModelToolList(collectionName: string): Promise<ToolExtension[]> {
    return this.request(`/workspaces/current/tool-provider/model/tools?provider=${collectionName}`);
  }

  // 2. 内置工具认证管理
  async fetchBuiltInToolCredentialSchema(collectionName: string): Promise<ToolCredential[]> {
    return this.request(`/workspaces/current/tool-provider/builtin/${collectionName}/credentials_schema`);
  }

  async fetchBuiltInToolCredential(collectionName: string): Promise<ToolCredential[]> {
    return this.request(`/workspaces/current/tool-provider/builtin/${collectionName}/credentials`);
  }

  async updateBuiltInToolCredential(collectionName: string, credentials: Record<string, any>): Promise<void> {
    return this.request(`/workspaces/current/tool-provider/builtin/${collectionName}/update`, {
      method: 'POST',
      body: { credentials } as any,
    });
  }

  async removeBuiltInToolCredential(collectionName: string): Promise<void> {
    return this.request(`/workspaces/current/tool-provider/builtin/${collectionName}/delete`, {
      method: 'POST',
      body: {} as any,
    });
  }

  // 3. 自定义工具管理
  async parseParamsSchema(schema: string): Promise<{ parameters_schema: CustomParamSchema[], schema_type: string }> {
    return this.request('/workspaces/current/tool-provider/api/schema', {
      method: 'POST',
      body: { schema } as any,
    });
  }

  async fetchCustomCollection(collectionName: string): Promise<CustomCollectionBackend> {
    return this.request(`/workspaces/current/tool-provider/api/get?provider=${collectionName}`);
  }

  async createCustomCollection(collection: CustomCollectionBackend): Promise<void> {
    return this.request('/workspaces/current/tool-provider/api/add', {
      method: 'POST',
      body: collection as any,
    });
  }

  async updateCustomCollection(collection: CustomCollectionBackend): Promise<void> {
    return this.request('/workspaces/current/tool-provider/api/update', {
      method: 'POST',
      body: collection as any,
    });
  }

  async removeCustomCollection(collectionName: string): Promise<void> {
    return this.request('/workspaces/current/tool-provider/api/delete', {
      method: 'POST',
      body: { provider: collectionName } as any,
    });
  }

  async importSchemaFromURL(url: string): Promise<void> {
    return this.request(`/workspaces/current/tool-provider/api/remote?url=${encodeURIComponent(url)}`);
  }

  async testAPIAvailable(payload: any): Promise<void> {
    return this.request('/workspaces/current/tool-provider/api/test/pre', {
      method: 'POST',
      body: payload as any,
    });
  }

  // 4. 工具列表获取
  async fetchAllBuiltInTools(): Promise<ToolExtension[]> {
    return this.request('/workspaces/current/tools/builtin');
  }

  async fetchAllCustomTools(): Promise<ToolExtension[]> {
    return this.request('/workspaces/current/tools/api');
  }

  async fetchAllWorkflowTools(): Promise<ToolExtension[]> {
    return this.request('/workspaces/current/tools/workflow');
  }

  // 5. 标签管理
  async fetchLabelList(): Promise<Label[]> {
    return this.request('/workspaces/current/tool-labels');
  }

  // 6. 工作流工具提供商管理
  async createWorkflowToolProvider(data: WorkflowToolProviderRequest & { workflow_app_id: string }): Promise<void> {
    return this.request('/workspaces/current/tool-provider/workflow/create', {
      method: 'POST',
      body: data as any,
    });
  }

  async saveWorkflowToolProvider(data: WorkflowToolProviderRequest & Partial<{ workflow_app_id: string, workflow_tool_id: string }>): Promise<void> {
    return this.request('/workspaces/current/tool-provider/workflow/update', {
      method: 'POST',
      body: data as any,
    });
  }

  async fetchWorkflowToolDetailByAppID(appID: string): Promise<WorkflowToolProviderResponse> {
    return this.request(`/workspaces/current/tool-provider/workflow/get?workflow_app_id=${appID}`);
  }

  async fetchWorkflowToolDetail(toolID: string): Promise<WorkflowToolProviderResponse> {
    return this.request(`/workspaces/current/tool-provider/workflow/get?workflow_tool_id=${toolID}`);
  }

  async deleteWorkflowTool(toolID: string): Promise<void> {
    return this.request('/workspaces/current/tool-provider/workflow/delete', {
      method: 'POST',
      body: { workflow_tool_id: toolID } as any,
    });
  }

  // --- MCP Tool Provider APIs ---

  async fetchMcpProviderDetail(providerId: string): Promise<McpProvider> {
    return this.request(`/workspaces/current/tool-provider/mcp/tools/${providerId}`);
  }

  async createMcpProvider(data: McpProviderRequest): Promise<McpProvider> {
    return this.request('/workspaces/current/tool-provider/mcp', {
      method: 'POST',
      body: data as any,
    });
  }

  async updateMcpProvider(data: McpProviderUpdateRequest): Promise<void> {
    return this.request('/workspaces/current/tool-provider/mcp', {
      method: 'PUT',
      body: data as any,
    });
  }

  async deleteMcpProvider(providerId: string): Promise<void> {
    return this.request('/workspaces/current/tool-provider/mcp', {
      method: 'DELETE',
      body: { provider_id: providerId } as any,
    });
  }

  async updateMcpToolList(providerId: string): Promise<McpTool[]> {
    return this.request(`/workspaces/current/tool-provider/mcp/update/${providerId}`);
  }

  async authMcpProvider(providerId: string, authorizationCode?: string, redirectUri?: string): Promise<any> {
    return this.request('/workspaces/current/tool-provider/mcp/auth', {
      method: 'POST',
      body: { 
        provider_id: providerId, 
        authorization_code: authorizationCode,
        redirect_uri: redirectUri || `${window.location.origin}/mcp-auth-callback`
      } as any,
    });
  }

  // 7. 标签管理 (App Tags)
  async fetchTagList(type: string): Promise<Tag[]> {
    return this.request(`/tags?type=${type}`);
  }

  async createTag(name: string, type: string): Promise<Tag> {
    return this.request('/tags', {
      method: 'POST',
      body: { name, type } as any,
    });
  }

  async updateTag(tagID: string, name: string): Promise<Tag> {
    return this.request(`/tags/${tagID}`, {
      method: 'PATCH',
      body: { name } as any,
    });
  }

  async deleteTag(tagID: string): Promise<void> {
    return this.request(`/tags/${tagID}`, {
      method: 'DELETE',
    });
  }

  async bindTag(tagIDList: string[], targetID: string, type: string): Promise<void> {
    return this.request('/tag-bindings/create', {
      method: 'POST',
      body: {
        tag_ids: tagIDList,
        target_id: targetID,
        type,
      } as any,
    });
  }

  async unBindTag(tagID: string, targetID: string, type: string): Promise<void> {
    return this.request('/tag-bindings/remove', {
      method: 'POST',
      body: {
        tag_id: tagID,
        target_id: targetID,
        type,
      } as any,
    });
  }

  // 8. 文件上传 (File Upload)
  async uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/files/upload', {
      method: 'POST',
      body: formData as any,
    });
  }

  // 9. 模型提供商 (Model Providers)
  async fetchModelProviders(): Promise<ModelProvider[]> {
    const response = await this.request('/workspaces/current/model-providers');
    return response.data;
  }

  async fetchModelList(type: ModelTypeEnum): Promise<Model[]> {
    const response = await this.request(`/workspaces/current/models/model-types/${type}`);
    return response.data;
  }

  async fetchDefaultModal(type: ModelTypeEnum): Promise<DefaultModelResponse> {
    const response = await this.request(`/workspaces/current/default-model?model_type=${type}`);
    return response.data;
  }

  async fetchModelProviderCredentials(provider: string, model?: string, modelType?: ModelTypeEnum): Promise<{ credentials?: Record<string, string | boolean | undefined>, load_balancing: ModelLoadBalancingConfig }> {
    let url = `/workspaces/current/model-providers/${provider}/credentials`;
    if (model && modelType) {
      url = `/workspaces/current/model-providers/${provider}/models/credentials?model=${model}&model_type=${modelType}`;
    }
    const response = await this.request(url);
    return response;
  }

  /**
   * 获取指定模型提供商的支付购买链接
   * @param provider 供应商标识
   */
  async getPayUrl(provider: string): Promise<{ url: string }> {
    const response = await this.request(`/workspaces/current/model-providers/${provider}/checkout-url`);
    return response;
  }

  /**
   * 更新指定模型类型的默认模型配置
   * @param model 模型名称
   * @param model_type 模型类型
   * @param provider 提供商标识
   */
  async updateDefaultModel(model: string, model_type: ModelTypeEnum, provider: string): Promise<CommonResponse> {
    const response = await this.request(`/workspaces/current/default-model`, {
      method: 'POST',
      body: JSON.stringify({ model, model_type, provider }),
    });
    return response;
  }

  /**
   * 获取指定模型支持的参数配置规则
   * @param provider 供应商标识
   * @param model 模型名称
   */
  async fetchModelParameterRules(provider: string, model: string): Promise<{ data: ModelParameterRule[] }> {
    const response = await this.request(`/workspaces/current/model-providers/${provider}/models/parameter-rules?model=${model}`);
    return response;
  }

  // --- Chat and Completion APIs ---

  async sendChatMessage(
    appId: string,
    body: Record<string, any>,
    callbacks: {
      onData: IOnData;
      onCompleted: IOnCompleted;
      onThought: IOnThought;
      onFile: IOnFile;
      onError: IOnError;
      getAbortController?: (abortController: AbortController) => void;
      onMessageEnd: IOnMessageEnd;
      onMessageReplace: IOnMessageReplace;
    }
  ) {
    return this.ssePost(`apps/${appId}/chat-messages`, {
      body: {
        ...body,
        response_mode: 'streaming',
      },
    }, callbacks);
  }

  async stopChatMessageResponding(appId: string, taskId: string) {
    return this.post(`apps/${appId}/chat-messages/${taskId}/stop`);
  }

  async sendCompletionMessage(
    appId: string,
    body: Record<string, any>,
    callbacks: {
      onData: IOnData;
      onCompleted: IOnCompleted;
      onError: IOnError;
      onMessageReplace: IOnMessageReplace;
    }
  ) {
    return this.ssePost(`apps/${appId}/completion-messages`, {
      body: {
        ...body,
        response_mode: 'streaming',
      },
    }, callbacks);
  }

  async fetchSuggestedQuestions(appId: string, messageId: string, getAbortController?: any) {
    return this.get(`apps/${appId}/chat-messages/${messageId}/suggested-questions`, {}, { getAbortController });
  }

  async fetchConversationMessages(appId: string, conversation_id: string, getAbortController?: any) {
    return this.get(`apps/${appId}/chat-messages`, { conversation_id }, { getAbortController });
  }

  async generateRule(body: Record<string, any>) {
    return this.post<AutomaticRes>('/rule-generate', { body });
  }

  async generateRuleCode(body: Record<string, any>) {
    return this.post<CodeGenRes>('/rule-code-generate', { body });
  }

  async fetchModelParams(providerName: string, modelId: string) {
    return this.get(`workspaces/current/model-providers/${providerName}/models/parameter-rules`, { model: modelId }) as Promise<{ data: ModelParameterRule[] }>;
  }

  async fetchPromptTemplate({
    appMode,
    mode,
    modelName,
    hasSetDataSet,
  }: {
    appMode: string;
    mode: ModelModeType;
    modelName: string;
    hasSetDataSet: boolean;
  }) {
    return this.get<Promise<{
      chat_prompt_config: ChatPromptConfig;
      completion_prompt_config: CompletionPromptConfig;
      stop: [];
    }>>('/app/prompt-templates', {
      app_mode: appMode,
      model_mode: mode,
      model_name: modelName,
      has_context: hasSetDataSet,
    });
  }

  async fetchTextGenerationMessage({
    appId,
    messageId,
  }: {
    appId: string;
    messageId: string;
  }) {
    return this.get<Promise<any>>(`/apps/${appId}/messages/${messageId}`);
  }

  async fetchDatasets(params: { page: number; ids?: string[]; limit?: number; type?: string, permission?: string }) {
    return this.get<DataSetListResponse>('/datasets', params);
  }
}

export const apiService = new ApiService();

export const fetchDatasets: Fetcher<DataSetListResponse, {
  url: string;
  params: { page: number; ids?: string[]; limit?: number; type?: string, permission?: string }
}> = ({
        url,
        params
      }) => {
  // type分别为“doc” “database” “knowledge_graph”，对应选择知识库面板发三种分类，全部的时候不传type
  return apiService.fetchDatasets(params);
}

export const updateAppModelConfig: Fetcher<UpdateAppModelConfigResponse, { url: string; body: ModelConfig }> = ({
  url,
  body
}) => {
  const appId = url.split('/')[2];
  return apiService.updateAppModelConfig(appId, body);
}
