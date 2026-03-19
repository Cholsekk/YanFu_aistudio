import React, { useState, useEffect } from 'react';
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
  History
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
  Tooltip,
  Upload as AntUpload
} from 'antd';
import { useAppDevHub } from '../context/AppContext';
import { monitoringService } from '../services/monitoringService';
import { apiService } from '../services/apiService';
import { LogItem, LogQuery, Message, AnnotationEnableStatus, EmbeddingModelConfig, AnnotationItem, AnnotationItemBasic, ModelTypeEnum } from '../types';
import dayjs from 'dayjs';
import TimeRangeSelector from './TimeRangeSelector';
import Markdown from 'react-markdown';
import ModelSelect from './ModelSelect';

const { Dragger } = AntUpload;

const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '已标注改进', value: 'annotated', count: 0 },
  { label: '未标注', value: 'not_annotated' },
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
  const [importFile, setImportFile] = useState<File | null>(null);
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
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await monitoringService.importAnnotations(app.id, formData as any);
      if (response && response.job_id) {
        message.success('导入任务已启动');
        checkImportStatus(response.job_id);
        setIsBatchImportOpen(false);
        setImportFile(null);
      }
    } catch (error) {
      console.error('Failed to import annotations:', error);
      message.error('导入失败');
    } finally {
      setLoading(false);
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

  const downloadTemplate = (lang: 'en' | 'zh') => {
    const CSV_TEMPLATE_QA_EN = [
      ['question', 'answer'],
      ['question1', 'answer1'],
      ['question2', 'answer2'],
    ];
    const CSV_TEMPLATE_QA_CN = [
      ['问题', '答案'],
      ['问题 1', '答案 1'],
      ['问题 2', '答案 2'],
    ];
    const template = lang === 'en' ? CSV_TEMPLATE_QA_EN : CSV_TEMPLATE_QA_CN;
    const csvContent = template.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = lang === 'en' ? 'template-en-US.csv' : 'template-zh-Hans.csv';
    link.click();
  };

  const handleExport = async () => {
    if (!app?.id) return;
    try {
      const response = await monitoringService.exportAnnotations(app.id);
      if (response && response.job_id) {
        message.success('导出任务已启动');
        checkExportStatus(response.job_id);
      }
    } catch (error) {
      console.error('Failed to export annotations:', error);
      message.error('导出失败');
    }
  };

  const checkExportStatus = async (jobId: string) => {
    if (!app?.id) return;
    try {
      const status = await monitoringService.getAnnotationJobStatus(app.id, jobId);
      if (status.job_status === 'completed') {
        message.success('导出成功');
      } else if (status.job_status === 'waiting' || status.job_status === 'processing') {
        setTimeout(() => checkExportStatus(jobId), 3000);
      }
    } catch (error) {
      console.error('Failed to check export status:', error);
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
      if (isChatMode) {
        response = await monitoringService.getChatConversations(app.id, apiQuery);
      } else {
        response = await monitoringService.getCompletionConversations(app.id, apiQuery);
      }

      if (response && response.data) {
        const mappedData = response.data.map((item: any) => ({
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
    if (app?.id) {
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
  }, [app?.id]);

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

  const handleExportCSV = () => {
    const dataToExport = activeTab === 'logs' ? logs : annotations;
    if (dataToExport.length === 0) {
      message.warning('没有数据可导出');
      return;
    }

    // CSV headers: question, answer
    const headers = ['question', 'answer'];
    const rows = dataToExport.map(item => [
      item.summary || '', // Using summary as question for now
      item.annotated ? '已标注' : '未标注'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `annotations_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    link.click();
  };

  const handleExportJSONL = () => {
    const dataToExport = activeTab === 'logs' ? logs : annotations;
    if (dataToExport.length === 0) {
      message.warning('没有数据可导出');
      return;
    }

    const jsonlContent = dataToExport.map(item => JSON.stringify(item)).join('\n');
    const blob = new Blob([jsonlContent], { type: 'application/x-jsonlines' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `annotations_${dayjs().format('YYYYMMDD_HHmmss')}.jsonl`;
    link.click();
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
      onClick: handleExport
    },
    {
      type: 'divider'
    },
    {
      key: 'export-formats',
      label: '导出格式',
      icon: <Download className="w-4 h-4" />,
      children: [
        { 
          key: 'export-csv', 
          label: '导出为 CSV',
          onClick: handleExportCSV
        },
        { 
          key: 'export-jsonl', 
          label: '导出为 JSONL',
          onClick: handleExportJSONL
        },
      ]
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* ... (rest of the component) */}
      
      {/* Batch Import Modal */}
      <Modal
        title="批量导入"
        open={isBatchImportOpen}
        onCancel={() => { setIsBatchImportOpen(false); setImportFile(null); }}
        footer={null}
        width={600}
        centered
      >
        <div className="p-4">
          {!importFile ? (
            <Dragger
              name="file"
              multiple={false}
              showUploadList={false}
              beforeUpload={(file) => {
                setImportFile(file);
                return false;
              }}
              className="p-8 border-dashed border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
            >
              <p className="ant-upload-drag-icon">
                <Upload className="w-10 h-10 text-primary-500 mx-auto" />
              </p>
              <p className="ant-upload-text">将您的 CSV 文件拖放到此处，或<span className="text-primary-600">选择文件</span></p>
            </Dragger>
          ) : (
            <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xs">CSV</span>
                </div>
                <span className="font-medium text-gray-700">{importFile.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button type="link" onClick={() => document.getElementById('file-input')?.click()}>更改文件</Button>
                <Button type="link" danger onClick={() => setImportFile(null)}><Trash2 className="w-4 h-4" /></Button>
              </div>
              <input type="file" id="file-input" className="hidden" onChange={(e) => e.target.files?.[0] && setImportFile(e.target.files[0])} />
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-500">
            <p>CSV 文件必须符合以下结构：</p>
            <Table 
              size="small" 
              pagination={false} 
              dataSource={[
                { key: '1', q: '问题', a: '回答' },
                { key: '2', q: '问题 1', a: '回答 1' },
                { key: '3', q: '问题 2', a: '回答 2' },
              ]}
              columns={[
                { title: '问题', dataIndex: 'q', key: 'q' },
                { title: '回答', dataIndex: 'a', key: 'a' },
              ]}
              className="mt-2 border border-gray-100 rounded-lg"
            />
            <div className="mt-4 flex gap-4">
              <Button type="link" onClick={() => downloadTemplate('en')} className="p-0 h-auto text-xs">↓ 下载英文模版</Button>
              <Button type="link" onClick={() => downloadTemplate('zh')} className="p-0 h-auto text-xs">↓ 下载中文模版</Button>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <Button onClick={() => { setIsBatchImportOpen(false); setImportFile(null); }}>取消</Button>
            <Button type="primary" onClick={() => importFile && handleImport(importFile)} disabled={!importFile} loading={loading}>导入</Button>
          </div>
        </div>
      </Modal>

      {/* ... (rest of the component) */}
    </div>
  );
};

export default LogsPage;
