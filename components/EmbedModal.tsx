import React, { useState } from 'react';
import { Copy, Check, Terminal, Monitor, Code, ExternalLink, Info, X } from 'lucide-react';
import Modal from './Modal';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicUrl: string;
}

const EmbedModal: React.FC<EmbedModalProps> = ({ isOpen, onClose, publicUrl }) => {
  const [embedType, setEmbedType] = useState<'iframe' | 'script'>('iframe');
  const [copied, setCopied] = useState(false);

  const parts = publicUrl.split('/');
  const token = parts[parts.length - 1];
  const baseUrl = parts.slice(0, 3).join('/');

  const iframeCode = `<iframe 
  src="${publicUrl.replace('/chat/', '/chatbot/')}" 
  style="width: 100%; height: 600px; border: none;" 
  frameborder="0" 
  allow="microphone">
</iframe>`;

  const scriptCode = `<script>
  window.yanfuChatbotConfig = {
    token: '${token}',
    baseUrl: '${baseUrl}'
  }
</script>
<script
  src="${baseUrl}/embed.min.js"
  id="${token}"
  defer>
</script>
<style>
  #yanfu-chatbot-bubble-button {
    background-color: #1C64F2 !important;
  }
  #yanfu-chatbot-bubble-window {
    width: 24rem !important;
    height: 40rem !important;
  }
</style>`;

  const codeToCopy = embedType === 'iframe' ? iframeCode : scriptCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="嵌入到网站" maxWidth="max-w-3xl" zIndex="z-[1050]">
      <div className="p-8 space-y-8">
        {/* Header with Icon */}
        <div className="flex items-center gap-4 p-4 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
          <div className="p-2 bg-white rounded-full shadow-sm">
            <Info className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-900">快速嵌入 AI 助手</h3>
            <p className="text-sm text-indigo-700/80">选择一种方式，将聊天应用集成到你的网站中。</p>
          </div>
        </div>

        {/* Selection */}
        <div className="grid grid-cols-2 gap-6">
          <button 
            onClick={() => setEmbedType('iframe')}
            className={`p-6 border-2 rounded-2xl transition-all flex flex-col items-center gap-4 ${embedType === 'iframe' ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
          >
            <Monitor className={`w-10 h-10 ${embedType === 'iframe' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className="font-bold text-gray-900">Iframe 嵌入</span>
          </button>
          <button 
            onClick={() => setEmbedType('script')}
            className={`p-6 border-2 rounded-2xl transition-all flex flex-col items-center gap-4 ${embedType === 'script' ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
          >
            <Terminal className={`w-10 h-10 ${embedType === 'script' ? 'text-purple-600' : 'text-gray-400'}`} />
            <span className="font-bold text-gray-900">Script 嵌入</span>
          </button>
        </div>

        {/* Code Block */}
        <div className="bg-slate-950 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-mono text-slate-300">{embedType === 'iframe' ? 'iframe.html' : 'script.js'}</span>
            </div>
            <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold transition-all">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制' : '复制代码'}
            </button>
          </div>
          <pre className="p-6 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
            <code>{codeToCopy}</code>
          </pre>
        </div>
      </div>
    </Modal>
  );
};

export default EmbedModal;
