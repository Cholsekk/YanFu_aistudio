import React, { useState, useEffect } from 'react';
import { Modal, Input, Checkbox, Button } from 'antd';
import { Type, AlignLeft, CheckSquare, Hash, GripVertical, Trash2, Plus } from 'lucide-react';

export interface Variable {
  id: string;
  name: string;
  displayName?: string;
  type: string;
  value?: any;
  options?: string[];
  required?: boolean;
  maxLength?: number;
  default?: any;
}

interface VariableEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  variable: Variable | null;
  onSave: (variable: Variable) => void;
}

const VariableEditModal: React.FC<VariableEditModalProps> = ({ isOpen, onClose, variable, onSave }) => {
  const [formData, setFormData] = useState<Partial<Variable>>({
    type: 'text',
    name: '',
    displayName: '',
    maxLength: 48,
    required: true,
    options: [],
  });

  useEffect(() => {
    if (variable) {
      setFormData({
        ...variable,
        required: variable.required !== false,
        maxLength: variable.maxLength || 48,
        options: variable.options || [],
        default: variable.default || '',
      });
    } else {
      setFormData({
        type: 'text',
        name: '',
        displayName: '',
        maxLength: 48,
        required: true,
        options: [],
        default: '',
      });
    }
  }, [variable, isOpen]);

  const handleSave = () => {
    if (!formData.name) return;
    const isSelect = formData.type === 'select';
    const isRequired = formData.required;
    onSave({
      id: variable?.id || Math.random().toString(36).substring(7),
      name: formData.name,
      displayName: formData.displayName,
      type: formData.type || 'text',
      required: isRequired,
      maxLength: formData.maxLength,
      options: isSelect ? formData.options : undefined,
      default: (!isSelect && isRequired) ? (formData.default || '') : '',
    });
    onClose();
  };

  const addOption = () => {
    const newOptions = [...(formData.options || []), `选项${(formData.options?.length || 0) + 1}`];
    setFormData({ ...formData, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options?.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const types = [
    { id: 'text', label: '文本', icon: <Type className="w-5 h-5 mb-1" /> },
    { id: 'paragraph', label: '段落', icon: <AlignLeft className="w-5 h-5 mb-1" /> },
    { id: 'select', label: '下拉选项', icon: <CheckSquare className="w-5 h-5 mb-1" /> },
    { id: 'number', label: '数字', icon: <Hash className="w-5 h-5 mb-1" /> },
  ];

  return (
    <Modal
      title={<div className="text-lg font-bold text-gray-900 mb-4">{variable ? '编辑变量' : '添加变量'}</div>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={480}
      className="custom-modal"
    >
      <div className="space-y-5">
        <div>
          <div className="text-sm font-bold text-gray-700 mb-2">字段类型</div>
          <div className="grid grid-cols-4 gap-3">
            {types.map((t) => (
              <div
                key={t.id}
                onClick={() => setFormData({ ...formData, type: t.id })}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.type === t.id
                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-[0_0_0_1px_rgba(59,130,246,0.5)]'
                    : 'border-gray-100 bg-gray-50/50 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.icon}
                <span className="text-xs font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-bold text-gray-700 mb-2">变量名称</div>
          <Input
            placeholder="请输入"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-gray-50 border-none h-10 rounded-lg focus:bg-white"
          />
        </div>

        <div>
          <div className="text-sm font-bold text-gray-700 mb-2">显示名称</div>
          <Input
            placeholder="请输入"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            className="bg-gray-50 border-none h-10 rounded-lg focus:bg-white"
          />
        </div>

        {formData.type === 'select' && (
          <div>
            <div className="text-sm font-bold text-gray-700 mb-2">选项</div>
            <div className="space-y-2">
              {formData.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <div className="flex items-center justify-center w-8 h-10 text-gray-400 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-grow bg-white border-gray-200 h-10 rounded-lg focus:border-blue-500"
                  />
                  <Button
                    type="text"
                    icon={<Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />}
                    onClick={() => removeOption(index)}
                    className="flex items-center justify-center w-10 h-10"
                  />
                </div>
              ))}
              <Button
                type="text"
                icon={<Plus className="w-4 h-4" />}
                onClick={addOption}
                className="w-full h-10 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center justify-start px-4 border-none"
              >
                添加选项
              </Button>
            </div>
          </div>
        )}

        {formData.type !== 'select' && formData.type !== 'number' && (
          <div>
            <div className="text-sm font-bold text-gray-700 mb-2">最大长度</div>
            <Input
              type="number"
              value={formData.maxLength}
              onChange={(e) => setFormData({ ...formData, maxLength: parseInt(e.target.value) || 0 })}
              className="bg-gray-50 border-none h-10 rounded-lg focus:bg-white"
            />
          </div>
        )}

        {formData.type !== 'select' && formData.required && (
          <div>
            <div className="text-sm font-bold text-gray-700 mb-2">默认值</div>
            <Input
              placeholder="请输入"
              value={formData.default}
              onChange={(e) => setFormData({ ...formData, default: e.target.value })}
              className="bg-gray-50 border-none h-10 rounded-lg focus:bg-white"
            />
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Checkbox
            checked={formData.required}
            onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
            className="font-bold text-gray-700"
          >
            必填
          </Checkbox>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
          <Button onClick={onClose} className="h-10 px-6 rounded-lg text-gray-600 hover:text-gray-900 border-gray-200">
            取消
          </Button>
          <Button type="primary" onClick={handleSave} className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 border-none">
            保存
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VariableEditModal;
