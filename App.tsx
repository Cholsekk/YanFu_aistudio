
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import AppCard from './components/AppCard';
import NewAppModal from './components/NewAppModal';
import CustomAppModal from './components/CustomAppModal';
import ImportAppModal from './components/ImportAppModal';
import ManageTagsModal from './components/ManageTagsModal';
import ScheduledTasks from './components/ScheduledTasks';
import ToolExtensions from './components/ToolExtensions';
import TokenConfigModal from './components/TokenConfigModal';
import ConvertToWorkflowModal from './components/ConvertToWorkflowModal';
import { APP_TYPES } from './constants';
import { AppItem, AppMode, Tag } from './types';
import { apiService } from './services/apiService';
import { 
  Plus, 
  Search as SearchIcon, 
  Filter, 
  Grid, 
  List, 
  Upload, 
  Sparkles,
  ChevronDown,
  LayoutGrid,
  SortAsc,
  SortDesc,
  RotateCcw,
  ListOrdered,
  ArrowUp
} from 'lucide-react';

const App: React.FC = () => {
  const [activeNavTab, setActiveNavTab] = useState('app-dev');
  const [activeFilterTab, setActiveFilterTab] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [apps, setApps] = useState<AppItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'time-desc' | 'time-asc'>('default');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Modal states
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [isCustomAppModalOpen, setIsCustomAppModalOpen] = useState(false);
  const [isImportAppModalOpen, setIsImportAppModalOpen] = useState(false);
  const [isManageTagsModalOpen, setIsManageTagsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isConvertToWorkflowModalOpen, setIsConvertToWorkflowModalOpen] = useState(false);
  const [appToConvert, setAppToConvert] = useState<AppItem | null>(null);
  
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);

  // Listen for unauthorized events
  React.useEffect(() => {
    const handleUnauthorized = () => {
      setIsTokenModalOpen(true);
    };
    window.addEventListener('api-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('api-unauthorized', handleUnauthorized);
  }, []);

  const mapAppModeToType = (mode: AppMode): string => {
    switch (mode) {
      case 'chat': return '对话应用';
      case 'agent-chat': return '智能体应用';
      case 'workflow': return '工作流应用';
      case 'completion': return '文本生成应用';
      case 'custom': return '定制应用';
      default: return '对话应用';
    }
  };

  const mapTypeToAppMode = (type: string): AppMode => {
    if (type.includes('对话')) return 'chat';
    if (type.includes('智能体')) return 'agent-chat';
    if (type.includes('工作流')) return 'workflow';
    if (type.includes('文本')) return 'completion';
    if (type.includes('定制')) return 'custom';
    return 'chat';
  };

  const fetchTags = async () => {
    try {
      const response = await apiService.fetchTagList('app');
      if (response && Array.isArray(response)) {
        setTags(response);
      } else {
        setTags([]);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const fetchApps = async (isLoadMore = false) => {
    if (activeNavTab !== 'app-dev') return;
    
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      const params: Record<string, any> = {
        page: currentPage,
        limit: 100, // Increased limit as per new API default
        name: searchQuery
      };

      // Pass filter params to API, but we will also filter client-side
      if (activeFilterTab === '全部') {
        params.built_in = false;
      } else if (activeFilterTab === '内置应用') {
        params.built_in = true;
      } else {
        const mode = mapTypeToAppMode(activeFilterTab);
        if (mode === 'custom') {
          // For custom apps, we only need to flag it. 
          // The API service will only use tenant_id and limit.
          params.is_custom_app_list = true;
        } else {
          params.built_in = false;
          params.mode = mode;
        }
      }

      const response = await apiService.getApps(params);
      
      // Handle different response formats (Array or Object with data)
      let appList: any[] = [];
      let hasMoreData = false;

      if (Array.isArray(response)) {
        appList = response;
      } else if (response && Array.isArray(response.recommended_apps)) {
        appList = response.recommended_apps;
        // If we need categories, we can extract them here: response.categories
      } else if (response && Array.isArray(response.data)) {
        appList = response.data;
        hasMoreData = response.has_more || false;
      } else if (response && Array.isArray(response.items)) {
        appList = response.items;
        hasMoreData = (response.current_page < response.pages);
      }

      const mappedApps: AppItem[] = appList.map((item: any) => {
        const appData = item.app || item;
        return {
          id: appData.id,
          name: appData.name,
          type: mapAppModeToType(appData.mode),
          typeLabel: mapAppModeToType(appData.mode),
          description: appData.description || item.description || '',
          icon: appData.icon || 'MessageSquare',
          iconType: appData.icon_type || (appData.icon_url ? 'image' : 'icon'),
          icon_url: appData.icon_url,
          tags: appData.tags || [],
          iconBgColor: appData.icon_background || 'bg-blue-600',
          mode: appData.mode,
          // Map custom app fields if present
          category: appData.category || item.category,
          appUrl: appData.config?.appUrl || appData.appUrl,
          needToken: appData.config?.needToken ?? appData.needToken,
          loginUrl: appData.config?.loginUrl || appData.loginUrl,
          authUrl: appData.config?.authUrl || appData.authUrl,
          account: appData.config?.account || appData.account,
          password: appData.config?.password || appData.password,
          customMenu: appData.config?.customMenu ?? appData.customMenu,
          menuItems: appData.config?.menuItems || appData.menuItems,
        };
      });
      
      if (isLoadMore) {
        setApps(prev => [...prev, ...mappedApps]);
        setPage(currentPage);
      } else {
        setApps(mappedApps);
        setPage(1);
      }
      setHasMore(hasMoreData);

    } catch (error) {
      console.error('Failed to fetch apps:', error);
      if (!isLoadMore) {
        setApps([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    // Debounce search to avoid too many requests
    const timer = setTimeout(() => {
      fetchApps(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeNavTab, activeFilterTab, searchQuery]);

  // Infinite scroll and Back to Top listener
  useEffect(() => {
    const handleScroll = () => {
      // Infinite scroll
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        if (hasMore && !isLoading && !isLoadingMore) {
          fetchApps(true);
        }
      }

      // Back to Top visibility (show after 2 screens)
      if (window.scrollY > window.innerHeight * 2) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, isLoadingMore, activeNavTab, activeFilterTab, searchQuery, page]);

  // Check if any filter or non-default sort is active
  const isFiltered = useMemo(() => {
    return activeFilterTab !== '全部' || sortBy !== 'default' || searchQuery !== '';
  }, [activeFilterTab, sortBy, searchQuery]);

  const handleResetFilters = () => {
    setActiveFilterTab('全部');
    setSortBy('default');
    setSearchQuery('');
    setIsFilterOpen(false);
  };

  const filteredApps = useMemo(() => {
    // Client-side sorting and filtering
    let result = [...apps];

    // Client-side filtering to ensure consistency if API returns mixed results
    if (activeFilterTab !== '全部') {
      if (activeFilterTab === '内置应用') {
        // Assuming built-in apps are not supported in this view or handled via API
        // If we have a way to identify built-in apps in the list, we filter here.
        // But currently AppItem doesn't have built_in flag explicitly mapped?
        // Let's assume the API handles it or we skip client-side filter for this one if unsure.
        // However, we can filter by mode for others.
      } else {
        const targetMode = mapTypeToAppMode(activeFilterTab);
        if (targetMode === 'custom') {
          // Do not filter client-side for custom apps, API handles it
        } else {
          result = result.filter(app => app.mode === targetMode);
        }
      }
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'time-desc') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === 'time-asc') {
      result.sort((a, b) => a.id.localeCompare(b.id));
    }
    
    return result;
  }, [apps, sortBy, activeFilterTab]);

  const handleCreateTag = async (name: string) => {
    try {
      await apiService.createTag(name, 'app');
      fetchTags();
    } catch (error) {
      console.error('Failed to create tag:', error);
      alert('创建标签失败');
    }
  };

  const handleRenameTag = async (tagId: string, newName: string) => {
    try {
      await apiService.updateTag(tagId, newName);
      fetchTags();
      fetchApps(); // Refresh apps to update tag names in UI
    } catch (error) {
      console.error('Failed to rename tag:', error);
      alert('重命名标签失败');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await apiService.deleteTag(tagId);
      fetchTags();
      fetchApps(); // Refresh apps to remove deleted tag
    } catch (error) {
      console.error('Failed to delete tag:', error);
      alert('删除标签失败');
    }
  };

  const handleBindTag = async (appId: string, tagId: string) => {
    try {
      await apiService.bindTag([tagId], appId, 'app');
      fetchApps();
      fetchTags(); // Update binding counts
    } catch (error) {
      console.error('Failed to bind tag:', error);
      alert('添加标签失败');
    }
  };

  const handleUnbindTag = async (appId: string, tagId: string) => {
    try {
      await apiService.unBindTag(tagId, appId, 'app');
      fetchApps();
      fetchTags(); // Update binding counts
    } catch (error) {
      console.error('Failed to unbind tag:', error);
      alert('移除标签失败');
    }
  };

  const handleCreateOrUpdateApp = async (appData: any) => {
    try {
      const config = {
        appUrl: appData.appUrl,
        needToken: appData.needToken,
        loginUrl: appData.loginUrl,
        authUrl: appData.authUrl,
        account: appData.account,
        password: appData.password,
        customMenu: appData.customMenu,
        menuItems: appData.menuItems,
        category: appData.category
      };

      if (appData.id) {
        // Update
        await apiService.updateApp(appData.id, {
          name: appData.name,
          icon_type: appData.iconType || 'icon',
          icon: appData.icon,
          icon_background: appData.iconBgColor,
          description: appData.description,
          use_icon_as_answer_icon: false, // Default
          built_in: false, // Default
          // Pass config with custom fields
          // @ts-ignore - apiService updateApp signature might need update or we cast
          config: config
        });
      } else {
        // Create
        await apiService.createApp({
          name: appData.name,
          icon_type: appData.iconType || 'icon',
          icon: appData.icon,
          icon_background: appData.iconBgColor,
          mode: mapTypeToAppMode(appData.typeLabel || appData.type),
          description: appData.description,
          config: config
        });
      }
      fetchApps();
      setEditingApp(null);
    } catch (error) {
      console.error('Failed to save app:', error);
      alert('保存失败，请重试');
    }
  };

  const handleDeleteApp = async (id: string) => {
    if (confirm('确认删除该应用吗？')) {
      try {
        await apiService.deleteApp(id);
        fetchApps();
      } catch (error) {
        console.error('Failed to delete app:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleCopyApp = async (app: AppItem) => {
    try {
      const config = {
        appUrl: app.appUrl,
        needToken: app.needToken,
        loginUrl: app.loginUrl,
        authUrl: app.authUrl,
        account: app.account,
        password: app.password,
        customMenu: app.customMenu,
        menuItems: app.menuItems,
        category: app.category
      };

      await apiService.copyApp(app.id, {
        name: `${app.name} (副本)`,
        icon_type: app.iconType,
        icon: app.icon,
        icon_background: app.iconBgColor,
        mode: mapTypeToAppMode(app.type),
        description: app.description,
        config: config
      });
      fetchApps();
    } catch (error) {
      console.error('Failed to copy app:', error);
      alert('复制失败，请重试');
    }
  };

  const handleExportApp = async (app: AppItem) => {
    try {
      const response = await apiService.exportApp(app.id);
      if (response && response.data) {
        const blob = new Blob([response.data], { type: 'text/yaml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${app.name}.yml`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('导出失败：未获取到数据');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    }
  };

  const handleConvertToWorkflow = (app: AppItem) => {
    setAppToConvert(app);
    setIsConvertToWorkflowModalOpen(true);
  };

  const executeConvertToWorkflow = async (data: { name: string; deleteOriginal: boolean; icon: string; iconType: 'icon' | 'image'; iconBgColor: string }) => {
    if (!appToConvert) return;
    
    try {
      await apiService.convertAppToWorkflow(appToConvert.id, {
        name: data.name,
        icon_type: data.iconType,
        icon: data.icon,
        icon_background: data.iconBgColor
      });

      if (data.deleteOriginal) {
        await apiService.deleteApp(appToConvert.id);
      }

      // Close modal first
      setIsConvertToWorkflowModalOpen(false);
      setAppToConvert(null);
      
      // Then refresh list
      await fetchApps();
      alert('迁移成功');
    } catch (error: any) {
      console.error('Failed to convert app:', error);
      alert(`迁移失败: ${error.message || '未知错误'}`);
    }
  };

  const openEditModal = (app: AppItem) => {
    setEditingApp(app);
    if (app.type === '定制应用') {
      setIsCustomAppModalOpen(true);
    } else {
      setIsNewAppModalOpen(true);
    }
  };

  const CreateAppContent = () => {
    if (viewMode === 'grid') {
      return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">创建应用</h3>
            <p className="text-xs text-gray-500">从头开始或导入现有配置</p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => { setEditingApp(null); setIsNewAppModalOpen(true); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all group"
            >
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">新建应用</p>
                <p className="text-[10px] text-gray-400">创建全新的对话或工作流应用</p>
              </div>
            </button>
            <button 
              onClick={() => { setEditingApp(null); setIsCustomAppModalOpen(true); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 text-gray-600 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all group"
            >
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">创建定制化应用</p>
                <p className="text-[10px] text-gray-400">基于模板快速构建</p>
              </div>
            </button>
            <button 
              onClick={() => setIsImportAppModalOpen(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all group"
            >
              <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">导入应用</p>
                <p className="text-[10px] text-gray-400">从外部文件或链接导入</p>
              </div>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4 shadow-sm flex items-center gap-6 mb-2">
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">创建应用</h3>
            <p className="text-[10px] text-gray-400">快速开始新项目</p>
          </div>
        </div>
        <div className="flex-grow flex gap-3">
          <button 
            onClick={() => { setEditingApp(null); setIsNewAppModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-sm text-gray-600 hover:text-blue-600 font-medium"
          >
            <Plus className="w-4 h-4" />
            新建应用
          </button>
          <button 
            onClick={() => { setEditingApp(null); setIsCustomAppModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-100 hover:border-purple-500 hover:bg-purple-50 transition-all text-sm text-gray-600 hover:text-purple-600 font-medium"
          >
            <Sparkles className="w-4 h-4" />
            创建定制化
          </button>
          <button 
            onClick={() => setIsImportAppModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-100 hover:border-green-500 hover:bg-green-50 transition-all text-sm text-gray-600 hover:text-green-600 font-medium"
          >
            <Upload className="w-4 h-4" />
            导入
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (activeNavTab === 'tasks') {
      return <ScheduledTasks />;
    }

    if (activeNavTab === 'tools') {
      return <ToolExtensions />;
    }

    if (activeNavTab !== 'app-dev') {
      return (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <LayoutGrid className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">该功能正在开发中...</p>
        </div>
      );
    }

    return (
      <>
        <div className="sticky top-0 z-30 backdrop-blur-sm py-4 -mt-4 mb-6 border-b border-gray-100 transition-all flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-100/80 rounded-lg w-fit">
            {APP_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setActiveFilterTab(type)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeFilterTab === type 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder="搜索应用或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-all shadow-sm
                  ${isFilterOpen || isFiltered 
                    ? 'border-blue-500 text-blue-600 bg-blue-50/30' 
                    : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}
              >
                <Filter className={`w-4 h-4 ${isFiltered ? 'fill-blue-600/10' : ''}`} />
                筛选
                <ChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60] animate-in fade-in slide-in-from-top-2 overflow-hidden">
                  <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                    <span>排序</span>
                    {isFiltered && (
                      <button 
                        onClick={handleResetFilters}
                        className="text-blue-600 hover:text-blue-700 normal-case flex items-center gap-0.5"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        重置
                      </button>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => { setSortBy('default'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${sortBy === 'default' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <ListOrdered className="w-4 h-4 opacity-50" />
                      <span>默认 (数据源排序)</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setSortBy('name'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${sortBy === 'name' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span>按名称</span>
                  </button>
                  <button 
                    onClick={() => { setSortBy('time-desc'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${sortBy === 'time-desc' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span>按创建时间 (降序)</span>
                    <SortDesc className="w-4 h-4 opacity-70" />
                  </button>
                  <button 
                    onClick={() => { setSortBy('time-asc'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${sortBy === 'time-asc' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span>按创建时间 (升序)</span>
                    <SortAsc className="w-4 h-4 opacity-70" />
                  </button>

                  {isFiltered && (
                    <div className="border-t border-gray-100 mt-1">
                      <button 
                        onClick={handleResetFilters}
                        className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 font-medium flex items-center gap-2 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        重置所有筛选
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-3'}>
          <CreateAppContent />

          {filteredApps.map(app => (
            <AppCard 
              key={app.id} 
              app={app} 
              viewMode={viewMode}
              allTags={tags} // Pass Tag[]
              onBindTag={handleBindTag}
              onUnbindTag={handleUnbindTag}
              onCreateTag={handleCreateTag}
              onEdit={openEditModal}
              onDelete={handleDeleteApp}
              onCopy={handleCopyApp}
              onExport={handleExportApp}
              onConvertToWorkflow={handleConvertToWorkflow}
              onManageTags={() => setIsManageTagsModalOpen(true)}
            />
          ))}

          {filteredApps.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-300 mb-4">
                <SearchIcon className="w-8 h-8" />
              </div>
              <p className="text-gray-500">未找到符合搜索条件的应用</p>
              {isFiltered && (
                <button 
                  onClick={handleResetFilters}
                  className="mt-4 text-sm text-blue-600 font-medium hover:underline"
                >
                  清除筛选条件
                </button>
              )}
            </div>
          )}
          {isLoadingMore && (
            <div className="col-span-full py-4 text-center text-gray-400 text-sm">
              加载更多...
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeNavTab} setActiveTab={setActiveNavTab} />

      <main className="flex-grow max-w-[1600px] w-full mx-auto px-6 py-8">
        {renderContent()}
      </main>

      <NewAppModal 
        isOpen={isNewAppModalOpen} 
        onClose={() => { setIsNewAppModalOpen(false); setEditingApp(null); }} 
        onCreate={handleCreateOrUpdateApp}
        initialData={editingApp}
      />
      <CustomAppModal 
        isOpen={isCustomAppModalOpen} 
        onClose={() => { setIsCustomAppModalOpen(false); setEditingApp(null); }} 
        onCreate={handleCreateOrUpdateApp}
        initialData={editingApp}
      />
      <ImportAppModal 
        isOpen={isImportAppModalOpen} 
        onClose={() => setIsImportAppModalOpen(false)} 
        onImport={() => fetchApps()}
      />
      <ManageTagsModal 
        isOpen={isManageTagsModalOpen}
        onClose={() => setIsManageTagsModalOpen(false)}
        tags={tags}
        onRenameTag={handleRenameTag}
        onDeleteTag={handleDeleteTag}
        onCreateTag={handleCreateTag}
      />
      <TokenConfigModal 
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
      />
      <ConvertToWorkflowModal
        isOpen={isConvertToWorkflowModalOpen}
        onClose={() => setIsConvertToWorkflowModalOpen(false)}
        onConfirm={executeConvertToWorkflow}
        app={appToConvert}
      />

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-10 right-10 p-3 bg-white border border-gray-200 text-gray-600 rounded-full shadow-lg hover:bg-gray-50 hover:text-blue-600 transition-all z-50 animate-in fade-in zoom-in duration-300"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default App;
