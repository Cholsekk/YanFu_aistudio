'use client'
import React, { useContext, createContext, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Copy, Key, Check } from 'lucide-react'
import { message } from 'antd'

// Raw imports
import TemplateEn from './template/template.en.mdx?raw'
import TemplateZh from './template/template.zh.mdx?raw'
import TemplateAdvancedChatEn from './template/template_advanced_chat.en.mdx?raw'
import TemplateAdvancedChatZh from './template/template_advanced_chat.zh.mdx?raw'
import TemplateWorkflowEn from './template/template_workflow.en.mdx?raw'
import TemplateWorkflowZh from './template/template_workflow.zh.mdx?raw'
import TemplateChatEn from './template/template_chat.en.mdx?raw'
import TemplateChatZh from './template/template_chat.zh.mdx?raw'

// Mock context for now
const I18nContext = createContext({ locale: 'zh-Hans' });

type IDocProps = {
  appDetail: any
}

const ApiDoc = ({ appDetail }: IDocProps) => {
  const { locale } = useContext(I18nContext)
  const [copied, setCopied] = useState(false)

  const apiUrl = appDetail?.api_base_url || "http://localhost:5005/v1"
  const isEn = locale === 'en-US';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    message.success('已复制');
    setTimeout(() => setCopied(false), 2000);
  };

  const getTemplate = () => {
    if (appDetail?.mode === 'chat' || appDetail?.mode === 'agent-chat') {
      return isEn ? TemplateChatEn : TemplateChatZh;
    }
    if (appDetail?.mode === 'advanced-chat') {
      return isEn ? TemplateAdvancedChatEn : TemplateAdvancedChatZh;
    }
    if (appDetail?.mode === 'workflow') {
      return isEn ? TemplateWorkflowEn : TemplateWorkflowZh;
    }
    return isEn ? TemplateEn : TemplateZh;
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-end gap-2 mb-8">
        <div className="flex items-center bg-gray-100 rounded-md p-1 text-sm">
          <span className="px-2 text-gray-500">API 服务器</span>
          <span className="px-2 font-mono">{apiUrl}</span>
          <button onClick={() => handleCopy(apiUrl)} className="p-1 hover:bg-gray-200 rounded">
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-md text-sm font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          状态 运行中
        </div>
        <button className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-800">
          <Key className="w-4 h-4" /> API 密钥
        </button>
      </div>

      {/* Main Content */}
      <article className="prose prose-xl max-w-none">
        <h1 className="text-3xl font-bold mb-4">
          {appDetail?.mode === 'workflow' ? '工作流应用' : '对话型应用'} API
        </h1>
        <p className="text-gray-600 mb-8">
          {appDetail?.description || '支持会话持久化，可将之前的聊天记录作为上下文进行回答，可适用于聊天/客服 AI 等。'}
        </p>

        <h2 className="text-xl font-semibold mb-4">基础 URL</h2>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-8">
          {apiUrl}
        </div>

        <h2 className="text-xl font-semibold mb-4">鉴权</h2>
        <p className="text-gray-600 mb-4">
          Service API 使用 <code className="bg-gray-100 px-1 py-0.5 rounded">API-Key</code> 进行鉴权。
          <span className="font-semibold text-gray-900">强烈建议开发者把 API-Key 放在后端存储，而非分享或者放在客户端存储</span>，以免 API-Key 泄露，导致财产损失。
          所有 API 请求都应在 <code className="bg-gray-100 px-1 py-0.5 rounded">Authorization</code> HTTP Header 中包含您的 API-Key，如下所示：
        </p>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-12">
          Authorization: Bearer {'{API_KEY}'}
        </div>

        {/* Dynamic Endpoint Content */}
        <div className="border-t border-gray-200 pt-8">
          <ReactMarkdown>{getTemplate()}</ReactMarkdown>
        </div>
      </article>
    </div>
  )
}

export default ApiDoc
