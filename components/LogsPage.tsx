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
  ArrowUp,
  ArrowDown,
  Edit3,
  RefreshCw,
  Trash2
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
  Pagination
} from 'antd';
import { useAppDevHub } from '../context/AppContext';
import { monitoringService } from '../services/monitoringService';
import { LogItem, LogQuery, Message } from '../types';
import dayjs from 'dayjs';
import TimeRangeSelector from './TimeRangeSelector';
import Markdown from 'react-markdown';

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
  const [annotationForm, setAnnotationForm] = useState({
    question: '',
    answer: '',
    addNext: false
  });

  // Logs state
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [annotations, setAnnotations] = useState<LogItem[]>([]);
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

  // Detail state
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange('keyword', searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const fetchAnnotations = async (query: LogQuery & { period: string | number }) => {
    if (!app?.id) return;
    setLoading(true);
    try {
      const apiQuery: any = {
        ...query,
        annotated: true,
        ...(query.period !== 'all' && typeof query.period === 'number'
          ? {
            start: dayjs().subtract(query.period, 'day').startOf('day').format('YYYY-MM-DD HH:mm'),
            end: dayjs().endOf('day').format('YYYY-MM-DD HH:mm'),
          }
          : {}),
      };
      // For now, we use the same getLogs but with a filter or mock
      const response = await monitoringService.getLogs(app.id, apiQuery);
      if (response && response.data) {
        // Filter for annotated items if the API doesn't support it yet
        const annotatedData = response.data.filter(item => item.annotated || item.id.startsWith('mock-ann'));
        setAnnotations(annotatedData);
        setTotal(annotatedData.length);
      } else {
        setAnnotations([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch annotations:', error);
      setAnnotations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

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
      // Update local state if needed
      fetchMessages(selectedLog?.id || '');
    } catch (error) {
      console.error('Failed to update annotation:', error);
      message.error('标注失败');
    }
  };

  const handleRemoveAnnotation = async (messageId: string) => {
    if (!app?.id) return;
    try {
      await monitoringService.deleteLogMessageAnnotation(app.id, messageId);
      message.success('移除标注成功');
      fetchMessages(selectedLog?.id || '');
    } catch (error) {
      console.error('Failed to remove annotation:', error);
      message.error('移除标注失败');
    }
  };

  const handleRowClick = (record: LogItem) => {
    setSelectedLog(record);
    setIsDetailOpen(true);
    fetchMessages(record.id);
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
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <span className="text-gray-400 text-xs">
          {dayjs(date).format('YYYY-MM-DD HH:mm:ss')}
        </span>
      ),
    },
  ];

  const handleAddAnnotation = () => {
    if (!annotationForm.question || !annotationForm.answer) {
      message.warning('请填写完整信息');
      return;
    }
    message.success('添加成功');
    if (annotationForm.addNext) {
      setAnnotationForm({ ...annotationForm, question: '', answer: '' });
    } else {
      setIsAddAnnotationOpen(false);
      setAnnotationForm({ question: '', answer: '', addNext: false });
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'import',
      label: '批量导入',
      icon: <Upload className="w-4 h-4" />,
    },
    {
      key: 'export',
      label: '批量导出',
      icon: <Download className="w-4 h-4" />,
      children: [
        { key: 'export-csv', label: '导出为 CSV' },
        { key: 'export-json', label: '导出为 JSON' },
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
        <button 
          onClick={() => setActiveTab('annotations')}
          className={`pb-3 text-sm font-medium transition-all relative ${
            activeTab === 'annotations' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          标注
          {activeTab === 'annotations' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />}
        </button>
      </div>

      <div className="text-xs text-gray-400 mb-6">
        日志记录了应用的运行情况，包括用户的输入和 AI 的回复。
      </div>

      {/* Filters Area */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {activeTab === 'logs' && (
            <>
              <TimeRangeSelector 
                defaultPeriodValue={7}
                onRangeChange={(start, end, period) => {
                  setFilters(prev => ({ ...prev, start, end, period, page: 1 }));
                  setCurrentPage(1);
                }} 
              />
              
              <Dropdown
                trigger={['click']}
                popupRender={() => (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-48 z-50">
                    {STATUS_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange('status', option.value)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 ${filters.status === option.value ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                      >
                        <span>{option.label}{option.count !== undefined && ` (${option.count} 项)`}</span>
                        {filters.status === option.value && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              >
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  {STATUS_OPTIONS.find(o => o.value === filters.status)?.label || '全部'}
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </Dropdown>
            </>
          )}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder="搜索摘要或用户" 
              className="pl-9 pr-4 py-1.5 bg-gray-50 border border-transparent rounded-lg text-sm w-72 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {activeTab === 'logs' ? (
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
          ) : (
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">标注回复</span>
                <Switch size="small" defaultChecked className="bg-gray-300" />
              </div>
              <Button 
                type="primary" 
                icon={<Plus className="w-4 h-4" />}
                className="flex items-center gap-2 h-9 rounded-xl font-medium shadow-sm shadow-primary-500/20"
                onClick={() => setIsAddAnnotationOpen(true)}
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
              columns={columns} 
              dataSource={activeTab === 'logs' ? logs : annotations} 
              rowKey="id"
              pagination={false}
              loading={loading}
              className="custom-table"
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                className: `cursor-pointer transition-colors ${record.annotated ? 'bg-blue-50/30 hover:bg-blue-50/50' : ''}`
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
        title="添加标注回复"
        placement="right"
        onClose={() => setIsAddAnnotationOpen(false)}
        open={isAddAnnotationOpen}
        size="large"
        extra={
          <button onClick={() => setIsAddAnnotationOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        }
        closable={false}
        footer={
          <div className="flex items-center justify-between px-2 py-2">
            <Checkbox 
              checked={annotationForm.addNext} 
              onChange={e => setAnnotationForm({ ...annotationForm, addNext: e.target.checked })}
              className="text-sm text-gray-500"
            >
              添加下一个标注回复
            </Checkbox>
            <div className="flex gap-3">
              <Button onClick={() => setIsAddAnnotationOpen(false)} className="rounded-lg">取消</Button>
              <Button type="primary" onClick={handleAddAnnotation} className="rounded-lg">添加</Button>
            </div>
          </div>
        }
      >
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-grow">
              <div className="text-sm font-bold text-gray-900 mb-2">提问</div>
              <Input.TextArea 
                placeholder="输入提问" 
                autoSize={{ minRows: 3 }}
                className="border-none bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-xl p-3 text-sm"
                value={annotationForm.question}
                onChange={e => setAnnotationForm({ ...annotationForm, question: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-grow">
              <div className="text-sm font-bold text-gray-900 mb-2">回复</div>
              <Input.TextArea 
                placeholder="输入回复" 
                autoSize={{ minRows: 3 }}
                className="border-none bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-xl p-3 text-sm"
                value={annotationForm.answer}
                onChange={e => setAnnotationForm({ ...annotationForm, answer: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Drawer>

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
                                          onClick={() => handleRemoveAnnotation(msg.id)}
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
        .custom-table .ant-table-tbody > tr:hover > td {
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
