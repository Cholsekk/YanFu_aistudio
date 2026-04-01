import React, { useState, useEffect } from 'react';
import { Plus, Upload, X, Folder, FileText, Search, MoreHorizontal, Download, Scissors, Pencil, Trash2, FilePlus, FolderPlus, FileUp, FolderUp } from 'lucide-react';
import { Skill, FileNode, getFileTree, getFileContent, updateFileContent, addSkill, renameNode, deleteNode, uploadZip, createNewNode, getSkillList, SkillListItem } from '../lib/api/skills';

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-[500px] p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const FileTreeItem: React.FC<{
  item: FileNode;
  depth?: number;
  onSelectFile: (file: FileNode) => void;
  selectedFileId: string | null;
  onRename: (tree_id: string, new_name: string) => void;
  onDelete: (tree_id: string) => void;
  onCreate: (parent_id: string, is_dir: boolean, name: string) => void;
}> = ({ item, depth = 0, onSelectFile, selectedFileId, onRename, onDelete, onCreate }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const isSelected = selectedFileId === item.id;

  return (
    <div className="relative group">
      <div
        className={`flex items-center justify-between py-1 px-2 hover:bg-gray-100 cursor-pointer text-sm ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (!item.is_dir) onSelectFile(item);
          else setIsOpen(!isOpen);
        }}
      >
        <div className="flex items-center gap-2 flex-grow min-w-0">
          {item.is_dir ? <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" /> : <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          <span 
            className={`truncate ${isSelected ? 'font-medium' : ''}`} 
            title={item.name}
          >
            {item.name}
          </span>
        </div>
        <button 
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded flex-shrink-0"
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
        >
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-6 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 text-sm">
            {item.is_dir ? (
              <>
                <button onClick={() => onCreate(item.id, false, 'new_file.txt')} className="w-full text-left px-4 py-1.5 hover:bg-gray-100 flex items-center gap-2"><FilePlus className="w-4 h-4"/>新建文件</button>
                <button onClick={() => onCreate(item.id, true, 'new_folder')} className="w-full text-left px-4 py-1.5 hover:bg-gray-100 flex items-center gap-2"><FolderPlus className="w-4 h-4"/>新建文件夹...</button>
              </>
            ) : (
              <button className="w-full text-left px-4 py-1.5 hover:bg-gray-100 flex items-center gap-2"><Download className="w-4 h-4"/>下载</button>
            )}
            <button onClick={() => onRename(item.id, prompt('输入新名称', item.name) || item.name)} className="w-full text-left px-4 py-1.5 hover:bg-gray-100 flex items-center gap-2"><Pencil className="w-4 h-4"/>重命名</button>
            <button onClick={() => onDelete(item.id)} className="w-full text-left px-4 py-1.5 hover:bg-gray-100 flex items-center gap-2 text-red-600"><Trash2 className="w-4 h-4"/>删除</button>
          </div>
        </>
      )}

      {item.is_dir && isOpen && item.children?.map((child, i) => (
        <FileTreeItem key={i} item={child} depth={depth + 1} onSelectFile={onSelectFile} selectedFileId={selectedFileId} onRename={onRename} onDelete={onDelete} onCreate={onCreate} />
      ))}
    </div>
  );
};

const SkillsTab: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [fileContent, setFileContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [skills, setSkills] = useState<SkillListItem[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSkills = () => {
    getSkillList().then(res => {
      if (res.data?.list) {
        setSkills(res.data.list);
      }
    });
  };

  const fetchFileTree = (skillId: string) => {
    getFileTree(skillId).then(res => {
      if (res.data) {
        setFileTree([res.data]);
      }
    });
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    if (selectedSkillId) {
      fetchFileTree(selectedSkillId);
      setSelectedFile(null);
      setFileContent('');
      setIsEditing(false);
    }
  }, [selectedSkillId]);

  useEffect(() => {
    if (selectedFile && selectedSkillId) {
      getFileContent(selectedSkillId, selectedFile.id).then(res => {
        setFileContent(res.text);
        setEditedContent(res.text);
      });
    }
  }, [selectedFile, selectedSkillId]);

  const handleSaveContent = () => {
    if (!selectedSkillId || !selectedFile) return;
    updateFileContent(selectedSkillId, selectedFile.id, editedContent).then(() => {
      setFileContent(editedContent);
      setIsEditing(false);
    });
  };

  const handleRename = (tree_id: string, new_name: string) => {
    if (!selectedSkillId) return;
    renameNode(selectedSkillId, tree_id, new_name).then(() => {
      fetchFileTree(selectedSkillId);
    });
  };

  const handleDelete = (tree_id: string) => {
    if (!selectedSkillId) return;
    deleteNode(selectedSkillId, tree_id).then(() => {
      fetchFileTree(selectedSkillId);
    });
  };

  const handleCreate = (parent_id: string, is_dir: boolean, name: string) => {
    if (!selectedSkillId) return;
    createNewNode(selectedSkillId, parent_id, is_dir, name).then(() => {
      fetchFileTree(selectedSkillId);
    });
  };

  const handleCreateSkill = () => {
    if (!newSkillName) return;
    addSkill(newSkillName, false).then(() => {
      setIsCreateModalOpen(false);
      setNewSkillName('');
      fetchSkills();
    });
  };

  const handleImportSkill = (file: File) => {
    uploadZip(file).then(() => {
      setIsImportModalOpen(false);
      fetchSkills();
    });
  };

  const filteredFileTree = fileTree.map(node => {
    const filterNode = (n: FileNode): FileNode | null => {
      if (n.name.toLowerCase().includes(searchTerm.toLowerCase())) return n;
      if (n.children) {
        const filteredChildren = n.children.map(filterNode).filter(Boolean) as FileNode[];
        if (filteredChildren.length > 0) return { ...n, children: filteredChildren };
      }
      return null;
    };
    return filterNode(node);
  }).filter(Boolean) as FileNode[];

  return (
    <div className="flex h-[calc(100vh-100px)] bg-[#f8f9fa] overflow-hidden rounded-2xl border border-gray-200 shadow-2xl">
      {/* Column 1: Skill Switcher (Sleek Sidebar) */}
      <div className="w-72 flex flex-col bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Skill 库</h3>
            <div className="flex gap-1">
              <button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                title="创建"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsImportModalOpen(true)} 
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                title="导入"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            <input 
              type="text" 
              placeholder="快速跳转..." 
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-primary-500/10 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {skills.map(skill => (
            <div 
              key={skill.id} 
              onClick={() => setSelectedSkillId(skill.id)}
              className={`group relative p-3 rounded-xl transition-all cursor-pointer border ${selectedSkillId === skill.id ? 'bg-primary-50/50 border-primary-100 shadow-sm' : 'bg-transparent border-transparent hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${selectedSkillId === skill.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-gray-100 text-gray-400 group-hover:bg-white group-hover:shadow-md'}`}>
                  {skill.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-grow">
                  <h4 className={`text-sm font-semibold truncate ${selectedSkillId === skill.id ? 'text-primary-900' : 'text-gray-700'}`}>{skill.name}</h4>
                  <p className="text-[10px] text-gray-400 truncate font-mono">#{skill.id.substring(0, 8)}</p>
                </div>
                {selectedSkillId === skill.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                )}
              </div>
            </div>
          ))}
          {skills.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-gray-200" />
              </div>
              <p className="text-xs text-gray-400">暂无 Skill</p>
            </div>
          )}
        </div>
      </div>

      {/* Column 2: File Explorer */}
      <div className="w-64 flex flex-col bg-white border-r border-gray-100">
        <div className="h-14 px-4 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">资源管理器</span>
          <button 
            onClick={() => selectedSkillId && handleCreate(fileTree[0]?.id || '', false, 'new_file.txt')}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
            disabled={!selectedSkillId}
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300" />
            <input 
              type="text" 
              placeholder="过滤文件..." 
              className="w-full pl-8 pr-2 py-1.5 bg-gray-50/50 border border-gray-100 rounded-lg text-[11px] focus:outline-none focus:border-primary-200 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto px-2 py-1 custom-scrollbar">
          {selectedSkillId ? (
            <>
              {filteredFileTree.map((item, i) => (
                <FileTreeItem 
                  key={i} 
                  item={item} 
                  onSelectFile={setSelectedFile} 
                  selectedFileId={selectedFile?.id || null} 
                  onRename={handleRename} 
                  onDelete={handleDelete} 
                  onCreate={handleCreate} 
                />
              ))}
              {filteredFileTree.length === 0 && (
                <div className="text-center py-10 text-[11px] text-gray-300">无匹配项</div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 px-6 text-center">
              <Folder className="w-10 h-10 mb-4 opacity-10" />
              <p className="text-[11px] leading-relaxed">选择左侧 Skill<br/>以浏览文件目录</p>
            </div>
          )}
        </div>
      </div>

      {/* Column 3: Editor (Premium Dark Theme) */}
      <div className="flex-grow flex flex-col bg-[#1e1e1e] min-w-0 relative">
        {selectedFile ? (
          <div className="flex flex-col h-full">
            {/* Editor Header */}
            <div className="h-14 px-6 border-b border-[#2d2d2d] flex items-center justify-between bg-[#252526]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-1.5 bg-[#2d2d2d] rounded-md">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-xs font-medium text-gray-200 truncate">{selectedFile.name}</h3>
                  <p className="text-[9px] text-gray-500 font-mono uppercase tracking-tighter">
                    {skills.find(s => s.id === selectedSkillId)?.name} / {selectedFile.id.substring(0, 6)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2 bg-[#2d2d2d] p-1 rounded-lg border border-[#3d3d3d]">
                    <button 
                      onClick={() => { setIsEditing(false); setEditedContent(fileContent); }} 
                      className="px-3 py-1 text-[10px] text-gray-400 hover:text-white transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      onClick={handleSaveContent} 
                      className="px-4 py-1 bg-primary-600 text-white rounded-md text-[10px] font-bold hover:bg-primary-500 shadow-lg shadow-primary-900/20 transition-all"
                    >
                      保存更改
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2d2d2d] text-gray-300 hover:text-white hover:bg-[#3d3d3d] rounded-lg text-[11px] transition-all border border-[#3d3d3d]"
                  >
                    <Pencil className="w-3 h-3" /> 编辑代码
                  </button>
                )}
                <button 
                  onClick={() => setSelectedFile(null)} 
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2d2d2d] rounded-md transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Editor Content */}
            <div className="flex-grow overflow-hidden flex">
              {/* Line Numbers Simulation */}
              <div className="w-12 bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col items-center py-6 text-[10px] text-gray-600 font-mono select-none">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="h-6 leading-6">{i + 1}</div>
                ))}
              </div>
              
              <div className="flex-grow relative">
                {isEditing ? (
                  <textarea
                    className="w-full h-full p-6 font-mono text-sm bg-[#1e1e1e] text-gray-300 focus:outline-none resize-none leading-6 caret-primary-500"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    spellCheck={false}
                  />
                ) : (
                  <pre className="w-full h-full p-6 font-mono text-sm text-gray-400 bg-[#1e1e1e] overflow-auto whitespace-pre-wrap leading-6">
                    {fileContent || `// ${selectedFile.name} is empty`}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary-500/10 blur-3xl rounded-full scale-150" />
              <div className="relative w-24 h-24 bg-[#252526] rounded-3xl border border-[#2d2d2d] flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <FileText className="w-10 h-10 text-gray-700 opacity-50" />
              </div>
            </div>
            <h4 className="text-gray-400 font-medium text-sm mb-2">准备就绪</h4>
            <p className="text-gray-600 text-xs max-w-[240px] text-center leading-relaxed">
              从左侧目录选择一个文件开始<br/>构建您的智能 Skill
            </p>
            {selectedSkillId && (
              <div className="mt-8 px-4 py-2 bg-[#252526] rounded-full border border-[#2d2d2d] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                  Active: {skills.find(s => s.id === selectedSkillId)?.name}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="创建空白 Skill">
        <label className="block text-sm font-medium text-gray-700 mb-2">Skill 名称</label>
        <input 
          type="text" 
          placeholder="输入 Skill 名称" 
          className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 mb-6"
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600">取消</button>
          <button 
            onClick={handleCreateSkill}
            className={`px-4 py-2 rounded-lg ${newSkillName ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-indigo-100 text-indigo-400 cursor-not-allowed'}`}
            disabled={!newSkillName}
          >
            创建
          </button>
        </div>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="导入 Skill">
        <div 
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-6 hover:border-primary-400 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.zip')) {
              handleImportSkill(file);
            }
          }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.zip';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) handleImportSkill(file);
            };
            input.click();
          }}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">将 .zip 文件拖放到此处，或 <span className="text-primary-600 cursor-pointer">浏览文件</span></p>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-gray-600">取消</button>
        </div>
      </Modal>
    </div>
  );
};

export default SkillsTab;
