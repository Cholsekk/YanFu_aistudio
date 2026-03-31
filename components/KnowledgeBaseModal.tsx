
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  FileText, 
  Database, 
  Network, 
  LayoutGrid, 
  Check, 
  Folder,
  X,
  Loader2
} from 'lucide-react';
import { Input, Button, Tabs, Badge, Spin } from 'antd';
import Modal from './Modal';
import { apiService } from '../services/apiService';
import { DataSet } from '../types';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (selected: DataSet[]) => void;
  excludeIds?: string[];
}

const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ isOpen, onClose, onAdd, excludeIds }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [datasets, setDatasets] = useState<DataSet[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchDatasets = useCallback(async (pageNum: number, isLoadMore: boolean = false) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const params: { page: number; limit: number; type?: string } = {
        page: pageNum,
        limit: 20,
      };
      if (activeTab !== 'all') {
        params.type = activeTab;
      }

      const response = await apiService.fetchDatasets(params);
      console.log('API Response:', response);

      const responseData = Array.isArray(response) ? response : (response.data || []);
      if (isLoadMore) {
        setDatasets(prev => [...prev, ...responseData]);
      } else {
        setDatasets(responseData);
      }
      setHasMore(Array.isArray(response) ? false : !!response.has_more);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      fetchDatasets(1, false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, activeTab]);

  // Handle search with debounce
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchDatasets(1, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleScroll = () => {
    if (!scrollContainerRef.current || isLoading || !hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      fetchDatasets(page + 1, true);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    const selected = datasets.filter(kb => selectedIds.includes(kb.id));
    onAdd(selected);
    onClose();
  };

  const filteredDatasets = datasets.filter(ds => 
    (ds.name || '').toLowerCase().includes(searchQuery.toLowerCase()) &&
    !(excludeIds || []).includes(ds.id)
  );

  const tabItems = [
    { key: 'all', label: '全部', icon: <LayoutGrid className="w-4 h-4" /> },
    { key: 'doc', label: '文档', icon: <FileText className="w-4 h-4" /> },
    { key: 'database', label: '数据库', icon: <Database className="w-4 h-4" /> },
    { key: 'knowledge_graph', label: '知识图谱', icon: <Network className="w-4 h-4" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="选择引用知识库"
      maxWidth="max-w-2xl"
      bodyClassName="p-0 flex flex-col h-[600px]"
    >
      <div className="p-4 pb-2 space-y-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Tabs 
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems.map(tab => ({
              key: tab.key,
              label: (
                <div className="flex items-center gap-1.5 px-0.5">
                  {tab.icon}
                  <span className="text-sm">{tab.label}</span>
                </div>
              )
            }))}
            className="flex-grow knowledge-tabs"
          />
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="搜索知识库 (支持多选)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-lg border-gray-100 bg-gray-50/50 focus:bg-white transition-all h-9"
          />
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-grow overflow-y-auto p-4 custom-scrollbar space-y-1.5"
      >
        {filteredDatasets.map((kb) => (
          <div
            key={kb.id}
            onClick={() => toggleSelect(kb.id)}
            className={`
              flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group
              ${selectedIds.includes(kb.id) 
                ? 'border-blue-500 bg-blue-50/50' 
                : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50/50'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-8 h-8 rounded-md flex items-center justify-center transition-colors
                ${selectedIds.includes(kb.id) ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-500'}
              `}>
                <Folder className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{kb.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1 py-0 rounded uppercase font-medium">
                    {kb.indexing_technique === 'high_quality' ? '高质量' : '经济型'} · {kb.data_source_type}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={`
              w-4 h-4 rounded border flex items-center justify-center transition-all
              ${selectedIds.includes(kb.id) 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'border-gray-300 group-hover:border-blue-300'}
            `}>
              {selectedIds.includes(kb.id) && <Check className="w-3 h-3" />}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="py-4 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}

        {filteredDatasets.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-12">
            <Search className="w-12 h-12 opacity-10" />
            <p className="text-sm">未找到匹配的知识库</p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 p-4 border-t border-gray-100 bg-white">
        <Button onClick={onClose} className="rounded-full px-6">取消</Button>
        <Button 
          type="primary" 
          onClick={handleAdd} 
          disabled={selectedIds.length === 0}
          className="rounded-full px-8 bg-blue-600"
        >
          添加 ({selectedIds.length})
        </Button>
      </div>
    </Modal>
  );
};

export default KnowledgeBaseModal;
