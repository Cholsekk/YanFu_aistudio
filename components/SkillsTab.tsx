import React, { useState, useEffect } from 'react';
import { Plus, Upload, X, Folder, FileText, Search, MoreHorizontal, Download, Scissors, Pencil, Trash2, FilePlus, FolderPlus, FileUp, FolderUp } from 'lucide-react';
import { Skill, FileNode, getFileTree, getFileContent, addSkill, renameNode, deleteNode, uploadZip, createNewNode, getSkillList, SkillListItem } from '../lib/api/skills';

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
  selectedFile: string | null;
  onRename: (tree_id: string, new_name: string) => void;
  onDelete: (tree_id: string) => void;
  onCreate: (parent_id: string, is_dir: boolean, name: string) => void;
}> = ({ item, depth = 0, onSelectFile, selectedFile, onRename, onDelete, onCreate }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const isSelected = selectedFile === item.name;

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
        <FileTreeItem key={i} item={child} depth={depth + 1} onSelectFile={onSelectFile} selectedFile={selectedFile} onRename={onRename} onDelete={onDelete} onCreate={onCreate} />
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
    }
  }, [selectedSkillId]);

  useEffect(() => {
    if (selectedFile && selectedSkillId) {
      getFileContent(selectedSkillId, selectedFile.id).then(res => {
        setFileContent(res.text);
      });
    }
  }, [selectedFile, selectedSkillId]);

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
    <div className="flex h-[calc(100vh-200px)] bg-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Sidebar: File Tree */}
      <div className="w-64 border-r border-gray-200 p-4 flex flex-col bg-white">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索文件..." 
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => selectedSkillId && handleCreate(fileTree[0]?.id || '', false, 'new_file.txt')}
            disabled={!selectedSkillId}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {filteredFileTree.map((item, i) => <FileTreeItem key={i} item={item} onSelectFile={setSelectedFile} selectedFile={selectedFile?.name || null} onRename={handleRename} onDelete={handleDelete} onCreate={handleCreate} />)}
          {!selectedSkillId && <div className="text-center py-8 text-gray-400 text-sm italic">请先选择一个 Skill</div>}
        </div>
        <button 
          className="mt-4 w-full py-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
          onClick={() => setIsImportModalOpen(true)}
        >
          <Upload className="w-4 h-4" /> 拖放文件到此处上传
        </button>
      </div>

      {/* Main Content: Templates or Preview */}
      <div className="flex-grow p-6 overflow-y-auto">
        {selectedFile ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">预览: {selectedFile.name}</h3>
              <button onClick={() => setSelectedFile(null)} className="text-sm text-gray-500 hover:text-gray-900">关闭预览</button>
            </div>
            <pre className="text-sm text-gray-800 bg-gray-50 p-4 rounded-lg h-[calc(100%-40px)] overflow-auto">
              {fileContent || `这里是 ${selectedFile.name} 的内容预览...`}
            </pre>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-500 transition-all shadow-sm">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">创建空白 Skill</div>
                  <div className="text-xs text-gray-500">从文件夹结构开始</div>
                </div>
              </button>
              <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-500 transition-all shadow-sm">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">导入 Skill</div>
                  <div className="text-xs text-gray-500">从 skill.zip 文件导入</div>
                </div>
              </button>
            </div>

            {/* Templates Grid */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Skill 模板</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map(skill => (
                  <div key={skill.id} className={`group bg-white rounded-xl border p-5 hover:shadow-md transition-all flex flex-col relative ${selectedSkillId === skill.id ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {skill.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                        <p className="text-xs text-gray-500">ID: {skill.id}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-2">{skill.description || '暂无描述'}</p>
                    <button 
                      onClick={() => setSelectedSkillId(skill.id)}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${selectedSkillId === skill.id ? 'bg-primary-50 text-primary-600' : 'bg-primary-600 text-white hover:bg-primary-700 opacity-0 group-hover:opacity-100'}`}
                    >
                      {selectedSkillId === skill.id ? '正在使用' : '+ 使用此 Skill'}
                    </button>
                  </div>
                ))}
                {skills.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                    暂无 Skill 模板，请创建或导入。
                  </div>
                )}
              </div>
            </div>
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
