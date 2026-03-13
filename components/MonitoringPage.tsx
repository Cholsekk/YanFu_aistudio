import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
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

const data = [
  { name: '00:00', value: 0 },
  { name: '04:00', value: 50 },
  { name: '08:00', value: 150 },
  { name: '12:00', value: 300 },
  { name: '16:00', value: 200 },
  { name: '20:00', value: 100 },
  { name: '23:59', value: 0 },
];

const MetricCard = ({ title, value, unit, chartData, colorClass }: { title: string, value: string | number, unit?: string, chartData?: any[], colorClass?: string }) => (
  <div className={`bg-white p-6 rounded-2xl border-l-4 ${colorClass || 'border-indigo-500'} shadow-sm hover:shadow-md transition-all`}>
    <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
      {title}
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
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={false} />
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
  const publicUrl = "http://192.168.1.201:3005/chat/OteKTo7RRG0OSva7";

  const handleRangeChange = (start: string, end: string) => {
    console.log(`Triggering analysis APIs for app ${app.id} with: start=${start}, end=${end}`);
    // TODO: Implement API calls here
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">运行中</span>
              <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-2">公开访问 URL</div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <code className="text-sm text-gray-700 flex-1 truncate">{publicUrl}</code>
            <button className="p-1.5 hover:bg-gray-200 rounded relative group" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">复制</span>
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><RefreshCw className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setIsEmbedModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 text-gray-900"><LayoutGrid className="w-4 h-4" /> 嵌入</button>
            <button onClick={() => setIsSettingsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 text-gray-900"><Settings className="w-4 h-4" /> 设置</button>
          </div>
        </div>

        <EmbedModal isOpen={isEmbedModalOpen} onClose={() => setIsEmbedModalOpen(false)} publicUrl={publicUrl} />
        <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />

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
              <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">运行中</span>
              <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-2">API 访问凭据</div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <code className="text-sm text-gray-700 flex-1 truncate">http://192.168.1.201:5005/v1</code>
            <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><Copy className="w-4 h-4" /></button>
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
        <MetricCard title="全部会话数" value="0" chartData={data} colorClass="border-blue-500" />
        <MetricCard title="活跃用户数" value="0" chartData={data} colorClass="border-purple-500" />
        <MetricCard title="平均会话互动数" value="0" chartData={data} colorClass="border-green-500" />
        <MetricCard title="Token 输出速度" value="0" unit="Token/秒" chartData={data} colorClass="border-yellow-500" />
        <MetricCard title="用户满意度" value="0" chartData={data} colorClass="border-red-500" />
        <MetricCard title="费用消耗" value="0" unit="耗费 Tokens (~$0.0000)" chartData={data} colorClass="border-indigo-500" />
        <MetricCard title="全部消息数" value="0" chartData={data} colorClass="border-pink-500" />
      </div>
    </div>
  );
};

export default MonitoringPage;
