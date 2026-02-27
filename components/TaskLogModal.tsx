import React, { useState, useEffect } from 'react';
import { TaskLog } from '../types';
import { ChevronLeft, ChevronRight, ChevronDown, X, CheckCircle2, XCircle, Clock, FileText, AlertCircle, Terminal } from 'lucide-react';
import LogResultModal from './LogResultModal';
import LogErrorModal from './LogErrorModal';
import { apiService } from '../services/apiService';

interface TaskLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  taskName?: string;
}

const TaskLogModal: React.FC<TaskLogModalProps> = ({ isOpen, onClose, taskId, taskName }) => {
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const [selectedError, setSelectedError] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      loadLogs();
    }
  }, [isOpen, taskId, currentPage, pageSize]);

  const loadLogs = async () => {
    if (!taskId) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await apiService.getTaskLogs(taskId, currentPage, pageSize);
      setLogs(response.logs || []);
      setTotal(response.pagination?.total_items || 0);
    } catch (error: any) {
      console.error("Failed to load logs", error);
      setFetchError(error.message || '获取日志失败');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const handleViewResult = (result: string) => {
    setSelectedResult(result);
    setIsResultModalOpen(true);
  };

  const handleViewError = (error: string) => {
    setSelectedError(error);
    setIsErrorModalOpen(true);
  };

  const calculateDuration = (start: string, end: string) => {
    try {
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();
      const diff = endTime - startTime;
      if (isNaN(diff)) return '-';
      if (diff < 1000) return `${diff}ms`;
      return `${(diff / 1000).toFixed(1)}s`;
    } catch (e) {
      return '-';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out overflow-hidden border-l border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="flex-none bg-white/90 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-sm">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">定时任务日志</h2>
              <p className="text-xs text-gray-500 mt-0.5 font-mono">
                {taskName ? `当前任务: ${taskName}` : `Task ID: ${taskId}`}
              </p>
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
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm text-gray-400">加载日志中...</span>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="text-sm text-red-500 font-medium">{fetchError}</div>
              <button 
                onClick={loadLogs}
                className="text-xs text-blue-600 hover:underline"
              >
                点击重试
              </button>
            </div>
          ) : logs.length > 0 ? (
            <div className="relative space-y-6">
              {/* Timeline Line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200" />

              {logs.map((log, index) => (
                <div key={log.id} className="relative flex gap-4 group items-start">
                  {/* Timeline Node */}
                  <div className="flex-none relative z-10 mt-2">
                    <div className={`w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                      log.status === 'success' ? 'bg-green-100 text-green-600' :
                      log.status === 'failed' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                       log.status === 'failed' ? <XCircle className="w-4 h-4" /> :
                       <Clock className="w-4 h-4 animate-pulse" />}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          log.status === 'success' ? 'text-green-700' :
                          log.status === 'failed' ? 'text-red-700' :
                          'text-blue-700'
                        }`}>
                          {log.status === 'success' ? '执行成功' :
                           log.status === 'failed' ? '执行失败' :
                           '执行中'}
                        </span>
                        <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-50 rounded-full font-mono">
                          {log.start_time.split(' ')[1]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                        <Clock className="w-3 h-3" />
                        {calculateDuration(log.start_time, log.end_time)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        开始: {log.start_time}
                      </div>
                      
                      {log.result && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                              <FileText className="w-3 h-3" />
                              执行结果
                            </span>
                            <button 
                              onClick={() => handleViewResult(log.result!)}
                              className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              查看详情
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 font-mono">
                            {typeof log.result === 'string' ? log.result : JSON.stringify(log.result)}
                          </p>
                        </div>
                      )}

                      {log.error_message && (
                        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-red-700 flex items-center gap-1.5">
                              <AlertCircle className="w-3 h-3" />
                              错误信息
                            </span>
                            <button 
                              onClick={() => handleViewError(log.error_message!)}
                              className="text-xs text-red-600 hover:text-red-700 hover:underline"
                            >
                              查看详情
                            </button>
                          </div>
                          <p className="text-xs text-red-600/80 line-clamp-2 font-mono">
                            {log.error_message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-300" />
              </div>
              <span className="text-sm text-gray-400">暂无日志数据</span>
            </div>
          )}
        </div>

        {/* Footer / Pagination */}
        <div className="flex-none bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="text-xs text-gray-500">
            共 {total} 条记录
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
              {currentPage} / {totalPages || 1}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0 || isLoading}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <LogResultModal 
        isOpen={isResultModalOpen}
        onClose={() => { setIsResultModalOpen(false); setSelectedResult(null); }}
        result={selectedResult}
      />

      <LogErrorModal 
        isOpen={isErrorModalOpen}
        onClose={() => { setIsErrorModalOpen(false); setSelectedError(null); }}
        error={selectedError}
      />
    </>
  );
};

export default TaskLogModal;
