import React from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskName: string;
  targetStatus: boolean; // true for activating, false for pausing
}

const ConfirmStatusModal: React.FC<ConfirmStatusModalProps> = ({ isOpen, onClose, onConfirm, taskName, targetStatus }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="" 
      maxWidth="max-w-md"
      footer={
        <>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
          >
            取消
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
          >
            确定
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 px-2 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">提示</h3>
        </div>
        <div className="pl-11">
          <p className="text-sm text-gray-600 leading-relaxed">
            已选择 "{taskName}",确定将 {taskName} 设置为{targetStatus ? '激活' : '暂停'}状态
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmStatusModal;
