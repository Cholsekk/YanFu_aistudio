import React, { useState, useEffect } from 'react';
import { Modal, Input, Checkbox, Button } from 'antd';
import { Type, AlignLeft, CheckSquare, Hash } from 'lucide-react';

export interface Variable {
  id: string;
  name: string;
  displayName?: string;
  type: string;
  value?: any;
  options?: string[];
  required?: boolean;
  maxLength?: number;
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
  });

  useEffect(() => {
    if (variable) {
      setFormData({
        ...variable,
        required: variable.required !== false,
        maxLength: variable.maxLength || 48,
      });
    } else {
      setFormData({
        type: 'text',
        name: '',
        displayName: '',
        maxLength: 48,
        required: true,
      });
    }
  }, [variable, isOpen]);

  const handleSave = () => {
    if (!formData.name) return;
    onSave({
      id: variable?.id || Math.random().toString(36).substring(7),
      name: formData.name,
      displayName: formData.displayName,
      type: formData.type || 'text',
      required: formData.required,
      maxLength: formData.maxLength,
      options: formData.options,
    });
    onClose();
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
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
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

        <div className="flex items-center gap-2 pt-2">
          <Checkbox
            checked={formData.required}
            onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
            className="font-bold text-gray-700"
          >
            必填
          </Checkbox>
        </div>

        {formData.type === 'select' ? (
          <div>
            <div className="text-sm font-bold text-gray-700 mb-2">选项 (用逗号分隔)</div>
            <Input
              placeholder="选项1, 选项2, 选项3"
              value={formData.options?.join(', ')}
              onChange={(e) => setFormData({ ...formData, options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="bg-gray-50 border-none h-10 rounded-lg focus:bg-white"
            />
          </div>
        ) : (
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
