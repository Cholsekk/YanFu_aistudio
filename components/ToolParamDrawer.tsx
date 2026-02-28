import React from 'react';
import { X, Puzzle } from 'lucide-react';
import { ToolDetail, ToolItem } from '../types';

interface ToolParamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  toolDetail: ToolDetail | null;
  parentTool: ToolItem | null;
}

const ToolParamDrawer: React.FC<ToolParamDrawerProps> = ({ 
  isOpen, 
  onClose, 
  toolDetail,
  parentTool 
}) => {
  if (!isOpen || !toolDetail) return null;

  return (
    <>
      {/* Backdrop - even higher z-index */}
      <div 
        className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[80] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[520px] bg-white shadow-2xl z-[90] transform transition-transform duration-300 ease-in-out overflow-y-auto border-l border-gray-100 flex flex-col">
        {/* Header Actions */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Header Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {parentTool?.icon ? (
                 typeof parentTool.icon === 'string' ? (
                  <img src={parentTool.icon || undefined} alt="" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-4 h-4 flex items-center justify-center">
                    {parentTool.icon.content}
                  </div>
                )
              ) : (
                <Puzzle className="w-4 h-4" />
              )}
              <span>
                {toolDetail.author} / {parentTool?.name || 'tool'}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {toolDetail.label.zh_Hans}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {toolDetail.description.zh_Hans}
              </p>
            </div>
          </div>

          {/* Parameters Section */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-6">参数</h3>
            
            <div className="space-y-6">
              {toolDetail.parameters && Array.isArray(toolDetail.parameters) && toolDetail.parameters.length > 0 ? (
                toolDetail.parameters.map((param) => (
                  <div key={param.name} className="space-y-1">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">
                        {param.label.zh_Hans}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {param.type}
                      </span>
                      {param.required && (
                        <span className="text-xs text-orange-500 font-medium">
                          必填
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {param.human_description?.zh_Hans || param.llm_description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">无参数配置</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ToolParamDrawer;
