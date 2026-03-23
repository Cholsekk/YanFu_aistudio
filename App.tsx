
import React, { useState, useMemo, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Header from './components/Header';
import AppCard from './components/AppCard';
import NewAppModal from './components/NewAppModal';
import CustomAppModal from './components/CustomAppModal';
import ImportAppModal from './components/ImportAppModal';
import ManageTagsModal from './components/ManageTagsModal';
import ScheduledTasks from './components/ScheduledTasks';
import ToolExtensions from './components/ToolExtensions';
import MCPServices from './components/MCPServices';
import AppDetail from './components/AppDetail';
import TokenConfigModal from './components/TokenConfigModal';
import ConvertToWorkflowModal from './components/ConvertToWorkflowModal';
import McpAuthCallback from './components/McpAuthCallback';
import ApiDocPage from './components/ApiDocPage';
import { APP_TYPES } from './constants';
import { AppItem, AppMode, Tag, MenuItem } from './types';
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

import { message } from 'antd';
import { ConfirmDialog } from './components/ConfirmDialog';

const App: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeNavTab, setActiveNavTab] = useState('app-dev');

  // Handle tab from query param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveNavTab(tab);
      // Clear the query param after setting the tab
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('tab');
      const newSearch = newSearchParams.toString();
      const newUrl = pathname + (newSearch ? `?${newSearch}` : '');
      router.replace(newUrl);
    }
  }, [searchParams, pathname, router]);

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
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

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

  const lastRequestId = React.useRef(0);

  const fetchApps = async (isLoadMore = false) => {
    if (activeNavTab !== 'app-dev') return;
    
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    const requestId = ++lastRequestId.current;

    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      const params: Record<string, any> = {
        page: currentPage,
        limit: 30, // Increased limit as per new API default
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
          params.limit = 30;
        } else {
          params.built_in = false;
          params.mode = mode;
        }
      }

      // Fetch categories if fetching custom apps
      let categoryMap: Record<string, string> = {};
      if (params.is_custom_app_list) {
        try {
          const categories = await apiService.getAppCategories();
          if (Array.isArray(categories)) {
            categories.forEach((c: any) => {
              if (c.id && c.name) {
                categoryMap[c.id] = c.name;
              }
            });
          }
        } catch (e) {
          console.error('Failed to fetch categories:', e);
        }
      }

      const response = await apiService.getApps(params);
      
      // Check if this is the latest request
      if (requestId !== lastRequestId.current) {
        return;
      }
      
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
        hasMoreData = response.has_more || (activeFilterTab !== '全部' && appList.length > 0);
      } else if (response && Array.isArray(response.items)) {
        appList = response.items;
        hasMoreData = (response.current_page < response.pages) || (activeFilterTab !== '全部' && appList.length > 0);
      }

      const mappedApps: AppItem[] = appList.map((item: any) => {
        const appData = item.app || item;
        
        // Parse menus if it's a string (from custom app API)
        let parsedMenuItems: MenuItem[] = [];
        if (typeof item.menus === 'string') {
          try {
            const parsed = JSON.parse(item.menus);
            parsedMenuItems = parsed.menus || [];
          } catch (e) {
            console.error('Failed to parse menus', e);
          }
        } else {
          parsedMenuItems = appData.config?.menuItems || appData.menuItems || [];
        }

        return {
          id: appData.id,
          itemId: item.app ? item.id : undefined, // Store outer ID if nested (for custom apps)
          name: appData.name,
          type: mapAppModeToType(appData.mode),
          typeLabel: mapAppModeToType(appData.mode),
          description: appData.description || item.description || '',
          icon: appData.icon || '156',
          iconType: appData.icon_type || (appData.icon_url ? 'image' : (appData.icon ? 'icon' : 'sys-icon')),
          icon_url: appData.icon_url,
          tags: appData.tags || [],
          iconBgColor: appData.icon_background || 'bg-primary-600',
          mode: appData.mode || (params.is_custom_app_list ? 'custom' : undefined),
          // Map custom app fields if present
          category: categoryMap[appData.category || item.category] || appData.category || item.category,
          
          // Fix: appUrl from appData.url (nested app object)
          appUrl: appData.url || appData.config?.appUrl || appData.appUrl,
          
          // Fix: needToken from item.is_token_verified
          needToken: item.is_token_verified !== undefined ? item.is_token_verified : (appData.config?.needToken ?? appData.needToken ?? true),
          
          loginUrl: appData.config?.loginUrl || appData.loginUrl || item.login_api,
          authUrl: appData.config?.authUrl || appData.authUrl || item.jwt_api,
          account: appData.config?.account || appData.account || item.default_username,
          password: appData.config?.password || appData.password || item.default_password,
          
          // Fix: customMenu from item.is_menu
          customMenu: item.is_menu !== undefined ? item.is_menu : (appData.config?.customMenu ?? appData.customMenu ?? false),
          
          menuItems: parsedMenuItems,
          builtIn: appData.built_in !== undefined ? appData.built_in : (params.built_in === true),
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
      // Only clear apps if this is the latest request
      if (requestId === lastRequestId.current && !isLoadMore) {
        setApps([]);
      }
    } finally {
      // Only update loading state if this is the latest request
      if (requestId === lastRequestId.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    // Clear apps immediately when switching tabs to prevent stale data display
    setApps([]);
    setPage(1);
    setHasMore(false);
    
    // Invalidate any in-flight requests immediately to prevent race conditions
    lastRequestId.current += 1;
    
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
    // Client-side sorting
    let result = [...apps];

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'time-desc') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === 'time-asc') {
      result.sort((a, b) => a.id.localeCompare(b.id));
    }
    
    return result;
  }, [apps, sortBy]);

  const handleCreateTag = async (name: string) => {
    try {
      await apiService.createTag(name, 'app');
      fetchTags();
      message.success('创建标签成功');
    } catch (error) {
      console.error('Failed to create tag:', error);
      message.error('创建标签失败');
    }
  };

  const handleRenameTag = async (tagId: string, newName: string) => {
    try {
      await apiService.updateTag(tagId, newName);
      fetchTags();
      fetchApps(); // Refresh apps to update tag names in UI
      message.success('重命名标签成功');
    } catch (error) {
      console.error('Failed to rename tag:', error);
      message.error('重命名标签失败');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await apiService.deleteTag(tagId);
      fetchTags();
      fetchApps(); // Refresh apps to remove deleted tag
      message.success('删除标签成功');
    } catch (error) {
      console.error('Failed to delete tag:', error);
      message.error('删除标签失败');
    }
  };

  const handleBindTag = async (appId: string, tagId: string) => {
    try {
      await apiService.bindTag([tagId], appId, 'app');
      fetchApps();
      fetchTags(); // Update binding counts
      message.success('添加标签成功');
    } catch (error) {
      console.error('Failed to bind tag:', error);
      message.error('添加标签失败');
    }
  };

  const handleUnbindTag = async (appId: string, tagId: string) => {
    try {
      await apiService.unBindTag(tagId, appId, 'app');
      fetchApps();
      fetchTags(); // Update binding counts
      message.success('移除标签成功');
    } catch (error) {
      console.error('Failed to unbind tag:', error);
      message.error('移除标签失败');
    }
  };

  const handleCreateOrUpdateApp = async (appData: any) => {
    try {
      // Handle Custom Apps separately
      if (appData.type === '定制应用' || appData.mode === 'custom') {
        const customAppPayload = {
          id: appData.itemId, // Outer ID for update
          app: {
            id: appData.id, // Inner ID
            name: appData.name,
            mode: 'custom',
            icon: appData.icon,
            icon_type: appData.iconType || 'icon',
            url: appData.appUrl
          },
          app_id: appData.id,
          description: appData.description,
          copyright: 'Yanfu.AI', // Default or from input if available
          privacy_policy: '',
          custom_disclaimer: '',
          category: appData.category,
          position: 0,
          is_listed: true,
          label_type: 'free',
          label_name: '免费使用',
          is_token_verified: appData.needToken,
          login_api: appData.loginUrl,
          jwt_api: appData.authUrl,
          default_username: appData.account,
          default_password: appData.password,
          is_menu: appData.customMenu,
          menus: appData.customMenu ? JSON.stringify({ menus: appData.menuItems }) : null,
          created_by: 'c90c0746-f226-4ddf-b7cd-e04318fc018d' // Mock or from user context
        };

        if (appData.id) {
          // Update
          await apiService.updateCustomApp(customAppPayload);
        } else {
          // Create
          // For create, we might not have IDs. The backend should generate them.
          // But the payload structure requires 'app' object.
          // We can omit IDs for create if backend handles it.
          // Or generate UUIDs if required.
          // Assuming backend handles missing IDs or we send partial payload.
          // But user sample has IDs.
          // Let's try sending without IDs for create, or with nulls.
          const createPayload = { ...customAppPayload };
          delete createPayload.id;
          delete createPayload.app.id;
          delete createPayload.app_id;
          
          await apiService.createCustomApp(createPayload);
        }
        fetchApps();
        setEditingApp(null);
        return;
      }

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
        // Update standard app
        await apiService.updateApp(appData.id, {
          name: appData.name,
          icon_type: appData.iconType || 'icon',
          icon: appData.icon,
          icon_background: appData.iconBgColor,
          description: appData.description,
          use_icon_as_answer_icon: false, // Default
          built_in: appData.builtIn || false,
          // Pass config with custom fields
          // @ts-ignore - apiService updateApp signature might need update or we cast
          config: config
        });
      } else {
        // Create standard app
        await apiService.createApp({
          name: appData.name,
          icon_type: appData.iconType || 'icon',
          icon: appData.icon,
          icon_background: appData.iconBgColor,
          mode: mapTypeToAppMode(appData.typeLabel || appData.type),
          description: appData.description,
          built_in: appData.builtIn || false,
          config: config
        });
      }
      fetchApps();
      setEditingApp(null);
      message.success('应用保存成功');
    } catch (error) {
      console.error('Failed to save app:', error);
      message.error('保存失败，请重试');
    }
  };

  const handleDeleteApp = async (id: string) => {
    const app = apps.find(a => a.id === id);
    if (!app) return;

    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: '确认删除该应用吗？此操作无法撤销。',
      type: 'danger',
      onConfirm: async () => {
        try {
          if (app.type === '定制应用' || app.mode === 'custom') {
            // Use outer ID (itemId) for custom app deletion if available, otherwise fallback to id
            await apiService.deleteCustomApp(app.itemId || id);
          } else {
            await apiService.deleteApp(id);
          }
          fetchApps();
          message.success('应用删除成功');
        } catch (error) {
          console.error('Failed to delete app:', error);
          message.error('删除失败，请重试');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
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
      message.success('应用复制成功');
    } catch (error) {
      console.error('Failed to copy app:', error);
      message.error('复制失败，请重试');
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
        message.success('应用导出成功');
      } else {
        message.error('导出失败：未获取到数据');
      }
    } catch (error) {
      console.error('Export failed:', error);
      message.error('导出失败，请重试');
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
      message.success('迁移成功');
    } catch (error: any) {
      console.error('Failed to convert app:', error);
      message.error(`迁移失败: ${error.message || '未知错误'}`);
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
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col gap-4 h-full">
          <div>
            <h3 className="font-semibold text-gray-900 text-base mb-0.5">创建应用</h3>
            <p className="text-[11px] text-gray-500">从头开始或导入现有配置</p>
          </div>
          <div className="space-y-2 mt-auto">
            <button 
              onClick={() => { setEditingApp(null); setIsNewAppModalOpen(true); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-dashed border-gray-200 text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all group"
            >
              <div className="p-1.5 bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-100 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold leading-tight">新建应用</p>
                <p className="text-[10px] text-gray-400 mt-0.5">创建全新的对话或工作流应用</p>
              </div>
            </button>
            <button 
              onClick={() => { setEditingApp(null); setIsCustomAppModalOpen(true); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-dashed border-gray-200 text-gray-600 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all group"
            >
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold leading-tight">创建定制化应用</p>
                <p className="text-[10px] text-gray-400 mt-0.5">基于模板快速构建</p>
              </div>
            </button>
            <button 
              onClick={() => setIsImportAppModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-dashed border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all group"
            >
              <div className="p-1.5 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold leading-tight">导入应用</p>
                <p className="text-[10px] text-gray-400 mt-0.5">从外部文件或链接导入</p>
              </div>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4 shadow-sm flex items-center gap-6 mb-2">
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all text-sm text-gray-600 hover:text-primary-600 font-medium"
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
    if (selectedApp) {
      return (
        <AppDetail 
          app={selectedApp} 
          onBack={() => setSelectedApp(null)} 
        />
      );
    }

    if (activeNavTab === 'tasks') {
      return <ScheduledTasks />;
    }

    if (activeNavTab === 'tools') {
      return <ToolExtensions />;
    }

    if (activeNavTab === 'mcp') {
      return <MCPServices />;
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
                onClick={() => {
                  setApps([]); // Clear immediately to prevent stale data render
                  setPage(1);
                  setHasMore(false);
                  setActiveFilterTab(type);
                }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeFilterTab === type 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500" />
              <input
                type="text"
                placeholder="搜索应用"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-all shadow-sm
                  ${isFilterOpen || isFiltered 
                    ? 'border-primary-500 text-primary-600 bg-primary-50/30' 
                    : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}
              >
                <Filter className={`w-4 h-4 ${isFiltered ? 'fill-primary-600/10' : ''}`} />
                筛选
                <ChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFilterOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={(e) => {
                      // 检查点击是否来自模态框区域
                      if ((e.target as HTMLElement).closest('.tool-auth-drawer, .tool-auth-settings-drawer, .tool-param-drawer, .edit-custom-tool-modal')) {
                        return;
                      }
                      setIsFilterOpen(false);
                    }} 
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60] animate-in fade-in slide-in-from-top-2 overflow-hidden">
                    <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                      <span>排序</span>
                    {isFiltered && (
                      <button 
                        onClick={handleResetFilters}
                        className="text-primary-600 hover:text-primary-700 normal-case flex items-center gap-0.5"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        重置
                      </button>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => { setSortBy('default'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${sortBy === 'default' ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <ListOrdered className="w-4 h-4 opacity-50" />
                      <span>默认 (数据源排序)</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setSortBy('name'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${sortBy === 'name' ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span>按名称</span>
                  </button>
                  <button 
                    onClick={() => { setSortBy('time-desc'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${sortBy === 'time-desc' ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span>按创建时间 (降序)</span>
                    <SortDesc className="w-4 h-4 opacity-70" />
                  </button>
                  <button 
                    onClick={() => { setSortBy('time-asc'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${sortBy === 'time-asc' ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
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
                </>
              )}
            </div>

            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
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
              onClick={() => {
                if (app.type !== '定制应用' && app.mode !== 'custom') {
                  setSelectedApp(app);
                }
              }}
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
                  className="mt-4 text-sm text-primary-600 font-medium hover:underline"
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

  if (pathname === '/mcp-auth-callback') {
    return <McpAuthCallback />;
  }

  if (pathname?.startsWith('/api-doc/')) {
    return <ApiDocPage />;
  }

  return (
    <div className={`flex flex-col ${selectedApp ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Header activeTab={activeNavTab} setActiveTab={(tab) => { setActiveNavTab(tab); setSelectedApp(null); }} />

      <main className={`flex-grow flex flex-col min-h-0 ${selectedApp ? 'w-full' : 'max-w-[1600px] w-full mx-auto px-6 py-8'}`}>
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
        onCreate={() => { fetchApps(); setEditingApp(null); }}
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
          className="fixed bottom-10 right-10 p-3 bg-white border border-gray-200 text-gray-600 rounded-full shadow-lg hover:bg-gray-50 hover:text-primary-600 transition-all z-50 animate-in fade-in zoom-in duration-300"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default App;
