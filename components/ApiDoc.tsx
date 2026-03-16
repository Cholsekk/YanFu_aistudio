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

const I18nContext = createContext({ locale: 'zh-Hans' });

type IDocProps = {
  appDetail: any
}

const ApiDoc = ({ appDetail }: IDocProps) => {
  const { locale } = useContext(I18nContext)
  const isEn = locale === 'en-US';

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

    // Replace placeholders
    return template
      .replace(/{{API_BASE_URL}}/g, appDetail?.api_base_url || 'http://localhost:5005/v1')
      .replace(/{{API_KEY}}/g, '{API_KEY}');
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <article className="prose prose-xl max-w-none">
        <ReactMarkdown>{getTemplate()}</ReactMarkdown>
      </article>
    </div>
  )
}

export default ApiDoc
