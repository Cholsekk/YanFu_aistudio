import { 
  AppDailyMessagesResponse, 
  AppDailyConversationsResponse, 
  WorkflowDailyConversationsResponse, 
  AppDailyEndUsersResponse, 
  AppTokenCostsResponse,
  AppStatisticsResponse,
  AppDetailResponse,
  App,
  UpdateAppSiteCodeResponse,
  CreateApiKeyResponse,
  ApiKeysListResponse
} from '../types';

const API_BASE = 'http://192.168.1.201:5005'; // Based on MonitoringPage.tsx
const API_PREFIX = '/console/api';

async function request<T>(path: string, params?: Record<string, string>, method: 'GET' | 'POST' | 'DELETE' = 'GET', body?: any): Promise<T> {
  const token = localStorage.getItem('console_token');
  if (!token) {
    window.alert('请配置 console_token');
    throw new Error('Missing console_token');
  }

  const url = new URL(`/api-proxy${API_PREFIX}${path}`, window.location.origin);
  if (params && method === 'GET') {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      'x-target-base-url': API_BASE,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 401) {
    window.alert('Token 已过期或无效，请重新配置 console_token');
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('API Error Body:', errorBody);
    throw new Error(`API Error: ${response.statusText} - ${errorBody}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const monitoringService = {
  getDailyMessages: (appId: string, start?: string, end?: string) => 
    request<AppDailyMessagesResponse>(`/apps/${appId}/statistics/daily-messages`, { start: start || '', end: end || '' }),
  
  getDailyConversations: (appId: string, start?: string, end?: string) => 
    request<AppDailyConversationsResponse>(`/apps/${appId}/statistics/daily-conversations`, { start: start || '', end: end || '' }),
  
  getWorkflowDailyConversations: (appId: string, start?: string, end?: string) => 
    request<WorkflowDailyConversationsResponse>(`/apps/${appId}/workflow/statistics/daily-conversations`, { start: start || '', end: end || '' }),
  
  getDailyEndUsers: (appId: string, start?: string, end?: string) => 
    request<AppDailyEndUsersResponse>(`/apps/${appId}/statistics/daily-end-users`, { start: start || '', end: end || '' }),
  
  getTokenCosts: (appId: string, start?: string, end?: string) => 
    request<AppTokenCostsResponse>(`/apps/${appId}/statistics/token-costs`, { start: start || '', end: end || '' }),
  
  getAverageSessionInteractions: (appId: string, start?: string, end?: string) => 
    request<AppStatisticsResponse>(`/apps/${appId}/statistics/average-session-interactions`, { start: start || '', end: end || '' }),

  getTokensPerSecond: (appId: string, start?: string, end?: string) => 
    request<AppStatisticsResponse>(`/apps/${appId}/statistics/tokens-per-second`, { start: start || '', end: end || '' }),

  getUserSatisfactionRate: (appId: string, start?: string, end?: string) => 
    request<AppStatisticsResponse>(`/apps/${appId}/statistics/user-satisfaction-rate`, { start: start || '', end: end || '' }),

  getAppDetail: (appId: string) => 
    request<AppDetailResponse>(`/apps/${appId}`),

  updateAppSiteConfig: (appId: string, params: any) => 
    request<App>(`/apps/${appId}/site`, undefined, 'POST', params),

  updateAppSiteAccessToken: (appId: string) =>
    request<UpdateAppSiteCodeResponse>(`/apps/${appId}/site/access-token-reset`, undefined, 'POST'),

  createApiKey: (appId: string) =>
    request<CreateApiKeyResponse>(`/apps/${appId}/api-keys`, undefined, 'POST'),

  getApiKeys: (appId: string) =>
    request<ApiKeysListResponse>(`/apps/${appId}/api-keys`),

  deleteApiKey: (appId: string, keyId: string) =>
    request<any>(`/apps/${appId}/api-keys/${keyId}`, undefined, 'DELETE'),
};
