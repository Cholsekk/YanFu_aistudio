import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { message } from 'antd';

interface DraftPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftData: any;
  onSubmit: (draft: any) => Promise<void>;
}

const DraftPreviewModal: React.FC<DraftPreviewModalProps> = ({ isOpen, onClose, draftData, onSubmit }) => {
  const [draftContent, setDraftContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && draftData) {
      setDraftContent(JSON.stringify(draftData.graph, null, 2));
    }
  }, [isOpen, draftData]);

  const handleSubmit = async () => {
    try {
      const parsedDraft = JSON.parse(draftContent);
      setIsSubmitting(true);
      await onSubmit(parsedDraft);
      onClose();
    } catch (e) {
      message.error('工作流数据格式错误，请输入有效的 JSON');
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="工作流生成结果预览 (人工验证)"
      maxWidth="max-w-4xl"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium border border-gray-200">
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 ${
              isSubmitting ? 'bg-primary-400 text-white cursor-not-allowed shadow-none' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200'
            }`}
          >
            {isSubmitting ? '正在添加...' : '将结果添加到工作流'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm border border-amber-100">
          <p className="font-semibold mb-1">AI 已经为您生成了工作流草稿！</p>
          <p>请在下方检阅生成的节点边数据。确认无误后，点击“将结果添加到工作流”应用到当前应用。</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">生成结果 (JSON 格式)</label>
          <textarea
            className="w-full h-96 p-4 rounded-lg border border-gray-200 bg-gray-50 font-mono text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all custom-scrollbar"
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>
    </Modal>
  );
};

export default DraftPreviewModal;
