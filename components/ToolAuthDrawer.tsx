import React, { useState } from 'react';
import { ToolItem, ToolDetail } from '../types';
import { X, ExternalLink, ShieldCheck, Info } from 'lucide-react';
import ToolParamDrawer from './ToolParamDrawer';

interface ToolAuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tool: ToolItem | null;
  toolDetail: ToolDetail[] | null;
  onAuthorize: () => void;
  onEdit: () => void;
}

const ToolAuthDrawer: React.FC<ToolAuthDrawerProps> = ({ isOpen, onClose, tool, toolDetail, onAuthorize, onEdit }) => {
  const [selectedSubTool, setSelectedSubTool] = useState<ToolDetail | null>(null);

  if (!isOpen || !tool) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out overflow-y-auto border-l border-gray-100">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
              {typeof tool.icon === 'string' ? (
                <img src={tool.icon} alt={tool.label.zh_Hans} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
              ) : (
                <div style={{ backgroundColor: tool.icon.background }} className="w-full h-full flex items-center justify-center text-sm">
                  {tool.icon.content}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">{tool.label.zh_Hans}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{tool.author}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {tool.type === 'builtin' ? (
            <>
              {/* Authorization Status */}
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <ShieldCheck className={`w-5 h-5 mt-0.5 ${tool.is_team_authorization ? 'text-green-600' : 'text-blue-600'}`} />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {tool.is_team_authorization ? '已授权' : '需要授权'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {tool.is_team_authorization 
                        ? '该工具已获得授权，可以正常使用。如需更新授权信息，请点击下方按钮。' 
                        : '使用该工具需要先进行授权配置。请点击下方按钮前往授权页面。'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onAuthorize}
                  className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-200 flex items-center justify-center gap-2"
                >
                  {tool.is_team_authorization ? '更新授权' : '去授权'}
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {/* Tool Details */}
              {Array.isArray(toolDetail) ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="font-semibold text-gray-900">包含工具</h4>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                      {toolDetail.length}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {toolDetail.map((detail, index) => (
                      <div 
                        key={index} 
                        className="group rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all bg-white cursor-pointer"
                        onClick={() => setSelectedSubTool(detail)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {detail.label.zh_Hans}
                          </h5>
                          <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                            {detail.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                          {detail.description.zh_Hans}
                        </p>
                        
                        {/* Parameters Preview */}
                        {detail.parameters && detail.parameters.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-1.5 mb-3 text-xs font-medium text-gray-500">
                              <Info className="w-3.5 h-3.5" />
                              参数列表
                            </div>
                            <div className="space-y-2">
                              {detail.parameters.slice(0, 3).map((param) => (
                                <div key={param.name} className="flex items-baseline gap-2 text-xs">
                                  <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    {param.name}
                                  </span>
                                  <span className="text-gray-400">
                                    {param.type}
                                  </span>
                                  {param.required && (
                                    <span className="text-red-500 scale-75 origin-left">*</span>
                                  )}
                                  <span className="text-gray-500 truncate flex-1">
                                    - {param.human_description?.zh_Hans || param.label?.zh_Hans}
                                  </span>
                                </div>
                              ))}
                              {detail.parameters.length > 3 && (
                                <div className="text-xs text-gray-400 pl-1">
                                  + {detail.parameters.length - 3} 更多参数...
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
                  <p className="text-xs">加载工具详情...</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Custom Tool Actions */}
              <div className="flex gap-3">
                <button 
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-200 flex items-center justify-center gap-2"
                  onClick={() => {}} // Placeholder functionality
                >
                  在应用开发中打开
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button 
                  className="flex-1 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  onClick={onEdit}
                >
                  编辑
                </button>
              </div>

              {/* Tool Parameters */}
              {Array.isArray(toolDetail) ? (
                <div>
                  <h4 className="font-medium text-gray-500 text-sm mb-3">工具入参</h4>
                  <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4">
                    {toolDetail[0]?.parameters && Array.isArray(toolDetail[0].parameters) && toolDetail[0].parameters.length > 0 ? (
                      <div className="space-y-3">
                        {toolDetail[0].parameters.map((param) => (
                          <div key={param.name} className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-900">{param.label.zh_Hans}</span>
                            <span className="text-gray-400 text-xs">{param.type}</span>
                            {param.required && (
                              <span className="text-red-500 text-xs">必须</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">无参数配置</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
                  <p className="text-xs">加载工具详情...</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ToolParamDrawer
        isOpen={!!selectedSubTool}
        onClose={() => setSelectedSubTool(null)}
        toolDetail={selectedSubTool}
        parentTool={tool}
      />
    </>
  );
};

export default ToolAuthDrawer;
