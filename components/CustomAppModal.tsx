
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import IconPickerModal from './IconPickerModal';
import { ChevronDown, ChevronUp, Check, Plus, Trash2 } from 'lucide-react';
import { AppItem, AppCategory, MenuItem } from '../types';
import { getIcon } from '../constants';

interface CustomAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (app: any) => void;
  initialData?: AppItem | null;
}

const CustomAppModal: React.FC<CustomAppModalProps> = ({ isOpen, onClose, onCreate, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '全部',
    category: '',
    appUrl: 'http://localhost:3333',
    needToken: true,
    loginUrl: 'http://localhost:3333/api/login',
    authUrl: 'http://localhost:3333/api/auth',
    account: 'admin',
    password: '',
    customMenu: false,
    menuItems: [] as MenuItem[],
    description: '',
    icon: 'LayoutGrid',
    iconType: 'icon' as 'icon' | 'image',
    iconBgColor: 'bg-indigo-600'
  });

  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const mockData: AppCategory[] = [
        { id: "e01afa29-dac2-4a29-a66f-9a5f639e9305", category: "工厂建设" },
        { id: "f8913715-6c07-49f7-97d4-5841b1d47d3b", category: "产品设计" },
        { id: "g9213715-6c07-49f7-97d4-5841b1d47d3c", category: "工艺设计" },
        { id: "h0313715-6c07-49f7-97d4-5841b1d47d3d", category: "计划调度" },
      ];
      setCategories(mockData);
      if (!formData.category && mockData.length > 0) {
        setFormData(prev => ({ ...prev, category: mockData[1].category }));
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        type: initialData.type,
        category: initialData.category || '',
        appUrl: initialData.appUrl || 'http://localhost:3333',
        needToken: initialData.needToken ?? true,
        loginUrl: initialData.loginUrl || '',
        authUrl: initialData.authUrl || '',
        account: initialData.account || '',
        password: initialData.password || '',
        customMenu: initialData.customMenu ?? false,
        menuItems: initialData.menuItems || [],
        description: initialData.description,
        icon: initialData.icon,
        iconType: initialData.iconType,
        iconBgColor: initialData.iconBgColor || 'bg-indigo-600'
      });
    } else {
      setFormData(prev => ({
        ...prev,
        name: '',
        type: '全部',
        category: categories[1]?.category || '',
        appUrl: 'http://localhost:3333',
        needToken: true,
        loginUrl: 'http://localhost:3333/api/login',
        authUrl: 'http://localhost:3333/api/auth',
        account: 'admin',
        password: '',
        customMenu: false,
        menuItems: [],
        description: '',
        icon: 'LayoutGrid',
        iconType: 'icon',
        iconBgColor: 'bg-indigo-600'
      }));
    }
  }, [initialData, isOpen, categories]);

  const handleSubmit = () => {
    onCreate({
      ...(initialData ? { id: initialData.id } : {}),
      name: formData.name || '未命名定制应用',
      type: '定制应用',
      typeLabel: '定制化应用',
      description: formData.description,
      tags: initialData?.tags || [],
      ...formData
    });
    onClose();
  };

  const handleIconConfirm = (data: { icon: string; iconType: 'icon' | 'image'; iconBgColor?: string }) => {
    setFormData({ ...formData, icon: data.icon, iconType: data.iconType, iconBgColor: data.iconBgColor || 'bg-indigo-600' });
  };

  const addMenuItem = () => {
    setFormData({
      ...formData,
      menuItems: [...formData.menuItems, { name: '', path: '' }]
    });
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string) => {
    const newItems = [...formData.menuItems];
    newItems[index][field] = value;
    setFormData({ ...formData, menuItems: newItems });
  };

  const removeMenuItem = (index: number) => {
    setFormData({
      ...formData,
      menuItems: formData.menuItems.filter((_, i) => i !== index)
    });
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={initialData ? "编辑定制化应用" : "创建定制化应用"}
        maxWidth="max-w-xl"
        footer={
          <>
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium border border-gray-200">取消</button>
            <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
              {initialData ? '保存' : '创建'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">图标 & 名称</label>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsIconPickerOpen(true)}
                className="w-10 h-10 rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0 hover:border-blue-300 transition-colors overflow-hidden group relative"
              >
                {formData.iconType === 'image' ? (
                  <img src={formData.icon || undefined} alt="icon" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full ${formData.iconBgColor} flex items-center justify-center text-white`}>
                    {getIcon(formData.icon, "w-5 h-5")}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                </div>
              </button>
              <input 
                type="text" 
                placeholder="给你的应用起个名字" 
                className="flex-grow px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">应用类型</label>
            <div className="relative">
              <button 
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300 transition-all text-left"
              >
                <span>{formData.category || '请选择类型'}</span>
                {isCategoryOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {isCategoryOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-[110] py-1 max-h-60 overflow-y-auto">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setFormData({...formData, category: cat.category});
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${formData.category === cat.category ? 'bg-blue-50/50 text-blue-600' : ''}`}
                    >
                      {cat.category}
                      {formData.category === cat.category && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">应用地址</label>
            <input 
              type="text" 
              placeholder="http://localhost:3333" 
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 bg-white"
              value={formData.appUrl}
              onChange={e => setFormData({...formData, appUrl: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">是否需要token认证</label>
            <button 
              onClick={() => setFormData({...formData, needToken: !formData.needToken})}
              className={`w-11 h-6 rounded-full transition-colors relative ${formData.needToken ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.needToken ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {formData.needToken && (
            <div className="bg-gray-50/50 p-4 rounded-xl space-y-4 border border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">登录接口</label>
                <input 
                  type="text" 
                  placeholder="http://localhost:3333/api/login" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  value={formData.loginUrl}
                  onChange={e => setFormData({...formData, loginUrl: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">鉴权接口</label>
                <input 
                  type="text" 
                  placeholder="http://localhost:3333/api/auth" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  value={formData.authUrl}
                  onChange={e => setFormData({...formData, authUrl: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">账号</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    value={formData.account}
                    onChange={e => setFormData({...formData, account: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">密码</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">是否需要自定义菜单</label>
            <button 
              onClick={() => setFormData({...formData, customMenu: !formData.customMenu})}
              className={`w-11 h-6 rounded-full transition-colors relative ${formData.customMenu ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.customMenu ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {formData.customMenu && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">自定义菜单配置</label>
              {formData.menuItems.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="菜单名称 (如：首页)" 
                    className="w-1/3 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    value={item.name}
                    onChange={e => updateMenuItem(idx, 'name', e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="菜单路径 (如：/home)" 
                    className="flex-grow px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    value={item.path}
                    onChange={e => updateMenuItem(idx, 'path', e.target.value)}
                  />
                  <button 
                    onClick={() => removeMenuItem(idx)}
                    className="px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-gray-100 transition-colors text-sm"
                  >
                    删除
                  </button>
                </div>
              ))}
              <button 
                onClick={addMenuItem}
                className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 text-xs font-semibold rounded-lg border border-dashed border-blue-200 hover:bg-blue-50 transition-all"
              >
                <Plus className="w-3 h-3" />
                添加菜单项
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <textarea 
              placeholder="输入应用的描述" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[80px] text-sm"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>
      </Modal>

      <IconPickerModal 
        isOpen={isIconPickerOpen} 
        onClose={() => setIsIconPickerOpen(false)} 
        onConfirm={handleIconConfirm}
        initialValue={{ icon: formData.icon, iconType: formData.iconType, iconBgColor: formData.iconBgColor }}
      />
    </>
  );
};

export default CustomAppModal;
