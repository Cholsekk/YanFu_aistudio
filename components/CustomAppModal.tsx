
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import IconPickerModal from './IconPickerModal';
import { ChevronDown, ChevronUp, Check, Plus, Trash2, Pencil, X } from 'lucide-react';
import { AppItem, AppCategory, MenuItem } from '../types';
import { getIcon } from '../constants';
import { apiService } from '../services/apiService';
import { message, Modal as AntModal } from 'antd';
import { v4 as uuid4 } from 'uuid';

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
    iconType: 'icon' as 'icon' | 'image' | 'sys-icon',
    iconBgColor: 'bg-indigo-600',
    iconUrl: ''
  });

  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await apiService.getAppCategories();
      if (response && Array.isArray(response)) {
        setCategories(response);
        setFormData(prev => {
          if (!prev.category && response.length > 0) {
            return { ...prev, category: response[0].id };
          }
          return prev;
        });
      } else if (response && response.items && Array.isArray(response.items)) {
        setCategories(response.items);
        setFormData(prev => {
          if (!prev.category && response.items.length > 0) {
            return { ...prev, category: response.items[0].id };
          }
          return prev;
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      if (error.message && error.message.includes('鉴权失败')) {
        message.error('鉴权失败：请配置您的 Token 和 tenant_id');
        window.dispatchEvent(new CustomEvent('open-token-config'));
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleAddCategory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!newCategoryName.trim()) return;
    try {
      await apiService.addAppCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
      await fetchCategories();
      message.success('添加分类成功');
    } catch (error: any) {
      console.error('Failed to add category:', error);
      message.error(error.message || '添加分类失败');
    }
  };

  const handleUpdateCategory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!editingCategoryName.trim()) return;
    try {
      await apiService.updateAppCategory(id, editingCategoryName.trim());
      setEditingCategoryId(null);
      await fetchCategories();
      message.success('更新分类成功');
    } catch (error: any) {
      console.error('Failed to update category:', error);
      message.error(error.message || '更新分类失败');
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: string, categoryName: string) => {
    e.stopPropagation();
    AntModal.confirm({
      title: '确认删除',
      content: `确定要删除分类 "${categoryName}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await apiService.deleteAppCategory(id);
          if (formData.category === id) {
            setFormData(prev => ({ ...prev, category: '' }));
          }
          await fetchCategories();
          message.success('删除分类成功');
        } catch (error: any) {
          console.error('Failed to delete category:', error);
          message.error(error.message || '删除分类失败');
        }
      }
    });
  };

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
        iconBgColor: initialData.iconBgColor || 'bg-indigo-600',
        iconUrl: initialData.icon_url || ''
      });
    } else {
      setFormData(prev => ({
        ...prev,
        name: '',
        type: '全部',
        category: categories[0]?.id || '',
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
        iconBgColor: 'bg-indigo-600',
        iconUrl: ''
      }));
    }
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      message.error('应用名称不能为空');
      return;
    }

    try {
      const isCustomApp = initialData?.type === '定制应用' || initialData?.mode === 'custom';
      const updateId = isCustomApp ? initialData?.itemId : initialData?.id;
      
      // 确保 app_id 和 app.id 不为空，避免列表渲染时 key 重复导致无限请求
      const appId = initialData?.id || uuid4();
      const itemId = initialData?.itemId || uuid4();

      const customAppPayload = {
        id: itemId, // Outer ID
        app: {
          id: appId, // Inner ID
          name: formData.name,
          mode: 'custom',
          icon: formData.icon,
          icon_type: formData.iconType,
          url: formData.appUrl
        },
        app_id: appId,
        description: formData.description,
        copyright: 'Yanfu.AI',
        privacy_policy: '',
        custom_disclaimer: '',
        category: formData.category,
        position: 0,
        is_listed: true,
        label_type: 'free',
        label_name: '免费使用',
        is_token_verified: formData.needToken,
        login_api: formData.loginUrl,
        jwt_api: formData.authUrl,
        default_username: formData.account,
        default_password: formData.password,
        is_menu: formData.customMenu,
        menus: formData.customMenu ? JSON.stringify({ menus: formData.menuItems }) : null,
        created_by: 'c90c0746-f226-4ddf-b7cd-e04318fc018d'
      };

      if (updateId) {
        await apiService.updateCustomApp(customAppPayload);
        message.success('应用更新成功');
      } else {
        await apiService.createCustomApp(customAppPayload);
        message.success('应用创建成功');
      }
      
      onCreate(null); // Trigger refresh
      onClose();
    } catch (error: any) {
      console.error('Failed to save custom app:', error);
      message.error(error.message || '保存失败，请重试');
    }
  };

  const handleIconConfirm = (data: { icon: string; iconType: 'icon' | 'image' | 'sys-icon'; iconBgColor?: string; iconUrl?: string }) => {
    setFormData({ ...formData, icon: data.icon, iconType: data.iconType, iconBgColor: data.iconBgColor || 'bg-indigo-600', iconUrl: data.iconUrl || '' });
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
            <button onClick={handleSubmit} className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200">
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
                className="w-10 h-10 rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0 hover:border-primary-300 transition-colors overflow-hidden group relative"
              >
                {formData.iconType === 'image' ? (
                  <img src={formData.iconUrl || formData.icon || undefined} alt="icon" className="w-full h-full object-cover" />
                ) : formData.iconType === 'sys-icon' ? (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img 
                      src={`/sys_icons/Component ${formData.icon}.svg`} 
                      alt="icon" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/sys_icons/Component 156.svg';
                      }}
                    />
                  </div>
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
                className="flex-grow px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
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
                <span>{categories.find(c => c.id === formData.category)?.category || '请选择类型'}</span>
                {isCategoryOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {isCategoryOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-[110] py-1 max-h-60 overflow-y-auto flex flex-col">
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      className={`group w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${formData.category === cat.id ? 'bg-primary-50/50 text-primary-600' : ''}`}
                    >
                      {editingCategoryId === cat.id ? (
                        <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            className="flex-grow px-2 py-1 text-sm border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={editingCategoryName}
                            onChange={e => setEditingCategoryName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleUpdateCategory(e as any, cat.id);
                              if (e.key === 'Escape') setEditingCategoryId(null);
                            }}
                            autoFocus
                          />
                          <button onClick={(e) => handleUpdateCategory(e, cat.id)} className="text-primary-600 hover:text-primary-700 p-1">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingCategoryId(null); }} className="text-gray-400 hover:text-gray-600 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            className="flex-grow text-left flex items-center gap-2"
                            onClick={() => {
                              setFormData({...formData, category: cat.id});
                              setIsCategoryOpen(false);
                            }}
                          >
                            {cat.category}
                            {formData.category === cat.id && <Check className="w-4 h-4 flex-shrink-0" />}
                          </button>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCategoryId(cat.id);
                                setEditingCategoryName(cat.category);
                              }}
                              className="p-1 text-gray-400 hover:text-primary-600 rounded"
                              title="编辑"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteCategory(e, cat.id, cat.category)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                              title="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-100 mt-1 p-2">
                    {isAddingCategory ? (
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          placeholder="输入新分类名称"
                          className="flex-grow px-2 py-1 text-sm border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          value={newCategoryName}
                          onChange={e => setNewCategoryName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddCategory(e as any);
                            if (e.key === 'Escape') setIsAddingCategory(false);
                          }}
                          autoFocus
                        />
                        <button onClick={handleAddCategory} className="text-primary-600 hover:text-primary-700 p-1">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setIsAddingCategory(false); }} className="text-gray-400 hover:text-gray-600 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAddingCategory(true);
                          setNewCategoryName('');
                        }}
                        className="w-full flex items-center justify-center gap-1 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        添加新分类
                      </button>
                    )}
                  </div>
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
              className={`w-11 h-6 rounded-full transition-colors relative ${formData.needToken ? 'bg-primary-600' : 'bg-gray-200'}`}
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
              className={`w-11 h-6 rounded-full transition-colors relative ${formData.customMenu ? 'bg-primary-600' : 'bg-gray-200'}`}
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-primary-600 text-xs font-semibold rounded-lg border border-dashed border-primary-200 hover:bg-primary-50 transition-all"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all min-h-[80px] text-sm"
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
