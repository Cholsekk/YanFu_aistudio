import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { message } from 'antd';
// 集成时使用，独立运行时请把下方注释打开并删除 mock
// import { syncWorkflowDraft, fetchWorkflowDraft } from '@/service/workflow';

// 独立运行时暂时使用 Mock，集成时删除这两个 mock 函数并释放上面的 import
const syncWorkflowDraft = async (payload: any) => ({ hash: 'mock-hash-123' });
const fetchWorkflowDraft = async (url: string) => ({ hash: 'mock-hash-123' });

interface DraftPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftData: any;
  appId: string;
}

const DraftPreviewModal: React.FC<DraftPreviewModalProps> = ({ isOpen, onClose, draftData, appId }) => {
  const [draftContent, setDraftContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncHash, setSyncHash] = useState('');

  useEffect(() => {
    if (isOpen && draftData) {
      setDraftContent(JSON.stringify(draftData.graph, null, 2));
    }
  }, [isOpen, draftData]);

  const doSubmit = async (hash: string, parsedDraft: any): Promise<boolean> => {
    const payload = {
      url: `/apps/${appId}/workflows/draft`,
      params: {
        graph: {
          nodes: parsedDraft.nodes,
          edges: parsedDraft.edges,
          viewport: parsedDraft.viewport || { x: 0, y: 0, zoom: 1 },
        },
        features: draftData.features || {
          opening_statement: '',
          suggested_questions: [],
          suggested_questions_after_answer: { enabled: false },
          speech_to_text: { enabled: false },
          text_to_speech: { enabled: false },
          retriever_resource: { enabled: false },
          sensitive_word_avoidance: { enabled: false },
        },
        environment_variables: draftData.environment_variables || [],
        conversation_variables: draftData.conversation_variables || [],
        hash: hash || '',
      },
    };

    const res = await syncWorkflowDraft(payload);
    setSyncHash(res.hash);
    return true;
  };

  const handleSubmit = async () => {
    try {
      const parsedDraft = JSON.parse(draftContent);

      if (!parsedDraft.nodes || !Array.isArray(parsedDraft.nodes)) {
        message.error('工作流数据格式错误：缺少有效的 nodes 字段');
        return;
      }
      if (!parsedDraft.edges || !Array.isArray(parsedDraft.edges)) {
        message.error('工作流数据格式错误：缺少有效的 edges 字段');
        return;
      }

      setIsSubmitting(true);

      try {
        const success = await doSubmit(syncHash, parsedDraft);
        if (success) {
          message.success('工作流已添加到当前应用');
          onClose();
        }
      } catch (e: any) {
        if (e?.code === 'draft_workflow_not_sync' || e?.code === 'draft_workflow_not_exist') {
          message.info('正在获取最新工作流版本...');
          try {
            const draftRes = await fetchWorkflowDraft(`/apps/${appId}/workflows/draft`);
            setSyncHash(draftRes.hash);

            const retrySuccess = await doSubmit(draftRes.hash, parsedDraft);
            if (retrySuccess) {
              message.success('工作流已添加到当前应用');
              onClose();
            }
          } catch (fetchError: any) {
            if (fetchError?.code === 'draft_workflow_not_exist') {
              console.log('Draft not exist, creating new workflow directly');
              const createSuccess = await doSubmit('', parsedDraft);
              if (createSuccess) {
                message.success('工作流已添加到当前应用');
                onClose();
              }
            } else {
              console.error('Retry sync failed:', fetchError);
              message.error(fetchError?.message || '工作流版本冲突，请刷新页面后重试');
            }
          }
        } else {
          throw e;
        }
      }
    } catch (e: any) {
      console.error('Submit draft error:', e);
      if (e.message && e.message.includes('JSON')) {
        message.error('工作流数据格式错误，请输入有效的 JSON');
      } else {
        message.error(e.message || '提交失败，请重试');
      }
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
          <p>请在下方检阅生成的节点边数据。确认无误后，点击"将结果添加到工作流"应用到当前应用。</p>
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
