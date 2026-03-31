import React from 'react';
import { Modal, Tabs, Collapse, Button, message } from 'antd';
import { Check, Copy, Cpu, Maximize2 } from 'lucide-react';

interface LogDetailModalProps {
  visible: boolean;
  onClose: () => void;
  currentLogMsg: any;
}

const LogDetailModal: React.FC<LogDetailModalProps> = ({ visible, onClose, currentLogMsg }) => {
  return (
    <Modal
      title="日志详情"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className="log-modal"
    >
      {currentLogMsg && (
        <Tabs
          defaultActiveKey="details"
          items={[
            {
              key: 'details',
              label: '详情',
              children: (
                <div className="space-y-4">
                  <div className="flex gap-8 border-b border-gray-100 pb-4">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">状态</div>
                      <div className="text-green-500 text-sm font-medium flex items-center gap-1">
                        <Check className="w-4 h-4" /> 成功
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">运行时间</div>
                      <div className="text-gray-800 text-sm font-medium">{currentLogMsg.assistantMsg?.time_taken?.toFixed(3) || '0.000'}s</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">总消耗 Token</div>
                      <div className="text-gray-800 text-sm font-medium">{currentLogMsg.assistantMsg?.total_tokens || 0}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-800 font-medium">输入</div>
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<Copy className="w-3.5 h-3.5 text-gray-400" />} 
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify({ query: currentLogMsg.userMsg?.content || '' }, null, 2));
                          message.success('已复制输入');
                        }}
                      />
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 font-mono text-xs text-gray-700 whitespace-pre-wrap max-h-[200px] overflow-y-auto custom-scrollbar">
                      {JSON.stringify({ query: currentLogMsg.userMsg?.content || '' }, null, 2)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-800 font-medium">输出</div>
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<Copy className="w-3.5 h-3.5 text-gray-400" />} 
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify({ text: currentLogMsg.assistantMsg?.content || '' }, null, 2));
                          message.success('已复制输出');
                        }}
                      />
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 font-mono text-xs text-gray-700 whitespace-pre-wrap max-h-[200px] overflow-y-auto custom-scrollbar">
                      {JSON.stringify({ text: currentLogMsg.assistantMsg?.content || '' }, null, 2)}
                    </div>
                  </div>
                </div>
              )
            },
            {
              key: 'trace',
              label: '追踪',
              children: (
                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-500 mb-2">最终处理</div>
                  <Collapse
                    ghost
                    expandIconPosition="start"
                    className="bg-white border border-gray-100 rounded-xl overflow-hidden"
                    items={[
                      {
                        key: '1',
                        label: (
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center text-white">
                                <Cpu className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-bold text-gray-800">LLM</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{currentLogMsg.assistantMsg?.total_tokens ? `${(currentLogMsg.assistantMsg.total_tokens / 1000).toFixed(3)}K tokens` : '0 tokens'}</span>
                              <Check className="w-4 h-4 text-green-500" />
                            </div>
                          </div>
                        ),
                        children: (
                          <div className="space-y-4 pt-2">
                            <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-100/50">
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">OBSERVATION</span>
                                <div className="flex items-center gap-1">
                                  <Button 
                                    type="text" 
                                    size="small" 
                                    icon={<Copy className="w-3.5 h-3.5 text-gray-400" />} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText('""');
                                      message.success('已复制');
                                    }}
                                  />
                                  <Button 
                                    type="text" 
                                    size="small" 
                                    icon={<Maximize2 className="w-3.5 h-3.5 text-gray-400" />} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Optional: Handle expand action
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="p-3 font-mono text-xs text-red-600 whitespace-pre-wrap max-h-[150px] overflow-y-auto custom-scrollbar flex gap-4">
                                <span className="text-blue-500 select-none">1</span>
                                <span>""</span>
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-100/50">
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">FINAL ANSWER</span>
                                <div className="flex items-center gap-1">
                                  <Button 
                                    type="text" 
                                    size="small" 
                                    icon={<Copy className="w-3.5 h-3.5 text-gray-400" />} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(currentLogMsg.assistantMsg?.content || '');
                                      message.success('已复制');
                                    }}
                                  />
                                  <Button 
                                    type="text" 
                                    size="small" 
                                    icon={<Maximize2 className="w-3.5 h-3.5 text-gray-400" />} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Optional: Handle expand action
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="p-3 font-mono text-xs text-red-600 whitespace-pre-wrap max-h-[250px] overflow-y-auto custom-scrollbar flex gap-4">
                                <span className="text-blue-500 select-none">1</span>
                                <span>{JSON.stringify(currentLogMsg.assistantMsg?.content || '')}</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                    ]}
                  />
                </div>
              )
            }
          ]}
        />
      )}
    </Modal>
  );
};

export default LogDetailModal;
