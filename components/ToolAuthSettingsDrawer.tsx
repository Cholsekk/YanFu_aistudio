import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { ToolCredential, CredentialData } from '../types';

interface ToolAuthSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  schema: ToolCredential[];
  initialValues: CredentialData;
  onSave: (values: CredentialData) => void;
}

const ToolAuthSettingsDrawer: React.FC<ToolAuthSettingsDrawerProps> = ({
  isOpen,
  onClose,
  schema,
  initialValues,
  onSave,
}) => {
  const [values, setValues] = useState<CredentialData>(initialValues);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues);
      setShowSecrets({});
    }
  }, [isOpen, initialValues]);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShowSecret = (name: string) => {
    setShowSecrets((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSave = () => {
    onSave(values);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - higher z-index than the main drawer */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[80] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer - higher z-index than the main drawer */}
      <div className="fixed top-0 right-0 h-full w-[480px] bg-gray-50 shadow-2xl z-[90] transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">设置授权</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="text-sm text-gray-500 leading-relaxed">
            配置凭据后，工作区中的所有成员都可以在编排应用程序时使用此工具。
          </div>

          <div className="space-y-6">
            {Array.isArray(schema) && schema.map((field) => (
              <div key={field.name} className="space-y-2">
                <div className="flex items-center gap-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label.zh_Hans}
                  </label>
                  {field.required && <span className="text-red-500">*</span>}
                  {field.help && (
                    <div className="group relative ml-1 cursor-help">
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {field.help.zh_Hans}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  {field.type === 'secret-input' ? (
                    <div className="relative">
                      <input
                        type={showSecrets[field.name] ? 'text' : 'password'}
                        value={values[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder?.zh_Hans}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret(field.name)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showSecrets[field.name] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={values[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder?.zh_Hans}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </>
  );
};

export default ToolAuthSettingsDrawer;
