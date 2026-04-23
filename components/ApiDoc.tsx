'use client'
import React, { useContext, createContext, useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { 
  Copy, 
  Key, 
  Check, 
  Server, 
  Radio, 
  AlertCircle, 
  ArrowLeft,
  ChevronRight,
  List,
  Menu,
  X,
  ExternalLink,
  Code,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { message } from 'antd'
import { motion, AnimatePresence } from 'framer-motion'

const TemplateEn = '/template/template.en.mdx';
const TemplateZh = '/template/template.zh.mdx';
const TemplateAdvancedChatEn = '/template/template_advanced_chat.en.mdx';
const TemplateAdvancedChatZh = '/template/template_advanced_chat.zh.mdx';
const TemplateWorkflowEn = '/template/template_workflow.en.mdx';
const TemplateWorkflowZh = '/template/template_workflow.zh.mdx';
const TemplateChatEn = '/template/template_chat.en.mdx';
const TemplateChatZh = '/template/template_chat.zh.mdx';

const I18nContext = createContext({ locale: 'zh-Hans' });

type IDocProps = {
  appDetail: any
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const ApiDoc = ({ appDetail }: IDocProps) => {
  const { locale } = useContext(I18nContext)
  const [copied, setCopied] = useState(false)
  const [templateContent, setTemplateContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isEn = locale === 'en-US';
  const apiUrl = appDetail?.api_base_url || "http://localhost:5005/v1"

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
      setError(null);

      let templatePath = '';
      if (appDetail?.mode === 'chat' || appDetail?.mode === 'agent-chat') {
        templatePath = isEn ? TemplateChatEn : TemplateChatZh;
      } else if (appDetail?.mode === 'advanced-chat') {
        templatePath = isEn ? TemplateAdvancedChatEn : TemplateAdvancedChatZh;
      } else if (appDetail?.mode === 'workflow') {
        templatePath = isEn ? TemplateWorkflowEn : TemplateWorkflowZh;
      } else {
        templatePath = isEn ? TemplateEn : TemplateZh;
      }

      try {
        const response = await fetch(templatePath);

        if (!response.ok) {
          if (response.status === 404) {
            setError(isEn ? 'API documentation not found. Please check your application settings.' : 'API 文档未找到，请检查应用设置。');
          } else {
            setError(isEn ? `Failed to load documentation (${response.status})` : `加载文档失败 (${response.status})`);
          }
          setLoading(false);
          return;
        }

        const text = await response.text();
        const processedText = text
          .replace(/{{API_BASE_URL}}/g, apiUrl)
          .replace(/{{API_KEY}}/g, '{API_KEY}');
        
        setTemplateContent(processedText);
        
        // Generate ToC
        const headingLines = processedText.split('\n').filter(line => line.startsWith('#'));
        const newToc = headingLines.map(line => {
          const level = line.match(/^#+/)?.[0].length || 0;
          const text = line.replace(/^#+\s*/, '').trim();
          const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
          return { id, text, level };
        }).filter(item => item.level > 1 && item.level < 4);
        setToc(newToc);

      } catch (err) {
        console.error('Failed to fetch template:', err);
        setError(isEn ? 'Failed to load API documentation. Please try again.' : '加载 API 文档失败，请重试。');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [appDetail, isEn, apiUrl]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -70% 0px' }
    );

    const headings = contentRef.current?.querySelectorAll('h2, h3');
    headings?.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [templateContent]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    message.success(isEn ? 'Copied' : '已复制');
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }
  };

  const MarkdownComponents: any = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      return !inline && match ? (
        <div className="relative group my-6">
          <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleCopy(codeString)}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 shadow-sm transition-all"
              title={isEn ? "Copy code" : "复制代码"}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
            <div className="bg-zinc-100 px-4 py-2 border-b border-zinc-200 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{match[1]}</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              </div>
            </div>
            <SyntaxHighlighter
              style={atomDark}
              language={match[1]}
              PreTag="div"
              className="!m-0 !bg-zinc-950 !p-6"
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        </div>
      ) : (
        <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded-md text-[0.9em] font-medium border border-zinc-200" {...props}>
          {children}
        </code>
      );
    },
    h2: ({ children }: any) => {
      const id = String(children).toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
      return <h2 id={id} className="text-2xl font-bold text-zinc-900 mt-12 mb-6 pb-2 border-b border-zinc-200 scroll-mt-24">{children}</h2>;
    },
    h3: ({ children }: any) => {
      const id = String(children).toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
      return <h3 id={id} className="text-xl font-bold text-zinc-900 mt-8 mb-4 scroll-mt-24 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
        {children}
      </h3>;
    },
    table: ({ children }: any) => (
      <div className="my-8 overflow-x-auto rounded-xl border border-zinc-200 shadow-sm">
        <table className="w-full border-collapse bg-white text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-zinc-50 border-b border-zinc-200">{children}</thead>,
    th: ({ children }: any) => <th className="px-6 py-4 text-left font-bold text-zinc-700">{children}</th>,
    td: ({ children }: any) => <td className="px-6 py-4 text-zinc-600 border-b border-zinc-100 last:border-0">{children}</td>,
    tr: ({ children }: any) => <tr className="hover:bg-zinc-50/50 transition-colors">{children}</tr>,
    ul: ({ children }: any) => <ul className="my-6 space-y-3 list-none pl-2">{children}</ul>,
    li: ({ children }: any) => (
      <li className="flex gap-3 text-zinc-600">
        <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
        <span>{children}</span>
      </li>
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6 shadow-sm"></div>
          <p className="text-zinc-500 font-medium tracking-wide">{isEn ? 'Preparing Documentation...' : '正在准备文档...'}</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md w-full bg-white rounded-2xl p-10 shadow-xl border border-zinc-100"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-3">
            {isEn ? 'Something Went Wrong' : '遇到了一些问题'}
          </h2>
          <p className="text-zinc-500 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-800 active:scale-95 transition-all shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            {isEn ? 'Return to Previous Page' : '返回上一页'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 leading-none">Developer API</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Documentation v1.0</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">Endpoint</span>
              <span className="font-mono text-sm text-zinc-600 truncate max-w-[200px]">{apiUrl}</span>
            </div>
            <button 
              onClick={() => handleCopy(apiUrl)}
              className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="h-8 w-px bg-zinc-200" />
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {isEn ? 'SYSTEM LIVE' : '服务运行中'}
            </div>
            <button className="bg-zinc-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2">
              <Key className="w-4 h-4" /> 
              {isEn ? 'API KEYS' : '管理密钥'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className={`fixed lg:sticky top-[73px] left-0 bottom-0 z-30 w-[280px] bg-zinc-50 border-r border-zinc-200 overflow-y-auto lg:block ${isSidebarOpen ? 'block' : 'hidden'}`}
            >
              <div className="p-8">
                <div className="flex items-center gap-2 text-zinc-400 mb-8 px-2">
                  <List className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">{isEn ? 'Contents' : '目录'}</span>
                </div>
                <nav className="space-y-1">
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all group flex items-center gap-2 ${
                        activeId === item.id 
                          ? 'bg-white text-zinc-900 font-bold shadow-sm border border-zinc-200 translate-x-1' 
                          : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                      }`}
                      style={{ paddingLeft: `${(item.level - 1) * 1}rem` }}
                    >
                      <ChevronRight className={`w-3 h-3 transition-transform ${activeId === item.id ? 'text-emerald-500 rotate-90' : 'text-zinc-300 group-hover:text-zinc-400'}`} />
                      <span className="truncate">{item.text}</span>
                    </button>
                  ))}
                </nav>

                <div className="mt-12 p-6 bg-zinc-900 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                  <div className="relative z-10">
                    <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
                    <h4 className="text-white text-sm font-bold mb-1">{isEn ? 'Need help?' : '需要帮助？'}</h4>
                    <p className="text-zinc-400 text-xs leading-relaxed mb-4">{isEn ? 'Contact our technical support for integration assistance.' : '如果您在集成过程中遇到任何问题，请随时联系技术支持。'}</p>
                    <button className="text-xs text-emerald-400 font-bold flex items-center gap-1 hover:gap-2 transition-all">
                      {isEn ? 'Support Center' : '支持中心'} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto px-6 py-12 lg:px-16 lg:py-20" ref={contentRef}>
            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 group hover:border-emerald-100 transition-all">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4 group-hover:bg-emerald-50 transition-colors">
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
                <h5 className="text-sm font-bold text-zinc-900 mb-1">{isEn ? 'Fast Integration' : '极速集成'}</h5>
                <p className="text-xs text-zinc-500">{isEn ? 'Standard RESTful API for any platform.' : '标准 RESTful 接口，支持多种编程语言。'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 group hover:border-blue-100 transition-all">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4 group-hover:bg-blue-50 transition-colors">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                </div>
                <h5 className="text-sm font-bold text-zinc-900 mb-1">{isEn ? 'Secure Auth' : '安全认证'}</h5>
                <p className="text-xs text-zinc-500">{isEn ? 'Enterprise-grade Bearer Token auth.' : '企业级 Bearer Token 认证机制。'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 group hover:border-purple-100 transition-all">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4 group-hover:bg-purple-50 transition-colors">
                  <ExternalLink className="w-5 h-5 text-purple-500" />
                </div>
                <h5 className="text-sm font-bold text-zinc-900 mb-1">{isEn ? 'Rich SDKs' : '丰富 SDK'}</h5>
                <p className="text-xs text-zinc-500">{isEn ? 'Ready-to-use libraries available.' : '提供多语言 SDK，降低开发成本。'}</p>
              </div>
            </div>

            <article className="prose prose-zinc prose-lg max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={MarkdownComponents}
              >
                {templateContent}
              </ReactMarkdown>
            </article>

            {/* Footer */}
            <footer className="mt-32 pt-12 border-t border-zinc-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center">
                    <Code className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-tighter">Developer Hub</span>
                </div>
                <p className="text-zinc-400 text-xs">
                  &copy; {new Date().getFullYear()} {isEn ? 'API Documentation. All rights reserved.' : 'API 文档。保留所有权利。'}
                </p>
                <div className="flex items-center gap-4">
                  <button className="text-xs text-zinc-500 hover:text-zinc-900 font-medium transition-colors">
                    {isEn ? 'Privacy Policy' : '隐私政策'}
                  </button>
                  <button className="text-xs text-zinc-500 hover:text-zinc-900 font-medium transition-colors">
                    {isEn ? 'Terms of Service' : '服务条款'}
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-zinc-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default ApiDoc

