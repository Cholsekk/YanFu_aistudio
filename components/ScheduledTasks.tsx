
import React, { useState, useEffect } from 'react';
import { ScheduledTask } from '../types';
import { Plus, ChevronLeft, ChevronRight, ChevronDown, Settings, AlertTriangle } from 'lucide-react';
import EditTaskModal from './EditTaskModal';
import NewTaskModal from './NewTaskModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import TaskLogModal from './TaskLogModal';
import ConfirmStatusModal from './ConfirmStatusModal';
import { apiService } from '../services/apiService';

const ScheduledTasks: React.FC = () => {
  // View State
  const [displayedTasks, setDisplayedTasks] = useState<ScheduledTask[]>([]);
  const [searchName, setSearchName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  
  const [taskToDelete, setTaskToDelete] = useState<ScheduledTask | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [taskToViewLog, setTaskToViewLog] = useState<ScheduledTask | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const [taskToToggleStatus, setTaskToToggleStatus] = useState<ScheduledTask | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [fetchError, setFetchError] = useState<string | null>(null);

  // API Call
  const fetchTasks = async (page: number, size: number) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await apiService.getTasks(page, size, searchName);
      setDisplayedTasks(response.items || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error);
      setFetchError(error.message || '获取数据失败，请检查网络或 Token 配置');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load & Refresh when dependencies change
  useEffect(() => {
    fetchTasks(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Listen for unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      // The Header now handles the TokenConfigModal, but we can still listen here if needed
      // or just rely on the global event.
    };
    window.addEventListener('api-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('api-unauthorized', handleUnauthorized);
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTasks(1, pageSize);
  };

  const handleReset = () => {
    setSearchName('');
    setCurrentPage(1);
    fetchTasks(1, pageSize);
  };

  const handleToggleStatusClick = (task: ScheduledTask) => {
    setTaskToToggleStatus(task);
    setIsStatusModalOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (taskToToggleStatus) {
      try {
        await apiService.toggleTaskStatus(taskToToggleStatus.id);
        fetchTasks(currentPage, pageSize);
      } catch (error) {
        console.error('Failed to toggle status:', error);
      }
      setTaskToToggleStatus(null);
    }
  };

  const handleEdit = (task: ScheduledTask) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveTask = async (updatedTask: ScheduledTask) => {
    try {
      await apiService.updateTask(updatedTask.id, updatedTask);
      fetchTasks(currentPage, pageSize);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
    setEditingTask(null);
  };

  const handleCreateTask = async (newTask: ScheduledTask) => {
    try {
      await apiService.createTask(newTask);
      fetchTasks(1, pageSize);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDeleteClick = (task: ScheduledTask) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      try {
        await apiService.deleteTask(taskToDelete.id);
        // If deleting the last item on the current page, go back one page
        if (displayedTasks.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchTasks(currentPage, pageSize);
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
      setTaskToDelete(null);
    }
  };

  const handleViewLog = (task: ScheduledTask) => {
    setTaskToViewLog(task);
    setIsLogModalOpen(true);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Action Bar */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto flex-1">
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <span className="text-sm text-gray-500 whitespace-nowrap font-medium">任务名称</span>
            <div className="w-px h-4 bg-gray-300"></div>
            <input 
              type="text" 
              placeholder="请输入任务名称" 
              className="bg-transparent border-none text-sm w-full md:w-64 focus:outline-none text-gray-700 placeholder-gray-400"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSearch}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              查询
            </button>
            <button 
              onClick={handleReset}
              className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              重置
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-end pl-4 md:border-l md:border-gray-100">
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            新建任务
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-bottom border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">任务名称</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">任务描述</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">所属应用</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">调用方法</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">任务状态</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">任务类型</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">规则</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-400">加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-red-600 font-bold">连接后端失败</div>
                        <div className="text-xs text-gray-500 leading-relaxed">
                          由于浏览器安全策略，HTTPS 页面默认拦截 HTTP 请求。
                          请点击地址栏右侧的<span className="font-bold text-gray-700">“不安全内容”</span>图标并选择<span className="font-bold text-gray-700">“允许”</span>，然后重试。
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <button 
                          onClick={() => fetchTasks(currentPage, pageSize)}
                          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-all"
                        >
                          点击重试
                        </button>
                        <button 
                          onClick={() => {
                            localStorage.setItem('console_mock_mode', 'true');
                            window.location.reload();
                          }}
                          className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-all"
                        >
                          使用模拟数据
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : displayedTasks.length > 0 ? (
                displayedTasks.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{task.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {task.app_id ? (
                        task.app_name
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          外部应用
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${
                        task.method === 'GET' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        task.method === 'POST' ? 'bg-green-50 text-green-600 border-green-200' :
                        task.method === 'PUT' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                        task.method === 'DELETE' ? 'bg-red-50 text-red-600 border-red-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {task.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggleStatusClick(task)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${task.status === 'active' ? 'bg-blue-600' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${task.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.schedule_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate" title={task.schedule_expression}>
                      {(() => {
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
                            
                            const parts = [];
                            if (weeks) parts.push(`${weeks}周`);
                            if (days) parts.push(`${days}天`);
                            if (hours) parts.push(`${hours}小时`);
                            if (minutes) parts.push(`${minutes}分钟`);
                            if (seconds) parts.push(`${seconds}秒`);
                            
                            return parts.length > 0 ? `每 ${parts.join(' ')}` : `${totalSeconds}秒`;
                          } catch (e) {
                            return task.schedule_expression;
                          }
                        }
                        return task.schedule_expression;
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{task.created_at}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleEdit(task)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(task)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                          删除
                        </button>
                        <button 
                          onClick={() => handleViewLog(task)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          查看
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 text-sm">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50/30 flex items-center justify-end gap-4">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-gray-400 hover:bg-white hover:text-gray-600 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-all ${
                  currentPage === page 
                    ? 'bg-white border border-blue-500 text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:bg-white'
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-md text-gray-400 hover:bg-white hover:text-gray-600 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-gray-300 transition-all">
              {pageSize} 条/页
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute bottom-full right-0 mb-1 w-24 bg-white rounded-lg shadow-xl border border-gray-100 py-1 hidden group-hover:block z-10">
              {[10, 20, 50].map(size => (
                <button
                  key={size}
                  onClick={() => { setPageSize(size); setCurrentPage(1); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${pageSize === size ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
                >
                  {size} 条/页
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EditTaskModal 
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        task={editingTask}
      />

      <NewTaskModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleCreateTask}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setTaskToDelete(null); }}
        onConfirm={handleConfirmDelete}
        taskName={taskToDelete?.name || ''}
      />

      <TaskLogModal
        isOpen={isLogModalOpen}
        onClose={() => { setIsLogModalOpen(false); setTaskToViewLog(null); }}
        taskId={taskToViewLog?.id || null}
        taskName={taskToViewLog?.name}
      />

      <ConfirmStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => { setIsStatusModalOpen(false); setTaskToToggleStatus(null); }}
        onConfirm={handleConfirmToggleStatus}
        taskName={taskToToggleStatus?.name || ''}
        targetStatus={taskToToggleStatus?.status !== 'active'}
      />
    </div>
  );
};

export default ScheduledTasks;
