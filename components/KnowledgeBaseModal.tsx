
import React, { useState } from 'react';
import { 
  Search, 
  FileText, 
  Database, 
  Network, 
  LayoutGrid, 
  Check, 
  Folder,
  X
} from 'lucide-react';
import { Input, Button, Tabs, Badge } from 'antd';
import Modal from './Modal';

interface KnowledgeBase {
  id: string;
  name: string;
  type: 'document' | 'database' | 'graph';
  quality: string;
  searchType: string;
  count?: number;
}

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (selected: KnowledgeBase[]) => void;
}

const MOCK_KNOWLEDGE_BASES: KnowledgeBase[] = [
  { id: 'kb-1', name: '青少年体质情况', type: 'document', quality: '高质量', searchType: '混合检索' },
  { id: 'kb-2', name: '青少年体质', type: 'document', quality: '高质量', searchType: '混合检索' },
  { id: 'kb-3', name: 'iotdb', type: 'database', quality: '高质量', searchType: '混合检索' },
  { id: 'kb-4', name: 'iotdb升级', type: 'database', quality: '高质量', searchType: '混合检索' },
  { id: 'kb-5', name: 'iotdb-v2', type: 'database', quality: '高质量', searchType: '向量检索' },
  { id: 'kb-6', name: 'test3', type: 'document', quality: '高质量', searchType: '向量检索' },
  { id: 'kb-7', name: 'test1', type: 'document', quality: '高质量', searchType: '向量检索' },
];

const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    const selected = MOCK_KNOWLEDGE_BASES.filter(kb => selectedIds.includes(kb.id));
    onAdd(selected);
    onClose();
  };

  const [activeTab, setActiveTab] = useState('all');

  const filteredKBs = MOCK_KNOWLEDGE_BASES.filter(kb => {
    const matchesSearch = kb.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || kb.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const tabItems = [
    { key: 'all', label: '全部', icon: <LayoutGrid className="w-4 h-4" /> },
    { key: 'document', label: '文档', icon: <FileText className="w-4 h-4" /> },
    { key: 'database', label: '数据库', icon: <Database className="w-4 h-4" /> },
    { key: 'graph', label: '知识图谱', icon: <Network className="w-4 h-4" /> },
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

      <div className="flex-grow overflow-y-auto p-4 custom-scrollbar space-y-1.5">
        {filteredKBs.map((kb) => (
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
                    {kb.quality} · {kb.searchType}
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
        
        {filteredKBs.length === 0 && (
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
