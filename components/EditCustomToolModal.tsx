
import React, { useState, useEffect, useRef } from 'react';
import { Collection, ToolExtension, ToolExtensionParameter } from '../types';
import { Search, ChevronDown, Info, Trash2, X, Check, Edit2 } from 'lucide-react';
import IconPickerModal from './IconPickerModal';

interface EditCustomToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: Collection | null;
  toolDetail: ToolExtension[] | null;
  allLabels: string[];
  onSave: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const LABEL_MAPPING: Record<string, string> = {
  search: '搜索',
  image: '图片',
  video: '视频',
  weather: '天气',
  finance: '金融',
  design: '设计',
  travel: '旅行',
  social: '社交',
  news: '新闻',
  medical: '医疗',
  productivity: '生产力',
  education: '教育',
  business: '商业',
  entertainment: '娱乐',
  utilities: '工具',
  other: '其他'
};

const EditCustomToolModal: React.FC<EditCustomToolModalProps> = ({
  isOpen,
  onClose,
  tool,
  toolDetail,
  allLabels,
  onSave,
  onDelete
}) => {
  const [name, setName] = useState('');
  const [toolCallName, setToolCallName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [isLabelDropdownOpen, setIsLabelDropdownOpen] = useState(false);
  const [labelSearch, setLabelSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [openParamDropdown, setOpenParamDropdown] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Label dropdown positioning
  const labelButtonRef = useRef<HTMLButtonElement>(null);
  const [labelDropdownPlacement, setLabelDropdownPlacement] = useState<'bottom' | 'top'>('bottom');

  // Icon state
  const [icon, setIcon] = useState<string | { content: string; background: string }>('');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  // Parameter forms state
  const [parameterForms, setParameterForms] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tool && isOpen) {
      setName(tool.label.zh_Hans || '');
      setToolCallName(tool.name || '');
      setDescription(tool.description.zh_Hans || '');
      setSelectedLabels(tool.labels || []);
      setPrivacyPolicy(tool.team_credentials?.privacy_policy || '');
      
      let initialIcon = tool.icon;
      try {
        if (typeof tool.icon === 'string') {
          const trimmedIcon = tool.icon.trim();
          if (trimmedIcon.startsWith('{')) {
            initialIcon = JSON.parse(trimmedIcon);
          } else if (!trimmedIcon.includes('/') && !trimmedIcon.startsWith('http') && !trimmedIcon.startsWith('data:')) {
            // Assume it's a system icon name if it doesn't look like a URL
            initialIcon = { content: trimmedIcon, background: '#f0f9ff' };
          }
        }
      } catch (e) {
        console.warn('Failed to parse icon JSON:', e);
      }
      setIcon(initialIcon);
      
      // Initialize parameter forms
      const initialForms: Record<string, string> = {};
      if (toolDetail?.[0]?.parameters) {
        toolDetail[0].parameters.forEach(p => {
          initialForms[p.name] = p.form || 'llm';
        });
      }
      setParameterForms(initialForms);
    }
  }, [tool, isOpen, toolDetail]);

  useEffect(() => {
    if (isLabelDropdownOpen && labelButtonRef.current) {
      const rect = labelButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If space below is less than 300px, show above
      setLabelDropdownPlacement(spaceBelow < 300 ? 'top' : 'bottom');
    }
  }, [isLabelDropdownOpen]);

  if (!isOpen || !tool) return null;

  const performSave = async () => {
    setIsSaving(true);
    try {
      // Update parameters with selected forms
      const updatedParameters = toolDetail?.[0]?.parameters.map(p => ({
        ...p,
        form: parameterForms[p.name] || p.form
      })) || [];

      const data = {
        ...tool,
        label: { ...tool.label, zh_Hans: name },
        name: toolCallName,
        description: { ...tool.description, zh_Hans: description },
        labels: selectedLabels,
        icon,
        team_credentials: {
          ...tool.team_credentials,
          privacy_policy: privacyPolicy
        },
        // If the API supports updating parameters here, we'd include them
        // For now we follow the existing structure
      };
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Failed to save tool:', error);
    } finally {
      setIsSaving(false);
      setShowSaveConfirm(false);
    }
  };

  const handleSave = () => {
    setShowSaveConfirm(true);
  };

  const handleIconConfirm = (data: { icon: string; iconType: 'icon' | 'image'; iconBgColor?: string }) => {
    if (data.iconType === 'icon') {
      setIcon({ content: data.icon, background: data.iconBgColor || '#f0f9ff' });
    } else {
      setIcon(data.icon);
    }
  };

  const handleFormChange = (paramName: string, form: string) => {
    setParameterForms(prev => ({ ...prev, [paramName]: form }));
  };

  const performDelete = async () => {
    try {
      await onDelete(tool.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete tool:', error);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const toggleLabel = (label: string) => {
    setSelectedLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label) 
        : [...prev, label]
    );
  };

  const filteredLabels = allLabels.filter(label => 
    (LABEL_MAPPING[label] || label).toLowerCase().includes(labelSearch.toLowerCase())
  );

  const parameters = toolDetail?.[0]?.parameters || [];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[80] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[800px] bg-white shadow-2xl z-[90] transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">发布为工具</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-8 pb-32">
          {/* Name & Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
              名称 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 items-center">
              <div 
                onClick={() => setIsIconPickerOpen(true)}
                className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all group relative overflow-hidden"
              >
                {typeof icon === 'string' ? (
                  <img src={icon} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div style={{ backgroundColor: icon.background }} className="w-full h-full flex items-center justify-center text-xl">
                    {icon.content}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Edit2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-grow">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="网络搜索工具"
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Tool Call Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              工具调用名称 <span className="text-red-500">*</span>
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
            </label>
            <input
              type="text"
              value={toolCallName}
              onChange={(e) => setToolCallName(e.target.value)}
              placeholder="network_information_retrieval"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              工具描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="用于进行网络信息检索"
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
            />
          </div>

          {/* Parameters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              工具入参
            </label>
            <div className="border border-gray-100 rounded-xl shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-4 py-3">名称</th>
                    <th className="px-4 py-3">方式</th>
                    <th className="px-4 py-3">描述</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {parameters.length > 0 ? (
                    parameters.map((param) => (
                      <tr key={param.name} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-gray-900">{param.name}</span>
                            {param.required && (
                              <span className="text-[10px] text-orange-500 font-medium bg-orange-50 px-1 rounded">必须</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{param.type}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="relative">
                            <button
                              onClick={() => setOpenParamDropdown(openParamDropdown === param.name ? null : param.name)}
                              className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <span>{parameterForms[param.name] === 'query' ? '用户输入' : 'LLM 填入'}</span>
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            </button>
                            
                            {openParamDropdown === param.name && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenParamDropdown(null)} />
                                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-20 overflow-hidden min-w-[200px]">
                                  <div 
                                    className={`px-3 py-2 cursor-pointer border-b border-gray-50 flex justify-between items-center ${parameterForms[param.name] === 'llm' ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                                    onClick={() => {
                                      handleFormChange(param.name, 'llm');
                                      setOpenParamDropdown(null);
                                    }}
                                  >
                                    <div>
                                      <div className={`font-medium text-xs ${parameterForms[param.name] === 'llm' ? 'text-blue-700' : 'text-gray-900'}`}>LLM 填入</div>
                                      <div className="text-[10px] text-gray-500 mt-0.5">由大模型自动生成参数值</div>
                                    </div>
                                    {parameterForms[param.name] === 'llm' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                                  </div>
                                  <div 
                                    className={`px-3 py-2 cursor-pointer flex justify-between items-center ${parameterForms[param.name] === 'query' ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                                    onClick={() => {
                                      handleFormChange(param.name, 'query');
                                      setOpenParamDropdown(null);
                                    }}
                                  >
                                    <div>
                                      <div className={`font-medium text-xs ${parameterForms[param.name] === 'query' ? 'text-blue-700' : 'text-gray-900'}`}>用户输入</div>
                                      <div className="text-[10px] text-gray-500 mt-0.5">由用户手动填写参数值</div>
                                    </div>
                                    {parameterForms[param.name] === 'query' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-xs leading-relaxed">
                          {param.human_description?.zh_Hans || param.label?.zh_Hans}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-10 text-center text-gray-400 italic">
                        无参数配置
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Labels */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签
            </label>
            <button
              ref={labelButtonRef}
              onClick={() => setIsLabelDropdownOpen(!isLabelDropdownOpen)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-left text-sm flex items-center justify-between hover:border-gray-300 transition-all"
            >
              <div className="flex flex-wrap gap-1.5">
                {selectedLabels.length > 0 ? (
                  selectedLabels.map(l => (
                    <span key={l} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium border border-blue-100 flex items-center gap-1">
                      {LABEL_MAPPING[l] || l}
                      <X className="w-3 h-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleLabel(l); }} />
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">选择标签(可选)</span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLabelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLabelDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsLabelDropdownOpen(false)} />
                <div className={`absolute left-0 right-0 ${labelDropdownPlacement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in ${labelDropdownPlacement === 'top' ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'} duration-200`}>
                  <div className="p-2 border-b border-gray-50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="搜索标签..."
                        value={labelSearch}
                        onChange={(e) => setLabelSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border-none rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                    {filteredLabels.map(label => {
                      const isSelected = selectedLabels.includes(label);
                      return (
                        <button
                          key={label}
                          onClick={() => toggleLabel(label)}
                          className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span>{LABEL_MAPPING[label] || label}</span>
                          {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Privacy Policy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              隐私协议
            </label>
            <input
              type="text"
              value={privacyPolicy}
              onChange={(e) => setPrivacyPolicy(e.target.value)}
              placeholder="请输入隐私协议"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-5 border-t border-gray-100 bg-white/80 backdrop-blur-md flex justify-between items-center z-20">
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium border border-gray-200"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-medium shadow-sm shadow-blue-200 disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>

      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onConfirm={handleIconConfirm}
        initialValue={typeof icon === 'string' ? { icon, iconType: 'image' } : { icon: icon.content, iconType: 'icon', iconBgColor: icon.background }}
      />

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSaveConfirm(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowSaveConfirm(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-orange-500 flex items-center justify-center relative">
                    <span className="absolute top-[6px] text-white font-bold text-[10px]">!</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">确认保存?</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  发布新的工具版本可能会影响该工具已关联的应用
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={() => setShowSaveConfirm(false)}
                  className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={performSave}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all shadow-sm"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">删除这个工具?</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  删除工具是不可逆的。用户将无法再访问您的工具。
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={performDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all shadow-sm"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditCustomToolModal;
