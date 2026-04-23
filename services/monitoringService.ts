// import { request } from '@/service/base';//集成时使用
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
  ApiKeysListResponse,
  LogListResponse,
  LogQuery,
  MessageListResponse,
  ChatConversationsResponse,
  CompletionConversationsResponse,
  ChatConversationFullDetailResponse,
  CompletionConversationFullDetailResponse,
  ChatMessagesResponse,
  ChatMessagesRequest,
  LogMessageFeedbacksRequest,
  LogMessageFeedbacksResponse,
  LogMessageAnnotationsRequest,
  LogMessageAnnotationsResponse,
  AnnotationSetting,
  AnnotationJobResponse,
  AnnotationEnableStatus,
  EmbeddingModelConfig,
  AnnotationItemBasic,
  WorkflowLogsResponse,
  WorkflowLogsRequest,
  WorkflowRunDetailResponse,
  NodeTracingListResponse
} from '../types';

import { apiService } from './apiService';

const MOCK_LOGS: LogListResponse = {
  page: 1,
  limit: 10,
  total: 5,
  has_more: false,
  data: [
    {
      id: "ceb4be3a-cbf6-45c2-a034-cc192a80c754",
      status: "normal",
      from_source: "console",
      from_end_user_id: null,
      from_end_user_session_id: null,
      from_account_id: "c90c0746-f226-4ddf-b7cd-e04318fc018d",
      from_account_name: "szyl",
      name: "新的对话",
      summary: "你好",
      read_at: null,
      created_at: "2025-12-10 14:58:30",
      updated_at: "2025-12-10 15:08:58",
      annotated: false,
      model_config: {
        model: null,
        pre_prompt: "根据知识库中的内容回答用户的提问\n其他的知识请以中文的方式返回\n"
      },
      message_count: 3,
      user_feedback_stats: {
        like: 0,
        dislike: 0
      },
      admin_feedback_stats: {
        like: 0,
        dislike: 0
      }
    },
    {
      id: "064ff149-f312-4fe5-bad0-d15ffb63bb54",
      status: "normal",
      from_source: "console",
      from_end_user_id: null,
      from_end_user_session_id: null,
      from_account_id: "c90c0746-f226-4ddf-b7cd-e04318fc018d",
      from_account_name: "szyl",
      name: "新的对话",
      summary: "公司简介，并携带图片",
      read_at: null,
      created_at: "2025-11-04 09:50:17",
      updated_at: "2025-11-04 09:50:17",
      annotated: false,
      model_config: {
        model: null,
        pre_prompt: "根据知识库中的内容回答用户的提问\n其他的知识请以中文的方式返回\n"
      },
      message_count: 1,
      user_feedback_stats: {
        like: 0,
        dislike: 0
      },
      admin_feedback_stats: {
        like: 0,
        dislike: 0
      }
    },
    {
      id: "5415057e-50b4-48cb-96b8-20b66d85507e",
      status: "normal",
      from_source: "api",
      from_end_user_id: "39afd60a-e467-4764-a947-f2d35a75f689",
      from_end_user_session_id: "1d90a9ba-da98-4f17-b333-02f02c3a7098",
      from_account_id: null,
      from_account_name: null,
      name: "New conversation",
      summary: "云南中烟服务器地址",
      read_at: null,
      created_at: "2025-05-21 10:01:06",
      updated_at: "2025-05-21 10:01:52",
      annotated: false,
      model_config: {
        model: null,
        pre_prompt: "根据知识库中的内容回答用户的提问\n其他的知识请以中文的方式返回\n"
      },
      message_count: 2,
      user_feedback_stats: {
        like: 0,
        dislike: 0
      },
      admin_feedback_stats: {
        like: 0,
        dislike: 0
      }
    },
    {
      id: "c2259407-c9fc-4c58-8854-aa16c36df464",
      status: "normal",
      from_source: "api",
      from_end_user_id: "77a40dfa-d1d9-4ec0-8bdc-9eacc674c78b",
      from_end_user_session_id: "724e7529-6d09-43b6-aa76-f909261af030",
      from_account_id: null,
      from_account_name: null,
      name: "New conversation",
      summary: "你好",
      read_at: null,
      created_at: "2025-04-02 06:02:28",
      updated_at: "2025-04-02 06:02:28",
      annotated: false,
      model_config: {
        model: null,
        pre_prompt: "根据知识库中的内容回答用户的提问\n其他的知识请以中文的方式返回\n"
      },
      message_count: 1,
      user_feedback_stats: {
        like: 0,
        dislike: 0
      },
      admin_feedback_stats: {
        like: 0,
        dislike: 0
      }
    },
    {
      id: "090d319e-fb4c-487c-b4b7-c2ecbcf89110",
      status: "normal",
      from_source: "api",
      from_end_user_id: "82e926bb-ee85-4481-bf88-fc79b17ae1f2",
      from_end_user_session_id: "49372020-e9c1-4f49-a16c-2bfe19709a44",
      from_account_id: null,
      from_account_name: null,
      name: "New conversation",
      summary: "1",
      read_at: null,
      created_at: "2025-03-18 09:30:26",
      updated_at: "2025-03-18 09:30:26",
      annotated: false,
      model_config: {
        model: null,
        pre_prompt: "根据知识库中的内容回答用户的提问\n其他的知识请以中文的方式返回\n"
      },
      message_count: 1,
      user_feedback_stats: {
        like: 0,
        dislike: 0
      },
      admin_feedback_stats: {
        like: 0,
        dislike: 0
      }
    },
    {
      id: "mock-ann-1",
      status: "normal",
      from_source: "console",
      from_end_user_id: null,
      from_end_user_session_id: null,
      from_account_id: "c90c0746-f226-4ddf-b7cd-e04318fc018d",
      from_account_name: "szyl",
      name: "标注对话 1",
      summary: "如何使用该系统？",
      read_at: null,
      created_at: "2025-12-11 10:00:00",
      updated_at: "2025-12-11 10:05:00",
      annotated: true,
      model_config: {
        model: null,
        pre_prompt: "根据知识库中的内容回答用户的提问"
      },
      message_count: 2,
      user_feedback_stats: {
        like: 1,
        dislike: 0
      },
      admin_feedback_stats: {
        like: 1,
        dislike: 0
      }
    },
    {
      id: "mock-ann-2",
      status: "normal",
      from_source: "api",
      from_end_user_id: "user-123",
      from_end_user_session_id: "sess-456",
      from_account_id: null,
      from_account_name: null,
      name: "标注对话 2",
      summary: "查询天气信息",
      read_at: null,
      created_at: "2025-12-12 11:00:00",
      updated_at: "2025-12-12 11:10:00",
      annotated: true,
      model_config: {
        model: null,
        pre_prompt: "根据知识库中的内容回答用户的提问"
      },
      message_count: 4,
      user_feedback_stats: {
        like: 0,
        dislike: 0
      },
      admin_feedback_stats: {
        like: 1,
        dislike: 0
      }
    }
  ]
};

const MOCK_MESSAGES: MessageListResponse = {
  limit: 20,
  has_more: false,
  data: [
    {
      id: "msg-1",
      conversation_id: "ceb4be3a-cbf6-45c2-a034-cc192a80c754",
      inputs: {},
      query: "你好",
      answer: "你好！很高兴为您服务。我是您的 AI 助手，有什么我可以帮您的吗？",
      message_files: [],
      feedback: null,
      created_at: "2025-12-10 14:58:30",
      agent_thoughts: [
        {
          id: "thought-1",
          message_id: "msg-1",
          position: 1,
          thought: "用户发送了“你好”，这是一个常见的问候语。我应该用中文回应，保持友好和自然。",
          tool: "",
          tool_input: "",
          created_at: "2025-12-10 14:58:31",
          observation: ""
        }
      ]
    },
    {
      id: "msg-2",
      conversation_id: "ceb4be3a-cbf6-45c2-a034-cc192a80c754",
      inputs: {},
      query: "你能帮我做什么",
      answer: "我可以为您提供多种服务，包括：\n1. **信息查询**：回答各种百科知识、历史、文化等问题。\n2. **内容创作**：撰写邮件、文章、代码、诗歌等。\n3. **语言翻译**：支持多种语言之间的互译。\n4. **逻辑分析**：解决数学问题、逻辑谜题或进行数据分析建议。\n\n您有什么具体的需求吗？",
      message_files: [],
      feedback: { rating: 'like' },
      created_at: "2025-12-10 15:05:00",
      agent_thoughts: [
        {
          id: "thought-2",
          message_id: "msg-2",
          position: 1,
          thought: "用户询问我的功能。我应该列出我擅长的主要任务，以便用户了解我的能力范围。",
          tool: "",
          tool_input: "",
          created_at: "2025-12-10 15:05:01",
          observation: ""
        }
      ]
    }
  ]
};

export const monitoringService = {
  getDailyMessages: (appId: string, start?: string, end?: string) => 
    apiService.get<AppDailyMessagesResponse>(`/apps/${appId}/statistics/daily-messages`, { start: start || '', end: end || '' }),
  
  getDailyConversations: (appId: string, start?: string, end?: string) => 
    apiService.get<AppDailyConversationsResponse>(`/apps/${appId}/statistics/daily-conversations`, { start: start || '', end: end || '' }),
  
  getWorkflowDailyConversations: (appId: string, start?: string, end?: string) => 
    apiService.get<WorkflowDailyConversationsResponse>(`/apps/${appId}/workflow/statistics/daily-conversations`, { start: start || '', end: end || '' }),
  
  getDailyEndUsers: (appId: string, start?: string, end?: string) => 
    apiService.get<AppDailyEndUsersResponse>(`/apps/${appId}/statistics/daily-end-users`, { start: start || '', end: end || '' }),
  
  getTokenCosts: (appId: string, start?: string, end?: string) => 
    apiService.get<AppTokenCostsResponse>(`/apps/${appId}/statistics/token-costs`, { start: start || '', end: end || '' }),
  
  getAverageSessionInteractions: (appId: string, start?: string, end?: string) => 
    apiService.get<AppStatisticsResponse>(`/apps/${appId}/statistics/average-session-interactions`, { start: start || '', end: end || '' }),

  getTokensPerSecond: (appId: string, start?: string, end?: string) => 
    apiService.get<AppStatisticsResponse>(`/apps/${appId}/statistics/tokens-per-second`, { start: start || '', end: end || '' }),

  getUserSatisfactionRate: (appId: string, start?: string, end?: string) => 
    apiService.get<AppStatisticsResponse>(`/apps/${appId}/statistics/user-satisfaction-rate`, { start: start || '', end: end || '' }),

  getAppDetail: (appId: string) => 
    apiService.get<AppDetailResponse>(`/apps/${appId}`),

  updateAppSiteConfig: (appId: string, params: any) => 
    apiService.post<App>(`/apps/${appId}/site`, params),

  updateAppSiteStatus: (appId: string, enable: boolean) =>
    apiService.post<App>(`/apps/${appId}/site-enable`, { enable_site: enable }),

  updateAppApiStatus: (appId: string, enable: boolean) =>
    apiService.post<App>(`/apps/${appId}/api-enable`, { enable_api: enable }),

  updateAppSiteAccessToken: (appId: string) =>
    apiService.post<UpdateAppSiteCodeResponse>(`/apps/${appId}/site/access-token-reset`),

  createApiKey: (appId: string) =>
    apiService.post<CreateApiKeyResponse>(`/apps/${appId}/api-keys`),

  getApiKeys: (appId: string) =>
    apiService.get<ApiKeysListResponse>(`/apps/${appId}/api-keys`),

  deleteApiKey: (appId: string, keyId: string) =>
    apiService.del<any>(`/apps/${appId}/api-keys/${keyId}`),

  getChatConversations: async (appId: string, params: any) => {
    try {
      return await apiService.get<ChatConversationsResponse>(`/apps/${appId}/chat-conversations`, params);
    } catch (error) {
      console.warn('Failed to fetch chat conversations, using mock data instead.', error);
      return MOCK_LOGS as unknown as ChatConversationsResponse;
    }
  },

  getCompletionConversations: async (appId: string, params: any) => {
    try {
      return await apiService.get<CompletionConversationsResponse>(`/apps/${appId}/completion-conversations`, params);
    } catch (error) {
      console.warn('Failed to fetch completion conversations, using mock data instead.', error);
      return MOCK_LOGS as unknown as CompletionConversationsResponse;
    }
  },

  getWorkflowLogs: async (appId: string, params: WorkflowLogsRequest) => {
    const queryParams: Record<string, string> = {
      page: String(params.page),
      limit: String(params.limit),
    };
    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.status && params.status !== 'all') queryParams.status = params.status;

    try {
      return await apiService.get<WorkflowLogsResponse>(`/apps/${appId}/workflow-app-logs`, queryParams);
    } catch (error) {
      console.warn('Failed to fetch workflow logs, using mock data instead.', error);
      return { data: [], total: 0, has_more: false, limit: params.limit, page: params.page } as WorkflowLogsResponse;
    }
  },

  fetchRunDetail: async (appId: string, runId: string) => {
    return apiService.get<WorkflowRunDetailResponse>(`/apps/${appId}/workflow-runs/${runId}`);
  },

  fetchTracingList: async (appId: string, runId: string) => {
    return apiService.get<NodeTracingListResponse>(`/apps/${appId}/workflow-runs/${runId}/node-executions`);
  },

  getWorkflowRunDetail: async (appId: string, runId: string) => {
    try {
      return await apiService.get<any>(`/apps/${appId}/workflow-runs/${runId}`);
    } catch (error) {
      console.warn('Failed to fetch workflow run detail, using mock data instead.', error);
      return null;
    }
  },

  getChatConversationDetail: async (appId: string, conversationId: string) => {
    try {
      return await apiService.get<ChatConversationFullDetailResponse>(`/apps/${appId}/chat-conversations/${conversationId}`);
    } catch (error) {
      console.warn('Failed to fetch chat conversation detail, using mock data instead.', error);
      const mockLog = MOCK_LOGS.data.find(log => log.id === conversationId) || MOCK_LOGS.data[0];
      return mockLog as unknown as ChatConversationFullDetailResponse;
    }
  },

  getCompletionConversationDetail: async (appId: string, conversationId: string) => {
    try {
      return await apiService.get<CompletionConversationFullDetailResponse>(`/apps/${appId}/completion-conversations/${conversationId}`);
    } catch (error) {
      console.warn('Failed to fetch completion conversation detail, using mock data instead.', error);
      const mockLog = MOCK_LOGS.data.find(log => log.id === conversationId) || MOCK_LOGS.data[0];
      return mockLog as unknown as CompletionConversationFullDetailResponse;
    }
  },

  getChatMessages: async (appId: string, params: ChatMessagesRequest) => {
    try {
      return await apiService.get<ChatMessagesResponse>(`/apps/${appId}/chat-messages`, params as any);
    } catch (error) {
      console.warn('Failed to fetch chat messages, using mock data instead.', error);
      const filtered = MOCK_MESSAGES.data.filter(m => m.conversation_id === params.conversation_id);
      return { ...MOCK_MESSAGES, data: filtered.length > 0 ? filtered : MOCK_MESSAGES.data } as unknown as ChatMessagesResponse;
    }
  },

  updateLogMessageFeedbacks: (appId: string, body: LogMessageFeedbacksRequest) =>
    apiService.post<LogMessageFeedbacksResponse>(`/apps/${appId}/feedbacks`, body),

  updateLogMessageAnnotations: (appId: string, body: AnnotationItemBasic) =>
    apiService.post<LogMessageAnnotationsResponse>(`/apps/${appId}/annotations`, body),

  deleteLogMessageAnnotation: (appId: string, annotationId: string) =>
    apiService.del<any>(`/apps/${appId}/annotations/${annotationId}`),

  getAnnotations: async (appId: string, params?: Record<string, any>) => {
    try {
      return await apiService.get<any>(`/apps/${appId}/annotations`, params);
    } catch (error) {
      console.warn('Failed to fetch annotations, using mock data instead.', error);
      const annotatedLogs = MOCK_LOGS.data.filter(log => log.annotated);
      return { data: annotatedLogs, total: annotatedLogs.length };
    }
  },

  updateAnnotation: (appId: string, annotationId: string, body: AnnotationItemBasic) =>
    apiService.post<any>(`/apps/${appId}/annotations/${annotationId}`, body),

  getAnnotationConfig: async (appId: string) => {
    try {
      return await apiService.get<AnnotationSetting>(`/apps/${appId}/annotation-setting`);
    } catch (error) {
      console.warn('Failed to fetch annotation config, using mock data instead.', error);
      return {
        id: 'mock-config-1',
        score_threshold: 0.9,
        embedding_model: {
          embedding_model_name: 'bge-m3:latest',
          embedding_provider_name: 'ollama'
        }
      } as AnnotationSetting;
    }
  },

  updateAnnotationStatus: (appId: string, action: AnnotationEnableStatus, body: { embedding_model_name?: string, embedding_provider_name?: string, score_threshold?: number }) =>
    apiService.post<any>(`/apps/${appId}/annotation-reply/${action}`, body),

  updateAnnotationScore: (appId: string, settingId: string, scoreThreshold: number) =>
    apiService.post<any>(`/apps/${appId}/annotation-settings/${settingId}`, { score_threshold: scoreThreshold }),

  exportAnnotations: (appId: string) =>
    apiService.get<any>(`/apps/${appId}/annotations/export`),

  importAnnotations: (appId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post<AnnotationJobResponse>(`/apps/${appId}/annotations/batch-import`, formData);
    // 集成时使用👇 request 返回，注释掉👆单独运行的post返回
    // return request(`/apps/${appId}/annotations/batch-import`, 
    //   { 
    //     method: 'POST', 
    //     body: formData 
    //   },
    //  { 
    //       bodyStringify: false, 
    //       deleteContentType: true 
    //     }
    // );
  },

  getBatchImportStatus: (appId: string, jobId: string) =>
    apiService.get<AnnotationJobResponse>(`/apps/${appId}/annotations/batch-import-status/${jobId}`),

  getHitHistory: async (appId: string, annotationId: string, params?: Record<string, any>) => {
    try {
      return await apiService.get<any>(`/apps/${appId}/annotations/${annotationId}/hit-histories`, params);
    } catch (error) {
      console.warn('Failed to fetch hit history, using mock data instead.', error);
      return { data: [], total: 0 };
    }
  },

  getConversationMessages: async (appId: string, conversationId: string) => {
    try {
      return await apiService.get<MessageListResponse>(`/apps/${appId}/messages`, { conversation_id: conversationId });
    } catch (error) {
      console.warn('Failed to fetch messages, using mock data instead.', error);
      // Filter mock messages for this conversation
      const filtered = MOCK_MESSAGES.data.filter(m => m.conversation_id === conversationId);
      return { ...MOCK_MESSAGES, data: filtered.length > 0 ? filtered : MOCK_MESSAGES.data };
    }
  },

  getLogs: async (appId: string, query: LogQuery) => {
    const params: Record<string, string> = {
      page: String(query.page),
      limit: String(query.limit),
    };
    if (query.start) params.start = query.start;
    if (query.end) params.end = query.end;
    if (query.keyword) params.keyword = query.keyword;
    if (query.status) params.status = query.status;
    if (query.annotated !== undefined) params.annotated = String(query.annotated);
    if (query.sort_by) params.sort_by = query.sort_by;
    if (query.direction) params.direction = query.direction;
    
    try {
      return await apiService.get<LogListResponse>(`/apps/${appId}/messages`, params);
    } catch (error) {
      console.warn('Failed to fetch logs, using mock data instead.', error);
      return MOCK_LOGS;
    }
  },
};
