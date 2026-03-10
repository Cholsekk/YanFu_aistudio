import React from 'react';
import { 
  Cpu, Search, Bot, Split, Repeat, RefreshCw, 
  Code2, Layers, Braces, FileText, Variable, 
  Settings2, Globe, MessageSquare, Image as ImageIcon,
  Clock, BarChart3, BookOpen, TrendingUp, Terminal,
  PieChart, SearchCode, Mail, Calendar, Database,
  Plus, X, ChevronRight
} from 'lucide-react';

export interface NodeDefinition {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  category: string;
  description?: string;
}

export const NODE_CATEGORIES = [
  { id: 'basic', label: '基础' },
  { id: 'understanding', label: '问题理解' },
  { id: 'logic', label: '逻辑' },
  { id: 'transform', label: '转换' },
  { id: 'tool', label: '工具' },
];

export const NODE_DEFINITIONS: NodeDefinition[] = [
  // 基础
  { type: 'llm', label: 'LLM', icon: <Cpu className="w-4 h-4" />, color: 'bg-indigo-600', category: 'basic' },
  { type: 'knowledge', label: '知识检索', icon: <Search className="w-4 h-4" />, color: 'bg-emerald-600', category: 'basic' },
  { type: 'agent', label: 'Agent', icon: <Bot className="w-4 h-4" />, color: 'bg-violet-600', category: 'basic' },
  
  // 问题理解
  { type: 'classifier', label: '问题分类器', icon: <Split className="w-4 h-4" />, color: 'bg-emerald-500', category: 'understanding' },
  
  // 逻辑
  { type: 'condition', label: '条件分支', icon: <Split className="w-4 h-4" />, color: 'bg-cyan-600', category: 'logic' },
  { type: 'iteration', label: '迭代', icon: <RefreshCw className="w-4 h-4" />, color: 'bg-teal-600', category: 'logic' },
  { type: 'loop', label: '循环', icon: <Repeat className="w-4 h-4" />, color: 'bg-emerald-600', category: 'logic' },
  
  // 转换
  { type: 'code', label: '代码执行', icon: <Code2 className="w-4 h-4" />, color: 'bg-blue-600', category: 'transform' },
  { type: 'template', label: '模板转换', icon: <Layers className="w-4 h-4" />, color: 'bg-blue-500', category: 'transform' },
  { type: 'aggregator', label: '变量聚合器', icon: <Braces className="w-4 h-4" />, color: 'bg-violet-500', category: 'transform' },
  { type: 'extractor', label: '文档提取器', icon: <FileText className="w-4 h-4" />, color: 'bg-emerald-500', category: 'transform' },
  { type: 'assigner', label: '变量赋值', icon: <Variable className="w-4 h-4" />, color: 'bg-blue-400', category: 'transform' },
  { type: 'parameter', label: '参数提取器', icon: <Settings2 className="w-4 h-4" />, color: 'bg-indigo-400', category: 'transform' },
  
  // 工具
  { type: 'http', label: 'HTTP 请求', icon: <Globe className="w-4 h-4" />, color: 'bg-purple-600', category: 'tool' },
  { type: 'list', label: '列表操作', icon: <Layers className="w-4 h-4" />, color: 'bg-cyan-500', category: 'tool' },
];

export interface ToolDefinition {
  id: string;
  label: string;
  icon: React.ReactNode;
  provider: string;
  category: string;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  { id: 'google', label: 'Google', icon: <Globe className="w-4 h-4 text-blue-500" />, provider: 'Yanfu', category: 'search' },
  { id: 'bing', label: 'Bing', icon: <Globe className="w-4 h-4 text-cyan-500" />, provider: 'Yanfu', category: 'search' },
  { id: 'podcast', label: '播客生成器', icon: <MessageSquare className="w-4 h-4 text-indigo-500" />, provider: 'Yanfu', category: 'media' },
  { id: 'time', label: '时间', icon: <Clock className="w-4 h-4 text-orange-600" />, provider: 'Yanfu', category: 'utility' },
  { id: 'data_analysis', label: '数据分析', icon: <BarChart3 className="w-4 h-4 text-gray-800" />, provider: 'Yanfu', category: 'data' },
  { id: 'web_scraper', label: '网页抓取', icon: <Globe className="w-4 h-4 text-pink-600" />, provider: 'Yanfu', category: 'search' },
  { id: 'wikipedia', label: '维基百科', icon: <BookOpen className="w-4 h-4 text-gray-700" />, provider: 'Yanfu', category: 'knowledge' },
  { id: 'yahoo_finance', label: '雅虎财经', icon: <TrendingUp className="w-4 h-4 text-purple-700" />, provider: 'Yanfu', category: 'finance' },
  { id: 'code_interpreter', label: '代码解释器', icon: <Terminal className="w-4 h-4 text-gray-900" />, provider: 'Yanfu', category: 'dev' },
  { id: 'echarts', label: 'ECharts图表生成', icon: <PieChart className="w-4 h-4 text-red-600" />, provider: 'Yanfu', category: 'data' },
];
