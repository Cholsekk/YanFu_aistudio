import { 
  AppDailyMessagesResponse, 
  AppDailyConversationsResponse, 
  WorkflowDailyConversationsResponse, 
  AppDailyEndUsersResponse, 
  AppTokenCostsResponse,
  AppStatisticsResponse,
  AppDetailResponse
} from '../types';

const API_BASE = 'http://192.168.1.201:5005'; // Based on MonitoringPage.tsx
const API_PREFIX = '/console/api';

async function request<T>(path: string, params?: Record<string, string>): Promise<T> {
  const token = localStorage.getItem('console_token');
  if (!token) {
    window.alert('请配置 console_token');
    throw new Error('Missing console_token');
  }

  const url = new URL(`/api-proxy${API_PREFIX}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  }

  const response = await fetch(url.toString(), {
    headers: {
      'x-target-base-url': API_BASE,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    window.alert('Token 已过期或无效，请重新配置 console_token');
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
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
};
