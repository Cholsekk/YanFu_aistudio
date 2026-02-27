
import React, { useState, useEffect } from 'react';
import { ScheduledTask } from '../types';
import { apiService } from '../services/apiService';
import { Calendar, ChevronDown, X, Save, Clock, Activity, Globe, Server, FileJson, CheckCircle2, Circle, Search } from 'lucide-react';
import { DatePicker, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: ScheduledTask) => void;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<ScheduledTask>>({
    status: 'active',
    method: 'POST',
    schedule_type: 'date', // Default to date
    appType: 'internal'
  });

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
      fetchApps();
    }
  }, [isOpen]);

  const fetchApps = async () => {
    try {
      const response = await apiService.getApps();
      if (response && response.data) {
        setAppList(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch apps", error);
    }
  };

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

  // Auto-set method for internal apps
  useEffect(() => {
    if (formData.appType === 'internal') {
      // For internal apps, method is typically POST (or determined by app logic, here we assume POST for now as per requirement "auto matched")
      // If we had app mode info here, we could refine it. For now, default to POST and disable edit.
      setFormData(prev => ({ ...prev, method: 'POST' }));
    }
  }, [formData.appType]);

  const handleChange = (field: keyof ScheduledTask, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAppSelect = (app: any) => {
    setFormData(prev => ({
      ...prev,
      app_id: app.id,
      app_name: app.name,
      method: 'POST' // Auto-set method for internal apps
    }));
    setIsAppDropdownOpen(false);
  };

  const handleIntervalChange = (field: keyof typeof interval, value: string) => {
    const numValue = parseInt(value) || 0;
    setInterval(prev => ({ ...prev, [field]: numValue }));
  };

  const filteredApps = appList.filter(app => 
    app.name.toLowerCase().includes(appSearchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name || !formData.description || !formData.api_endpoint || !formData.schedule_expression) {
      alert('请填写必要信息 (名称、描述、API地址、定时规则)');
      return;
    }

    let requestBodyObj = {};
    try {
      if (formData.request_body && typeof formData.request_body === 'string') {
        requestBodyObj = JSON.parse(formData.request_body);
      } else if (formData.request_body) {
        requestBodyObj = formData.request_body;
      }
    } catch (e) {
      alert('请求体 JSON 格式不正确');
      return;
    }

    const newTask: ScheduledTask = {
      id: Date.now().toString(),
      name: formData.name || '',
      description: formData.description || '',
      app_id: formData.appType === 'external' ? null : (formData.app_id || ''),
      app_name: formData.app_name || '',
      api_endpoint: formData.api_endpoint || '',
      request_body: requestBodyObj,
      method: formData.method || 'POST',
      status: formData.status || 'inactive',
      schedule_type: formData.schedule_type || 'date',
      schedule_expression: formData.schedule_expression || '',
      created_at: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      updated_at: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      last_executed_at: null,
      appType: formData.appType
    };

    onSave(newTask);
    onClose();
    // Reset form
    setFormData({
      status: 'active',
      method: 'POST',
      schedule_type: 'date',
      appType: 'internal'
    });
    setInterval({ weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
    setAppSearchTerm('');
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
      <div className="fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out overflow-hidden border-l border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="flex-none bg-white/90 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">新建任务</h2>
            <p className="text-xs text-gray-500 mt-0.5">创建一个新的定时任务配置</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              <Activity className="w-4 h-4 text-blue-500" />
              基本信息
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> 任务名称
                </label>
                <input
                  type="text"
                  placeholder="请输入任务名称"
                  value={formData.name || ''}
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 hover:border-gray-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> 任务描述
                </label>
                <textarea
                  placeholder="请输入任务描述"
                  value={formData.description || ''}
                  onChange={e => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 hover:border-gray-300 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Schedule Config */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              <Clock className="w-4 h-4 text-orange-500" />
              定时配置
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> 定时器类型
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className={`w-full px-3 py-2 bg-white border rounded-lg text-sm text-left flex items-center justify-between transition-all ${
                      isTypeDropdownOpen 
                        ? 'border-blue-500 ring-2 ring-blue-500/20' 
                        : 'border-gray-200 hover:border-gray-300'
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
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden z-50 py-1">
                        {[
                          { value: 'date', label: '定时时间', desc: '在指定时间执行一次' },
                          { value: 'cron', label: '定时任务规则', desc: '使用 Cron 表达式配置' },
                          { value: 'interval', label: '定时间隔', desc: '按固定时间间隔循环执行' }
                        ].map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              handleChange('schedule_type', option.value);
                              setIsTypeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 flex flex-col gap-0.5 ${
                              formData.schedule_type === option.value ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <span className={`font-medium ${formData.schedule_type === option.value ? 'text-blue-600' : 'text-gray-900'}`}>
                              {option.label}
                            </span>
                            <span className="text-xs text-gray-500">{option.desc}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> 定时器规则
                </label>
                
                {formData.schedule_type === 'date' && (
                  <div className="relative group w-full">
                    <DatePicker
                      showTime
                      placeholder="请选择日期时间"
                      className="w-full h-[38px] rounded-lg border-gray-200 hover:border-blue-500 focus:border-blue-500"
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
                      placeholder="请输入 Cron 表达式 (e.g. 0 0 * * *)"
                      value={formData.schedule_expression || ''}
                      onChange={e => handleChange('schedule_expression', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 hover:border-gray-300 font-mono"
                    />
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                )}

                {formData.schedule_type === 'interval' && (
                  <div className="bg-white border border-gray-200 rounded-lg p-3 grid grid-cols-5 gap-2">
                    {[
                      { label: '周', key: 'weeks' },
                      { label: '天', key: 'days' },
                      { label: '小时', key: 'hours' },
                      { label: '分钟', key: 'minutes' },
                      { label: '秒', key: 'seconds' }
                    ].map((item) => (
                      <div key={item.key} className="space-y-1 text-center">
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{item.label}</label>
                        <input
                          type="number"
                          min="0"
                          value={(interval as any)[item.key]}
                          onChange={e => handleIntervalChange(item.key as any, e.target.value)}
                          className="w-full px-1 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: App Config */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              <Globe className="w-4 h-4 text-green-500" />
              应用配置
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                    <span className="text-red-500">*</span> 任务状态
                  </label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleChange('status', 'active')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                        formData.status === 'active' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {formData.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                      激活
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('status', 'inactive')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                        formData.status === 'inactive' 
                          ? 'bg-white text-gray-700 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {formData.status === 'inactive' && <Circle className="w-3 h-3" />}
                      未激活
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                    <span className="text-red-500">*</span> 应用选择
                  </label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleChange('appType', 'internal')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                        formData.appType === 'internal' 
                          ? 'bg-white text-blue-600 shadow-sm' 
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
                          ? 'bg-white text-blue-600 shadow-sm' 
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
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                    <span className="text-red-500">*</span> 应用名称
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsAppDropdownOpen(!isAppDropdownOpen)}
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-sm text-left flex items-center justify-between transition-all ${
                        isAppDropdownOpen 
                          ? 'border-blue-500 ring-2 ring-blue-500/20' 
                          : 'border-gray-200 hover:border-gray-300'
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
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden z-50 py-1 max-h-60 overflow-y-auto">
                          <div className="px-3 py-2 sticky top-0 bg-white border-b border-gray-50">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              <input 
                                type="text"
                                placeholder="搜索应用..."
                                value={appSearchTerm}
                                onChange={(e) => setAppSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                                  formData.app_id === app.id ? 'bg-blue-50/50 text-blue-600' : 'text-gray-900'
                                }`}
                              >
                                <span>{app.name}</span>
                                {formData.app_id === app.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-center text-xs text-gray-400">
                              未找到相关应用
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> API 地址
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="请输入 API 地址"
                    value={formData.api_endpoint || ''}
                    onChange={e => handleChange('api_endpoint', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 hover:border-gray-300"
                  />
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> 调用方法
                </label>
                {formData.appType === 'internal' ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed">
                    <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200 text-xs">POST</span>
                    <span className="text-xs text-gray-400">(内部应用自动匹配)</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH', 'TRACE'].map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handleChange('method', method)}
                        className={`py-1.5 text-xs font-bold rounded-md border transition-all ${
                          formData.method === method
                            ? method === 'GET' ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : method === 'POST' ? 'bg-green-50 text-green-600 border-green-200'
                            : method === 'PUT' ? 'bg-orange-50 text-orange-600 border-orange-200'
                            : method === 'DELETE' ? 'bg-red-50 text-red-600 border-red-200'
                            : method === 'PATCH' ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
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
                <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> 请求体
                </label>
                <div className="relative group">
                  <textarea
                    placeholder="请输入 JSON 格式的请求体"
                    value={typeof formData.request_body === 'string' ? formData.request_body : JSON.stringify(formData.request_body, null, 2)}
                    onChange={e => handleChange('request_body', e.target.value)}
                    rows={6}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none font-mono placeholder:text-gray-400 hover:border-gray-300 text-xs leading-relaxed"
                  />
                  <FileJson className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex-none bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 z-10">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-800 transition-all"
          >
            取消
          </button>
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            保存任务
          </button>
        </div>
      </div>
    </>
    </ConfigProvider>
  );
};

export default NewTaskModal;
