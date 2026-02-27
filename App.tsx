
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import AppCard from './components/AppCard';
import NewAppModal from './components/NewAppModal';
import CustomAppModal from './components/CustomAppModal';
import ImportAppModal from './components/ImportAppModal';
import ManageTagsModal from './components/ManageTagsModal';
import ScheduledTasks from './components/ScheduledTasks';
import ToolExtensions from './components/ToolExtensions';
import TokenConfigModal from './components/TokenConfigModal';
import { MOCK_APPS, APP_TYPES } from './constants';
import { AppItem } from './types';
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
  ListOrdered
} from 'lucide-react';

const App: React.FC = () => {
  const [activeNavTab, setActiveNavTab] = useState('app-dev');
  const [activeFilterTab, setActiveFilterTab] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [apps, setApps] = useState<AppItem[]>(MOCK_APPS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'time-desc' | 'time-asc'>('default');
  
  // Modal states
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [isCustomAppModalOpen, setIsCustomAppModalOpen] = useState(false);
  const [isImportAppModalOpen, setIsImportAppModalOpen] = useState(false);
  const [isManageTagsModalOpen, setIsManageTagsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);

  // Listen for unauthorized events
  React.useEffect(() => {
    const handleUnauthorized = () => {
      setIsTokenModalOpen(true);
    };
    window.addEventListener('api-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('api-unauthorized', handleUnauthorized);
  }, []);

  // Check if any filter or non-default sort is active
  const isFiltered = useMemo(() => {
    return activeFilterTab !== '全部' || sortBy !== 'default';
  }, [activeFilterTab, sortBy]);

  const handleResetFilters = () => {
    setActiveFilterTab('全部');
    setSortBy('default');
    setSearchQuery('');
    setIsFilterOpen(false);
  };

  const filteredApps = useMemo(() => {
    let result = apps.filter(app => {
      const matchesType = activeFilterTab === '全部' || app.type === activeFilterTab || app.typeLabel === activeFilterTab;
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           app.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });

    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'time-desc') {
      result = [...result].sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === 'time-asc') {
      result = [...result].sort((a, b) => a.id.localeCompare(b.id));
    }
    // If sortBy is 'default', we just keep the filtered order as-is (data source order)

    return result;
  }, [apps, activeFilterTab, searchQuery, sortBy]);

  const handleUpdateTags = (id: string, newTags: string[]) => {
    setApps(apps.map(app => app.id === id ? { ...app, tags: newTags } : app));
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    apps.forEach(app => app.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [apps]);

  const handleRenameTag = (oldName: string, newName: string) => {
    setApps(apps.map(app => ({
      ...app,
      tags: app.tags.map(tag => tag === oldName ? newName : tag)
    })));
  };

  const handleDeleteTagGlobal = (tagName: string) => {
    setApps(apps.map(app => ({
      ...app,
      tags: app.tags.filter(tag => tag !== tagName)
    })));
  };

  const handleCreateOrUpdateApp = (appData: any) => {
    if (appData.id) {
      setApps(apps.map(a => a.id === appData.id ? { ...a, ...appData } : a));
    } else {
      const newApp: AppItem = {
        id: Date.now().toString(),
        ...appData,
        tags: appData.tags || []
      };
      setApps([newApp, ...apps]);
    }
    setEditingApp(null);
  };

  const handleDeleteApp = (id: string) => {
    if (confirm('确认删除该应用吗？')) {
      setApps(apps.filter(a => a.id !== id));
    }
  };

  const handleCopyApp = (app: AppItem) => {
    const copy: AppItem = {
      ...app,
      id: `${Date.now()}`,
      name: `${app.name} (副本)`
    };
    setApps([copy, ...apps]);
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
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-8">
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
              allTags={allTags}
              onUpdateTags={handleUpdateTags}
              onEdit={openEditModal}
              onDelete={handleDeleteApp}
              onCopy={handleCopyApp}
              onExport={handleExportApp}
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
        onImport={handleCreateOrUpdateApp}
      />
      <ManageTagsModal 
        isOpen={isManageTagsModalOpen}
        onClose={() => setIsManageTagsModalOpen(false)}
        allTags={allTags}
        onRenameTag={handleRenameTag}
        onDeleteTag={handleDeleteTagGlobal}
      />
      <TokenConfigModal 
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
      />
    </div>
  );
};

export default App;
