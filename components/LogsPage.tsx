import React, { useState, useEffect, useRef } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  ArrowUpDown, 
  Plus, 
  MoreHorizontal, 
  Download, 
  Upload,
  MessageCircle,
  User,
  Bot,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Target,
  Cpu,
  Settings,
  Info,
  ArrowUp,
  ArrowDown,
  Edit3,
  RefreshCw,
  Trash2,
  History,
  Copy,
  ChevronUp
} from 'lucide-react';
import { 
  Select, 
  Input, 
  Switch, 
  Button, 
  Dropdown, 
  MenuProps,
  Drawer,
  Checkbox,
  message,
  Table,
  Pagination,
  Modal,
  Slider,
  Tooltip
} from 'antd';
import { useAppDevHub } from '../context/AppContext';
import { monitoringService } from '../services/monitoringService';
import { apiService } from '../services/apiService';
import { LogItem, LogQuery, Message, AnnotationEnableStatus, EmbeddingModelConfig, AnnotationItem, AnnotationItemBasic, ModelTypeEnum, WorkflowRunDetailResponse, NodeTracing } from '../types';
import dayjs from 'dayjs';
import TimeRangeSelector from './TimeRangeSelector';
import Markdown from 'react-markdown';
import ModelSelect from './ModelSelect';
import BatchImportModal from './BatchImportModal';

// CodeBlock component for copy and expand
const CodeBlock: React.FC<{ title: string, content: string }> = ({ title, content }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFullView, setIsFullView] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden my-2">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {title}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsFullView(!isFullView)} className="text-xs text-gray-500 hover:text-blue-600">
            {isFullView ? '收起' : '展开'}
          </button>
          <button onClick={handleCopy} className="text-gray-400 hover:text-gray-600">
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="bg-white">
          <Editor
            height={isFullView ? "400px" : "150px"}
            defaultLanguage="json"
            theme="light"
            value={content}
            options={{ 
              readOnly: true, 
              minimap: { enabled: false }, 
              scrollBeyondLastLine: false,
              fontSize: 12,
              lineNumbers: 'on',
              folding: true,
              renderLineHighlight: 'none'
            }}
          />
        </div>
      )}
    </div>
  );
};

const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '已标注改进', value: 'annotated', count: 0 },
  { label: '未标注', value: 'not_annotated' },
];

const TracingNode = ({ trace, index }: { trace: any, index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div key={trace.id || index} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div 
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${trace.status === 'succeeded' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {index + 1}
        </div>
        <h3 className="text-base font-bold text-gray-900">{trace.title}</h3>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs text-gray-500 font-mono">{trace.elapsed_time ? `${trace.elapsed_time.toFixed(3)}s` : '-'}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${trace.status === 'succeeded' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {trace.status}
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t border-gray-100 space-y-4 bg-gray-50/50">
          {trace.inputs && (
            <CodeBlock title="输入 (Inputs)" content={JSON.stringify(trace.inputs, null, 2)} />
          )}
          {trace.process_data && (
            <CodeBlock title="处理数据 (Process Data)" content={JSON.stringify(trace.process_data, null, 2)} />
          )}
          {trace.outputs && (
            <div>
              {trace.error && <div className="text-red-500 text-xs mb-2 font-bold">错误提示: {trace.error}</div>}
              <CodeBlock title="输出 (Outputs)" content={JSON.stringify(trace.outputs, null, 2)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const WORKFLOW_STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Success', value: 'succeeded' },
  { label: 'Fail', value: 'failed' },
  { label: 'Stop', value: 'stopped' },
];

const SORT_OPTIONS = [
  { label: '创建时间', value: 'created_at' },
  { label: '更新时间', value: 'updated_at' },
];

const LogsPage: React.FC = () => {
  const app = useAppDevHub();
  const [activeTab, setActiveTab] = useState<'logs' | 'annotations'>('logs');
  const [isAddAnnotationOpen, setIsAddAnnotationOpen] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [isAnnotationSettingsOpen, setIsAnnotationSettingsOpen] = useState(false);
  const [annotationReplyEnabled, setAnnotationReplyEnabled] = useState(false);
  const [annotationSettings, setAnnotationSettings] = useState({
    scoreThreshold: 0.9,
    embeddingModel: 'bge-m3:latest',
    embeddingProvider: 'ollama'
  });
  const [annotationSettingId, setAnnotationSettingId] = useState<string | null>(null);
  const [annotationForm, setAnnotationForm] = useState({
    question: '',
    answer: '',
    addNext: false
  });

  // Logs state
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<LogQuery & { period: string | number }>({
    page: 1,
    limit: 10,
    status: 'all',
    keyword: '',
    sort_by: 'created_at',
    direction: 'desc',
    period: 7,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [hitHistory, setHitHistory] = useState<any[]>([]);

  // Detail state
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<AnnotationItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAnnotationDetailOpen, setIsAnnotationDetailOpen] = useState(false);
  const [isWorkflowDetailOpen, setIsWorkflowDetailOpen] = useState(false);
  const [selectedWorkflowLog, setSelectedWorkflowLog] = useState<any>(null);
  const [workflowRunDetail, setWorkflowRunDetail] = useState<WorkflowRunDetailResponse | null>(null);
  const [workflowTracingList, setWorkflowTracingList] = useState<NodeTracing[]>([]);
  const [workflowRunDetailLoading, setWorkflowRunDetailLoading] = useState(false);
  const [workflowDetailTab, setWorkflowDetailTab] = useState<'result' | 'detail' | 'tracing'>('result');
  const [annotationDetailTab, setAnnotationDetailTab] = useState<'reply' | 'history'>('reply');
  const [editingField, setEditingField] = useState<'question' | 'answer' | null>(null);
  const [editForm, setEditForm] = useState({ question: '', answer: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange('keyword', searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (isAnnotationSettingsOpen && app?.id) {
      const fetchAnnotationConfig = async () => {
        try {
          const config = await monitoringService.getAnnotationConfig(app.id);
          if (config && config.embedding_model) {
            setAnnotationSettings(prev => ({
              ...prev,
              embeddingModel: config.embedding_model.embedding_model_name,
              embeddingProvider: config.embedding_model.embedding_provider_name,
              scoreThreshold: config.score_threshold
            }));
          } else {
            // Fallback to default if no config
            const res = await apiService.fetchDefaultModal(ModelTypeEnum.textEmbedding);
            if (res && res.model && res.provider) {
              setAnnotationSettings(prev => ({
                ...prev,
                embeddingModel: res.model,
                embeddingProvider: res.provider.provider
              }));
            }
          }
        } catch (error) {
          console.error('Failed to fetch annotation config:', error);
        }
      };
      fetchAnnotationConfig();
    }
  }, [isAnnotationSettingsOpen, app?.id]);

  const handleToggleAnnotationReply = async (enabled: boolean) => {
    if (!app?.id) return;
    try {
      const action = enabled ? AnnotationEnableStatus.enable : AnnotationEnableStatus.disable;
      const body = enabled ? {
        embedding_provider_name: annotationSettings.embeddingProvider,
        embedding_model_name: annotationSettings.embeddingModel,
        score_threshold: annotationSettings.scoreThreshold
      } : {};
      
      await monitoringService.updateAnnotationStatus(app.id, action, body);
      setAnnotationReplyEnabled(enabled);
      message.success(enabled ? '已开启标注回复' : '已关闭标注回复');
      
      // Refresh config to get ID if it was just enabled
      if (enabled) {
        const config = await monitoringService.getAnnotationConfig(app.id);
        if (config) {
          setAnnotationSettingId(config.id);
          setAnnotationSettings(prev => ({
            ...prev,
            scoreThreshold: config.score_threshold,
            embeddingModel: config.embedding_model?.embedding_model_name || prev.embeddingModel,
            embeddingProvider: config.embedding_model?.embedding_provider_name || prev.embeddingProvider
          }));
        }
        fetchAnnotations(filters);
      }
    } catch (error) {
      console.error('Failed to toggle annotation reply:', error);
      message.error('操作失败');
    }
  };

  const handleUpdateScoreThreshold = async (score: number) => {
    if (!app?.id || !annotationSettingId) return;
    try {
      await monitoringService.updateAnnotationScore(app.id, annotationSettingId, score);
      setAnnotationSettings(prev => ({ ...prev, scoreThreshold: score }));
    } catch (error) {
      console.error('Failed to update score threshold:', error);
      message.error('更新分数阈值失败');
    }
  };

  const handleImport = async (file: File) => {
    if (!app?.id) return;
    try {
      const response = await monitoringService.importAnnotations(app.id, file);
      if (response && response.job_id) {
        message.success('导入任务已启动');
        checkImportStatus(response.job_id);
      }
    } catch (error) {
      console.error('Failed to import annotations:', error);
      message.error('导入失败');
    }
  };

  const checkImportStatus = async (jobId: string) => {
    if (!app?.id) return;
    try {
      const status = await monitoringService.getBatchImportStatus(app.id, jobId);
      if (status.job_status === 'completed') {
        message.success('导入成功');
        if (activeTab === 'annotations') {
          fetchAnnotations({ ...filters, page: currentPage, limit: pageSize });
        }
      } else if (status.job_status === 'waiting' || status.job_status === 'processing') {
        setTimeout(() => checkImportStatus(jobId), 3000);
      } else if (status.job_status === 'error' || status.job_status === 'failed') {
        message.error('导入失败');
      }
    } catch (error) {
      console.error('Failed to check import status:', error);
    }
  };


  const fetchLogs = async (query: LogQuery & { period: string | number }) => {
    if (!app?.id) return;
    setLoading(true);
    try {
      const isChatMode = app.mode !== 'completion';
      
      const apiQuery: any = {
        page: query.page,
        limit: query.limit,
        ...(query.period !== 'all' && typeof query.period === 'number'
          ? {
            start: dayjs().subtract(query.period, 'day').startOf('day').format('YYYY-MM-DD HH:mm'),
            end: dayjs().endOf('day').format('YYYY-MM-DD HH:mm'),
          }
          : {}),
        sort_by: query.sort_by,
        keyword: query.keyword,
        status: query.status,
        annotated: query.annotated,
        direction: query.direction,
      };

      let response;
      if (app.type === '工作流应用') {
        const workflowQuery = {
          page: query.page,
          limit: query.limit,
          keyword: query.keyword || '',
          status: query.status || 'all',
        };
        response = await monitoringService.getWorkflowLogs(app.id, workflowQuery);
      } else if (isChatMode) {
        response = await monitoringService.getChatConversations(app.id, apiQuery);
      } else {
        response = await monitoringService.getCompletionConversations(app.id, apiQuery);
      }

      if (response && response.data) {
        const mappedData = app.type === '工作流应用' ? response.data : response.data.map((item: any) => ({
          ...item,
          summary: item.summary || (item.message ? item.message.query : ''),
          message_count: item.message_count || 1,
        }));
        setLogs(mappedData as any);
        setTotal(response.total);
      } else {
        setLogs([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      message.error('获取日志失败');
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnotations = async (query: LogQuery & { period: string | number }, silent = false) => {
    if (!app?.id) return;
    if (!silent) setLoading(true);
    try {
      const apiQuery: any = {
        page: query.page,
        limit: query.limit,
        keyword: query.keyword,
      };
      const response = await monitoringService.getAnnotations(app.id, apiQuery);
      if (response && response.data) {
        setAnnotations(response.data);
        setTotal(response.total || response.data.length);
      } else {
        setAnnotations([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch annotations:', error);
      setAnnotations([]);
      setTotal(0);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (app?.id && app.type !== '工作流应用' && app.type !== '文本生成应用') {
      const fetchInitialConfig = async () => {
        try {
          const config = await monitoringService.getAnnotationConfig(app.id);
          if (config && config.id) {
            setAnnotationSettingId(config.id);
            setAnnotationReplyEnabled(true);
            setAnnotationSettings(prev => ({
              ...prev,
              scoreThreshold: config.score_threshold,
              embeddingModel: config.embedding_model?.embedding_model_name || prev.embeddingModel,
              embeddingProvider: config.embedding_model?.embedding_provider_name || prev.embeddingProvider
            }));
          }
        } catch (error) {
          // If it fails (e.g., 404), we assume it's disabled
          console.log('Annotation reply is likely disabled or not configured');
        }
      };
      fetchInitialConfig();
    }
  }, [app?.id, app?.type]);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs(filters);
    } else {
      fetchAnnotations(filters);
    }
  }, [activeTab, filters, app?.id]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (key: keyof LogQuery, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    setCurrentPage(1);
  };

  const fetchWorkflowRunDetail = async (runId: string) => {
    if (!app?.id) return;
    setWorkflowRunDetailLoading(true);
    try {
      const [detail, tracing] = await Promise.all([
        monitoringService.fetchRunDetail(app.id, runId),
        monitoringService.fetchTracingList(app.id, runId)
      ]);
      setWorkflowRunDetail({
        ...detail,
        detail: detail,
        tracing: tracing.data
      });
      setWorkflowTracingList(tracing.data);
    } catch (error) {
      console.error('Failed to fetch workflow run detail:', error);
      message.error('获取工作流详情失败');
    } finally {
      setWorkflowRunDetailLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!app?.id) return;
    setMessagesLoading(true);
    try {
      const isChatMode = app.mode !== 'completion';
      let response;
      
      // Fetch detail as well
      if (isChatMode) {
        monitoringService.getChatConversationDetail(app.id, conversationId).then(detail => {
          if (detail) setSelectedLog(prev => prev ? { ...prev, ...detail } as any : null);
        });
      } else {
        monitoringService.getCompletionConversationDetail(app.id, conversationId).then(detail => {
          if (detail) setSelectedLog(prev => prev ? { ...prev, ...detail } as any : null);
        });
      }

      if (isChatMode) {
        response = await monitoringService.getChatMessages(app.id, {
          conversation_id: conversationId,
          limit: 100
        });
      } else {
        // For completion mode, we might still use getConversationMessages or a similar logic
        // But the PDF says fetchChatMessages is for chat. 
        // Let's stick to getConversationMessages for completion if it's different.
        response = await monitoringService.getConversationMessages(app.id, conversationId);
      }

      if (response && response.data) {
        setMessages(response.data as any);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, rating: 'like' | 'dislike' | null) => {
    if (!app?.id) return;
    try {
      await monitoringService.updateLogMessageFeedbacks(app.id, {
        message_id: messageId,
        rating
      });
      message.success('反馈成功');
      // Update local state
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, feedback: { rating } } : m
      ));
    } catch (error) {
      console.error('Failed to update feedback:', error);
      message.error('反馈失败');
    }
  };

  const handleUpdateAnnotation = async (messageId: string, question: string, answer: string) => {
    if (!app?.id) return;
    try {
      await monitoringService.updateLogMessageAnnotations(app.id, {
        message_id: messageId,
        question,
        answer
      });
      message.success('标注成功');
      // Update local state for immediate feedback
      setLogs(prev => prev.map(log => 
        log.id === selectedLog?.id ? { ...log, annotated: true } : log
      ));
      // Update selected log if it's the one being annotated
      if (selectedLog) {
        setSelectedLog({ ...selectedLog, annotated: true });
      }
      
      fetchMessages(selectedLog?.id || '');
      // Refresh logs list to update table highlight from server
      if (activeTab === 'logs') {
        fetchLogs({ ...filters, page: currentPage, limit: pageSize });
      } else {
        fetchAnnotations({ ...filters, page: currentPage, limit: pageSize });
      }
    } catch (error) {
      console.error('Failed to update annotation:', error);
      message.error('标注失败');
    }
  };

  const handleRemoveAnnotation = async (annotationId: string) => {
    if (!app?.id) return;
    try {
      await monitoringService.deleteLogMessageAnnotation(app.id, annotationId);
      message.success('移除标注成功');
      
      if (activeTab === 'logs') {
        // Update local state for immediate feedback
        setLogs(prev => prev.map(log => 
          log.id === selectedLog?.id ? { ...log, annotated: false } : log
        ));
        if (selectedLog) {
          setSelectedLog({ ...selectedLog, annotated: false });
        }
        fetchLogs({ ...filters, page: currentPage, limit: pageSize });
        fetchMessages(selectedLog?.id || '');
      } else {
        fetchAnnotations({ ...filters, page: currentPage, limit: pageSize });
      }
    } catch (error) {
      console.error('Failed to remove annotation:', error);
      message.error('移除标注失败');
    }
  };

  const fetchHitHistory = async (annotationId: string) => {
    if (!app?.id) return;
    try {
      const response = await monitoringService.getHitHistory(app.id, annotationId);
      if (response && response.data) {
        setHitHistory(response.data);
      } else {
        setHitHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch hit history:', error);
      setHitHistory([]);
    }
  };

  const handleInlineSave = async () => {
    if (!app?.id || !selectedAnnotation) return;
    try {
      await monitoringService.updateAnnotation(app.id, selectedAnnotation.id, {
        question: editForm.question,
        answer: editForm.answer
      });
      message.success('更新成功');
      
      const updatedAnnotation = { ...selectedAnnotation, question: editForm.question, answer: editForm.answer };
      setSelectedAnnotation(updatedAnnotation);
      setAnnotations(prev => prev.map(a => a.id === updatedAnnotation.id ? updatedAnnotation : a));
      
      setEditingField(null);
    } catch (error) {
      console.error('Failed to update annotation:', error);
      message.error('更新失败');
    }
  };

  const handleRowClick = (record: any) => {
    if (app?.type === '工作流应用') {
      setSelectedWorkflowLog(record);
      setIsWorkflowDetailOpen(true);
      setWorkflowDetailTab('result');
      fetchWorkflowRunDetail(record.workflow_run.id);
      return;
    }
    if (activeTab === 'annotations') {
      setSelectedAnnotation(record as AnnotationItem);
      setIsAnnotationDetailOpen(true);
      setAnnotationDetailTab('reply');
      setEditingField(null);
      setHitHistory([]); 
    } else {
      setSelectedLog(record as LogItem);
      setIsDetailOpen(true);
      fetchMessages(record.id);
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'summary',
      key: 'summary',
      width: '30%',
      render: (text: string, record: LogItem) => (
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${record.annotated ? 'bg-blue-500' : 'bg-gray-300'}`} />
          <span className="text-gray-900 font-medium line-clamp-1">{text || '无摘要'}</span>
          {record.annotated && (
            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase shrink-0">
              已标注
            </span>
          )}
        </div>
      ),
    },
    {
      title: '用户或账户',
      key: 'user',
      render: (record: LogItem) => (
        <div className="flex items-center gap-2 text-gray-500">
          <User className="w-3.5 h-3.5" />
          <span className="truncate max-w-[120px]">
            {record.from_account_name || record.from_end_user_id || '未知'}
          </span>
        </div>
      ),
    },
    {
      title: '消息数',
      dataIndex: 'message_count',
      key: 'message_count',
      align: 'center' as const,
      render: (count: number) => <span className="text-gray-500">{count}</span>,
    },
    {
      title: '用户反馈',
      key: 'user_feedback',
      align: 'center' as const,
      render: (record: LogItem) => {
        const { like, dislike } = record.user_feedback_stats || { like: 0, dislike: 0 };
        if (like === 0 && dislike === 0) return <span className="text-gray-300">-</span>;
        return (
          <div className="flex items-center justify-center gap-2">
            {like > 0 && <span className="text-emerald-500 text-xs">👍 {like}</span>}
            {dislike > 0 && <span className="text-red-500 text-xs">👎 {dislike}</span>}
          </div>
        );
      },
    },
    {
      title: '管理员反馈',
      key: 'admin_feedback',
      align: 'center' as const,
      render: (record: LogItem) => {
        const { like, dislike } = record.admin_feedback_stats || { like: 0, dislike: 0 };
        if (like === 0 && dislike === 0) return <span className="text-gray-300">-</span>;
        return (
          <div className="flex items-center justify-center gap-2">
            {like > 0 && <span className="text-emerald-600 text-xs font-medium">👍 {like}</span>}
            {dislike > 0 && <span className="text-red-600 text-xs font-medium">👎 {dislike}</span>}
          </div>
        );
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => (
        <span className="text-gray-400 text-xs">
          {dayjs(date).format('YYYY-MM-DD HH:mm:ss')}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (record: LogItem) => (
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => {
              setSelectedLog(record);
              setIsDetailOpen(true);
              fetchMessages(record.id);
            }}
            className="text-gray-400 hover:text-primary-600 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              message.success('删除成功');
              if (activeTab === 'logs') {
                setLogs(prev => prev.filter(l => l.id !== record.id));
              } else {
                setAnnotations(prev => prev.filter(l => l.id !== record.id));
              }
            }}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const statusTdRender = (status: string) => {
    if (status === 'succeeded') {
      return <span className="text-emerald-500 flex items-center gap-1.5 text-xs font-medium"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Success</span>;
    }
    if (status === 'failed') {
      return <span className="text-red-500 flex items-center gap-1.5 text-xs font-medium"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>Fail</span>;
    }
    if (status === 'stopped') {
      return <span className="text-yellow-500 flex items-center gap-1.5 text-xs font-medium"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>Stop</span>;
    }
    return <span className="text-blue-500 flex items-center gap-1.5 text-xs font-medium"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Running</span>;
  };

  const workflowColumns = [
    {
      title: '',
      key: 'read_status',
      width: 24,
      render: (record: any) => (
        !record.read_at ? <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" /> : null
      )
    },
    {
      title: '开始时间',
      key: 'created_at',
      render: (record: any) => (
        <span className="text-gray-500 text-sm">
          {record.created_at ? dayjs(record.created_at * 1000).format('YYYY-MM-DD HH:mm:ss') : '-'}
        </span>
      )
    },
    {
      title: '状态',
      key: 'status',
      render: (record: any) => statusTdRender(record.workflow_run?.status)
    },
    {
      title: '运行时间',
      key: 'elapsed_time',
      render: (record: any) => <span className="text-gray-500 text-sm">{record.workflow_run?.elapsed_time ? `${record.workflow_run.elapsed_time.toFixed(3)}s` : '-'}</span>
    },
    {
      title: 'TOKENS',
      key: 'total_tokens',
      render: (record: any) => <span className="text-gray-500 text-sm">{record.workflow_run?.total_tokens || 0}</span>
    },
    {
      title: '用户或账户',
      key: 'created_by',
      render: (record: any) => (
        <span className="text-gray-500 text-sm truncate max-w-[200px] block">
          {record.created_by_end_user ? record.created_by_end_user.session_id : record.created_by_account ? record.created_by_account.name : "N/A"}
        </span>
      )
    }
  ];
  
  const annotationColumns = [
    {
      title: '问题',
      dataIndex: 'question',
      key: 'question',
      width: '30%',
      render: (text: string) => <span className="text-gray-900 font-medium line-clamp-2">{text}</span>
    },
    {
      title: '回答',
      dataIndex: 'answer',
      key: 'answer',
      width: '40%',
      render: (text: string) => <span className="text-gray-500 line-clamp-2">{text}</span>
    },
    {
      title: '命中次数',
      dataIndex: 'hit_count',
      key: 'hit_count',
      align: 'center' as const,
      render: (count: number) => <span className="text-gray-500">{count}</span>
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (timestamp: number) => (
        <span className="text-gray-400 text-xs">
          {dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (record: AnnotationItem) => (
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => {
              setSelectedAnnotation(record);
              setAnnotationDetailTab('reply');
              setIsAnnotationDetailOpen(true);
              setEditingField('answer');
              setEditForm({ question: record.question, answer: record.answer });
            }}
            className="text-gray-400 hover:text-primary-600 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleRemoveAnnotation(record.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleAddAnnotation = async () => {
    if (!app?.id) return;
    if (!annotationForm.question || !annotationForm.answer) {
      message.warning('请填写完整信息');
      return;
    }
    
    try {
      // Add new annotation
      await monitoringService.updateLogMessageAnnotations(app.id, {
        question: annotationForm.question,
        answer: annotationForm.answer
      });
      message.success('添加成功');

      if (annotationForm.addNext) {
        setAnnotationForm({ ...annotationForm, question: '', answer: '' });
      } else {
        setIsAddAnnotationOpen(false);
        setAnnotationForm({ question: '', answer: '', addNext: false });
      }
      
      // Refresh annotations if on that tab
      if (activeTab === 'annotations') {
        fetchAnnotations({ ...filters, page: currentPage, limit: pageSize }, true);
      } else {
        // If on logs tab, maybe refresh logs to show annotated status
        fetchLogs({ ...filters, page: currentPage, limit: pageSize });
      }
    } catch (error) {
      console.error('Failed to save annotation:', error);
      message.error('保存失败');
    }
  };

  const handleExport = async (format: 'csv' | 'jsonl') => {
    if (!app?.id) return;
    message.loading('正在获取导出数据...', 0);
    try {
      const response = await monitoringService.exportAnnotations(app.id);
      const data = Array.isArray(response) ? response : (response?.data || response?.items || []);
      
      if (!data || data.length === 0) {
        message.destroy();
        message.warning('没有数据可导出');
        return;
      }

      if (format === 'csv') {
        const headers = ['id', 'question', 'answer', 'hit_count', 'created_at'];
        const rows = data.map((item: any) => [
          item.id,
          item.question,
          item.answer,
          item.hit_count,
          item.created_at
        ]);
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `annotations_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
        link.click();
      } else {
        const jsonlContent = data.map((item: any) => JSON.stringify(item)).join('\n');
        const blob = new Blob([jsonlContent], { type: 'application/x-jsonlines' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `annotations_${dayjs().format('YYYYMMDD_HHmmss')}.jsonl`;
        link.click();
      }
      message.destroy();
      message.success('导出成功');
    } catch (error) {
      console.error('Failed to export annotations:', error);
      message.destroy();
      message.error('导出失败');
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'import',
      label: '批量导入',
      icon: <Upload className="w-4 h-4" />,
      onClick: () => setIsBatchImportOpen(true)
    },
    {
      key: 'export',
      label: '批量导出',
      icon: <Download className="w-4 h-4" />,
      children: [
        { 
          key: 'export-csv', 
          label: 'CSV',
          onClick: () => handleExport('csv')
        },
        { 
          key: 'export-jsonl', 
          label: 'JSONL',
          onClick: () => handleExport('jsonl')
        },
      ]
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tab Header */}
      <div className="flex items-center gap-8 border-b border-gray-100 mb-6">
        <button 
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-medium transition-all relative ${
            activeTab === 'logs' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          日志
          {activeTab === 'logs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />}
        </button>
        {app?.type !== '工作流应用' && app?.type !== '文本生成应用' && (
          <button 
            onClick={() => setActiveTab('annotations')}
            className={`pb-3 text-sm font-medium transition-all relative ${
              activeTab === 'annotations' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            标注
            {activeTab === 'annotations' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />}
          </button>
        )}
      </div>

      <div className="text-xs text-gray-400 mb-6">
        {app?.type === '工作流应用' ? '日志记录了应用的执行情况' : '日志记录了应用的运行情况，包括用户的输入和 AI 的回复。'}
      </div>

      {/* Filters Area */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {activeTab === 'logs' && (
            <>
              {app?.type !== '工作流应用' && (
                <TimeRangeSelector 
                  defaultPeriodValue={7}
                  onRangeChange={(start, end, period) => {
                    setFilters(prev => ({ ...prev, start, end, period, page: 1 }));
                    setCurrentPage(1);
                  }} 
                />
              )}
              
              <Dropdown
                trigger={['click']}
                popupRender={() => (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-48 z-50">
                    {(app?.type === '工作流应用' ? WORKFLOW_STATUS_OPTIONS : STATUS_OPTIONS).map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange('status', option.value)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 ${filters.status === option.value ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                      >
                        <span>{option.label}{(option as any).count !== undefined && ` (${(option as any).count} 项)`}</span>
                        {filters.status === option.value && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              >
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  {(app?.type === '工作流应用' ? WORKFLOW_STATUS_OPTIONS : STATUS_OPTIONS).find(o => o.value === filters.status)?.label || '全部'}
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </Dropdown>
            </>
          )}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder={app?.type === '工作流应用' ? '搜索' : '搜索摘要或用户'} 
              className="pl-9 pr-4 py-1.5 bg-gray-50 border border-transparent rounded-lg text-sm w-72 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {activeTab === 'logs' ? (
            app?.type !== '工作流应用' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                  <Dropdown
                    trigger={['click']}
                    popupRender={() => (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40 z-50">
                        {SORT_OPTIONS.map(option => (
                          <button
                            key={option.value}
                            onClick={() => handleFilterChange('sort_by', option.value)}
                            className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 ${filters.sort_by === option.value ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                          >
                            {option.label}
                            {filters.sort_by === option.value && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    )}
                  >
                    <div className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-white rounded-md transition-all text-sm text-gray-600 font-medium">
                      <span>排序：{SORT_OPTIONS.find(o => o.value === filters.sort_by)?.label}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </Dropdown>
                  <div className="w-px h-4 bg-gray-300 mx-1" />
                  <button 
                    onClick={() => handleFilterChange('direction', filters.direction === 'asc' ? 'desc' : 'asc')}
                    className="p-1.5 hover:bg-white rounded-md transition-all text-gray-500 hover:text-gray-900"
                  >
                    {filters.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">标注回复</span>
                <Switch 
                  size="small" 
                  checked={annotationReplyEnabled} 
                  onChange={(checked) => {
                    if (checked) {
                      setIsAnnotationSettingsOpen(true);
                    } else {
                      handleToggleAnnotationReply(false);
                    }
                  }}
                  className={annotationReplyEnabled ? 'bg-primary-500' : 'bg-gray-300'} 
                />
                {annotationReplyEnabled && (
                  <button 
                    onClick={() => setIsAnnotationSettingsOpen(true)}
                    className="p-1 hover:bg-gray-200 rounded-md transition-colors text-gray-500 hover:text-gray-700"
                    title="标注回复初始设置"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button 
                type="primary" 
                icon={<Plus className="w-4 h-4" />}
                className="flex items-center gap-2 h-10 rounded-xl font-semibold bg-gradient-to-r from-primary-600 to-primary-500 border-none shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                onClick={() => {
                  setSelectedAnnotation(null);
                  setAnnotationForm({ question: '', answer: '', addNext: false });
                  setIsAddAnnotationOpen(true);
                }}
              >
                添加标注
              </Button>
              <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
                <Button 
                  icon={<MoreHorizontal className="w-4 h-4" />} 
                  className="h-9 w-9 flex items-center justify-center rounded-xl border-gray-200 hover:text-primary-600 hover:border-primary-500" 
                />
              </Dropdown>
            </div>
          )}
        </div>
      </div>

      {/* Table Area */}
      {(activeTab === 'logs' ? logs : annotations).length > 0 ? (
        <div className="flex-grow flex flex-col">
          <div className="flex-grow overflow-auto">
            <Table 
              columns={app?.type === '工作流应用' ? workflowColumns : (activeTab === 'logs' ? columns : annotationColumns)} 
              dataSource={(activeTab === 'logs' ? logs : annotations) as any[]} 
              rowKey="id"
              pagination={false}
              loading={loading}
              className="custom-table"
              scroll={{ x: 440, y: 'calc(100vh - 450px)' }}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                className: `cursor-pointer transition-colors ${
                  record.annotated ? 'bg-blue-50/30 hover:bg-blue-50/50' : ''
                } ${
                  app?.type === '工作流应用' && selectedWorkflowLog?.id === record.id ? 'selected-row' : ''
                }`
              })}
            />
          </div>
          <div className="mt-8 flex items-center justify-between px-4 pb-4">
            <button 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              上一页
            </button>
            <Pagination 
              current={currentPage}
              total={total}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              className="custom-pagination"
            />
            <button 
              disabled={currentPage * pageSize >= total}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              下一页
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="bg-gray-50/50 rounded-2xl p-12 max-w-lg w-full text-center border border-gray-100/50">
            <div className="relative inline-block mb-6">
              <MessageCircle className="w-12 h-12 text-gray-200" />
              <div className="absolute -top-1 -right-1 flex gap-0.5">
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {activeTab === 'logs' ? '这里有人吗' : '没有标注'}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {activeTab === 'logs' 
                ? '在这里观测和标注最终用户和 AI 应用程序之间的交互，以不断提高 AI 的准确性。'
                : '你可以在应用会话调试中编辑标注，也可以在此批量导入标注用于高质量回复。'}
            </p>
          </div>
        </div>
      )}

      {/* Add Annotation Drawer */}
      <Drawer
        title={
          <div className="py-2">
            <div className="text-xl font-bold text-gray-900 leading-none mb-1.5 tracking-tight">添加标注回复</div>
            <div className="text-xs text-gray-400 font-medium">为应用配置高质量的预设回复</div>
          </div>
        }
        placement="right"
        onClose={() => setIsAddAnnotationOpen(false)}
        open={isAddAnnotationOpen}
        size={560}
        closable={false}
        extra={
          <button 
            onClick={() => setIsAddAnnotationOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        }
        className="custom-drawer"
        styles={{
          header: { borderBottom: '1px solid #f3f4f6', padding: '24px 32px' },
          body: { padding: '32px' },
          footer: { borderTop: '1px solid #f3f4f6', padding: '20px 32px' }
        }}
        footer={
          <div className="flex items-center justify-between">
            <Checkbox 
              checked={annotationForm.addNext}
              onChange={(e) => setAnnotationForm({ ...annotationForm, addNext: e.target.checked })}
              className="text-gray-500 text-sm font-bold"
            >
              继续添加下一个
            </Checkbox>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setIsAddAnnotationOpen(false)} 
                className="rounded-xl h-12 px-8 border-gray-200 text-gray-600 font-bold hover:text-primary-600 hover:border-primary-200 transition-all"
              >
                取消
              </Button>
              <Button 
                type="primary" 
                onClick={handleAddAnnotation} 
                className="rounded-xl h-12 px-10 font-bold bg-gradient-to-r from-primary-600 to-primary-500 border-none shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                确认添加
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-10">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100/50 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-blue-900">什么是标注回复？</p>
              <p className="text-[11px] text-blue-700/80 leading-relaxed">
                标注回复可以帮助 AI 更好地理解特定场景下的用户意图。当用户提问与标注问题相似度较高时，将优先使用标注回复。
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="group">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-focus-within:bg-primary-50 transition-all duration-300">
                  <User className="w-4 h-4 text-gray-400 group-focus-within:text-primary-600" />
                </div>
                <span className="text-sm font-bold text-gray-900">用户提问</span>
                <span className="text-[10px] text-gray-400 font-bold ml-auto bg-gray-50 px-2 py-0.5 rounded-full uppercase tracking-wider">必填</span>
              </div>
              <Input.TextArea 
                placeholder="输入用户可能提出的问题，例如：如何重置密码？"
                value={annotationForm.question}
                onChange={(e) => setAnnotationForm({ ...annotationForm, question: e.target.value })}
                autoSize={{ minRows: 4, maxRows: 8 }}
                className="rounded-2xl bg-gray-50/50 border-none focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all p-5 text-sm leading-relaxed"
              />
            </div>

            <div className="group">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-focus-within:bg-emerald-50 transition-all duration-300">
                  <Bot className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-gray-900">机器回复</span>
                <span className="text-[10px] text-gray-400 font-bold ml-auto bg-gray-50 px-2 py-0.5 rounded-full uppercase tracking-wider">必填</span>
              </div>
              <Input.TextArea 
                placeholder="输入 AI 应该给出的标准回复内容..."
                value={annotationForm.answer}
                onChange={(e) => setAnnotationForm({ ...annotationForm, answer: e.target.value })}
                autoSize={{ minRows: 8, maxRows: 16 }}
                className="rounded-2xl bg-gray-50/50 border-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all p-5 text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>
      </Drawer>


      <BatchImportModal 
        isOpen={isBatchImportOpen} 
        onClose={() => setIsBatchImportOpen(false)} 
        onImport={handleImport}
      />
      {/* Annotation Settings Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 py-1">
            <div className="w-11 h-11 rounded-2xl bg-primary-50 flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 leading-none mb-1.5">标注回复初始设置</div>
              <div className="text-xs text-gray-400 font-normal">配置标注匹配的精度与模型</div>
            </div>
          </div>
        }
        open={isAnnotationSettingsOpen}
        onCancel={() => setIsAnnotationSettingsOpen(false)}
        width={560}
        centered
        styles={{
          header: { borderBottom: '1px solid #f3f4f6', padding: '24px 32px' },
          body: { padding: '24px' },
          footer: { borderTop: '1px solid #f3f4f6', padding: '20px 32px' }
        }}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button 
              onClick={() => setIsAnnotationSettingsOpen(false)} 
              className="rounded-xl h-11 px-8 border-gray-200 text-gray-600 font-medium hover:text-primary-600 hover:border-primary-200"
            >
              取消
            </Button>
            <Button 
              type="primary" 
              onClick={() => {
                handleToggleAnnotationReply(true);
                setIsAnnotationSettingsOpen(false);
              }} 
              className="rounded-xl h-11 px-10 font-bold bg-gradient-to-r from-primary-600 to-primary-500 border-none shadow-lg shadow-primary-500/20"
            >
              {annotationReplyEnabled ? '保存' : '保存并启用'}
            </Button>
          </div>
        }
      >
        <div className="space-y-10">
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Target className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-sm font-bold text-gray-900">分数阈值</span>
                <Tooltip title="用于设置标注回复的匹配相似度阈值。">
                  <div className="w-4 h-4 rounded-full border border-gray-200 flex items-center justify-center text-[10px] text-gray-400 cursor-help hover:bg-gray-50 transition-colors">?</div>
                </Tooltip>
              </div>
              <div className="px-3 py-1 bg-primary-50 rounded-lg border border-primary-100">
                <span className="text-sm font-bold text-primary-600 font-mono">{annotationSettings.scoreThreshold.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="px-2">
              <Slider 
                min={0.8} 
                max={1.0} 
                step={0.01}
                value={annotationSettings.scoreThreshold}
                onChange={(value) => setAnnotationSettings({ ...annotationSettings, scoreThreshold: value })}
                tooltip={{ open: false }}
                className="custom-slider"
              />
              <div className="flex justify-between mt-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-emerald-600 mb-0.5">0.8</span>
                  <span className="text-[10px] text-gray-400">容易匹配</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-primary-600 mb-0.5">1.0</span>
                  <span className="text-[10px] text-gray-400">精准匹配</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm font-bold text-gray-900">Embedding 模型</span>
              <Tooltip title="标注文本向量化模型，切换模型会重新嵌入，产生额外费用消耗">
                <div className="w-4 h-4 rounded-full border border-gray-200 flex items-center justify-center text-[10px] text-gray-400 cursor-help hover:bg-gray-50 transition-colors">?</div>
              </Tooltip>
            </div>
            <ModelSelect
              className="w-full h-12"
              value={annotationSettings.embeddingModel}
              onChange={(model, provider) => setAnnotationSettings({ ...annotationSettings, embeddingModel: model, embeddingProvider: provider })}
              modelType={ModelTypeEnum.textEmbedding}
              disableFetchRules={true}
            />
          </section>
        </div>
      </Modal>
      
      {/* Annotation Detail Modal */}
      <Modal
        open={isAnnotationDetailOpen}
        onCancel={() => setIsAnnotationDetailOpen(false)}
        footer={null}
        width={800}
        centered
        closable={false}
        className="annotation-detail-modal"
        styles={{
          body: { padding: 0 }
        }}
      >
        <div className="flex flex-col h-[600px]">
          {/* Header with Tabs */}
          <div className="flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setAnnotationDetailTab('reply')}
                className={`py-4 text-base font-bold relative transition-colors ${annotationDetailTab === 'reply' ? 'text-gray-900 border-b-2 border-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                标注回复
              </button>
              <button 
                onClick={() => {
                  setAnnotationDetailTab('history');
                  if (selectedAnnotation) {
                    fetchHitHistory(selectedAnnotation.id);
                  }
                }}
                className={`py-4 text-base font-bold relative transition-colors ${annotationDetailTab === 'history' ? 'text-gray-900 border-b-2 border-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                命中历史
              </button>
            </div>
            <button 
              onClick={() => setIsAnnotationDetailOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {annotationDetailTab === 'reply' ? (
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">用户提问</span>
                  </div>
                  <div className="pl-11 pr-4">
                    {editingField === 'question' ? (
                      <div className="space-y-3">
                        <Input.TextArea 
                          value={editForm.question}
                          onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                          autoSize={{ minRows: 2, maxRows: 6 }}
                          className="rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all p-3 text-sm leading-relaxed"
                        />
                        <div className="flex items-center gap-2">
                          <Button type="primary" size="small" onClick={handleInlineSave} className="rounded-lg">保存</Button>
                          <Button size="small" onClick={() => setEditingField(null)} className="rounded-lg border-gray-200">取消</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 leading-relaxed mb-2">
                          {selectedAnnotation?.question || '你好'}
                        </div>
                        <button 
                          onClick={() => {
                            setEditForm({ question: selectedAnnotation?.question || '', answer: selectedAnnotation?.answer || '' });
                            setEditingField('question');
                          }}
                          className="flex items-center gap-1.5 text-xs text-primary-600 font-bold hover:text-primary-700 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          编辑
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">机器回复</span>
                  </div>
                  <div className="pl-11 pr-4">
                    {editingField === 'answer' ? (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                          &gt; {selectedAnnotation?.answer}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Edit3 className="w-3.5 h-3.5" />
                          您的回复
                        </div>
                        <Input.TextArea 
                          value={editForm.answer}
                          onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                          autoSize={{ minRows: 4, maxRows: 10 }}
                          placeholder="在这里输入您的回复"
                          className="rounded-xl bg-white border-gray-200 focus:ring-2 focus:ring-primary-500/20 transition-all p-3 text-sm leading-relaxed"
                        />
                        <div className="flex items-center gap-2">
                          <Button type="primary" size="small" onClick={handleInlineSave} className="rounded-lg">保存</Button>
                          <Button size="small" onClick={() => setEditingField(null)} className="rounded-lg border-gray-200">取消</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 leading-relaxed mb-2 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                          <Markdown>{selectedAnnotation?.answer || '您好！我是由中国深度求索（DeepSeek）公司开发的智能助手DeepSeek-R1。有关模型和产品的详细内容请参考官方文档。'}</Markdown>
                        </div>
                        <button 
                          onClick={() => {
                            setEditForm({ question: selectedAnnotation?.question || '', answer: selectedAnnotation?.answer || '' });
                            setEditingField('answer');
                          }}
                          className="flex items-center gap-1.5 text-xs text-primary-600 font-bold hover:text-primary-700 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          编辑
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                {hitHistory.length > 0 ? (
                  <div className="w-full h-full overflow-auto space-y-4">
                    {hitHistory.map((hit, index) => (
                      <div key={hit.id || index} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {dayjs(hit.created_at * 1000).format('YYYY-MM-DD HH:mm:ss')}
                          </span>
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">
                            Score: {hit.score?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs font-bold text-gray-500 mb-1 block">匹配问题</span>
                            <p className="text-sm text-gray-900">{hit.match || hit.question}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 mb-1 block">实际回复</span>
                            <p className="text-sm text-gray-600 line-clamp-3">{hit.response}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50/50 rounded-3xl p-12 flex flex-col items-center gap-4 border border-dashed border-gray-200 w-full max-w-lg">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
                      <History className="w-7 h-7 text-gray-300" />
                    </div>
                    <span className="text-sm text-gray-400 font-medium">没有命中历史</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between shrink-0">
            <button 
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 font-medium transition-colors group"
              onClick={() => {
                if (selectedAnnotation) {
                  handleRemoveAnnotation(selectedAnnotation.id);
                  setIsAnnotationDetailOpen(false);
                }
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center group-hover:border-red-100 group-hover:bg-red-50 transition-all">
                <Trash2 className="w-4 h-4" />
              </div>
              删除此标注
            </button>
            <div className="text-xs text-gray-400 font-medium">
              创建于 {selectedAnnotation ? dayjs(selectedAnnotation.created_at * 1000).format('YYYY-MM-DD HH:mm:ss') : 'Invalid Date'}
            </div>
          </div>
        </div>
      </Modal>

      {/* Log Detail Drawer */}
      <Drawer
        placement="right"
        onClose={() => setIsDetailOpen(false)}
        open={isDetailOpen}
        size="large"
        closable={false}
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col h-full bg-gray-50">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">对话 ID</span>
              <span className="text-sm font-mono text-gray-600 truncate max-w-[200px]">{selectedLog?.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <Bot className="w-4 h-4 text-primary-500" />
                <span className="text-xs font-medium text-gray-700">
                  {typeof selectedLog?.model_config.model === 'object' && selectedLog?.model_config.model !== null
                    ? (selectedLog?.model_config.model as any).name 
                    : (selectedLog?.model_config.model || 'deepseek-r1:14b')}
                </span>
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded uppercase">Chat</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs font-medium text-gray-700">Custom</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
              </div>
            ) : messages.length > 0 ? (
              messages.map((msg) => (
                <div key={msg.id} className="space-y-6">
                  {/* User Message */}
                  <div className="flex justify-end items-start gap-4">
                    <div className="max-w-[80%] bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-sm relative group">
                      <p className="text-sm leading-relaxed">{(msg as any).annotation?.question || msg.query}</p>
                      {(msg as any).annotation?.question && (
                        <div className="absolute -left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] bg-blue-500/20 text-blue-100 px-1.5 py-0.5 rounded border border-blue-400/30">已修改</span>
                        </div>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>

                  {/* Bot Message */}
                  <div className="flex justify-start items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <Bot className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="max-w-[85%] space-y-3">
                      {/* Thinking Process */}
                      {msg.agent_thoughts && msg.agent_thoughts.length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">思考过程</span>
                          </div>
                          <div className="text-sm text-gray-600 italic leading-relaxed">
                            {msg.agent_thoughts[0].thought}
                          </div>
                        </div>
                      )}
                      
                      {/* Answer */}
                      <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${ (msg as any).annotation ? 'border-blue-200 ring-4 ring-blue-500/5' : 'border-gray-100' }`}>
                        <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                          <Markdown>{(msg as any).annotation?.answer || msg.answer}</Markdown>
                        </div>

                        {(msg as any).annotation && (
                          <div className="mt-4 pt-3 border-t border-blue-50 flex items-center gap-2 text-[10px] text-blue-400 font-medium italic">
                            <Edit3 className="w-3 h-3" />
                            <span>{(msg as any).annotation.account?.name || '管理员'} 编辑的标注回复</span>
                          </div>
                        )}
                        
                        {/* Message Footer */}
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => handleFeedback(msg.id, msg.feedback?.rating === 'like' ? null : 'like')}
                              className={`flex items-center gap-1 transition-colors ${msg.feedback?.rating === 'like' ? 'text-emerald-500' : 'text-gray-400 hover:text-emerald-500'}`}
                            >
                              <span className="text-xs">👍 有用</span>
                            </button>
                            <button 
                              onClick={() => handleFeedback(msg.id, msg.feedback?.rating === 'dislike' ? null : 'dislike')}
                              className={`flex items-center gap-1 transition-colors ${msg.feedback?.rating === 'dislike' ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                            >
                              <span className="text-xs">👎 没用</span>
                            </button>
                            
                            <Dropdown
                              trigger={['click']}
                              dropdownRender={() => {
                                const annotation = (msg as any).annotation;
                                return (
                                  <div className="bg-white p-5 rounded-2xl shadow-2xl border border-gray-100 w-[400px]">
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="text-sm font-bold text-gray-900">编辑标注回复</div>
                                      {annotation && (
                                        <button 
                                          onClick={() => handleRemoveAnnotation(annotation.id)}
                                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 bg-red-50 rounded-lg transition-colors"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                          移除此标注
                                        </button>
                                      )}
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">用户提问</div>
                                        <Input.TextArea 
                                          id={`q-${msg.id}`}
                                          defaultValue={annotation?.question || msg.query}
                                          placeholder="输入提问标注"
                                          autoSize={{ minRows: 2 }}
                                          className="text-sm rounded-xl bg-gray-50 border-none focus:bg-white"
                                        />
                                      </div>
                                      
                                      <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">机器回复</div>
                                        <Input.TextArea 
                                          id={`a-${msg.id}`}
                                          defaultValue={annotation?.answer || msg.answer}
                                          placeholder="输入回复标注"
                                          autoSize={{ minRows: 4 }}
                                          className="text-sm rounded-xl bg-gray-50 border-none focus:bg-white"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex justify-end gap-2 mt-5">
                                      <Button size="small" className="rounded-lg text-xs">取消</Button>
                                      <Button 
                                        size="small" 
                                        type="primary" 
                                        className="rounded-lg text-xs px-4"
                                        onClick={() => {
                                          const q = (document.getElementById(`q-${msg.id}`) as HTMLTextAreaElement).value;
                                          const a = (document.getElementById(`a-${msg.id}`) as HTMLTextAreaElement).value;
                                          handleUpdateAnnotation(msg.id, q, a);
                                        }}
                                      >
                                        保存
                                      </Button>
                                    </div>
                                  </div>
                                );
                              }}
                            >
                              <button className={`flex items-center gap-1 transition-colors ${(msg as any).annotation ? 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg' : 'text-gray-400 hover:text-blue-500'}`}>
                                <span className="text-xs">{(msg as any).annotation ? '✅ 已标注' : '📝 标注'}</span>
                                {(msg as any).annotation && <ChevronDown className="w-3 h-3" />}
                              </button>
                            </Dropdown>
                          </div>
                          <span className="text-[10px] text-gray-300 font-mono">
                            {dayjs(msg.created_at).format('HH:mm:ss')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
                <p>暂无对话记录</p>
              </div>
            )}
          </div>
        </div>
      </Drawer>

      {/* Workflow Detail Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2 text-gray-800">
            <span className="font-semibold text-base">工作流日志详情</span>
            {selectedWorkflowLog && !selectedWorkflowLog.read_at && (
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            )}
            {selectedWorkflowLog && (
              <span className="text-xs text-gray-400 font-normal">
                {dayjs(selectedWorkflowLog.created_at * 1000).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            )}
          </div>
        }
        placement="right"
        size={800}
        onClose={() => setIsWorkflowDetailOpen(false)}
        open={isWorkflowDetailOpen}
        closeIcon={<X className="w-5 h-5 text-gray-400 hover:text-gray-600" />}
        styles={{
          header: { borderBottom: '1px solid #f3f4f6', padding: '16px 24px' },
          body: { padding: 0, display: 'flex', flexDirection: 'column', background: '#f9fafb' }
        }}
      >
        <div className="flex flex-col h-full">
          {/* Tabs */}
          <div className="flex items-center gap-6 px-6 pt-4 bg-white border-b border-gray-100">
            {[
              { id: 'result', label: '结果' },
              { id: 'detail', label: '详情' },
              { id: 'tracing', label: '追踪' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setWorkflowDetailTab(tab.id as any)}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  workflowDetailTab === tab.id 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {workflowDetailTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {workflowRunDetailLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : workflowRunDetail ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                {workflowDetailTab === 'result' && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <Editor
                      height="500px"
                      defaultLanguage="json"
                      theme="light"
                      value={JSON.stringify(workflowRunDetail.outputs || {}, null, 2)}
                      options={{ 
                        readOnly: true, 
                        minimap: { enabled: false }, 
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        lineNumbers: 'on',
                        renderLineHighlight: 'none',
                        padding: { top: 16, bottom: 16 }
                      }}
                    />
                  </div>
                )}
                {workflowDetailTab === 'detail' && (
                  <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-700 font-bold text-lg uppercase">{workflowRunDetail.status}</span>
                      </div>
                      <div className="flex gap-8 text-sm">
                        <div>
                          <span className="text-emerald-600/60 block text-xs uppercase">运行时间</span>
                          <span className="font-medium text-emerald-900">{workflowRunDetail.elapsed_time ? `${workflowRunDetail.elapsed_time.toFixed(3)}s` : '-'}</span>
                        </div>
                        <div>
                          <span className="text-emerald-600/60 block text-xs uppercase">总 TOKEN 数</span>
                          <span className="font-medium text-emerald-900">{workflowRunDetail.total_tokens || 0} Tokens</span>
                        </div>
                      </div>
                    </div>

                    {/* Input/Output */}
                    <div className="space-y-4">
                      <CodeBlock title="输入" content={JSON.stringify(workflowRunDetail.inputs || {}, null, 2)} />
                      <CodeBlock title="输出" content={JSON.stringify(workflowRunDetail.outputs || {}, null, 2)} />
                    </div>

                    {/* Metadata */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">元数据</div>
                      <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div>
                          <span className="text-gray-500">状态</span>
                          <span className="font-medium ml-2">{workflowRunDetail.status}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">执行人</span>
                          <span className="font-medium ml-2 text-xs font-mono">
                            {workflowRunDetail.created_by_account?.name || workflowRunDetail.created_by_end_user?.session_id || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">开始时间</span>
                          <span className="font-medium ml-2">{workflowRunDetail.created_at ? dayjs(workflowRunDetail.created_at * 1000).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">运行时间</span>
                          <span className="font-medium ml-2">{workflowRunDetail.elapsed_time ? `${workflowRunDetail.elapsed_time.toFixed(3)}s` : '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">总 token 数</span>
                          <span className="font-medium ml-2">{workflowRunDetail.total_tokens || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">运行步骤</span>
                          <span className="font-medium ml-2">{workflowRunDetail.total_steps || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {workflowDetailTab === 'tracing' && (
                  <div className="space-y-4">
                    {workflowTracingList && workflowTracingList.length > 0 ? (
  [...workflowTracingList].reverse().map((trace, index) => (
    <TracingNode key={trace.id || index} trace={trace} index={index} />
  ))
) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                        <p>暂无追踪记录</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p>暂无详情数据</p>
              </div>
            )}
          </div>
        </div>
      </Drawer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-table .ant-table {
          background: transparent;
        }
        .custom-table .ant-table-thead > tr > th {
          background: #f9fafb;
          color: #6b7280;
          font-size: 12px;
          font-weight: 500;
          border-bottom: none;
          padding: 12px 16px;
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3f4f6;
          padding: 16px;
          font-size: 13px;
        }
        .custom-table .ant-table-tbody > tr:hover > td,
        .custom-table .ant-table-tbody > tr.selected-row > td {
          background: #f9fafb !important;
        }
        .custom-pagination .ant-pagination-item {
          border: none;
          background: transparent;
          border-radius: 8px;
        }
        .custom-pagination .ant-pagination-item-active {
          background: #eff6ff;
        }
        .custom-pagination .ant-pagination-item-active a {
          color: #2563eb;
        }
      `}} />
    </div>
  );
};

export default LogsPage;
