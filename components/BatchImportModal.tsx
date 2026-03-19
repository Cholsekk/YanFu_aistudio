import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import { Upload, FileText, Trash2, Download } from 'lucide-react';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
}

const CSV_TEMPLATE_QA_EN = [
  ['Question', 'Answer'],
  ['Question1', 'Answer1'],
  ['Question2', 'Answer2'],
];

const CSV_TEMPLATE_QA_CN = [
  ['问题', '答案'],
  ['问题1', '答案1'],
  ['问题2', '答案2'],
];

const BatchImportModal: React.FC<BatchImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const downloadTemplate = (template: string[][], filename: string) => {
    const csvContent = template.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        message.error('请上传 CSV 文件');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile);
      onClose();
      setSelectedFile(null);
    }
  };

  return (
    <Modal
      title={<div className="text-xl font-bold text-gray-800">批量导入</div>}
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} className="rounded-lg h-10 px-6">取消</Button>,
        <Button key="import" type="primary" onClick={handleImport} disabled={!selectedFile} className="rounded-lg h-10 px-6 bg-emerald-600 hover:bg-emerald-700">导入</Button>
      ]}
      width={600}
      centered
      className="rounded-2xl overflow-hidden"
    >
      <input type="file" id="batch-import-input" className="hidden" accept=".csv" onChange={handleFileChange} />
      <div className="space-y-6">
        {!selectedFile ? (
          <div className="p-8 border-2 border-dashed border-emerald-200 rounded-2xl bg-emerald-50/50 text-center hover:border-emerald-400 transition-colors">
            <Upload className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-2">将您的 CSV 文件拖放到此处，或</p>
            <Button type="link" onClick={() => document.getElementById('batch-import-input')?.click()} className="text-emerald-600 font-semibold">选择文件</Button>
          </div>
        ) : (
          <div className="p-4 border border-emerald-200 rounded-xl bg-emerald-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-emerald-600" />
              <span className="font-medium text-gray-800">{selectedFile.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="text" onClick={() => document.getElementById('batch-import-input')?.click()} className="text-gray-500 hover:text-emerald-600">更改文件</Button>
              <Button type="text" danger icon={<Trash2 className="w-4 h-4" />} onClick={() => setSelectedFile(null)} />
            </div>
          </div>
        )}

        <div>
          <p className="font-semibold text-gray-800 mb-3">CSV 文件必须符合以下结构：</p>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-3">问题</th>
                  <th className="p-3">回答</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr className="border-b border-gray-100">
                  <td className="p-3 text-gray-600">问题 1</td>
                  <td className="p-3 text-gray-600">回答 1</td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-600">问题 2</td>
                  <td className="p-3 text-gray-600">回答 2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center gap-2 text-emerald-600 cursor-pointer hover:underline" onClick={() => {
          downloadTemplate(CSV_TEMPLATE_QA_CN, 'template-zh-Hans.csv');
          downloadTemplate(CSV_TEMPLATE_QA_EN, 'template-en-US.csv');
        }}>
          <Download className="w-4 h-4" />
          <span className="text-sm">下载模版</span>
        </div>
      </div>
    </Modal>
  );
};

export default BatchImportModal;
