import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Upload, X, Folder, FileText, Search, MoreHorizontal, Pencil, Trash2, FilePlus, FolderPlus, PanelLeftClose, PanelLeftOpen, FileArchive, Cpu, ChevronRight, ChevronDown } from 'lucide-react';
import { Tooltip, Dropdown, Input, Modal as AntModal, message, type MenuProps } from 'antd';
import { Skill, FileNode, getFileTree, getFileContent, updateFileContent, addSkill, renameNode, deleteNode, uploadZip, createNewNode, getSkillList, SkillListItem } from '../lib/api/skills';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Helper to determine icon/color based on file type/name
const getFileIcon = (name: string, isDir: boolean, isOpen: boolean) => {
  if (isDir) return isOpen ? <Folder className="w-4 h-4 text-amber-600" /> : <Folder className="w-4 h-4 text-amber-500" />;
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return <FileText className="w-4 h-4 text-blue-600" />;
  if (name.endsWith('.css')) return <FileText className="w-4 h-4 text-sky-500" />;
  if (name.endsWith('.json')) return <FileText className="w-4 h-4 text-yellow-600" />;
  if (name.endsWith('.py')) return <FileText className="w-4 h-4 text-emerald-500" />;
  if (name.endsWith('.md')) return <FileText className="w-4 h-4 text-indigo-500" />;
  return <FileText className="w-4 h-4 text-gray-500" />;
};

const getFileColor = (name: string, isDir: boolean) => {
  if (isDir) return 'text-amber-700';
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return 'text-blue-700';
  if (name.endsWith('.css')) return 'text-sky-700';
  if (name.endsWith('.json')) return 'text-yellow-700';
  if (name.endsWith('.py')) return 'text-emerald-700';
  if (name.endsWith('.md')) return 'text-indigo-700';
  return 'text-gray-700';
};

const getLanguage = (name: string) => {
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return 'typescript';
  if (name.endsWith('.css')) return 'css';
  if (name.endsWith('.json')) return 'json';
  if (name.endsWith('.py')) return 'python';
  if (name.endsWith('.md')) return 'markdown';
  return 'javascript';
};

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
  onRename: (skillId: string, item: FileNode) => void;
  onDelete: (skillId: string, tree_id: string) => void;
  onCreate: (skillId: string, parent_id: string, is_dir: boolean, parentNode: FileNode) => void;
}> = ({ item, skillId, depth = 0, onSelectFile, selectedFileId, onRename, onDelete, onCreate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedFileId === item.id;

  const menuItems: MenuProps['items'] = [
    ...(item.is_dir ? [
      { key: 'new_file', label: '新建文件', icon: <FilePlus className="w-3.5 h-3.5" />, onClick: () => onCreate(skillId, item.id, false, item) },
      { key: 'new_folder', label: '新建文件夹', icon: <FolderPlus className="w-3.5 h-3.5" />, onClick: () => onCreate(skillId, item.id, true, item) },
      { type: 'divider' as const }
    ] : []),
    { key: 'rename', label: '重命名', icon: <Pencil className="w-3.5 h-3.5" />, onClick: () => onRename(skillId, item) },
    { key: 'delete', label: '删除', icon: <Trash2 className="w-3.5 h-3.5" />, danger: true, onClick: () => onDelete(skillId, item.id) },
  ];

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-1 py-0.5 cursor-pointer text-sm rounded transition-colors ${isSelected ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => {
          if (!item.is_dir) onSelectFile(item, skillId);
          else setIsOpen(!isOpen);
        }}
      >
        <div className="flex items-center gap-1 flex-grow min-w-0">
          {item.is_dir ? (
            isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />
          ) : (
            <div className="w-4" />
          )}
          {item.is_dir ? (
            getFileIcon(item.name, true, isOpen)
          ) : (
            getFileIcon(item.name, false, false)
          )}
          <span className={`truncate flex-grow ${isSelected ? 'font-bold' : ''} ${getFileColor(item.name, item.is_dir)}`} title={item.name}>
            {item.name}
          </span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <button className="p-0.5 hover:bg-gray-200 rounded text-gray-500" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </Dropdown>
        </div>
      </div>

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

const countFiles = (node: FileNode): number => {
  let count = 0;
  if (!node.is_dir) count += 1;
  if (node.children) {
    for (const child of node.children) {
      count += countFiles(child);
    }
  }
  return count;
};

const SkillNode: React.FC<{
  skill: SkillListItem;
  onSelectFile: (file: FileNode, skillId: string) => void;
  selectedFileId: string | null;
  onRename: (skillId: string, item: FileNode | { id: string; name: string; is_dir: boolean }) => void;
  onDelete: (skillId: string, tree_id: string, isRoot?: boolean) => void;
  onCreate: (skillId: string, parent_id: string, is_dir: boolean, parentNode: FileNode) => void;
  isExpanded: boolean;
  onToggle: (skillId: string) => void;
  tree: FileNode | null;
  loading: boolean;
  isSidebarCollapsed?: boolean;
}> = ({ skill, onSelectFile, selectedFileId, onRename, onDelete, onCreate, isExpanded, onToggle, tree, loading, isSidebarCollapsed }) => {
  const tooltipContent = (
    <div>
      <div className="font-bold">{skill.name}</div>
      {skill.description && <div className="text-xs opacity-80 mt-1">{skill.description}</div>}
    </div>
  );

  const handleCreateClick = async (e: React.MouseEvent, isDir: boolean) => {
    e.stopPropagation();
    let targetTree = tree;
    if (!targetTree) {
      try {
        const res = await getFileTree(skill.id);
        targetTree = res.data;
        if (!isExpanded) onToggle(skill.id);
      } catch (err) {
        message.error('获取目录信息失败');
        return;
      }
    }
    if (targetTree) {
      onCreate(skill.id, targetTree.id, isDir, targetTree);
    }
  };

  return (
    <div className="relative group/skill">
      <div
        className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-all ${isExpanded ? 'bg-gray-100' : ''} ${isSidebarCollapsed ? 'justify-center' : ''}`}
        onClick={() => !isSidebarCollapsed && onToggle(skill.id)}
      >
        <div className={`flex items-center gap-3 min-w-0 ${isSidebarCollapsed ? 'justify-center' : 'flex-grow'}`}>
          <Tooltip title={isSidebarCollapsed ? tooltipContent : ""} placement="right" arrow={false}>
            <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-all border ${isSidebarCollapsed ? 'bg-orange-50 border-orange-100' : isExpanded ? 'bg-primary-50 border-primary-200 shadow-sm' : 'bg-gray-100 border-gray-200'}`}>
              {isSidebarCollapsed ? (
                <span className="text-sm font-bold text-orange-600">{skill.name.charAt(0).toUpperCase()}</span>
              ) : (
                <Folder className={`w-4 h-4 ${isExpanded ? 'text-primary-600' : 'text-gray-600'}`} />
              )}
            </div>
          </Tooltip>
          {!isSidebarCollapsed && (
            <div className="min-w-0 flex-grow">
              <Tooltip title={tooltipContent} placement="top" arrow={false} mouseEnterDelay={0.5}>
                <h4 className={`text-sm font-medium truncate ${isExpanded ? 'text-gray-900' : 'text-gray-700'}`}>{skill.name}</h4>
              </Tooltip>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-gray-400 truncate font-bold uppercase tracking-wider">
                  {tree ? `${countFiles(tree)} 个文件` : (skill as any).file_count !== undefined ? `${(skill as any).file_count} 个文件` : '0 个文件'}
                </p>
                {loading && <div className="w-2.5 h-2.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />}
              </div>
            </div>
          )}
        </div>
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-1 opacity-0 group-hover/skill:opacity-100 transition-opacity ml-2">
            <Tooltip title="新建文件" arrow={false}>
              <button 
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 hover:text-primary-600 transition-all border border-transparent hover:border-gray-100"
                onClick={(e) => handleCreateClick(e, false)}
              >
                <FilePlus className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip title="新建文件夹" arrow={false}>
              <button 
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 hover:text-primary-600 transition-all border border-transparent hover:border-gray-100"
                onClick={(e) => handleCreateClick(e, true)}
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip title="删除 Skill" arrow={false}>
              <button 
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                onClick={async (e) => { 
                  e.stopPropagation(); 
                  let targetTreeId = tree?.id;
                  if (!targetTreeId) {
                    try {
                      const res = await getFileTree(skill.id);
                      targetTreeId = res.data?.id;
                    } catch (err) {
                      message.error('获取目录信息失败');
                      return;
                    }
                  }
                  if (targetTreeId) {
                    onDelete(skill.id, targetTreeId, true);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Rename Modal State
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ skillId: string; item: { id: string; name: string; is_dir: boolean } } | null>(null);
  const [newName, setNewName] = useState('');

  // Import Modal State
  const [isDragging, setIsDragging] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);

  // Create Node Modal State
  const [isCreateNodeModalOpen, setIsCreateNodeModalOpen] = useState(false);
  const [createNodeParams, setCreateNodeParams] = useState<{ skillId: string; parentId: string; isDir: boolean; parentNode: FileNode } | null>(null);
  const [newNodeName, setNewNodeName] = useState('');

  const fetchSkills = () => {
    getSkillList().then(res => {
      if (res.data?.list) {
        setSkills(res.data.list);
        // Pre-fetch all trees to get file counts for the root nodes
        res.data.list.forEach(skill => {
          getFileTree(skill.id).then(treeRes => {
            if (treeRes.data) {
              setSkillTrees(prev => ({ ...prev, [skill.id]: treeRes.data }));
            }
          }).catch(err => console.error(`Failed to fetch tree for skill ${skill.id}:`, err));
        });
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
    setIsEditing(false);
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
      message.success('保存成功');
    }).catch(err => {
      if(err.status !== 400){
        message.error('保存失败: ' + (err.message || '未知错误'));
      }
    });
  };

  const handleRenameClick = (skillId: string, item: { id: string; name: string; is_dir: boolean }) => {
    setRenameTarget({ skillId, item });
    setNewName(item.name);
    setIsRenameModalOpen(true);
  };

  const handleConfirmRename = () => {
    if (!renameTarget || !newName || newName === renameTarget.item.name) {
      setIsRenameModalOpen(false);
      return;
    }
    renameNode(renameTarget.skillId, renameTarget.item.id, newName).then(() => {
      refreshSkillTree(renameTarget.skillId);
      
      // 同步更新预览面板的文件名
      if (selectedFile && selectedFile.id === renameTarget.item.id) {
        setSelectedFile({ ...selectedFile, name: newName });
      }

      if (renameTarget.item.id === renameTarget.skillId) {
        fetchSkills();
      }
      setIsRenameModalOpen(false);
      message.success('重命名成功');
    }).catch(err => {
      message.error('重命名失败: ' + (err.message || '未知错误'));
    });
  };

  const handleDelete = (skillId: string, tree_id: string, isRoot: boolean = false) => {
    AntModal.confirm({
      title: '确认删除',
      content: '此操作不可撤销，确定要删除吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      centered: true,
      onOk: () => {
        deleteNode(skillId, tree_id).then(() => {
          if (isRoot) {
            fetchSkills();
          } else {
            refreshSkillTree(skillId);
          }
          
          // 如果删除的是当前正在预览的文件或所属的 Skill，则关闭预览面板
          if (isRoot || (selectedFile && selectedFile.id === tree_id)) {
            setSelectedSkillId(null);
            setSelectedFile(null);
          }
          
          message.success('删除成功');
        }).catch(err => {
          message.error('删除失败: ' + (err.message || '未知错误'));
        });
      }
    });
  };

  const handleCreate = (skillId: string, parent_id: string, is_dir: boolean, parentNode: FileNode) => {
    setCreateNodeParams({ skillId, parentId: parent_id, isDir: is_dir, parentNode });
    setNewNodeName('');
    setIsCreateNodeModalOpen(true);
  };

  const handleConfirmCreateNode = () => {
    if (!createNodeParams || !newNodeName) return;
    
    const { parentNode, isDir, skillId, parentId } = createNodeParams;
    
    // 检查重名
    if (parentNode && parentNode.children) {
      const exists = parentNode.children.some(child => child.name === newNodeName && child.is_dir === isDir);
      if (exists) {
        message.error(`当前目录下已存在同名${isDir ? '文件夹' : '文件'}`);
        return;
      }
    }

    createNewNode(skillId, parentId, isDir, newNodeName).then(() => {
      refreshSkillTree(skillId);
      message.success(`新建${isDir ? '文件夹' : '文件'}成功`);
      setIsCreateNodeModalOpen(false);
    }).catch(err => {
      message.error(`新建${isDir ? '文件夹' : '文件'}失败: ` + (err.message || '未知错误'));
    });
  };

  const handleCreateSkill = () => {
    if (!newSkillName) return;
    addSkill(newSkillName, false).then(() => {
      setIsCreateModalOpen(false);
      setNewSkillName('');
      fetchSkills();
      message.success('创建 Skill 成功');
    }).catch(err => {
      message.error('创建 Skill 失败: ' + (err.message || '未知错误'));
    });
  };

  const handleImportSkill = (file: File) => {
    const hide = message.loading('正在导入 Skill...', 0);
    uploadZip(file).then(() => {
      hide();
      setIsImportModalOpen(false);
      setPendingImportFile(null);
      fetchSkills();
      message.success('导入 Skill 成功');
    }).catch(err => {
      hide();
      message.error('导入 Skill 失败: ' + (err.message || '未知错误'));
    });
  };

  const filteredSkills = skills.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-200px)] overflow-hidden relative border border-gray-200 rounded-2xl shadow-sm">
      {/* Sidebar: Unified Skills & File Explorer */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-80'} flex flex-col bg-white border-r border-gray-200 overflow-hidden transition-all duration-300 flex-shrink-0 relative`}>
        <div className={`p-5 border-b border-gray-100 bg-white flex items-center justify-between ${isSidebarCollapsed ? 'flex-col gap-4' : ''}`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-50 rounded-lg">
                <Cpu className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 whitespace-nowrap">资源管理器</h3>
            </div>
          )}
          <div className={`flex ${isSidebarCollapsed ? 'flex-col' : 'gap-2'}`}>
            <Tooltip title="创建 Skill" arrow={false} placement={isSidebarCollapsed ? 'right' : 'top'}>
              <button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip title="导入 Skill" arrow={false} placement={isSidebarCollapsed ? 'right' : 'top'}>
              <button 
                onClick={() => setIsImportModalOpen(true)} 
                className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200"
              >
                <Upload className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip title={isSidebarCollapsed ? "展开侧边栏" : "收起侧边栏"} arrow={false} placement={isSidebarCollapsed ? 'right' : 'top'}>
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-all"
              >
                {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            </Tooltip>
          </div>
        </div>
        
        {!isSidebarCollapsed && (
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
        )}
        
        <div className={`flex-grow overflow-y-auto px-2 pb-4 space-y-0.5 custom-scrollbar ${isSidebarCollapsed ? 'items-center' : ''}`}>
          {filteredSkills.map(skill => (
            <SkillNode 
              key={skill.id}
              skill={skill}
              onSelectFile={handleSelectFile}
              selectedFileId={selectedFile?.id || null}
              onRename={handleRenameClick}
              onDelete={handleDelete}
              onCreate={handleCreate}
              isExpanded={isSidebarCollapsed ? false : !!expandedSkills[skill.id]}
              onToggle={handleToggleSkill}
              tree={skillTrees[skill.id]}
              loading={!!loadingTrees[skill.id]}
              isSidebarCollapsed={isSidebarCollapsed}
            />
          ))}
          {filteredSkills.length === 0 && !isSidebarCollapsed && (
            <div className="py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <Folder className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">暂无 Skill</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Editor (Clean Light Theme) */}
      <div className="flex-grow flex flex-col bg-white overflow-hidden min-w-0">
        {selectedFile ? (
          <div className="flex flex-col h-full">
            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-white">
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
                  onClick={() => { setSelectedFile(null); setIsEditing(false); }} 
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
                <SyntaxHighlighter
                  language={getLanguage(selectedFile.name)}
                  style={oneLight}
                  customStyle={{ margin: 0, height: '100%', fontSize: '14px', background: 'transparent' }}
                >
                  {fileContent || `// 文件内容为空`}
                </SyntaxHighlighter>
              )}
              <div className="absolute bottom-2 right-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
                行: {fileContent.split('\n').length} | 字数: {fileContent.length}
              </div>
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

      <Modal isOpen={isImportModalOpen} onClose={() => { setIsImportModalOpen(false); setPendingImportFile(null); }} title="导入 Skill">
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-all cursor-pointer ${isDragging ? 'border-primary-500 bg-primary-50 scale-[1.02]' : 'border-gray-200 hover:border-primary-400'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.zip')) {
              setPendingImportFile(file);
            } else {
              message.error('请上传 .zip 格式的文件');
            }
          }}
          onClick={() => {
            if (pendingImportFile) return;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.zip';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) setPendingImportFile(file);
            };
            input.click();
          }}
        >
          {pendingImportFile ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                <FileArchive className="w-8 h-8 text-primary-600" />
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">{pendingImportFile.name}</p>
              <p className="text-xs text-gray-400">{(pendingImportFile.size / 1024).toFixed(1)} KB</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setPendingImportFile(null); }}
                className="mt-4 text-xs text-red-500 hover:text-red-600 font-medium"
              >
                更换文件
              </button>
            </div>
          ) : (
            <>
              <Upload className={`w-8 h-8 mx-auto mb-2 transition-transform ${isDragging ? 'scale-110 text-primary-600' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-600">将 .zip 文件拖放到此处，或 <span className="text-primary-600 cursor-pointer">浏览文件</span></p>
            </>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => { setIsImportModalOpen(false); setPendingImportFile(null); }} className="px-4 py-2 text-gray-600">取消</button>
          <button 
            onClick={() => pendingImportFile && handleImportSkill(pendingImportFile)}
            className={`px-6 py-2 rounded-lg transition-all ${pendingImportFile ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            disabled={!pendingImportFile}
          >
            确认导入
          </button>
        </div>
      </Modal>

      {/* Rename Modal */}
      <AntModal
        title={renameTarget?.item.is_dir ? "重命名文件夹" : "重命名文件"}
        open={isRenameModalOpen}
        onOk={handleConfirmRename}
        onCancel={() => setIsRenameModalOpen(false)}
        okText="确认"
        cancelText="取消"
        centered
        width={400}
      >
        <div className="py-4">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">新名称</label>
          <Input 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            placeholder="请输入新名称"
            onPressEnter={handleConfirmRename}
            autoFocus
          />
        </div>
      </AntModal>

      {/* Create Node Modal */}
      <AntModal
        title={createNodeParams?.isDir ? "新建文件夹" : "新建文件"}
        open={isCreateNodeModalOpen}
        onOk={handleConfirmCreateNode}
        onCancel={() => setIsCreateNodeModalOpen(false)}
        okText="确认"
        cancelText="取消"
        centered
        width={400}
      >
        <div className="py-4">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">名称</label>
          <Input 
            value={newNodeName} 
            onChange={(e) => setNewNodeName(e.target.value)} 
            placeholder={`请输入${createNodeParams?.isDir ? '文件夹' : '文件'}名称`}
            onPressEnter={handleConfirmCreateNode}
            autoFocus
          />
        </div>
      </AntModal>
    </div>
  );
};

export default SkillsTab;
