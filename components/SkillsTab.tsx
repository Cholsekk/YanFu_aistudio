import React, { useState, useEffect } from 'react';
import { Plus, Upload, X, Folder, FileText, Search, MoreHorizontal, Download, Scissors, Pencil, Trash2, FilePlus, FolderPlus, FileUp, FolderUp, Cpu, ChevronRight, ChevronDown } from 'lucide-react';
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
  skillId: string;
  depth?: number;
  onSelectFile: (file: FileNode, skillId: string) => void;
  selectedFileId: string | null;
  onRename: (skillId: string, tree_id: string, new_name: string) => void;
  onDelete: (skillId: string, tree_id: string) => void;
  onCreate: (skillId: string, parent_id: string, is_dir: boolean, name: string) => void;
}> = ({ item, skillId, depth = 0, onSelectFile, selectedFileId, onRename, onDelete, onCreate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isSelected = selectedFileId === item.id;

  return (
    <div className="relative group">
      <div
        className={`flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 cursor-pointer text-sm rounded-lg transition-colors ${isSelected ? 'bg-primary-50 text-primary-700' : 'text-gray-600'}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (!item.is_dir) onSelectFile(item, skillId);
          else setIsOpen(!isOpen);
        }}
      >
        <div className="flex items-center gap-2 flex-grow min-w-0">
          {item.is_dir ? (
            <Folder className={`w-4 h-4 flex-shrink-0 ${isOpen ? 'text-blue-500' : 'text-gray-400'}`} />
          ) : (
            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          <span 
            className={`truncate flex-grow ${isSelected ? 'font-bold' : 'font-medium'}`} 
            title={item.name}
          >
            {item.name}
          </span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.is_dir && (
            <>
              <button 
                className="p-1 hover:bg-gray-200 rounded-md text-gray-500 hover:text-primary-600 transition-colors"
                onClick={(e) => { e.stopPropagation(); onCreate(skillId, item.id, false, 'new_file.txt'); }}
                title="新建文件"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button 
                className="p-1 hover:bg-gray-200 rounded-md text-gray-500 hover:text-primary-600 transition-colors"
                onClick={(e) => { e.stopPropagation(); onCreate(skillId, item.id, true, 'new_folder'); }}
                title="新建文件夹"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button 
            className="p-1 hover:bg-gray-200 rounded-md text-gray-500 transition-colors"
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-8 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1.5 text-xs">
            {item.is_dir ? (
              <>
                <button onClick={() => { setShowMenu(false); onCreate(skillId, item.id, false, 'new_file.txt'); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"><FilePlus className="w-3.5 h-3.5 text-gray-400"/>新建文件</button>
                <button onClick={() => { setShowMenu(false); onCreate(skillId, item.id, true, 'new_folder'); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"><FolderPlus className="w-3.5 h-3.5 text-gray-400"/>新建文件夹</button>
              </>
            ) : (
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Download className="w-3.5 h-3.5 text-gray-400"/>下载文件</button>
            )}
            <div className="h-px bg-gray-50 my-1" />
            <button onClick={() => { setShowMenu(false); onRename(skillId, item.id, prompt('输入新名称', item.name) || item.name); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Pencil className="w-3.5 h-3.5 text-gray-400"/>重命名</button>
            <button onClick={() => { setShowMenu(false); onDelete(skillId, item.id); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600"><Trash2 className="w-3.5 h-3.5 text-red-400"/>删除</button>
          </div>
        </>
      )}

      {item.is_dir && isOpen && item.children?.map((child, i) => (
        <FileTreeItem 
          key={i} 
          item={child} 
          skillId={skillId}
          depth={depth + 1} 
          onSelectFile={onSelectFile} 
          selectedFileId={selectedFileId} 
          onRename={onRename} 
          onDelete={onDelete} 
          onCreate={onCreate} 
        />
      ))}
    </div>
  );
};

const SkillNode: React.FC<{
  skill: SkillListItem;
  onSelectFile: (file: FileNode, skillId: string) => void;
  selectedFileId: string | null;
  onRename: (skillId: string, tree_id: string, new_name: string) => void;
  onDelete: (skillId: string, tree_id: string) => void;
  onCreate: (skillId: string, parent_id: string, is_dir: boolean, name: string) => void;
  isExpanded: boolean;
  onToggle: (skillId: string) => void;
  tree: FileNode | null;
  loading: boolean;
}> = ({ skill, onSelectFile, selectedFileId, onRename, onDelete, onCreate, isExpanded, onToggle, tree, loading }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative group/skill">
      <div
        className={`flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 cursor-pointer rounded-xl transition-all border ${isExpanded ? 'bg-primary-50/30 border-primary-100 shadow-sm' : 'border-transparent'}`}
        onClick={() => onToggle(skill.id)}
      >
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
            <Cpu className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-grow">
            <h4 className={`text-sm font-bold truncate ${isExpanded ? 'text-primary-900' : 'text-gray-800'}`} title={skill.name}>{skill.name}</h4>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-gray-400 truncate font-bold uppercase tracking-wider">SKILL ROOT</p>
              {loading && <div className="w-2.5 h-2.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover/skill:opacity-100 transition-opacity ml-2">
          <button 
            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 hover:text-primary-600 transition-all border border-transparent hover:border-gray-100"
            onClick={(e) => { e.stopPropagation(); if (!isExpanded) onToggle(skill.id); onCreate(skill.id, tree?.id || '', false, 'new_file.txt'); }}
            title="在根目录新建文件"
          >
            <FilePlus className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 hover:text-primary-600 transition-all border border-transparent hover:border-gray-100"
            onClick={(e) => { e.stopPropagation(); if (!isExpanded) onToggle(skill.id); onCreate(skill.id, tree?.id || '', true, 'new_folder'); }}
            title="在根目录新建文件夹"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 transition-all border border-transparent hover:border-gray-100"
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-10 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1.5 text-xs">
            <button onClick={() => { setShowMenu(false); onCreate(skill.id, tree?.id || '', false, 'new_file.txt'); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"><FilePlus className="w-3.5 h-3.5 text-gray-400"/>新建根文件</button>
            <button onClick={() => { setShowMenu(false); onCreate(skill.id, tree?.id || '', true, 'new_folder'); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"><FolderPlus className="w-3.5 h-3.5 text-gray-400"/>新建根目录</button>
            <div className="h-px bg-gray-50 my-1" />
            <button onClick={() => { setShowMenu(false); onRename(skill.id, skill.id, prompt('输入新名称', skill.name) || skill.name); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Pencil className="w-3.5 h-3.5 text-gray-400"/>重命名 Skill</button>
            <button onClick={() => { setShowMenu(false); onDelete(skill.id, skill.id); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600"><Trash2 className="w-3.5 h-3.5 text-red-400"/>删除 Skill</button>
          </div>
        </>
      )}

      {isExpanded && tree && (
        <div className="mt-1 ml-4 border-l border-gray-100 pl-1">
          {tree.children?.map((child, i) => (
            <FileTreeItem 
              key={i} 
              item={child} 
              skillId={skill.id}
              onSelectFile={onSelectFile}
              selectedFileId={selectedFileId}
              onRename={onRename}
              onDelete={onDelete}
              onCreate={onCreate}
            />
          ))}
          {(!tree.children || tree.children.length === 0) && (
            <div className="py-2 px-4 text-[10px] text-gray-400 italic">空目录</div>
          )}
        </div>
      )}
    </div>
  );
};

const SkillsTab: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [skills, setSkills] = useState<SkillListItem[]>([]);
  const [skillTrees, setSkillTrees] = useState<Record<string, FileNode>>({});
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});
  const [loadingTrees, setLoadingTrees] = useState<Record<string, boolean>>({});
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSkills = () => {
    getSkillList().then(res => {
      if (res.data?.list) {
        setSkills(res.data.list);
      }
    });
  };

  const handleToggleSkill = (skillId: string) => {
    const isNowExpanded = !expandedSkills[skillId];
    setExpandedSkills(prev => ({ ...prev, [skillId]: isNowExpanded }));

    if (isNowExpanded && !skillTrees[skillId]) {
      setLoadingTrees(prev => ({ ...prev, [skillId]: true }));
      getFileTree(skillId).then(res => {
        if (res.data) {
          setSkillTrees(prev => ({ ...prev, [skillId]: res.data }));
        }
        setLoadingTrees(prev => ({ ...prev, [skillId]: false }));
      });
    }
  };

  const handleSelectFile = (file: FileNode, skillId: string) => {
    setSelectedFile(file);
    setSelectedSkillId(skillId);
  };

  const refreshSkillTree = (skillId: string) => {
    getFileTree(skillId).then(res => {
      if (res.data) {
        setSkillTrees(prev => ({ ...prev, [skillId]: res.data }));
      }
    });
  };

  useEffect(() => {
    fetchSkills();
  }, []);

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

  const handleRename = (skillId: string, tree_id: string, new_name: string) => {
    renameNode(skillId, tree_id, new_name).then(() => {
      refreshSkillTree(skillId);
    });
  };

  const handleDelete = (skillId: string, tree_id: string) => {
    deleteNode(skillId, tree_id).then(() => {
      refreshSkillTree(skillId);
    });
  };

  const handleCreate = (skillId: string, parent_id: string, is_dir: boolean, name: string) => {
    createNewNode(skillId, parent_id, is_dir, name).then(() => {
      refreshSkillTree(skillId);
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

  const filteredSkills = skills.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)] overflow-hidden">
      {/* Sidebar: Unified Skills & File Explorer */}
      <div className="w-80 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Skills 资源管理器</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsCreateModalOpen(true)} 
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-100"
              title="创建 Skill"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsImportModalOpen(true)} 
              className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200"
              title="导入 Skill"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索 Skill 或文件..." 
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto px-3 pb-4 space-y-1 custom-scrollbar">
          {filteredSkills.map(skill => (
            <SkillNode 
              key={skill.id}
              skill={skill}
              onSelectFile={handleSelectFile}
              selectedFileId={selectedFile?.id || null}
              onRename={handleRename}
              onDelete={handleDelete}
              onCreate={handleCreate}
              isExpanded={!!expandedSkills[skill.id]}
              onToggle={handleToggleSkill}
              tree={skillTrees[skill.id]}
              loading={!!loadingTrees[skill.id]}
            />
          ))}
          {filteredSkills.length === 0 && (
            <div className="py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <Folder className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">暂无 Skill</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Editor (Clean Light Theme) */}
      <div className="flex-grow flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
        {selectedFile ? (
          <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 truncate">{selectedFile.name}</h3>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    {skills.find(s => s.id === selectedSkillId)?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setIsEditing(false); setEditedContent(fileContent); }} 
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      onClick={handleSaveContent} 
                      className="px-5 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all"
                    >
                      保存
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="flex items-center gap-2 px-4 py-2 border border-primary-100 text-primary-600 hover:bg-primary-50 rounded-xl text-xs font-bold transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" /> 编辑内容
                  </button>
                )}
                <button 
                  onClick={() => setSelectedFile(null)} 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-grow overflow-hidden relative bg-gray-50/30">
              {isEditing ? (
                <textarea
                  className="w-full h-full p-8 font-mono text-sm bg-white text-gray-800 focus:outline-none resize-none leading-relaxed border-none"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  spellCheck={false}
                />
              ) : (
                <pre className="w-full h-full p-8 font-mono text-sm text-gray-700 bg-white overflow-auto whitespace-pre-wrap leading-relaxed">
                  {fileContent || `// 文件内容为空`}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50/30">
            <div className="w-20 h-20 bg-white rounded-3xl border border-gray-100 flex items-center justify-center shadow-sm mb-6">
              <FileText className="w-10 h-10 text-gray-200" />
            </div>
            <h4 className="text-gray-900 font-bold text-base mb-2">文件预览</h4>
            <p className="text-gray-500 text-sm max-w-[280px] text-center leading-relaxed">
              在左侧资源管理器中选择一个文件，<br/>即可在此处查看或编辑其内容。
            </p>
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
