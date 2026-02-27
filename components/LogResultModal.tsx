import React from 'react';
import { Info } from 'lucide-react';
import Modal from './Modal';

interface LogResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: string | null;
}

const LogResultModal: React.FC<LogResultModalProps> = ({ isOpen, onClose, result }) => {
  let formattedResult = "";
  try {
    if (result) {
      const parsed = JSON.parse(result);
      formattedResult = JSON.stringify(parsed, null, 2);
    }
  } catch (e) {
    formattedResult = result || "";
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="" 
      maxWidth="max-w-2xl"
      footer={
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
        >
          知道了
        </button>
      }
    >
      <div className="flex flex-col gap-4 px-2 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">任务执行结果详情</h3>
        </div>
        <div className="pl-11">
          <pre className="bg-gray-50 p-4 rounded-xl text-sm font-mono text-gray-700 overflow-auto max-h-[400px] custom-scrollbar border border-gray-100">
            {formattedResult}
          </pre>
        </div>
      </div>
    </Modal>
  );
};

export default LogResultModal;
