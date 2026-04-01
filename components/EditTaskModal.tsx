
import React, { useState, useEffect } from 'react';
import { ScheduledTask } from '../types';
import { apiService } from '../services/apiService';
import { Calendar, ChevronDown, XCircle, X, Save, Clock, Activity, Globe, Server, Code, FileJson, CheckCircle2, Search } from 'lucide-react';
import { DatePicker, ConfigProvider, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: ScheduledTask) => void;
  task: ScheduledTask | null;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, onSave, task }) => {
  const [formData, setFormData] = useState<Partial<ScheduledTask>>({});
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState(false);
  const [appList, setAppList] = useState<any[]>([]);
  const [appSearchTerm, setAppSearchTerm] = useState('');

  const [interval, setInterval] = useState({
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (isOpen) {
      fetchApps(1, false);
    }
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
      fetchApps(page + 1, true);
    }
  };

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchApps = async (pageNum: number = 1, append: boolean = false) => {
    if (loading || (!append && pageNum > 1)) return;
    setLoading(true);
    try {
      const response = await apiService.getApps({ built_in: false, limit: 100, page: pageNum });
      if (response && response.data) {
        setAppList(prev => append ? [...prev, ...response.data] : response.data);
        setHasMore(response.has_more || false);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Failed to fetch apps", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (task) {
      setFormData({ 
        ...task, 
        appType: task.appType || (task.app_id ? 'internal' : 'external'),
        request_body: task.request_body ? JSON.stringify(task.request_body, null, 2) : '' 
      });
      if (task.schedule_type === 'interval') {
        try {
          const totalSeconds = parseInt(task.schedule_expression) || 0;
          const weeks = Math.floor(totalSeconds / 604800);
          let remaining = totalSeconds % 604800;
          const days = Math.floor(remaining / 86400);
          remaining %= 86400;
          const hours = Math.floor(remaining / 3600);
          remaining %= 3600;
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          
          setInterval({ weeks, days, hours, minutes, seconds });
        } catch (e) {
          console.error("Failed to parse interval rule", e);
        }
      }
    }
  }, [task]);

  useEffect(() => {
    if (formData.schedule_type === 'interval') {
      const totalSeconds = 
        (interval.weeks || 0) * 604800 +
        (interval.days || 0) * 86400 +
        (interval.hours || 0) * 3600 +
        (interval.minutes || 0) * 60 +
        (interval.seconds || 0);
      setFormData(prev => ({ ...prev, schedule_expression: totalSeconds.toString() }));
    }
  }, [interval, formData.schedule_type]);

  const handleChange = (field: keyof ScheduledTask, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'appType' && value === 'external') {
        next.request_body = '';
      }
      return next;
    });
  };

  const handleAppSelect = async (app: any) => {
    setFormData(prev => ({
      ...prev,
      app_id: app.id,
      app_name: app.name,
      method: 'POST' // Auto-set method for internal apps
    }));
    setIsAppDropdownOpen(false);

    try {
      const appDetail = await apiService.fetchAppDetail(app.id);
      if (appDetail) {
        let endpoint = '';
        let requestBodyTemplate = {};
        const mode = appDetail.mode;
        
        if (['chat', 'advanced-chat', 'agent-chat'].includes(mode)) {
          endpoint = `/console/api/app_expand/${app.id}/chat-messages`;
          requestBodyTemplate = {
            query: "你好",
            conversation_id: "",
            inputs: {}
          };
        } else if (mode === 'completion') {
          endpoint = `/console/api/app_expand/${app.id}/completion-messages`;
          requestBodyTemplate = {
            query: "你好",
            inputs: {}
          };
        } else if (mode === 'workflow') {
          endpoint = `/console/api/app_expand/${app.id}/workflows/run`;
          requestBodyTemplate = {
            inputs: {}
          };
        }
        
        setFormData(prev => ({
          ...prev,
          api_endpoint: endpoint,
          request_body: JSON.stringify(requestBodyTemplate, null, 2)
        }));
      }
    } catch (error) {
      console.error("Failed to fetch app detail", error);
    }
  };

  const handleIntervalChange = (field: keyof typeof interval, value: string) => {
    const numValue = parseInt(value) || 0;
    setInterval(prev => ({ ...prev, [field]: numValue }));
  };

  const filteredApps = appList.filter(app => 
    app.name.toLowerCase().includes(appSearchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (task && formData) {
      let requestBodyObj = {};
      try {
        if (formData.request_body) {
          requestBodyObj = JSON.parse(formData.request_body);
        }
      } catch (e) {
        message.error('请求体 JSON 格式不正确');
        return;
      }

      onSave({ 
        ...task, 
        ...formData, 
        app_id: formData.appType === 'external' ? null : (formData.app_id || task.app_id),
        request_body: requestBodyObj 
      } as ScheduledTask);
      onClose();
      setAppSearchTerm('');
    }
  };

  if (!isOpen) return null;

  return (
    <ConfigProvider locale={zhCN}>
      <>
        {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out overflow-y-auto border-l border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-100 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">编辑任务</h2>
              <p className="text-xs text-gray-500 mt-0.5">修改定时任务配置信息</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-8 overflow-y-auto">
          
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <Activity className="w-4 h-4 text-primary-500" />
              基本信息
            </h3>
            
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> 任务名称
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => handleChange('name', e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all group-hover:bg-white"
                    placeholder="请输入任务名称"
                  />
                  {formData.name && (
                    <button 
                      onClick={() => handleChange('name', '')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> 任务描述
                </label>
                <div className="relative group">
                  <textarea
                    value={formData.description || ''}
                    onChange={e => handleChange('description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none group-hover:bg-white"
                    placeholder="请输入任务描述"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Config Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <Clock className="w-4 h-4 text-orange-500" />
              定时配置
            </h3>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> 定时器类型
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm text-left flex items-center justify-between transition-all ${
                      isTypeDropdownOpen 
                        ? 'border-primary-500 ring-2 ring-primary-500/20' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={formData.schedule_type ? 'text-gray-900' : 'text-gray-400'}>
                      {formData.schedule_type === 'date' ? '定时时间' : 
                       formData.schedule_type === 'cron' ? '定时任务规则' : 
                       formData.schedule_type === 'interval' ? '定时间隔' : '请选择定时器类型'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isTypeDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsTypeDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                        {[
                          { value: 'date', label: '定时时间', desc: '在指定时间执行一次' },
                          { value: 'cron', label: '定时任务规则', desc: '使用 Cron 表达式配置周期任务' },
                          { value: 'interval', label: '定时间隔', desc: '按固定时间间隔重复执行' }
                        ].map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              handleChange('schedule_type', option.value);
                              setIsTypeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 flex flex-col ${
                              formData.schedule_type === option.value ? 'bg-primary-50/50' : ''
                            }`}
                          >
                            <span className={`font-medium ${formData.schedule_type === option.value ? 'text-primary-600' : 'text-gray-900'}`}>{option.label}</span>
                            <span className="text-xs text-gray-500 mt-0.5">{option.desc}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> 定时器规则
                </label>
                
                {formData.schedule_type === 'date' && (
                  <div className="relative group w-full">
                    <DatePicker
                      showTime
                      placeholder="请选择日期时间"
                      className="w-full h-[38px] rounded-lg border-gray-200 hover:border-primary-500 focus:border-primary-500"
                      value={formData.schedule_expression ? dayjs(formData.schedule_expression) : null}
                      onChange={(date) => {
                        handleChange('schedule_expression', date ? date.format('YYYY-MM-DD HH:mm:ss') : '');
                      }}
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: '100%' }}
                    />
                  </div>
                )}

                {formData.schedule_type === 'cron' && (
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="请输入 Cron 表达式 (e.g., 0 0 * * *)"
                      value={formData.schedule_expression || ''}
                      onChange={e => handleChange('schedule_expression', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-mono group-hover:bg-white"
                    />
                  </div>
                )}

                {formData.schedule_type === 'interval' && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        { label: '周', key: 'weeks' },
                        { label: '天', key: 'days' },
                        { label: '小时', key: 'hours' },
                        { label: '分钟', key: 'minutes' },
                        { label: '秒', key: 'seconds' }
                      ].map((item) => (
                        <div key={item.key} className="space-y-1.5 text-center">
                          <label className="text-xs font-medium text-gray-500">{item.label}</label>
                          <input
                            type="number"
                            min="0"
                            value={interval[item.key as keyof typeof interval]}
                            onChange={e => handleIntervalChange(item.key as keyof typeof interval, e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-center font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* App Config Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <Globe className="w-4 h-4 text-green-500" />
              应用配置
            </h3>

            <div className="grid grid-cols-1 gap-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <span className="text-red-500">*</span> 任务状态
                  </label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleChange('status', 'active')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                        formData.status === 'active' 
                          ? 'bg-white text-primary-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      激活
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('status', 'inactive')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                        formData.status === 'inactive' 
                          ? 'bg-white text-gray-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      未激活
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <span className="text-red-500">*</span> 应用选择
                  </label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleChange('appType', 'internal')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                        formData.appType === 'internal' 
                          ? 'bg-white text-primary-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      内部应用
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('appType', 'external')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                        formData.appType === 'external' 
                          ? 'bg-white text-primary-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      外部应用
                    </button>
                  </div>
                </div>
              </div>

              {formData.appType === 'internal' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <span className="text-red-500">*</span> 应用名称
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsAppDropdownOpen(!isAppDropdownOpen)}
                      className={`w-full px-3 py-2.5 bg-gray-50 border rounded-lg text-sm text-left flex items-center justify-between transition-all hover:bg-white ${
                        isAppDropdownOpen 
                          ? 'border-primary-500 ring-2 ring-primary-500/20' 
                          : 'border-gray-200'
                      }`}
                    >
                      <span className={formData.app_name ? 'text-gray-900' : 'text-gray-400'}>
                        {formData.app_name || '请选择应用'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isAppDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isAppDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsAppDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden z-50 py-1 max-h-60 overflow-y-auto" onScroll={handleScroll}>
                          <div className="px-3 py-2 sticky top-0 bg-white border-b border-gray-50">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              <input 
                                type="text"
                                placeholder="搜索应用..."
                                value={appSearchTerm}
                                onChange={(e) => setAppSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                autoFocus
                              />
                            </div>
                          </div>
                          {filteredApps.length > 0 ? (
                            filteredApps.map(app => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => handleAppSelect(app)}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 flex items-center justify-between ${
                                  formData.app_id === app.id ? 'bg-primary-50/50 text-primary-600' : 'text-gray-900'
                                }`}
                              >
                                <span>{app.name}</span>
                                {formData.app_id === app.id && <CheckCircle2 className="w-3.5 h-3.5 text-primary-600" />}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-center text-xs text-gray-400">
                              {loading ? '加载中...' : '未找到相关应用'}
                            </div>
                          )}
                          {loading && <div className="px-4 py-2 text-center text-xs text-gray-400">加载中...</div>}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> API 地址
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={formData.api_endpoint || ''}
                    onChange={e => handleChange('api_endpoint', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all group-hover:bg-white font-mono text-gray-600"
                    placeholder="https://api.example.com/v1/..."
                  />
                  <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> 调用方法
                </label>
                {formData.appType === 'internal' ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed">
                    <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200 text-xs">POST</span>
                    <span className="text-xs text-gray-400">(内部应用自动匹配)</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH', 'TRACE'].map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handleChange('method', method)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          formData.method === method
                            ? method === 'GET' ? 'bg-primary-50 text-primary-600 border-primary-200 ring-1 ring-primary-200' :
                              method === 'POST' ? 'bg-green-50 text-green-600 border-green-200 ring-1 ring-green-200' :
                              method === 'PUT' ? 'bg-orange-50 text-orange-600 border-orange-200 ring-1 ring-orange-200' :
                              method === 'DELETE' ? 'bg-red-50 text-red-600 border-red-200 ring-1 ring-red-200' :
                              method === 'PATCH' ? 'bg-yellow-50 text-yellow-600 border-yellow-200 ring-1 ring-yellow-200' :
                              'bg-gray-100 text-gray-700 border-gray-300 ring-1 ring-gray-300'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> 请求体
                </label>
                <div className="relative group">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileJson className="w-4 h-4 text-gray-400" />
                  </div>
                  <textarea
                    value={formData.request_body || ''}
                    onChange={e => handleChange('request_body', e.target.value)}
                    rows={8}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none font-mono group-hover:bg-white text-gray-600 leading-relaxed"
                    placeholder="{ ... }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 z-10">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            取消
          </button>
          <button 
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-primary-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存修改
          </button>
        </div>
      </div>
    </>
    </ConfigProvider>
  );
};

export default EditTaskModal;
