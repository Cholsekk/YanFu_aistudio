import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Copy, 
  RefreshCw, 
  Settings, 
  ExternalLink, 
  Key, 
  FileText, 
  Calendar,
  ChevronDown,
  LayoutGrid,
  Check,
  AlertCircle
} from 'lucide-react';
import { message, Modal } from 'antd';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import EmbedModal from './EmbedModal';
import SettingsModal from './SettingsModal';
import TimeRangeSelector from './TimeRangeSelector';
import { useAppDevHub } from '../context/AppContext';
import { monitoringService } from '../services/monitoringService';

const data = [
  { name: '00:00', value: 0 },
  { name: '04:00', value: 50 },
  { name: '08:00', value: 150 },
  { name: '12:00', value: 300 },
  { name: '16:00', value: 200 },
  { name: '20:00', value: 100 },
  { name: '23:59', value: 0 },
];

const getChartColor = (colorClass: string) => {
  switch (colorClass) {
    case 'border-blue-500': return '#3b82f6';
    case 'border-purple-500': return '#a855f7';
    case 'border-green-500': return '#22c55e';
    case 'border-orange-500': return '#f97316';
    case 'border-red-500': return '#ef4444';
    case 'border-indigo-500': return '#6366f1';
    case 'border-pink-500': return '#ec4899';
    default: return '#4f46e5';
  }
};

const MetricCard = ({ title, value, unit, chartData, colorClass, tooltip }: { title: string, value: string | number, unit?: string, chartData?: any[], colorClass?: string, tooltip?: string }) => (
  <div className={`bg-white p-6 rounded-2xl border-l-4 ${colorClass || 'border-indigo-500'} shadow-sm hover:shadow-md transition-all`}>
    <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
      {tooltip ? (
        <div className="relative group cursor-help">
          {title}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {tooltip}
          </div>
        </div>
      ) : (
        title
      )}
      <Activity className="w-4 h-4" />
    </div>
    <div className="text-3xl font-semibold text-gray-900 mb-4">
      {value}<span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
    </div>
    {chartData && (
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
              cursor={{ stroke: '#9ca3af', strokeWidth: 1 }}
            />
            <Line type="monotone" dataKey="value" stroke={getChartColor(colorClass || 'border-indigo-500')} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

const MonitoringPage = () => {
  const app = useAppDevHub();
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiCopied, setApiCopied] = useState(false);
  const [isServiceRunning, setIsServiceRunning] = useState(true);
  const [isApiRunning, setIsApiRunning] = useState(true);
  const [metrics, setMetrics] = useState({
    dailyMessages: 0,
    dailyConversations: 0,
    dailyEndUsers: 0,
    tokenCosts: 0,
    averageInteractions: 0,
    tps: 0,
    satisfactionRate: 0,
  });
  const [appDetail, setAppDetail] = useState<any>(null);

  useEffect(() => {
    const fetchAppDetail = async () => {
      try {
        const detail = await monitoringService.getAppDetail(app.id);
        setAppDetail(detail);
      } catch (error) {
        console.error('Failed to fetch app detail:', error);
      }
    };
    fetchAppDetail();
  }, [app.id]);

  const appMode = appDetail ? ((appDetail.mode !== 'completion' && appDetail.mode !== 'workflow') ? 'chat' : appDetail.mode) : 'chat';
  const publicUrl = appDetail?.site?.app_base_url ? `${appDetail.site.app_base_url}/${appMode}/${appDetail.site.code}` : "";
  const apiUrl = appDetail?.api_base_url || "";

  const fetchData = async (start?: string, end?: string) => {
    try {
      const [messages, conversations, users, costs, interactions, tps, satisfaction] = await Promise.all([
        monitoringService.getDailyMessages(app.id, start, end),
        monitoringService.getDailyConversations(app.id, start, end),
        monitoringService.getDailyEndUsers(app.id, start, end),
        monitoringService.getTokenCosts(app.id, start, end),
        monitoringService.getAverageSessionInteractions(app.id, start, end),
        monitoringService.getTokensPerSecond(app.id, start, end),
        monitoringService.getUserSatisfactionRate(app.id, start, end),
      ]);
      
      setMetrics({
        dailyMessages: messages.data.reduce((acc, curr) => acc + curr.message_count, 0),
        dailyConversations: conversations.data.reduce((acc, curr) => acc + curr.conversation_count, 0),
        dailyEndUsers: users.data.reduce((acc, curr) => acc + curr.terminal_count, 0),
        tokenCosts: costs.data.reduce((acc, curr) => acc + curr.token_count, 0),
        averageInteractions: interactions.data.reduce((acc, curr) => acc + (curr.interactions || 0), 0) / (interactions.data.length || 1),
        tps: tps.data.reduce((acc, curr) => acc + (curr.tps || 0), 0) / (tps.data.length || 1),
        satisfactionRate: satisfaction.data.reduce((acc, curr) => acc + (curr.rate || 0), 0) / (satisfaction.data.length || 1),
      });
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatDate = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const hh = pad(date.getHours());
        const min = pad(date.getMinutes());
        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    };

    fetchData(formatDate(start), formatDate(end));
  }, [app.id]);

  const handleRangeChange = (start: string, end: string) => {
    fetchData(start, end);
  };

  const handleCopy = (text: string, setCopiedState: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const handleRefreshUrl = () => {
    Modal.confirm({
      title: '重新生成',
      content: '您是否要重新生成公开访问 URL？',
      okText: '确认',
      cancelText: '取消',
      icon: <AlertCircle className="text-orange-500" />,
      onOk: async () => {
        try {
          await monitoringService.updateAppSiteAccessToken(app.id);
          message.success('已重新生成');
          monitoringService.getAppDetail(app.id).then(setAppDetail);
        } catch (err) {
          message.error('重新生成失败');
        }
      }
    });
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">监测</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
          <LayoutGrid className="w-4 h-4" />
          追踪应用性能
        </button>
      </div>

      {/* Service Info Cards */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">言复助手</h3>
                <p className="text-sm text-gray-500">开箱即用的 AI WebApp</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isServiceRunning ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-100'} px-2 py-1 rounded`}>
                {isServiceRunning ? '运行中' : '已停用'}
              </span>
              <button 
                onClick={() => setIsServiceRunning(!isServiceRunning)}
                className={`w-10 h-5 rounded-full relative transition-colors ${isServiceRunning ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isServiceRunning ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-2">公开访问 URL</div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <code className="text-sm text-gray-700 flex-1 truncate">{publicUrl}</code>
            <button className="p-1.5 hover:bg-gray-200 rounded relative group" onClick={() => handleCopy(publicUrl, setCopied)}>
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">复制</span>
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500 group relative" onClick={handleRefreshUrl}>
              <RefreshCw className="w-4 h-4" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">重新生成</span>
            </button>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setIsEmbedModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 text-gray-900"><LayoutGrid className="w-4 h-4" /> 嵌入</button>
            <button onClick={() => setIsSettingsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 text-gray-900"><Settings className="w-4 h-4" /> 设置</button>
          </div>
        </div>

        <EmbedModal isOpen={isEmbedModalOpen} onClose={() => setIsEmbedModalOpen(false)} publicUrl={publicUrl} />
        {appDetail && (
          <SettingsModal 
            isOpen={isSettingsModalOpen} 
            onClose={() => setIsSettingsModalOpen(false)} 
            app={appDetail}
            onUpdate={() => {
              // Refresh app detail
              monitoringService.getAppDetail(app.id).then(setAppDetail);
            }}
          />
        )}

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">后端服务 API</h3>
                <p className="text-sm text-gray-500">可集成至你的应用的后端即服务</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isApiRunning ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-100'} px-2 py-1 rounded`}>
                {isApiRunning ? '运行中' : '已停用'}
              </span>
              <button 
                onClick={() => setIsApiRunning(!isApiRunning)}
                className={`w-10 h-5 rounded-full relative transition-colors ${isApiRunning ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isApiRunning ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-2">API 访问凭据</div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <code className="text-sm text-gray-700 flex-1 truncate">{apiUrl}</code>
            <button className="p-1.5 hover:bg-gray-200 rounded relative group" onClick={() => handleCopy(apiUrl, setApiCopied)}>
              {apiCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">复制</span>
            </button>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 text-gray-900"><Key className="w-4 h-4" /> API 密钥</button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 text-gray-900"><FileText className="w-4 h-4" /> 查阅 API 文档</button>
          </div>
        </div>
      </div>

      {/* Analysis */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">分析</h2>
        <TimeRangeSelector onRangeChange={handleRangeChange} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <MetricCard title="全部会话数" value={metrics.dailyConversations} chartData={data} colorClass="border-blue-500" tooltip="反映 AI 每天的会话总次数，提示词编排和调试的消息不计入。" />
        <MetricCard title="活跃用户数" value={metrics.dailyEndUsers} chartData={data} colorClass="border-purple-500" tooltip="与 AI 有效互动，即有一问一答以上的唯一用户数。提示词编排和调试的会话不计入。" />
        <MetricCard title="平均会话互动数" value={metrics.averageInteractions.toFixed(1)} chartData={data} colorClass="border-green-500" tooltip="反应每个会话用户的持续沟通次数，如果用户与 AI 问答了 10 轮，即为 10。该指标反映了用户粘性。仅在对话型应用提供。" />
        <MetricCard title="Token 输出速度" value={metrics.tps.toFixed(1)} unit="Token/秒" chartData={data} colorClass="border-orange-500" tooltip="衡量 LLM 的性能。统计 LLM 从请求开始到输出完毕这段期间的 Tokens 输出速度。" />
        <MetricCard title="用户满意度" value={`${(metrics.satisfactionRate * 100).toFixed(1)}%`} chartData={data} colorClass="border-red-500" tooltip="每 1000 条消息的点赞数。反应了用户对回答十分满意的比例。" />
        <MetricCard title="费用消耗" value={metrics.tokenCosts} unit="Tokens" chartData={data} colorClass="border-indigo-500" tooltip="反映每日该应用请求语言模型的 Tokens 花费，用于成本控制。" />
        <MetricCard title="全部消息数" value={metrics.dailyMessages} chartData={data} colorClass="border-pink-500" tooltip="反映 AI 每天的互动总次数，每回答用户一个问题算一条 Message。" />
      </div>
    </div>
  );
};

export default MonitoringPage;
