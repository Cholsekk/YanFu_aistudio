
import React, { useState } from 'react';
import { AppItem } from '../types';
import { AppDevHubContext } from '../context/AppContext';
import { Tooltip } from 'antd';
import { getIcon } from '../constants';
import { 
  ChevronLeft, 
  Settings, 
  FileText, 
  Activity, 
  MessageSquare,
  Bot,
  Zap,
  Edit3
} from 'lucide-react';
import WorkflowEditor from './WorkflowEditor';
import MonitoringPage from './MonitoringPage';
import LogsPage from './LogsPage';
import AppConfig from './AppConfig';
// 集成时使用👇
// import WorkflowPage from '../../apps/app/(appDetailLayout)/[appId]/workflow/page';
// import { useStore as useAppStore } from '@/app/components/app/store';

interface AppDetailProps {
  app: AppItem;
  onBack: () => void;
}

const AppDetail: React.FC<AppDetailProps> = ({ app, onBack }) => {
  // 集成时使用👇
  // const setAppDetail = useAppStore(s => s.setAppDetail);
  // const currentAppDetail = useAppStore(s => s.appDetail);

  // // 同步设置 appDetail，确保在渲染前就有值
  // if (app && currentAppDetail?.id !== app.id) {
  //   setAppDetail(app as any);
  // }

  const getTabs = () => {
    const type = app.type;
    const isWorkflowOrAdvancedChat = app.mode === 'workflow' || app.mode === 'advanced-chat';
    const configLabel = isWorkflowOrAdvancedChat ? '工作流编排' : '开发配置';
    const configId = isWorkflowOrAdvancedChat ? 'orchestrate' : 'config';

    if (type === '对话应用') {
      return [
        { id: configId, label: configLabel, icon: <Settings className="w-4 h-4" /> },
        { id: 'logs', label: '日志与标注', icon: <FileText className="w-4 h-4" /> },
        { id: 'monitor', label: '监测', icon: <Activity className="w-4 h-4" /> },
      ];
    } else if (type === '文本生成应用') {
      return [
        { id: configId, label: configLabel, icon: <Settings className="w-4 h-4" /> },
        { id: 'logs', label: '日志', icon: <FileText className="w-4 h-4" /> },
        { id: 'monitor', label: '监测', icon: <Activity className="w-4 h-4" /> },
      ];
    } else if (type === '智能体应用') {
      return [
        { id: configId, label: configLabel, icon: <Settings className="w-4 h-4" /> },
        { id: 'logs', label: '日志与标注', icon: <FileText className="w-4 h-4" /> },
        { id: 'monitor', label: '监测', icon: <Activity className="w-4 h-4" /> },
      ];
    } else if (type === '工作流应用') {
      return [
        { id: 'orchestrate', label: configLabel, icon: <Settings className="w-4 h-4" /> },
        { id: 'logs', label: '日志', icon: <FileText className="w-4 h-4" /> },
        { id: 'monitor', label: '监测', icon: <Activity className="w-4 h-4" /> },
      ];
    }
    return [];
  };

  const tabs = getTabs();
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem(`appDetailTab_${app.id}`) || tabs[0]?.id || 'config';
  });

  React.useEffect(() => {
    sessionStorage.setItem(`appDetailTab_${app.id}`, activeTab);
  }, [activeTab, app.id]);

  const getTypeIcon = () => {
    switch (app.mode) {
      case 'chat': return <MessageSquare className="w-4 h-4 text-primary-600" />;
      case 'agent-chat': return <Bot className="w-4 h-4 text-blue-600" />;
      case 'workflow': return <Zap className="w-4 h-4 text-orange-600" />;
      case 'completion': return <Edit3 className="w-4 h-4 text-green-600" />;
      default: return <MessageSquare className="w-4 h-4 text-primary-600" />;
    }
  };

  const renderAppIcon = () => {
    const containerClass = "w-10 h-10 flex-shrink-0";
    const iconClass = "text-xl";
    const defaultIcon = '/sys_icons/Component 156.svg';

    const isEmoji = (str: string) => {
      const emojiRegex = /\p{Emoji}/u;
      return emojiRegex.test(str);
    };

    // Case 1: iconType is 'image'
    if (app.iconType === 'image') {
      const src = app.icon_url || app.icon;
      // If src is an emoji (like '🤖') or missing, fallback to default system icon
      if (!src || isEmoji(src)) {
        return (
          <div className={`${containerClass} bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm`}>
            <img 
              src={defaultIcon} 
              alt={app.name} 
              className="w-full h-full object-cover"
            />
          </div>
        );
      }
      return (
        <img 
          src={src} 
          alt={app.name} 
          className={`${containerClass} rounded-xl object-cover border border-gray-100 shadow-sm`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultIcon;
          }}
        />
      );
    }

    // Case 2: iconType is 'icon'
    if (app.iconType === 'icon') {
      if (app.icon && isEmoji(app.icon)) {
        return (
          <div className={`${containerClass} ${app.iconBgColor || 'bg-primary-100'} rounded-xl flex items-center justify-center border border-gray-100 shadow-sm`}>
            <span className={iconClass} role="img" aria-label="app icon">
              {app.icon}
            </span>
          </div>
        );
      }
      
      // If it's a UUID (length > 20), it's invalid for 'icon' type, fallback to default system icon
      if (app.icon && app.icon.length > 20) {
        return (
          <div className={`${containerClass} bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm`}>
            <img 
              src={defaultIcon} 
              alt={app.name} 
              className="w-full h-full object-cover"
            />
          </div>
        );
      }

      // Otherwise, assume it's a Lucide icon name
      return (
        <div className={`${containerClass} ${app.iconBgColor || 'bg-primary-600'} rounded-xl text-white flex items-center justify-center border border-gray-100 shadow-sm`}>
          {getIcon(app.icon || 'Bot', iconClass)}
        </div>
      );
    }

    // Case 3: iconType is 'sys-icon' or missing/invalid
    return (
      <div className={`${containerClass} bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm`}>
        <img 
          src={app.icon ? `/sys_icons/Component ${app.icon}.svg` : defaultIcon} 
          alt={app.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultIcon;
          }}
        />
      </div>
    );
  };

  const getTypeColor = () => {
    switch (app.mode) {
      case 'chat': return 'bg-primary-50 text-primary-700 border-primary-100';
      case 'agent-chat': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'workflow': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'completion': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const renderContent = () => {
    if (activeTab === 'orchestrate') {
      return (
        <div className="h-full w-full">
          <WorkflowEditor />
          {/* 集成时使用👇 */}
          {/*<WorkflowPage /> */}
        </div>
      );
    }

    if (activeTab === 'monitor') {
      return <MonitoringPage />;
    }

    if (activeTab === 'logs') {
      return <LogsPage />;
    }

    if (activeTab === 'config') {
      return <AppConfig />;
    }

    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            {tabs.find(t => t.id === activeTab)?.icon && React.cloneElement(tabs.find(t => t.id === activeTab)!.icon as React.ReactElement<any>, { className: "w-10 h-10 text-gray-300" })}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <p className="text-gray-500 max-w-md">
            正在为您准备 {app.name} 的 {tabs.find(t => t.id === activeTab)?.label} 模块内容。
            该功能即将上线，敬请期待。
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Section */}
      <div className="border-b border-gray-200/60 px-4 py-2 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            {renderAppIcon()}
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <Tooltip title={app.name}>
                  <h1 className="text-sm font-bold text-gray-900 cursor-help">
                    {app.name.length > 6 ? `${app.name.substring(0, 6)}...` : app.name}
                  </h1>
                </Tooltip>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`px-1 py-0.5 rounded text-[9px] font-bold border ${getTypeColor()}`}>
                  {app.typeLabel}
                </span>
                {app.mode === 'advanced-chat' && (
                  <span className="px-1 py-0.5 rounded text-[9px] font-bold border bg-orange-50 text-orange-700 border-orange-100">
                    workflow模式
                  </span>
                )}
                {app.mode === 'chat' && (
                  <span className="px-1 py-0.5 rounded text-[9px] font-bold border bg-green-50 text-green-700 border-green-100">
                    基础模式
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className={`flex-grow bg-white overflow-auto relative ${['orchestrate', 'config'].includes(activeTab) ? 'p-0' : 'p-4'}`}>
        <AppDevHubContext.Provider value={app}>
          {renderContent()}
        </AppDevHubContext.Provider>
      </div>
    </div>
  );
};

export default AppDetail;
