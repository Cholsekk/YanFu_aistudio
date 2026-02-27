import React from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from './Modal';

interface LogErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string | null;
}

const LogErrorModal: React.FC<LogErrorModalProps> = ({ isOpen, onClose, error }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="" 
      maxWidth="max-w-2xl"
      footer={
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all shadow-sm"
        >
          知道了
        </button>
      }
    >
      <div className="flex flex-col gap-4 px-2 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">错误详情</h3>
        </div>
        <div className="pl-11">
          <div className="bg-red-50 p-4 rounded-xl text-sm text-red-700 border border-red-100 whitespace-pre-wrap break-all max-h-[400px] overflow-auto custom-scrollbar">
            {error || "无错误信息"}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LogErrorModal;
