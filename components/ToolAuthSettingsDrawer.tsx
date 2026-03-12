import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { ToolCredential, CredentialData } from '../types';

interface ToolAuthSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  schema: ToolCredential[];
  initialValues: CredentialData;
  onSave: (values: CredentialData) => void;
  isLoading?: boolean;
}

const ToolAuthSettingsDrawer: React.FC<ToolAuthSettingsDrawerProps> = ({
  isOpen,
  onClose,
  schema,
  initialValues,
  onSave,
  isLoading = false,
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
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - higher z-index than the main drawer */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[80] transition-opacity"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      />

      {/* Drawer - higher z-index than the main drawer */}
      <div 
        className="fixed top-0 right-0 h-full w-[520px] bg-white shadow-2xl z-[90] transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-100 tool-auth-settings-drawer"
        onClick={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
        onMouseDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
      >
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-gray-900 text-xl">设置授权</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="text-sm text-gray-500 leading-relaxed">
            配置凭据后，工作区中的所有成员都可以在编排应用程序时使用此工具。
          </div>

          <div className="space-y-8">
            {Array.isArray(schema) && schema.map((field) => (
              <div key={field.name} className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <label className="block text-sm font-bold text-gray-900">
                    {field.label.zh_Hans}
                  </label>
                  {field.required && <span className="text-red-500 font-bold">*</span>}
                  {field.help && (
                    <div className="group relative cursor-help">
                      <HelpCircle className="w-4 h-4 text-gray-300 hover:text-gray-400 transition-colors" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
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
                        name={`auth-${field.name}`}
                        autoComplete="new-password"
                        value={values[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder?.zh_Hans}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm pr-12 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret(field.name)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showSecrets[field.name] ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      name={`auth-${field.name}`}
                      autoComplete="off"
                      value={values[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder?.zh_Hans}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-8 py-6 border-t border-gray-100 flex justify-end gap-4 shrink-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                保存中...
              </>
            ) : '保存'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ToolAuthSettingsDrawer;
