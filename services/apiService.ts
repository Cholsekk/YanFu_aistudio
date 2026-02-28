import { ScheduledTask, TaskLog } from '../types';

const getBaseUrl = () => {
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

class ApiService {
  private getAuthHeader() {
    const token = localStorage.getItem('console_token');
    const tenantId = localStorage.getItem('console_tenant_id');
    const headers: Record<string, string> = {};

    if (token) {
      console.log('[API] Using token:', token.substring(0, 8) + '...');
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('[API] No console_token found in localStorage');
    }

    if (tenantId) {
      console.log('[API] Using tenant_id:', tenantId);
      // Assuming the header name is 'X-Tenant-ID' or similar, but since not specified, 
      // I'll use a standard-looking one or just 'tenant_id' if that's what the backend expects.
      // Given the user just said "tenant_id is used in some interfaces", I'll assume a custom header or maybe it's part of the token?
      // But usually it's a separate header. I'll use 'X-Tenant-ID' as a safe default or 'tenant-id'.
      // Let's stick to 'X-Tenant-ID' as it's common. If the user meant something else, they can clarify.
      // Wait, if I look at the previous context, there was no mention of the specific header name.
      // I'll use 'X-Tenant-ID'.
      headers['X-Tenant-ID'] = tenantId;
    }

    return headers;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    if (isMockMode()) {
      console.log(`[Mock API] ${options.method || 'GET'} ${endpoint}`);
      return this.getMockResponse(endpoint);
    }

    const baseUrl = getBaseUrl();
    
    // Use the server-side proxy to bypass Mixed Content and Private Network Access issues
    // The proxy is mounted at /api-proxy on the same origin
    const url = `/api-proxy${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'x-target-base-url': baseUrl, // Tell the proxy where to send the request
      ...this.getAuthHeader(),
      ...options.headers,
    } as Record<string, string>;

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('api-unauthorized'));
        throw new Error('鉴权失败：请检查您的 Token 配置');
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

  private getMockResponse(endpoint: string) {
    // Mock for export app only, as requested
    if (endpoint.match(/\/console\/api\/apps\/[^\/]+\/export/)) {
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

    // Mock for apps list
    if (endpoint.includes('/console/api/apps')) {
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
          mode: 'agent',
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
        }
      ];
    }

    return {};
  }

  async exportApp(appId: string): Promise<{ data: string }> {
    return this.request(`/console/api/apps/${appId}/export?include_secret=false`);
  }

  async getApps(page: number = 1, limit: number = 20): Promise<any> {
    return this.request(`/console/api/apps?page=${page}&limit=${limit}`);
  }

  async getTasks(page: number, perPage: number, taskName?: string): Promise<ApiResponse<ScheduledTask>> {
    let url = `/console/api/scheduled-tasks?page=${page}&per_page=${perPage}`;
    if (taskName) {
      url += `&name=${encodeURIComponent(taskName)}`; // Doc says 'name' for filtering? Actually doc doesn't specify filter param name in list, but usually it's name. Let's assume 'name' or check if I should stick to 'task_name'. The doc summary says "Get Task List", but doesn't detail query params. I'll stick to 'name' as it's more standard, or keep 'task_name' if I'm unsure. Wait, the doc doesn't show list params. I'll keep it as is or change to 'name' if I want to be safe. Let's assume 'name' based on the field name.
    }
    return this.request(url);
  }

  async createTask(task: Partial<ScheduledTask>): Promise<ScheduledTask> {
    return this.request('/console/api/scheduled-tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: Partial<ScheduledTask>): Promise<ScheduledTask> {
    return this.request(`/console/api/scheduled-tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request(`/console/api/scheduled-tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTaskStatus(id: string): Promise<void> {
    return this.request(`/console/api/scheduled-tasks/${id}/toggle`, {
      method: 'POST',
    });
  }

  async getTaskLogs(id: string, page: number, perPage: number): Promise<ApiResponse<TaskLog>> {
    return this.request(`/console/api/scheduled-tasks/${id}/logs?page=${page}&per_page=${perPage}`);
  }

  // --- Tool Extension APIs ---

  // 1. 工具集合管理
  async fetchCollectionList(): Promise<any> {
    return this.request('/console/api/workspaces/current/tool-providers');
  }

  async getBuiltinTools(collectionName: string): Promise<any[]> {
    return this.request(`/console/api/workspaces/current/tool-provider/builtin/${collectionName}/tools`);
  }

  async getCustomTools(provider: string): Promise<any[]> {
    return this.request(`/console/api/workspaces/current/tool-provider/api/tools?provider=${provider}`);
  }

  async getModelTools(provider: string): Promise<any[]> {
    return this.request(`/console/api/workspaces/current/tool-provider/model/tools?provider=${provider}`);
  }

  async getWorkflowTools(workflowToolId: string): Promise<any[]> {
    return this.request(`/console/api/workspaces/current/tool-provider/workflow/tools?workflow_tool_id=${workflowToolId}`);
  }

  // 2. 内置工具认证管理
  async getBuiltinCredentialsSchema(collectionName: string): Promise<any> {
    return this.request(`/console/api/workspaces/current/tool-provider/builtin/${collectionName}/credentials_schema`);
  }

  async getBuiltinCredentials(collectionName: string): Promise<any> {
    return this.request(`/console/api/workspaces/current/tool-provider/builtin/${collectionName}/credentials`);
  }

  async updateBuiltinCredentials(collectionName: string, credentials: any): Promise<void> {
    return this.request(`/console/api/workspaces/current/tool-provider/builtin/${collectionName}/update`, {
      method: 'POST',
      body: JSON.stringify({ credentials }),
    });
  }

  async deleteBuiltinCredentials(collectionName: string): Promise<void> {
    return this.request(`/console/api/workspaces/current/tool-provider/builtin/${collectionName}/delete`, {
      method: 'POST',
    });
  }

  // 3. 自定义工具管理
  async parseSchema(schema: string): Promise<any> {
    return this.request('/console/api/workspaces/current/tool-provider/api/schema', {
      method: 'POST',
      body: JSON.stringify({ schema }),
    });
  }

  async getCustomCollection(provider: string): Promise<any> {
    return this.request(`/console/api/workspaces/current/tool-provider/api/get?provider=${provider}`);
  }

  async addCustomCollection(data: any): Promise<void> {
    return this.request('/console/api/workspaces/current/tool-provider/api/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomCollection(data: any): Promise<void> {
    return this.request('/console/api/workspaces/current/tool-provider/api/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomCollection(provider: string): Promise<void> {
    return this.request('/console/api/workspaces/current/tool-provider/api/delete', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  }

  async importSchemaFromUrl(url: string): Promise<void> {
    return this.request(`/console/api/workspaces/current/tool-provider/api/remote?url=${encodeURIComponent(url)}`);
  }

  async testApiAvailability(data: any): Promise<void> {
    return this.request('/console/api/workspaces/current/tool-provider/api/test/pre', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 4. 工具列表获取
  async getAllBuiltinTools(): Promise<any[]> {
    return this.request('/console/api/workspaces/current/tools/builtin');
  }

  async getAllCustomTools(): Promise<any[]> {
    return this.request('/console/api/workspaces/current/tools/api');
  }

  async getAllWorkflowTools(): Promise<any[]> {
    return this.request('/console/api/workspaces/current/tools/workflow');
  }

  // 5. 标签管理
  async getToolLabels(): Promise<any[]> {
    return this.request('/console/api/workspaces/current/tool-labels');
  }

  // 6. 工作流工具提供商管理
  async createWorkflowToolProvider(data: any): Promise<void> {
    return this.request('/console/api/workspaces/current/tool-provider/workflow/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkflowToolProvider(data: any): Promise<void> {
    return this.request('/console/api/workspaces/current/tool-provider/workflow/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkflowToolProviderByAppId(appId: string): Promise<any> {
    return this.request(`/console/api/workspaces/current/tool-provider/workflow/get?workflow_app_id=${appId}`);
  }

  async getWorkflowToolProviderByToolId(toolId: string): Promise<any> {
    return this.request(`/console/api/workspaces/current/tool-provider/workflow/get?workflow_tool_id=${toolId}`);
  }

  async deleteWorkflowTool(toolId: string): Promise<void> {
    return this.request('/console/api/workspaces/current/tool-provider/workflow/delete', {
      method: 'POST',
      body: JSON.stringify({ workflow_tool_id: toolId }),
    });
  }
}

export const apiService = new ApiService();
