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
    <div className="flex flex-col gap-6 h-[calc(100vh-120px)]">
      {/* Top Section: Skill Templates */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Skill 模板</h3>
          <div className="flex gap-2">
            <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
              <Plus className="w-4 h-4" /> 创建空白
            </button>
            <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" /> 导入
            </button>
          </div>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {skills.map(skill => (
            <div 
              key={skill.id} 
              onClick={() => setSelectedSkillId(skill.id)}
              className={`flex-shrink-0 w-64 p-4 rounded-xl border cursor-pointer transition-all ${selectedSkillId === skill.id ? 'border-primary-500 bg-primary-50/30 ring-1 ring-primary-500' : 'border-gray-100 bg-gray-50/50 hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                  {skill.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{skill.name}</h4>
                  <p className="text-[10px] text-gray-400 truncate">ID: {skill.id}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1">{skill.description || '暂无描述'}</p>
            </div>
          ))}
          {skills.length === 0 && (
            <div className="w-full py-8 text-center text-gray-400 text-sm italic border border-dashed border-gray-200 rounded-xl">
              暂无 Skill 模板
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: File Tree & Editor */}
      <div className="flex-grow flex bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-0">
        {/* Sidebar: File Tree */}
        <div className="w-72 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索文件..." 
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => selectedSkillId && handleCreate(fileTree[0]?.id || '', false, 'new_file.txt')}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="新建根目录文件"
              disabled={!selectedSkillId}
            >
              <FilePlus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-2">
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
                  <div className="text-center py-8 text-gray-400 text-sm">未找到匹配文件</div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm italic px-4 text-center">
                <Folder className="w-8 h-8 mb-2 opacity-20" />
                请先从上方选择一个 Skill 以查看文件目录
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <button 
              className="w-full py-2 text-xs text-gray-500 border border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-white hover:border-primary-400 transition-all"
              onClick={() => setIsImportModalOpen(true)}
              disabled={!selectedSkillId}
            >
              <Upload className="w-3 h-3" /> 上传文件
            </button>
          </div>
        </div>

        {/* Main Content: Editor/Preview */}
        <div className="flex-grow flex flex-col min-w-0 bg-gray-50/30">
          {selectedFile ? (
            <div className="flex flex-col h-full bg-white">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-900 truncate">{selectedFile.name}</h3>
                </div>
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <button onClick={() => { setIsEditing(false); setEditedContent(fileContent); }} className="text-xs text-gray-500 hover:text-gray-700">取消</button>
                      <button onClick={handleSaveContent} className="px-3 py-1 bg-primary-600 text-white rounded text-xs hover:bg-primary-700">保存</button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700">
                      <Pencil className="w-3 h-3" /> 编辑
                    </button>
                  )}
                  <button onClick={() => setSelectedFile(null)} className="p-1 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-grow overflow-hidden relative">
                {isEditing ? (
                  <textarea
                    className="w-full h-full p-6 font-mono text-sm bg-gray-50 focus:outline-none resize-none"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                ) : (
                  <pre className="w-full h-full p-6 font-mono text-sm text-gray-800 bg-gray-50 overflow-auto whitespace-pre-wrap">
                    {fileContent || `// ${selectedFile.name} 内容为空`}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm">在左侧目录中选择一个文件进行查看或编辑</p>
            </div>
          )}
        </div>
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
