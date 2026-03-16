'use client'
import React, { useContext, createContext, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Copy, Key, Check, Server, Radio } from 'lucide-react'
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

const I18nContext = createContext({ locale: 'zh-Hans' });

type IDocProps = {
  appDetail: any
}

const ApiDoc = ({ appDetail }: IDocProps) => {
  const { locale } = useContext(I18nContext)
  const [copied, setCopied] = useState(false)
  const isEn = locale === 'en-US';
  const apiUrl = appDetail?.api_base_url || "http://localhost:5005/v1"

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    message.success('已复制');
    setTimeout(() => setCopied(false), 2000);
  };

  const getTemplate = () => {
    let template = '';
    if (appDetail?.mode === 'chat' || appDetail?.mode === 'agent-chat') {
      template = isEn ? TemplateChatEn : TemplateChatZh;
    } else if (appDetail?.mode === 'advanced-chat') {
      template = isEn ? TemplateAdvancedChatEn : TemplateAdvancedChatZh;
    } else if (appDetail?.mode === 'workflow') {
      template = isEn ? TemplateWorkflowEn : TemplateWorkflowZh;
    } else {
      template = isEn ? TemplateEn : TemplateZh;
    }

    return template
      .replace(/{{API_BASE_URL}}/g, apiUrl)
      .replace(/{{API_KEY}}/g, '{API_KEY}');
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-end gap-3">
        <div className="flex items-center bg-zinc-100 rounded-lg px-3 py-1.5 text-sm border border-zinc-200">
          <Server className="w-4 h-4 text-zinc-500 mr-2" />
          <span className="text-zinc-500 mr-2">API 服务器</span>
          <span className="font-mono text-zinc-800 mr-2">{apiUrl}</span>
          <button onClick={() => handleCopy(apiUrl)} className="hover:text-zinc-900">
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-zinc-400" />}
          </button>
        </div>
        <div className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-emerald-100">
          <Radio className="w-4 h-4 mr-2" />
          状态 运行中
        </div>
        <button className="flex items-center gap-2 bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-zinc-800">
          <Key className="w-4 h-4" /> API 密钥
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <article className="prose prose-zinc max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-zinc-600 prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-code:text-zinc-800 prose-code:bg-zinc-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
          <ReactMarkdown>{getTemplate()}</ReactMarkdown>
        </article>
      </div>
    </div>
  )
}

export default ApiDoc
