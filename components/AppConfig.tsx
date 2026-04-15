
import React, { useState, useRef, useEffect } from 'react';
import { 
  Wand2, 
  Plus, 
  Settings2, 
  Settings,
  MessageSquare, 
  Send, 
  Square,
  Copy,
  RotateCcw, 
  Mic,
  Type,
  Quote, 
  ChevronDown,
  Info,
  ShieldCheck,
  AlignLeft,
  List,
  Hash,
  CheckSquare,
  Database,
  Search,
  Sparkles,
  Cpu,
  Sliders,
  PlayCircle,
  Store,
  Code,
  FileText,
  ArrowUpRight,
  Paperclip,
  Trash2,
  Edit2,
  HelpCircle,
  Check,
  BookOpen,
  Sun,
  LayoutGrid,
  Layers,
  SlidersHorizontal,
  ExternalLink,
  Filter,
  ListFilter,
  X,
  Maximize2
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { 
  Input, 
  Button, 
  Slider, 
  Select, 
  Switch, 
  Tooltip, 
  Divider, 
  Empty,
  Badge,
  Space,
  Dropdown,
  MenuProps,
  message,
  Popover,
  Modal,
  Checkbox,
  Drawer,
  InputNumber,
  Tabs,
  Collapse,
  Image
} from 'antd';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PromptGeneratorModal from './PromptGeneratorModal';
import KnowledgeBaseModal from './KnowledgeBaseModal';
import ModelSelect from './ModelSelect';
import VariableEditModal, { Variable } from './VariableEditModal';
import { ModelTypeEnum, ModelParameterRule, ModelModeType, DataSet, MetadataFilteringModeEnum, Member, Role, ModelConfig, PromptMode, RETRIEVE_TYPE, RerankingModeEnum, WeightedScoreEnum, LogicalOperator, ComparisonOperator, IOnDataMoreInfo } from '../types';
import { apiService } from '../services/apiService';
import { useAppDevHub } from '../context/AppContext';

import { PartialTeamMembersSelector } from './PartialTeamMembersSelector';
import EmbedModal from './EmbedModal';
import { ToolSelectorPopover } from './ToolSelectorPopover';
import ToolAuthDrawer from './ToolAuthDrawer';
import LogDetailModal from './LogDetailModal';
import { monitoringService } from '../services/monitoringService';

const { TextArea } = Input;

interface LocalModelConfig {
  id: string;
  name: string;
  provider: string;
  type?: string;
  icon?: any;
  temperature: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  maxTokens: number;
  responseFormat: string;
  samplingStrategy?: boolean;
  googleSearch?: boolean;
  reasoningMode?: boolean;
  requiredParams?: Record<string, boolean>;
  rules?: ModelParameterRule[];
}

const DEFAULT_MODEL: LocalModelConfig = {
  id: 'gpt-3.5-turbo-0125',
  name: 'gpt-3.5-turbo-0125',
  provider: 'OpenAI',
  type: 'GPT-3.5',
  icon: <Cpu className="w-4 h-4" />,
  temperature: 0.7,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
  maxTokens: 512,
  responseFormat: 'text',
  samplingStrategy: true,
  googleSearch: false,
  reasoningMode: false,
  requiredParams: {
    temperature: true,
    topP: false,
    presencePenalty: false,
    frequencyPenalty: false,
    maxTokens: false,
    responseFormat: false,
    samplingStrategy: false,
    googleSearch: false,
    reasoningMode: false
  }
};

interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  count: number;
  permission?: string;
  partial_team_data?: {
    roles: string[];
    departments: string[];
    members: string[];
  };
  indexing_technique?: string;
  embedding_model?: string;
  embedding_model_provider?: string;
  retrieval_config?: {
    search_method: string;
    reranking_model?: {
      reranking_provider_name: string;
      reranking_model_name: string;
    };
    top_k: number;
    score_threshold: number;
    score_threshold_enabled?: boolean;
    reranking_enable: boolean;
    weights?: {
      vector_setting: {
        vector_weight: number;
        embedding_provider_name: string;
        embedding_model_name: string;
      };
      keyword_setting: {
        keyword_weight: number;
      };
    };
    reranking_mode?: string;
  };
}

const features = [
  { id: 'opening', name: '对话开场白', desc: '在对话型应用中，让 AI 主动说第一段话可以拉近与用户间的距离。', icon: MessageSquare, color: 'bg-blue-500' },
  { id: 'suggestion', name: '下一步问题建议', desc: '设置下一步问题建议可以让用户更好的对话。', icon: MessageSquare, color: 'bg-sky-500' },
  { id: 'tts', name: '文字转语音', desc: '文本可以转换成语音。', icon: Type, color: 'bg-indigo-500' },
  { id: 'stt', name: '语音转文字', desc: '您可以使用语音输入。', icon: Mic, color: 'bg-purple-500' },
  { id: 'citation', name: '引用和归属', desc: '显示源文档和生成内容的归属部分。', icon: Quote, color: 'bg-orange-500' },
  { id: 'content_check', name: '内容审查', desc: '您可以调用审查 API 或者维护敏感词库来使模型更安全地输出。', icon: ShieldCheck, color: 'bg-emerald-500' },
  { id: 'annotation', name: '标注回复', desc: '启用后，将标注用户的回复，以便在用户重复提问时快速响应。', icon: MessageSquare, color: 'bg-blue-500' },
  { id: 'attachment', name: '上传附件', desc: '支持上传图片、文档等附件。', icon: Plus, color: 'bg-amber-500' },
];

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['doc', 'docx'].includes(ext || '')) return <LucideIcons.FileText className="w-6 h-6 text-blue-500" />;
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <LucideIcons.FileSpreadsheet className="w-6 h-6 text-green-500" />;
  if (['ppt', 'pptx'].includes(ext || '')) return <LucideIcons.File className="w-6 h-6 text-orange-500" />;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return <LucideIcons.FileArchive className="w-6 h-6 text-red-500" />;
  if (['pdf'].includes(ext || '')) return <LucideIcons.FileText className="w-6 h-6 text-red-500" />;
  if (['mp3', 'wav', 'ogg'].includes(ext || '')) return <LucideIcons.FileAudio className="w-6 h-6 text-purple-500" />;
  if (['mp4', 'avi', 'mov', 'mkv'].includes(ext || '')) return <LucideIcons.FileVideo className="w-6 h-6 text-pink-500" />;
  if (['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'py', 'java', 'c', 'cpp'].includes(ext || '')) return <LucideIcons.FileCode className="w-6 h-6 text-gray-500" />;
  return <LucideIcons.File className="w-6 h-6 text-gray-400" />;
};

const formatFileSize = (bytes?: number) => {
  if (bytes === undefined) return '未知大小';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const renderMarkdown = (content: string) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ node, inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
          <SyntaxHighlighter
            {...props}
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <code {...props} className={className}>
            {children}
          </code>
        );
      }
    }}
  >
    {content}
  </ReactMarkdown>
);

const AppConfig: React.FC = () => {
  const app = useAppDevHub();
  const appId = app?.id;
  const [prompt, setPrompt] = useState('');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isKBModalOpen, setIsKBModalOpen] = useState(false);
  const [isKBSettingsOpen, setIsKBSettingsOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [editingKB, setEditingKB] = useState<KnowledgeBase | null>(null);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [isSavingKB, setIsSavingKB] = useState(false);

  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isPublishingToMarket, setIsPublishingToMarket] = useState(false);
  const [draftUpdatedAt, setDraftUpdatedAt] = useState<number | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [appDetail, setAppDetail] = useState<any>(null);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [isPublishPopoverOpen, setIsPublishPopoverOpen] = useState(false);
  const lastSavedConfigRef = useRef<string>('');

  const appMode = appDetail ? ((appDetail.mode !== 'completion' && appDetail.mode !== 'workflow') ? 'chat' : appDetail.mode) : 'chat';
  const publicUrl = appDetail?.site?.app_base_url ? `${appDetail.site.app_base_url}/${appMode}/${appDetail.site.access_token}` : "";

  const [relativeTimeString, setRelativeTimeString] = useState<string>('');
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [selectedToolForAuth, setSelectedToolForAuth] = useState<any>(null);
  const [toolDetailForAuth, setToolDetailForAuth] = useState<any>(null);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await apiService.getAppCategories();
      if (res && Array.isArray(res)) {
        setCategories(res);
      } else if (res && res.data && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      message.error('获取分类失败');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAuthorize = () => {
    if (!selectedToolForAuth) return;
    // Implement authorize logic, maybe reuse ToolExtensions logic
    console.log('Authorize tool:', selectedToolForAuth);
  };

  const handleEditTool = () => {
    if (!selectedToolForAuth) return;
    // Implement edit logic
    console.log('Edit tool:', selectedToolForAuth);
  };

  const handleOpenMarketModal = () => {
    setIsMarketModalOpen(true);
    fetchCategories();
  };

  const getCurrentConfig = () => {
    return {
      prompt,
      variables,
      knowledgeBases,
      models,
      enabledFeatures,
      variableValues,
      metadataFilter,
      metadataModelConfig,
      manualFilters,
      dataset_configs: {
        retrieval_model: RETRIEVE_TYPE.multiWay,
        top_k: 4,
        reranking_mode: RerankingModeEnum.RerankingModel,
        reranking_model: {
          reranking_provider_name: 'tongyi',
          reranking_model_name: 'gte-rerank'
        },
        reranking_enable: false,
        datasets: {
          datasets: knowledgeBases.map(kb => ({
            enabled: true,
            id: kb.id
          }))
        },
        metadata_filtering_mode: metadataFilter,
        ...(metadataFilter === MetadataFilteringModeEnum.automatic && metadataModelConfig ? {
          metadata_model_config: {
            provider: metadataModelConfig.provider,
            name: metadataModelConfig.name,
            mode: ModelModeType.chat,
            completion_params: {
              temperature: metadataModelConfig.temperature,
              top_p: metadataModelConfig.topP,
              presence_penalty: metadataModelConfig.presencePenalty,
              frequency_penalty: metadataModelConfig.frequencyPenalty,
              max_tokens: metadataModelConfig.maxTokens,
            }
          }
        } : {}),
        ...(metadataFilter === MetadataFilteringModeEnum.manual ? {
          metadata_filtering_conditions: {
            logical_operator: LogicalOperator.and,
            conditions: manualFilters.map(f => ({
              id: f.key,
              name: f.key,
              comparison_operator: f.operator,
              value: f.value
            }))
          }
        } : {}),
        score_threshold_enabled: false,
        score_threshold: null
      }
    };
  };

  const getCurrentModelConfig = (): ModelConfig => {
    const model = models[0] || DEFAULT_MODEL;
    return {
      opening_statement: openingStatement,
      suggested_questions: suggestedQuestions,
      pre_prompt: prompt,
      prompt_type: PromptMode.simple,
      chat_prompt_config: {},
      completion_prompt_config: {},
      user_input_form: variables as any,
      dataset_query_variable: '',
      more_like_this: {
        enabled: false
      },
      suggested_questions_after_answer: {
        enabled: !!enabledFeatures.suggestion
      },
      speech_to_text: {
        enabled: !!enabledFeatures.stt
      },
      text_to_speech: {
        enabled: !!enabledFeatures.tts,
        voice: '',
        language: ''
      },
      retriever_resource: {
        enabled: !!enabledFeatures.citation
      },
      sensitive_word_avoidance: {
        enabled: !!enabledFeatures.content_check
      },
      agent_mode: {
        enabled: tools.length > 0,
        tools: tools.map(t => {
          const { raw_tool, raw_provider, ...rest } = t;
          return rest;
        })
      },
      model: {
        provider: model.provider,
        name: model.name,
        mode: ModelModeType.chat,
        completion_params: {
          temperature: model.temperature,
          top_p: model.topP,
          presence_penalty: model.presencePenalty,
          frequency_penalty: model.frequencyPenalty,
          max_tokens: model.maxTokens,
        }
      },
      dataset_configs: {
        retrieval_model: RETRIEVE_TYPE.multiWay,
        top_k: 4,
        reranking_mode: RerankingModeEnum.RerankingModel,
        reranking_model: {
          reranking_provider_name: 'tongyi',
          reranking_model_name: 'gte-rerank'
        },
        reranking_enable: false,
        datasets: {
          datasets: knowledgeBases.map(kb => ({
            enabled: true,
            id: kb.id
          }))
        },
        metadata_filtering_mode: metadataFilter,
        ...(metadataFilter === MetadataFilteringModeEnum.automatic && metadataModelConfig ? {
          metadata_model_config: {
            provider: metadataModelConfig.provider,
            name: metadataModelConfig.name,
            mode: ModelModeType.chat,
            completion_params: {
              temperature: metadataModelConfig.temperature,
              top_p: metadataModelConfig.topP,
              presence_penalty: metadataModelConfig.presencePenalty,
              frequency_penalty: metadataModelConfig.frequencyPenalty,
              max_tokens: metadataModelConfig.maxTokens,
            }
          }
        } : {}),
        ...(metadataFilter === MetadataFilteringModeEnum.manual ? {
          metadata_filtering_conditions: {
            logical_operator: LogicalOperator.and,
            conditions: manualFilters.map(f => ({
              id: f.key,
              name: f.key,
              comparison_operator: f.operator,
              value: f.value
            }))
          }
        } : {}),
        score_threshold_enabled: false,
        score_threshold: null
      }
    };
  };

  const handlePublishToMarket = async () => {
    if (!selectedCategory || !appId || !appDetail) {
      message.warning('请选择发布分类');
      return;
    }
    setIsPublishingToMarket(true);
    const hide = message.loading('正在发布到应用市场...', 0);
    try {
      // 1. 获取市场应用列表
      const marketApps = await apiService.getApps({ is_custom_app_list: true, limit: 100 });
      const existingApp = marketApps.data.find((item: any) => item.app_id === appId);

      // 2. 构建 URL
      const site = appDetail.site;
      let url = '';
      if (['advanced-chat', 'agent-chat', 'chat'].includes(appDetail.mode)) {
        url = `${site.app_base_url}/chat/${site.access_token}`;
      } else if (appDetail.mode === 'workflow') {
        url = `${site.app_base_url}/workflow/${site.access_token}`;
      } else if (appDetail.mode === 'completion') {
        url = `${site.app_base_url}/completion/${site.access_token}`;
      }

      // 3. 构建发布数据
      const publishData = {
        app: {
          id: appDetail.id,
          name: appDetail.name,
          mode: appDetail.mode,
          icon: appDetail.icon,
          icon_url: null,
          icon_type: appDetail.icon_type,
          icon_background: appDetail.icon_background,
          url: url
        },
        app_id: appId,
        description: appDetail.description || '',
        copyright: appDetail.site?.copyright || 'Yanfu.AI',
        privacy_policy: appDetail.site?.privacy_policy,
        custom_disclaimer: appDetail.site?.custom_disclaimer,
        category: selectedCategory,
        position: null,
        is_listed: true,
        tenant_id: appDetail.tenant_id || localStorage.getItem('console_tenant_id') || '6cd1c55c-441a-4b28-8da5-071c896ab5d2' // 优先使用 appDetail.tenant_id，其次从 localStorage 获取，最后使用固定值
      };

      if (existingApp) {
        // 4. 更新逻辑
        await apiService.putApp({
          ...publishData,
          id: existingApp.id
        });
        message.success('已更新到应用市场');
      } else {
        // 5. 创建逻辑
        await apiService.post('/explore/apps', publishData);
        // 自动开启公开访问
        try {
          await monitoringService.updateAppSiteStatus(appId, true);
        } catch (e) {
          console.error('Failed to enable app site automatically:', e);
        }
        message.success('已成功发布到应用市场');
      }

      setDraftUpdatedAt(Date.now());
      setIsMarketModalOpen(false);
    } catch (error) {
      console.error('Failed to publish to market:', error);
      message.error('发布到应用市场失败');
    } finally {
      setIsPublishingToMarket(false);
      hide();
    }
  };

  const handleSaveKBSettings = async () => {
    if (!editingKB) return;
    setIsSavingKB(true);
    try {
      const body: any = {
        name: editingKB.name,
        description: editingKB.description,
        permission: editingKB.permission,
        indexing_technique: editingKB.indexing_technique,
        embedding_model: editingKB.embedding_model,
        embedding_model_provider: editingKB.embedding_model_provider,
        retrieval_model: editingKB.retrieval_config,
      };

      if (editingKB.permission === 'partial_members') {
        const partialData = editingKB.partial_team_data || { roles: [], departments: [], members: [] };
        
        // Get all member IDs including those auto-selected by roles
        const selectedRoleNames = roleList
          .filter(r => partialData.roles?.includes(r.role_id))
          .map(r => r.role_name);
        
        const autoSelectedMemberIDs = memberList
          .filter(m => selectedRoleNames.includes(m.role))
          .map(m => m.id);
        
        const allSelectedMemberIDs = Array.from(new Set([
          ...(partialData.members || []),
          ...autoSelectedMemberIDs
        ]));

        body.partial_member_list = allSelectedMemberIDs.map(id => {
          const member = memberList.find(m => m.id === id);
          return {
            user_id: id,
            role: member?.role
          };
        });
      }

      await apiService.updateDatasetSetting(editingKB.id, body);
      message.success('知识库设置已更新');
      setIsKBSettingsOpen(false);
      // Update local knowledge bases list
      setKnowledgeBases(prev => prev.map(kb => kb.id === editingKB.id ? editingKB : kb));
    } catch (error) {
      console.error('Failed to update knowledge base settings:', error);
      message.error('更新知识库设置失败');
    } finally {
      setIsSavingKB(false);
    }
  };

  const [citationPreview, setCitationPreview] = useState<any | null>(null);
  const [isMultiModel, setIsMultiModel] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});

  const handleVariableChange = (id: string, value: any) => {
    setVariableValues(prev => ({ ...prev, [id]: value }));
  };
  const [models, setModels] = useState<LocalModelConfig[]>([]);
  const [messages, setMessages] = useState<Record<string, { role: 'user' | 'assistant'; content: string; citations?: any[]; time_taken?: number; total_tokens?: number; agent_thoughts?: any[]; attachments?: any[] }[]>>({});
  const [isStreaming, setIsStreaming] = useState<Record<string, boolean>>({});
  const [taskIds, setTaskIds] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [currentLogMsg, setCurrentLogMsg] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [showParams, setShowParams] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await apiService.uploadFile(file);
      const isImage = file.type.startsWith('image/');
      const url = isImage ? URL.createObjectURL(file) : undefined;
      setAttachments([{ id: res.id, name: file.name, type: file.type, url, size: file.size }]);
    } catch (e) {
      console.error(e);
      message.error('上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSpeechToText = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        setUploading(true);
        try {
          const res = await apiService.uploadFile(file);
          // Assuming there's an STT endpoint
          const sttRes = await (apiService as any).request('/speech-to-text', {
            method: 'POST',
            body: JSON.stringify({ file_id: res.id })
          });
          setInputValue(prev => prev + (sttRes.text || ''));
        } catch (e) {
          console.error(e);
          message.error('语音转文字失败');
        } finally {
          setUploading(false);
        }
      };
      
      mediaRecorder.start();
      setRecording(true);
    } catch (e) {
      console.error(e);
      message.error('无法访问麦克风');
    }
  };
  const [showFeaturesDrawer, setShowFeaturesDrawer] = useState(false);
  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>({
    opening: false,
    suggestion: false,
    tts: false,
    stt: false,
    citation: false,
    content_check: false,
    annotation: false,
    attachment: false,
  });
  const [openingStatement, setOpeningStatement] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [metadataFilter, setMetadataFilter] = useState<MetadataFilteringModeEnum>(MetadataFilteringModeEnum.disabled);
  const [metadataModelConfig, setMetadataModelConfig] = useState<any>(null);
  const [manualFilters, setManualFilters] = useState<{ key: string; operator: ComparisonOperator; value: string }[]>([]);
  const [metadataOptions, setMetadataOptions] = useState<any[]>([]);
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    const fetchMetadata = async () => {
      if (knowledgeBases.length > 0) {
        try {
          const allMetadata: any[] = [];
          for (const kb of knowledgeBases) {
            const res = await apiService.getDatasetMetadata(kb.id);
            if (res && res.doc_metadata) {
              allMetadata.push(...res.doc_metadata);
            }
          }
          // Unique by name
          const uniqueMetadata = Array.from(new Map(allMetadata.map(item => [item.name, item])).values());
          setMetadataOptions(uniqueMetadata);
        } catch (error) {
          console.error('Failed to fetch metadata:', error);
        }
      } else {
        setMetadataOptions([]);
      }
    };
    fetchMetadata();
  }, [knowledgeBases]);

  // Recall Settings State
  const [rerankingMode, setRerankingMode] = useState<RerankingModeEnum>(RerankingModeEnum.RerankingModel);
  const [rerankingModel, setRerankingModel] = useState<{provider: string, model: string}>({provider: 'tongyi', model: 'gte-rerank'});
  const [vectorWeight, setVectorWeight] = useState<number>(0.7);
  const [topK, setTopK] = useState<number>(4);
  const [scoreThresholdEnabled, setScoreThresholdEnabled] = useState<boolean>(false);
  const [scoreThreshold, setScoreThreshold] = useState<number>(0.5);
  const [isRecallSettingsModalOpen, setIsRecallSettingsModalOpen] = useState(false);

  const getConfigString = () => {
    return JSON.stringify({
      prompt,
      variables,
      knowledgeBases,
      models,
      enabledFeatures,
      variableValues,
      metadataFilter,
      metadataModelConfig,
      manualFilters,
      openingStatement,
      suggestedQuestions,
      rerankingMode,
      rerankingModel,
      vectorWeight,
      topK,
      scoreThresholdEnabled,
      scoreThreshold
    });
  };

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return `${Math.floor(diff / 86400)}天前`;
  };

  useEffect(() => {
    if (!draftUpdatedAt) return;
    const updateRelativeTime = () => {
      setRelativeTimeString(getRelativeTime(draftUpdatedAt));
    };
    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 60000);
    return () => clearInterval(interval);
  }, [draftUpdatedAt]);

  /*
  const handleAutoSave = async (configStr: string) => {
    if (!appId) return;
    setIsAutoSaving(true);
    try {
      const modelConfig = getCurrentModelConfig();
      await apiService.updateAppModelConfig(appId, modelConfig);
      await apiService.updateApp(appId, {
        name: app.name,
        icon_type: app.iconType as any,
        icon: app.icon,
        icon_background: app.iconBgColor,
        description: app.description,
        config: getCurrentConfig()
      } as any);
      setDraftUpdatedAt(Date.now());
      lastSavedConfigRef.current = configStr;
    } catch (error) {
      console.error('Auto-save failed:', error);
      message.error('自动保存失败，请检查网络');
    } finally {
      setIsAutoSaving(false);
    }
  };
  */

  /*
  useEffect(() => {
    if (!isLoaded) return;
    const currentConfig = getConfigString();

    if (!lastSavedConfigRef.current) {
      lastSavedConfigRef.current = currentConfig;
      return;
    }

    if (currentConfig === lastSavedConfigRef.current) return;

    const timer = setTimeout(() => {
      handleAutoSave(currentConfig);
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    prompt,
    variables,
    knowledgeBases,
    models,
    enabledFeatures,
    variableValues,
    metadataFilter,
    metadataModelConfig,
    manualFilters,
    openingStatement,
    suggestedQuestions
  ]);
  */

  useEffect(() => {
    if (!appId) return;
    const fetchAppDetail = async () => {
      try {
        const detail = await apiService.fetchAppDetail(appId);
        setAppDetail(detail);
        if (detail && detail.model_config) {
          const config = detail.model_config;
          if (config.pre_prompt) setPrompt(config.pre_prompt);
          if (config.user_input_form) setVariables(config.user_input_form);
          
          if (config.dataset_configs && config.dataset_configs.datasets && config.dataset_configs.datasets.datasets) {
            const kbIds = config.dataset_configs.datasets.datasets.map((d: any) => d.dataset ? d.dataset.id : d.id);
            if (kbIds.length > 0) {
              try {
                // Construct params with multiple 'ids' fields
                const queryParams = new URLSearchParams();
                queryParams.append('page', '1');
                queryParams.append('limit', kbIds.length.toString());
                kbIds.forEach(id => queryParams.append('ids', id));
                
                // Call the API directly using the constructed query string to ensure multiple 'ids' are passed
                const kbListResponse = await (apiService as any).get('/datasets', queryParams);
                if (kbListResponse && kbListResponse.data) {
                  const kbList = kbListResponse.data.map((d: any) => ({
                    id: d.id,
                    name: d.name || 'Knowledge Base',
                    description: d.description,
                    count: d.document_count || 0,
                    permission: d.permission,
                    indexing_technique: d.indexing_technique,
                    embedding_model: d.embedding_model,
                    partial_team_data: {
                      roles: [],
                      departments: [],
                      members: d.partial_member_list?.map((m: any) => m.user_id) || []
                    },
                    retrieval_config: {
                      ...d.retrieval_model_dict,
                      ...(config.dataset_configs.datasets.datasets.find((ds: any) => (ds.dataset ? ds.dataset.id : ds.id) === d.id)?.dataset?.retrieval_model || {})
                    }
                  }));
                  setKnowledgeBases(kbList);
                }
              } catch (e) {
                console.error('Failed to fetch dataset details:', e);
              }
            }
          }
          if (config.dataset_configs?.metadata_filtering_mode) {
            setMetadataFilter(config.dataset_configs.metadata_filtering_mode);
            if (config.dataset_configs.metadata_filtering_mode === MetadataFilteringModeEnum.manual && config.dataset_configs.metadata_filtering_conditions?.conditions) {
              setManualFilters(config.dataset_configs.metadata_filtering_conditions.conditions.map((c: any) => ({
                key: c.name,
                operator: c.comparison_operator || ComparisonOperator.is,
                value: c.value
              })));
            }
          }
          if (config.dataset_configs?.metadata_model_config) {
            setMetadataModelConfig(config.dataset_configs.metadata_model_config);
          }
          if (config.model) {
            const model = {
              id: config.model.name,
              name: config.model.name,
              provider: config.model.provider,
              temperature: config.model.completion_params?.temperature || 0.7,
              topP: config.model.completion_params?.top_p || 1,
              presencePenalty: config.model.completion_params?.presence_penalty || 0,
              frequencyPenalty: config.model.completion_params?.frequency_penalty || 0,
              maxTokens: config.model.completion_params?.max_tokens || 512,
              responseFormat: 'text',
            };
            setModels([model]);
            setMessages({ [model.id]: [] });
            setIsMultiModel(false);
          } else {
            setModels([DEFAULT_MODEL]);
            setMessages({ [DEFAULT_MODEL.id]: [] });
            setIsMultiModel(false);
          }
          if (config.opening_statement) setOpeningStatement(config.opening_statement);
          if (config.suggested_questions) setSuggestedQuestions(config.suggested_questions);
          if (config.agent_mode?.tools) {
            // Fetch all providers to backfill icons if missing
            let allProviders: any[] = [];
            try {
              const providersRes = await apiService.fetchCollectionList();
              allProviders = Array.isArray(providersRes) ? providersRes : (providersRes as any).data || [];
            } catch (e) {
              console.error('Failed to fetch providers for icon backfill:', e);
            }

            const loadedTools = config.agent_mode.tools.map((t: any) => {
              let providerIcon = t.provider_icon || t.icon;
              
              // If icon is still missing, try to find it in allProviders
              if (!providerIcon && allProviders.length > 0) {
                const provider = allProviders.find(p => 
                  p.id === t.provider_id || 
                  p.name === t.provider_name || 
                  p.provider === t.provider_name
                );
                if (provider) {
                  providerIcon = provider.icon;
                }
              }

              return {
                ...t,
                provider_icon: providerIcon,
                tool_name: t.tool_name || t.name,
                tool_label: t.tool_label || (typeof t.label === 'string' ? t.label : (t.label?.zh_Hans || t.name)),
                tool_description: t.tool_description || (typeof t.description === 'string' ? t.description : (t.description?.zh_Hans || t.description?.en_US || '')),
                enabled: t.enabled !== false
              };
            });
            setTools(loadedTools);
          }

          // Map features from model_config to enabledFeatures state
          setEnabledFeatures({
            opening: !!config.opening_statement,
            suggestion: !!config.suggested_questions_after_answer?.enabled,
            tts: !!config.text_to_speech?.enabled,
            stt: !!config.speech_to_text?.enabled,
            citation: !!config.retriever_resource?.enabled,
            content_check: !!config.sensitive_word_avoidance?.enabled,
            annotation: !!config.annotation_reply?.enabled,
            attachment: !!config.file_upload?.enabled || !!config.file_upload?.image?.enabled,
          });
          setIsLoaded(true);
        }
      } catch (e) {
        console.error('Failed to fetch app detail:', e);
      }
    };
    fetchAppDetail();
  }, [appId]);

  useEffect(() => {
    if (app?.config) {
      const config = app.config;
      if (config.prompt) setPrompt(config.prompt);
      if (config.variables) setVariables(config.variables);
      if (config.knowledgeBases) setKnowledgeBases(config.knowledgeBases);
      if (config.models && Array.isArray(config.models)) {
        const validModels = config.models.filter((m: any) => m && m.id);
        setModels(validModels);
        const initialMessages: Record<string, any> = {};
        validModels.forEach((m: any) => {
          initialMessages[m.id] = [];
        });
        setMessages(initialMessages);
      }
      if (config.enabledFeatures) {
        if (Array.isArray(config.enabledFeatures)) {
          const enabledFeaturesMap: Record<string, boolean> = {};
          config.enabledFeatures.forEach((f: string) => {
            enabledFeaturesMap[f] = true;
          });
          setEnabledFeatures(enabledFeaturesMap);
        } else {
          setEnabledFeatures(config.enabledFeatures);
        }
      }
      if (config.metadataFilter) setMetadataFilter(config.metadataFilter);
      if (config.metadataModelConfig) setMetadataModelConfig(config.metadataModelConfig);
      if (config.manualFilters) {
        setManualFilters(config.manualFilters.map((f: any) => ({
          ...f,
          operator: f.operator || ComparisonOperator.is
        })));
      }
      setIsLoaded(true);
      return;
    }

    const fetchDefaultModel = async () => {
      try {
        const res = await apiService.fetchDefaultModal(ModelTypeEnum.textGeneration);
        if (res && res.model && res.provider) {
          let rules: ModelParameterRule[] = [];
          try {
            const rulesRes = await apiService.fetchModelParameterRules(res.provider.provider, res.model);
            rules = rulesRes.data || [];
          } catch (e) {
            console.error('Failed to fetch model parameter rules:', e);
          }
          
          const newModel: LocalModelConfig = {
            ...DEFAULT_MODEL,
            id: res.model,
            name: res.model,
            provider: res.provider.provider,
            rules,
            ...(rules ? (rules as any[]).reduce((acc: any, rule: any) => {
              if (rule.default !== undefined) {
                const keyMap: Record<string, keyof LocalModelConfig> = {
                  'temperature': 'temperature',
                  'top_p': 'topP',
                  'presence_penalty': 'presencePenalty',
                  'frequency_penalty': 'frequencyPenalty',
                  'max_tokens': 'maxTokens'
                };
                const configKey = keyMap[rule.name];
                if (configKey) {
                  acc[configKey] = rule.default as any;
                }
              }
              return acc;
            }, {} as any) : {})
          };
          
          setModels([newModel]);
          setMessages({ [newModel.id]: [] });
          setIsLoaded(true);
        }
      } catch (e) {
        console.error('Failed to fetch default model:', e);
      }
    };
    fetchDefaultModel();
  }, [app]);

  const updateMetadataModelParam = (param: keyof LocalModelConfig | 'model_info', value: any, extra?: { provider?: string; rules?: ModelParameterRule[] }) => {
    setMetadataModelConfig((prev: any) => {
      const m = prev || { ...DEFAULT_MODEL, id: 'metadata-model', name: '', provider: '' };
      if (param === 'model_info') {
        const { provider, rules } = extra || { provider: '' };
        return { 
          ...m, 
          name: value, 
          provider: provider || m.provider,
          rules: rules || m.rules,
          // Reset params to defaults if rules are provided
          ...(rules ? rules.reduce((acc: any, rule: any) => {
            if (rule.default !== undefined) {
              const keyMap: Record<string, keyof LocalModelConfig> = {
                'temperature': 'temperature',
                'top_p': 'topP',
                'presence_penalty': 'presencePenalty',
                'frequency_penalty': 'frequencyPenalty',
                'max_tokens': 'maxTokens'
              };
              const configKey = keyMap[rule.name];
              if (configKey) {
                acc[configKey] = rule.default as any;
              }
            }
            return acc;
          }, {} as any) : {})
        };
      }
      return { ...m, [param]: value };
    });
  };

  const onPublish = async () => {
    if (!appId) return;
    const hide = message.loading('正在发布配置...', 0);
    try {
      const modelConfig = getCurrentModelConfig();
      await apiService.updateAppModelConfig(appId, modelConfig);
      
      // Also update app basic info if needed
      // await apiService.updateApp(appId, {
      //   name: app.name,
      //   icon_type: app.iconType as any,
      //   icon: app.icon,
      //   icon_background: app.iconBgColor,
      //   description: app.description,
      //   config: getCurrentConfig()
      // } as any);
      
      message.success('配置发布成功！');
      setDraftUpdatedAt(Date.now());
      lastSavedConfigRef.current = getConfigString();
    } catch (error) {
      console.error('Failed to publish:', error);
      message.error('发布失败');
    } finally {
      hide();
    }
  };

  const addKnowledgeBase = () => {
    setIsKBModalOpen(true);
  };

  const handleKBAdd = (selected: DataSet[]) => {
    const newKBs = selected.map(kb => ({
      id: kb.id,
      name: kb.name,
      description: kb.description,
      count: kb.document_count || 0,
      permission: kb.permission,
      indexing_technique: kb.indexing_technique,
      embedding_model: kb.embedding_model,
      retrieval_config: {
        search_method: kb.retrieval_model_dict?.search_method || 'hybrid',
        top_k: kb.retrieval_model_dict?.top_k || 3,
        score_threshold: kb.retrieval_model_dict?.score_threshold || 0.5,
        score_threshold_enabled: kb.retrieval_model_dict?.score_threshold_enabled || false,
        reranking_enable: kb.retrieval_model_dict?.reranking_enable || false,
        reranking_model: kb.retrieval_model_dict?.reranking_model,
        weights: kb.retrieval_model_dict?.weights,
        reranking_mode: kb.retrieval_model_dict?.reranking_mode
      }
    }));
    setKnowledgeBases([...knowledgeBases, ...newKBs]);
  };

  const handleKBEdit = (kb: KnowledgeBase) => {
    setEditingKB(kb);
    setIsKBSettingsOpen(true);
  };

  const updateKBSettings = (config: any) => {
    if (!editingKB) return;
    const updatedKB = {
      ...editingKB,
      ...config,
      retrieval_config: {
        ...editingKB.retrieval_config!,
        ...(config.retrieval_config || {})
      }
    };
    setEditingKB(updatedKB);
  };

  const loadPreset = (preset: string) => {
    const presets: Record<string, Partial<LocalModelConfig>> = {
      'creative': { temperature: 1.2, topP: 0.95, presencePenalty: 0.1 },
      'precise': { temperature: 0.1, topP: 0.1, presencePenalty: 0 },
      'balanced': { temperature: 0.7, topP: 1, presencePenalty: 0 },
    };
    const config = presets[preset];
    if (config) {
      setModels(models.map(m => ({ ...m, ...config })));
    }
  };

  const metadataMenuItems: MenuProps['items'] = [
    { key: 'disabled', label: '禁用', children: [{ key: 'disabled_desc', label: '禁用元数据过滤', disabled: true }] },
    { key: 'auto', label: '自动', children: [{ key: 'auto_desc', label: '根据用户查询自动生成元数据过滤条件', disabled: true }] },
    { key: 'manual', label: '手动', children: [{ key: 'manual_desc', label: '手动添加元数据过滤条件', disabled: true }] },
  ];

  const chatEndRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToBottom = (modelId: string) => {
    chatEndRefs.current[modelId]?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    models.forEach(model => scrollToBottom(model.id));
  }, [messages, models]);

  const handleStopMessage = async () => {
    for (const modelId of Object.keys(isStreaming)) {
      if (isStreaming[modelId] && taskIds[modelId]) {
        try {
          await apiService.stopChatMessageResponding(appId!, taskIds[modelId]);
        } catch (e) {
          console.error('Failed to stop message:', e);
        }
      }
    }
    setIsStreaming({});
  };

  const handleSendMessage = () => sendMessage(inputValue);

  const handleRegenerate = async (modelId: string, msgIndex: number) => {
    const modelMsgs = messages[modelId];
    let userMsgIndex = -1;
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (modelMsgs[i].role === 'user') {
        userMsgIndex = i;
        break;
      }
    }
    if (userMsgIndex === -1) return;

    const userMsg = modelMsgs[userMsgIndex].content;
    const userAttachments = modelMsgs[userMsgIndex].attachments || [];
    
    // Remove the user message and everything after it
    const newMsgs = modelMsgs.slice(0, userMsgIndex);
    setMessages(prev => ({ ...prev, [modelId]: newMsgs }));
    
    // Send the message again
    sendMessage(userMsg, userAttachments);
  };

  const handleViewLogs = (modelId: string, msgIndex: number) => {
    const modelMsgs = messages[modelId];
    let userMsgIndex = -1;
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (modelMsgs[i].role === 'user') {
        userMsgIndex = i;
        break;
      }
    }
    
    const userMsg = userMsgIndex !== -1 ? modelMsgs[userMsgIndex] : null;
    const assistantMsg = modelMsgs[msgIndex];
    
    setCurrentLogMsg({ userMsg, assistantMsg });
    setLogModalVisible(true);
  };

  const sendMessage = async (query: string, currentAttachments: any[] = attachments) => {
    if (!query.trim() || Object.values(isStreaming).some(s => s)) return;

    // Validate required variables
    for (const v of variables) {
      if (v.required) {
        const val = variableValues[v.id];
        if (val === undefined || val === null || val === '') {
          message.error(`${v.displayName || v.name} 必填`);
          return;
        }
      }
    }

    setInputValue('');
    setAttachments([]);

    // Add user message to configured models
    setMessages(prev => {
      const next = { ...prev };
      models.forEach(model => {
        if (model.name) {
          next[model.id] = [...(next[model.id] || []), { role: 'user', content: query, attachments: currentAttachments }];
        }
      });
      return next;
    });

    // Start streaming for each configured model
    models.forEach(async (model) => {
      if (!model.name) return;
      
      setIsStreaming(prev => ({ ...prev, [model.id]: true }));
      
      // Add empty assistant message
      setMessages(prev => ({
        ...prev,
        [model.id]: [...(prev[model.id] || []), { role: 'assistant', content: '' }]
      }));

      const inputs: Record<string, any> = {};
      variables.forEach(v => {
        inputs[v.name] = variableValues[v.id] || v.default || '';
      });

      const body = {
        inputs: inputs,
        query: query,
        conversation_id: '',
        files: currentAttachments.map(a => ({ id: a.id, type: 'document' })),
        model_config: {
          pre_prompt: prompt,
          prompt_type: 'simple',
          chat_prompt_config: {},
          completion_prompt_config: {},
          user_input_form: variables.map(v => {
            const baseConfig: any = {
              label: v.displayName || v.name,
              variable: v.name,
              required: v.required,
              default: v.default || ''
            };
            
            let typeKey = 'text-input';
            if (v.type === 'select') {
              typeKey = 'select';
              baseConfig.options = v.options || [];
            } else if (v.type === 'paragraph') {
              typeKey = 'paragraph';
            } else {
              typeKey = 'text-input';
              baseConfig.max_length = v.maxLength || 48;
            }
            
            return {
              [typeKey]: baseConfig
            };
          }),
          dataset_query_variable: '',
          opening_statement: '',
          more_like_this: {
            enabled: false
          },
          suggested_questions: [],
          suggested_questions_after_answer: {
            enabled: !!enabledFeatures.suggestion
          },
          text_to_speech: {
            enabled: !!enabledFeatures.tts,
            voice: '',
            language: ''
          },
          speech_to_text: {
            enabled: !!enabledFeatures.stt
          },
          retriever_resource: {
            enabled: !!enabledFeatures.citation
          },
          sensitive_word_avoidance: {
            enabled: !!enabledFeatures.content_check,
            type: '',
            configs: []
          },
          agent_mode: {
            enabled: tools.length > 0,
            max_iteration: 5,
            strategy: 'function_call',
            tools: tools.map(t => {
              const { raw_tool, raw_provider, ...rest } = t;
              return rest;
            })
          },
          dataset_configs: {
            retrieval_model: 'multiple',
            top_k: topK,
            score_threshold_enabled: scoreThresholdEnabled,
            score_threshold: scoreThresholdEnabled ? scoreThreshold : undefined,
            reranking_mode: rerankingMode,
            ...(rerankingMode === RerankingModeEnum.RerankingModel ? {
              reranking_model: {
                reranking_provider_name: rerankingModel.provider,
                reranking_model_name: rerankingModel.model
              },
              reranking_enable: true
            } : {
              weights: {
                weight_type: WeightedScoreEnum.Customized,
                vector_setting: {
                  vector_weight: vectorWeight,
                  embedding_provider_name: '',
                  embedding_model_name: ''
                },
                keyword_setting: {
                  keyword_weight: 1 - vectorWeight
                }
              },
              reranking_enable: false
            }),
            datasets: {
              datasets: knowledgeBases.map(kb => ({
                enabled: true,
                id: kb.id
              }))
            },
            metadata_filtering_mode: metadataFilter,
            ...(metadataFilter === MetadataFilteringModeEnum.automatic && metadataModelConfig ? {
              metadata_model_config: {
                provider: metadataModelConfig.provider,
                name: metadataModelConfig.name,
                mode: ModelModeType.chat,
                completion_params: {
                  temperature: metadataModelConfig.temperature,
                  top_p: metadataModelConfig.topP,
                  presence_penalty: metadataModelConfig.presencePenalty,
                  frequency_penalty: metadataModelConfig.frequencyPenalty,
                  max_tokens: metadataModelConfig.maxTokens,
                }
              }
            } : {}),
            ...(metadataFilter === MetadataFilteringModeEnum.manual ? {
              metadata_filtering_conditions: {
                logical_operator: LogicalOperator.and,
                conditions: manualFilters.map(f => ({
                  id: f.key,
                  name: f.key,
                  comparison_operator: f.operator,
                  value: f.value
                }))
              }
            } : {}),
          },
          file_upload: {
            image: {
              detail: 'high',
              enabled: !!enabledFeatures.attachment,
              number_limits: 3,
              transfer_methods: [
                'remote_url',
                'local_file'
              ]
            },
            enabled: !!enabledFeatures.attachment,
            allowed_file_types: [
              'image'
            ],
            allowed_file_extensions: [
              '.JPG',
              '.JPEG',
              '.PNG',
              '.GIF',
              '.WEBP',
              '.SVG'
            ],
            allowed_file_upload_methods: [
              'remote_url',
              'local_file'
            ],
            number_limits: 3,
            fileUploadConfig: {
              file_size_limit: 25,
              batch_count_limit: 5,
              image_file_size_limit: 10,
              video_file_size_limit: 100,
              audio_file_size_limit: 50
            }
          },
          annotation_reply: {
            enabled: !!enabledFeatures.annotation,
            score_threshold: 0.9,
            embedding_model: {
              embedding_provider_name: 'zhipuai',
              embedding_model_name: 'text_embedding'
            }
          },
          supportAnnotation: !!enabledFeatures.annotation,
          appId: appId,
          supportCitationHitInfo: !!enabledFeatures.citation,
          model: {
            provider: model.provider,
            name: model.name,
            mode: app?.mode || 'chat',
            completion_params: {
              temperature: model.temperature,
              top_p: model.topP,
              presence_penalty: model.presencePenalty,
              frequency_penalty: model.frequencyPenalty,
              max_tokens: model.maxTokens,
              response_format: model.responseFormat,
            }
          }
        },
        parent_message_id: null
      };

      try {
        if (app?.mode === 'completion') {
          await apiService.sendCompletionMessage(appId!, body, {
            onData: (message: any, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
              const text = message?.answer || (typeof message === 'string' ? message : '');
              if (message?.task_id) {
                setTaskIds(prev => ({ ...prev, [model.id]: message.task_id }));
              }
              setMessages(prev => {
                const modelMsgs = [...(prev[model.id] || [])];
                if (modelMsgs.length > 0) {
                  const lastMsg = modelMsgs[modelMsgs.length - 1];
                  if (lastMsg.role === 'assistant') {
                    modelMsgs[modelMsgs.length - 1] = { ...lastMsg, content: lastMsg.content + text };
                  }
                }
                return { ...prev, [model.id]: modelMsgs };
              });
            },
            onCompleted: () => {
              setIsStreaming(p => ({ ...p, [model.id]: false }));
            },
            onError: (err: any) => {
              const errMsg = typeof err === 'string' ? err : (err?.message || 'Unknown error');
              message.error(`Error: ${errMsg}`);
              setIsStreaming(p => ({ ...p, [model.id]: false }));
            },
            onMessageReplace: (data) => {
              setMessages(prev => {
                const modelMsgs = [...(prev[model.id] || [])];
                if (modelMsgs.length > 0) {
                  const lastMsg = modelMsgs[modelMsgs.length - 1];
                  if (lastMsg.role === 'assistant') {
                    modelMsgs[modelMsgs.length - 1] = { ...lastMsg, content: data.answer || '' };
                  }
                }
                return { ...prev, [model.id]: modelMsgs };
              });
            }
          });
        } else {
          await apiService.sendChatMessage(appId!, body, {
            onData: (message: any, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
              const text = message?.answer || (typeof message === 'string' ? message : '');
              if (message?.task_id) {
                setTaskIds(prev => ({ ...prev, [model.id]: message.task_id }));
              }
              setMessages(prev => {
                const modelMsgs = [...(prev[model.id] || [])];
                if (modelMsgs.length > 0) {
                  const lastMsg = modelMsgs[modelMsgs.length - 1];
                  if (lastMsg.role === 'assistant') {
                    modelMsgs[modelMsgs.length - 1] = { ...lastMsg, content: lastMsg.content + text };
                  }
                }
                return { ...prev, [model.id]: modelMsgs };
              });
            },
            onCompleted: () => {
              setIsStreaming(p => ({ ...p, [model.id]: false }));
            },
            onThought: (data) => {
              setMessages(prev => {
                const modelMsgs = [...(prev[model.id] || [])];
                if (modelMsgs.length > 0) {
                  const lastMsg = modelMsgs[modelMsgs.length - 1];
                  if (lastMsg.role === 'assistant') {
                    const thoughts = lastMsg.agent_thoughts || [];
                    modelMsgs[modelMsgs.length - 1] = { 
                      ...lastMsg, 
                      agent_thoughts: [...thoughts, data]
                    };
                  }
                }
                return { ...prev, [model.id]: modelMsgs };
              });
            },
            onFile: (data) => console.log('File:', data),
            onError: (err: any) => {
              const errMsg = typeof err === 'string' ? err : (err?.message || 'Unknown error');
              message.error(`Error: ${errMsg}`);
              setIsStreaming(p => ({ ...p, [model.id]: false }));
            },
            onMessageEnd: (data: any) => {
              setMessages(prev => {
                const modelMsgs = [...(prev[model.id] || [])];
                if (modelMsgs.length > 0) {
                  const lastMsg = modelMsgs[modelMsgs.length - 1];
                  if (lastMsg.role === 'assistant') {
                    const usage = data?.metadata?.usage || {};
                    const timeTaken = usage.latency || data?.metadata?.time_taken || data?.metadata?.elapsed_time || 0;
                    const totalTokens = usage.total_tokens || 0;
                    modelMsgs[modelMsgs.length - 1] = { 
                      ...lastMsg, 
                      time_taken: timeTaken, 
                      total_tokens: totalTokens 
                    };
                  }
                }
                return { ...prev, [model.id]: modelMsgs };
              });
            },
            onMessageReplace: (data) => {
              setMessages(prev => {
                const modelMsgs = [...(prev[model.id] || [])];
                if (modelMsgs.length > 0) {
                  const lastMsg = modelMsgs[modelMsgs.length - 1];
                  if (lastMsg.role === 'assistant') {
                    modelMsgs[modelMsgs.length - 1] = { ...lastMsg, content: data.answer || '' };
                  }
                }
                return { ...prev, [model.id]: modelMsgs };
              });
            }
          });
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        setIsStreaming(p => ({ ...p, [model.id]: false }));
      }
    });
  };

  const addModel = () => {
    if (models.length >= 4) return;
    const newId = `model-${Date.now()}`;
    const newModel = { ...DEFAULT_MODEL, id: newId, name: '' };
    setModels([...models, newModel]);
    setMessages({ ...messages, [newId]: [] });
    if (!isMultiModel) setIsMultiModel(true);
  };

  const removeModel = (id: string) => {
    if (models.length <= 1) return;
    const newModels = models.filter(m => m.id !== id);
    setModels(newModels);
    const newMsgs = { ...messages };
    delete newMsgs[id];
    setMessages(newMsgs);
    if (newModels.length === 1) {
      setIsMultiModel(false);
    }
  };

  const updateModelParam = (id: string, param: keyof LocalModelConfig | 'model_info' | 'required_param', value: any, extra?: { provider?: string; rules?: ModelParameterRule[]; paramName?: string }) => {
    setModels(models.map(m => {
      if (m.id === id) {
        if (param === 'model_info') {
          const { provider, rules } = extra || { provider: '' };
          const requiredParams = rules ? rules.reduce((acc, rule) => {
            const keyMap: Record<string, string> = {
              'temperature': 'temperature',
              'top_p': 'topP',
              'presence_penalty': 'presencePenalty',
              'frequency_penalty': 'frequencyPenalty',
              'max_tokens': 'maxTokens',
              'sampling_strategy': 'samplingStrategy',
              'google_search': 'googleSearch',
              'reasoning_mode': 'reasoningMode'
            };
            const configKey = keyMap[rule.name];
            if (configKey) {
              acc[configKey] = rule.required ?? false;
            }
            return acc;
          }, {} as Record<string, boolean>) : m.requiredParams;

          return { 
            ...m, 
            name: value, 
            provider: provider || m.provider,
            rules: rules || m.rules,
            requiredParams: requiredParams || m.requiredParams,
            // Reset params to defaults if rules are provided
            ...(rules ? rules.reduce((acc, rule) => {
              if (rule.default !== undefined) {
                const keyMap: Record<string, keyof LocalModelConfig> = {
                  'temperature': 'temperature',
                  'top_p': 'topP',
                  'presence_penalty': 'presencePenalty',
                  'frequency_penalty': 'frequencyPenalty',
                  'max_tokens': 'maxTokens'
                };
                const configKey = keyMap[rule.name];
                if (configKey) {
                  acc[configKey] = rule.default as any;
                }
              }
              return acc;
            }, {} as any) : {})
          };
        }
        if (param === 'required_param') {
          const paramName = extra?.paramName;
          if (!paramName) return m;
          
          // Also update the rules array if it exists to keep it in sync
          const updatedRules = m.rules?.map(rule => {
            const keyMap: Record<string, string> = {
              'temperature': 'temperature',
              'top_p': 'topP',
              'presence_penalty': 'presencePenalty',
              'frequency_penalty': 'frequencyPenalty',
              'max_tokens': 'maxTokens',
              'sampling_strategy': 'samplingStrategy',
              'google_search': 'googleSearch',
              'reasoning_mode': 'reasoningMode'
            };
            if (keyMap[rule.name] === paramName) {
              return { ...rule, required: value };
            }
            return rule;
          });

          return {
            ...m,
            rules: updatedRules,
            requiredParams: {
              ...(m.requiredParams || {}),
              [paramName]: value
            }
          };
        }
        if (param === 'name') {
          const modelInfo: Record<string, { type: string; icon: any }> = {
            'gpt-3.5-turbo-0125': { type: 'GPT-3.5', icon: <Cpu className="w-4 h-4" /> },
            'gpt-4-turbo': { type: 'GPT-4', icon: <Sparkles className="w-4 h-4" /> },
          };
          const info = modelInfo[value];
          return { ...m, name: value, type: info?.type || m.type, icon: info?.icon || m.icon };
        }
        return { ...m, [param]: value };
      }
      return m;
    }));
  };

  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [tools, setTools] = useState<any[]>([]);
  const [selectedToolForParams, setSelectedToolForParams] = useState<any>(null);

  const renderToolIcon = (iconData: any) => {
    if (!iconData) return <Wand2 className="w-4 h-4 text-primary-600" />;
    
    let parsedIcon = iconData;
    // If iconData is an object that has an icon property, use that
    if (typeof iconData === 'object' && iconData.icon) {
      parsedIcon = iconData.icon;
    }

    if (typeof parsedIcon === 'string') {
      const trimmed = parsedIcon.trim();
      if (trimmed.startsWith('{')) {
        try {
          parsedIcon = JSON.parse(trimmed);
        } catch (e) {
          // It's a URL string
        }
      } else if (/^\d+$/.test(trimmed)) {
        return <img src={`/sys_icons/Component ${trimmed}.svg`} alt="icon" className="w-5 h-5 rounded-md object-cover" />;
      } else if (trimmed.includes('http://') || trimmed.includes('https://') || trimmed.startsWith('/')) {
        return <img src={trimmed} alt="icon" className="w-5 h-5 rounded-md object-cover" referrerPolicy="no-referrer" />;
      } else {
        const IconComponent = (LucideIcons as any)[trimmed];
        if (IconComponent) {
          return <IconComponent className="w-4 h-4 text-primary-600" />;
        }
        return <Wand2 className="w-4 h-4 text-primary-600" />;
      }
    }
    
    if (parsedIcon && typeof parsedIcon === 'object') {
      if (parsedIcon.content) {
        const IconComponent = (LucideIcons as any)[parsedIcon.content];
        return (
          <div 
            className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs"
            style={{ background: parsedIcon.background }}
          >
            {IconComponent ? <IconComponent className="w-3 h-3" /> : parsedIcon.content.substring(0, 1)}
          </div>
        );
      }
    }
    return <Wand2 className="w-4 h-4 text-primary-600" />;
  };

  const ToolSettingDrawer = () => {
    if (!selectedToolForParams) return null;
    const tool = selectedToolForParams;
    const parameters = tool.raw_tool?.parameters || tool.tool_parameters || [];
    const isArray = Array.isArray(parameters);
    const paramList = isArray ? parameters : Object.values(parameters);

    return (
      <Drawer
        title="工具设置"
        open={!!selectedToolForParams}
        onClose={() => setSelectedToolForParams(null)}
        size="default"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
              {renderToolIcon(tool.provider_icon)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{tool.tool_label || tool.tool_name}</h3>
              <div className="text-sm text-gray-500 mt-0.5">{tool.provider_name}</div>
            </div>
          </div>

          {/* Description */}
          {tool.tool_description && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">
                {tool.tool_description}
              </p>
            </div>
          )}

          {/* Parameters */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              参数配置
            </h4>
            
            {paramList.length > 0 ? (
              <div className="space-y-4">
                {paramList.map((param: any, idx: number) => (
                  <div key={param.name || idx} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition-colors">
                    <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">
                        {param.label?.zh_Hans || param.name}
                      </span>
                      <span className="text-xs font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                        {param.type || 'string'}
                      </span>
                      {param.required && (
                        <span className="text-[10px] font-medium text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                          必填
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {param.human_description?.zh_Hans || param.llm_description || param.description?.zh_Hans || param.description || '无描述'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <p className="text-sm text-gray-400">该工具无需参数配置</p>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    );
  };

  const handleAutoGenerate = async () => {
    if (!prompt.trim() || isAutoGenerating) return;
    setIsAutoGenerating(true);
    try {
      const modelConfig = models[0];
      const formattedModelConfig = modelConfig ? {
        mode: app?.mode || 'chat',
        name: modelConfig.name,
        provider: modelConfig.provider,
        completion_params: {
          temperature: modelConfig.temperature,
          top_p: modelConfig.topP,
          presence_penalty: modelConfig.presencePenalty,
          frequency_penalty: modelConfig.frequencyPenalty,
          max_tokens: modelConfig.maxTokens,
          stop: []
        }
      } : undefined;

      const res = await apiService.generateRule({
        instruction: prompt,
        app_mode: app?.mode || 'chat',
        model_config: formattedModelConfig
      });
      if (res && res.prompt) {
        setPrompt(res.prompt);
        message.success('提示词已优化');
      }
    } catch (error) {
      console.error('Failed to auto generate:', error);
      message.error('优化失败');
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const resetChat = () => {
    const newMsgs: Record<string, { role: 'user' | 'assistant'; content: string; citations?: any[]; time_taken?: number; total_tokens?: number; }[] > = {};
    models.forEach(m => newMsgs[m.id] = []);
    setMessages(newMsgs);
  };

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      {/* Left Configuration Area */}
      <div className="w-[480px] flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 overflow-y-auto flex-grow space-y-4 custom-scrollbar">
          {/* Prompt Section Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">提示词</span>
                <Tooltip title="提示词用于对 AI 的回复做出一系列指令和约束。可插入表单变量，例如 {{input}}。这段提示词不会被最终用户所看到。">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<Wand2 className="w-3.5 h-3.5 text-primary-600" />}
                  className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 flex items-center gap-1.5 text-xs font-medium"
                  onClick={() => setIsPromptModalOpen(true)}
                >
                  提示词生成器
                </Button>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<Sparkles className="w-3.5 h-3.5 text-primary-600" />}
                  className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 flex items-center gap-1.5 text-xs font-medium"
                  onClick={() => setPrompt("你是一个有用的助手，请根据用户的输入提供准确、简洁且有帮助的回答。")}
                >
                  默认提示词
                </Button>
              </div>
            </div>
            <div className="relative group">
              <TextArea
                value={prompt}
                defaultValue={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="在这里写你的提示词，输入 '{' 插入变量、输入 '/' 插入提示内容块"
                autoSize={{ minRows: 8, maxRows: 15 }}
                className="rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm leading-relaxed"
              />
            </div>
          </motion.div>

          {/* Variables Section Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50/50 rounded-xl border border-gray-200 p-4 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">{"{x} 变量"}</span>
                <Tooltip title="变量将以表单形式让用户在对话前填写，用户填写的表单内容将自动替换提示词中的变量。">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <Button 
                type="text" 
                size="small" 
                icon={<Plus className="w-3.5 h-3.5" />}
                className="text-gray-500 hover:text-primary-600 hover:bg-gray-100 flex items-center gap-1 text-xs font-medium"
                onClick={() => {
                  setEditingVariable({
                    id: `var-${Date.now()}`,
                    name: 'key',
                    displayName: '',
                    type: 'text-input',
                    maxLength: 48,
                    required: true
                  });
                  setIsVariableModalOpen(true);
                }}
              >
                添加
              </Button>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 bg-white">
                <div className="col-span-4">变量 KEY</div>
                <div className="col-span-4">字段名称</div>
                <div className="col-span-2 text-center">可选</div>
                <div className="col-span-2 text-right">操作</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-50">
                <AnimatePresence>
                  {variables.length > 0 ? variables.map((v, i) => (
                    <motion.div 
                      key={v.id} 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-gray-50 bg-white group/var transition-colors"
                    >
                      <div className="col-span-4 flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex items-center justify-center w-6 h-6 rounded bg-blue-50 text-blue-500">
                          {v.type === 'text-input' && <Type className="w-3.5 h-3.5" />}
                          {v.type === 'paragraph' && <AlignLeft className="w-3.5 h-3.5" />}
                          {v.type === 'select' && <CheckSquare className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-mono text-gray-700">{v.name || 'key'}</span>
                      </div>
                      <div className="col-span-4 text-sm text-gray-500">
                        {v.displayName}
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <Switch 
                          size="small" 
                          checked={!v.required} 
                          onChange={(checked) => {
                            const newVars = [...variables];
                            newVars[i].required = !checked;
                            setVariables(newVars);
                          }} 
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-3">
                        <Settings 
                          className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" 
                          onClick={() => {
                            setEditingVariable(v);
                            setIsVariableModalOpen(true);
                          }}
                        />
                        <Trash2 
                          className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" 
                          onClick={() => {
                            setVariables(variables.filter((_, idx) => idx !== i));
                            message.success('变量已删除');
                          }}
                        />
                      </div>
                    </motion.div>
                  )) : (
                    <div className="py-8 text-center text-gray-400 text-xs bg-white">
                      暂无变量，点击右上角添加
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Knowledge Base Section Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">知识库</span>
              </div>
              <div className="flex items-center gap-2">
                {knowledgeBases.length > 0 && appDetail?.mode !== 'agent-chat' && (
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<Settings2 className="w-3.5 h-3.5" />}
                    className="text-gray-500 hover:text-primary-600 hover:bg-gray-50 flex items-center gap-1 text-xs font-medium"
                    onClick={() => setIsRecallSettingsModalOpen(true)}
                  >
                    召回设置
                  </Button>
                )}
                <Button 
                  type="text" 
                  size="small" 
                  icon={<Plus className="w-3.5 h-3.5" />}
                  className="text-gray-500 hover:text-primary-600 hover:bg-gray-50 flex items-center gap-1 text-xs font-medium"
                  onClick={addKnowledgeBase}
                >
                  添加
                </Button>
              </div>
            </div>
            {knowledgeBases.length > 0 ? (
              <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                <AnimatePresence>
                  {knowledgeBases.map((kb, i) => (
                    <motion.div 
                      key={kb.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100 group/kb"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-primary-50 flex items-center justify-center text-primary-600">
                          <Database className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-700">{kb.name}</p>
                          <p className="text-[9px] text-gray-400">{kb.count} 个分段</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover/kb:opacity-100 transition-opacity">
                        <Button 
                          type="text" 
                          size="small" 
                          className="w-6 h-6 p-0"
                          icon={<Edit2 className="w-3 h-3 text-gray-300 hover:text-primary-500" />} 
                          onClick={() => handleKBEdit(kb)}
                        />
                        <Button 
                          type="text" 
                          size="small" 
                          className="w-6 h-6 p-0"
                          icon={<Trash2 className="w-3 h-3 text-gray-300 hover:text-red-500" />} 
                          onClick={() => setKnowledgeBases(knowledgeBases.filter(item => item.id !== kb.id))}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-4 text-center">
                <p className="text-[11px] text-gray-400">您可以导入知识库作为上下文</p>
              </div>
            )}
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">元数据过滤</span>
                  <Tooltip title="元数据过滤是使用元数据属性（例如标签、类别或访问权限）来细化和控制系统内相关信息的检索过程。">
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={metadataFilter}
                    onChange={setMetadataFilter}
                    size="small"
                    className="w-20"
                    options={[
                      { value: MetadataFilteringModeEnum.disabled, label: '禁用' },
                      { value: MetadataFilteringModeEnum.automatic, label: '自动' },
                      { value: MetadataFilteringModeEnum.manual, label: '手动' }
                    ]}
                  />
                  {metadataFilter === MetadataFilteringModeEnum.manual && (
                    <Popover
                      placement="bottomRight"
                      trigger="click"
                      overlayClassName="metadata-filter-popover"
                      content={
                        <div className="w-[320px] p-1">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-base font-bold text-gray-900">元数据过滤条件</span>
                          </div>
                          
                          <div className="space-y-4">
                            <Button 
                              type="default" 
                              size="middle" 
                              icon={<Plus className="w-4 h-4" />}
                              className="w-fit flex items-center gap-1 text-gray-600 border-gray-200"
                              onClick={() => setManualFilters([...manualFilters, { key: '', operator: ComparisonOperator.is, value: '' }])}
                            >
                              添加条件
                            </Button>

                            <div className="relative">
                              <Input
                                placeholder="搜索元数据"
                                value={filterSearch}
                                onChange={(e) => setFilterSearch(e.target.value)}
                                prefix={<Search className="w-4 h-4 text-gray-400" />}
                                className="bg-gray-50 border-none rounded-lg h-10"
                              />
                            </div>

                            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                              {manualFilters
                                .filter(f => !filterSearch || f.key.toLowerCase().includes(filterSearch.toLowerCase()) || f.value.toLowerCase().includes(filterSearch.toLowerCase()))
                                .map((filter, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 group relative">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">键 (Key)</span>
                                      <X 
                                        className="w-3.5 h-3.5 text-gray-300 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" 
                                        onClick={() => setManualFilters(manualFilters.filter((_, i) => i !== idx))}
                                      />
                                    </div>
                                    <Select
                                      size="small"
                                      placeholder="选择元数据键"
                                      value={filter.key}
                                      className="w-full"
                                      onChange={(value) => {
                                        const newFilters = [...manualFilters];
                                        newFilters[idx].key = value;
                                        setManualFilters(newFilters);
                                      }}
                                      options={metadataOptions.map(opt => ({ label: opt.name, value: opt.name }))}
                                    />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">条件 (Operator)</span>
                                    <Select
                                      size="small"
                                      placeholder="选择条件"
                                      value={filter.operator}
                                      className="w-full"
                                      onChange={(value) => {
                                        const newFilters = [...manualFilters];
                                        newFilters[idx].operator = value;
                                        setManualFilters(newFilters);
                                      }}
                                      options={[
                                        { label: '等于', value: ComparisonOperator.is },
                                        { label: '不等于', value: ComparisonOperator.isNot },
                                        { label: '包含', value: ComparisonOperator.contains },
                                        { label: '不包含', value: ComparisonOperator.notContains },
                                        { label: '为空', value: ComparisonOperator.empty },
                                        { label: '不为空', value: ComparisonOperator.notEmpty },
                                      ]}
                                    />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">值 (Value)</span>
                                    <Input 
                                      size="small" 
                                      placeholder="输入过滤值" 
                                      value={filter.value}
                                      onChange={(e) => {
                                        const newFilters = [...manualFilters];
                                        newFilters[idx].value = e.target.value;
                                        setManualFilters(newFilters);
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                              {manualFilters.length === 0 && (
                                <div className="py-8 text-center">
                                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无过滤条件" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <Button 
                        size="small" 
                        className="flex items-center gap-1.5 border-gray-200 hover:border-primary-500 hover:text-primary-600"
                      >
                        <ListFilter className="w-3.5 h-3.5 text-primary-500" />
                        <span className="text-xs">条件</span>
                        <span className="text-xs font-bold text-gray-400">{manualFilters.length}</span>
                      </Button>
                    </Popover>
                  )}
                </div>
              </div>
              
              <AnimatePresence>
                {metadataFilter === MetadataFilteringModeEnum.automatic && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">推理模型</span>
                      <ModelSelect
                        className="w-40"
                        value={metadataModelConfig?.name || ''}
                        modelType={ModelTypeEnum.textGeneration}
                        onChange={(m, provider, rules) => updateMetadataModelParam('model_info', m, { provider, rules })}
                      />
                    </div>
                    
                    {metadataModelConfig && (
                      <div className="space-y-4 pt-2 border-t border-gray-100">
                        {(metadataModelConfig.rules || [
                          { label: { zh_Hans: '温度 (Temperature)', en_US: 'Temperature' }, name: 'temperature', min: 0, max: 2, type: 'slider', precision: 1 },
                        ]).filter((rule: any) => ['temperature', 'top_p', 'max_tokens'].includes(rule.name)).map((rule: any) => {
                          const keyMap: Record<string, keyof LocalModelConfig> = {
                            'temperature': 'temperature',
                            'top_p': 'topP',
                            'max_tokens': 'maxTokens',
                          };
                          const configKey = keyMap[rule.name];
                          if (!configKey) return null;
                          
                          const label = typeof rule.label === 'string' ? rule.label : (rule.label?.zh_Hans || rule.label?.en_US || rule.name);
                          
                          return (
                            <div key={rule.name} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-medium text-gray-400">{label}</span>
                                <span className="text-[10px] font-bold text-primary-600 font-mono">
                                  {metadataModelConfig[configKey]}
                                </span>
                              </div>
                              <Slider 
                                min={rule.min ?? 0} 
                                max={rule.max ?? 1} 
                                step={rule.precision ? 1 / Math.pow(10, rule.precision) : (rule.name === 'max_tokens' ? 1 : 0.1)} 
                                value={metadataModelConfig[configKey]} 
                                onChange={v => updateMetadataModelParam(configKey, v)}
                                tooltip={{ open: false }}
                                className="m-0 h-4"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
                {metadataFilter === MetadataFilteringModeEnum.manual && null}
              </AnimatePresence>
            </div>
          </motion.div>

          {(app?.mode === 'agent-chat' || app?.mode === 'advanced-chat') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">工具</span>
                  <Tooltip title="工具可以帮助 AI 完成更复杂的任务。">
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{tools.length}/{tools.length} 启用</span>
                  <Divider orientation="vertical" />
                  <ToolSelectorPopover
                    onSelectTool={(provider, tool) => {
                      // Add tool to the list if it's not already there
                      const exists = tools.some(t => t.provider_id === provider.id && t.provider_type === provider.type && t.tool_name === tool.name);
                      if (!exists) {
                        setTools([...tools, {
                          provider_id: provider.id,
                          provider_type: provider.type,
                          provider_name: provider.name,
                          provider_icon: provider.icon,
                          tool_name: tool.name,
                          tool_label: tool.label?.zh_Hans || tool.name,
                          tool_parameters: tool.parameters || {},
                          tool_description: tool.description?.zh_Hans || tool.description?.en_US || '',
                          enabled: true,
                          raw_tool: tool,
                          raw_provider: provider
                        }]);
                      }
                    }}
                  >
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<Plus className="w-3.5 h-3.5" />}
                      className="text-gray-500 hover:text-primary-600 hover:bg-gray-50 flex items-center gap-1 text-xs font-medium"
                    >
                      添加
                    </Button>
                  </ToolSelectorPopover>
                </div>
              </div>
              
              {tools.length > 0 && (
                <div className="space-y-2 mt-3">
                  {tools.map((tool, index) => (
                    <div key={`${tool.provider_id}-${tool.tool_name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                          {renderToolIcon(tool.provider_icon)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tool.tool_label || tool.tool_name}</div>
                          <div className="text-xs text-gray-500">{tool.provider_name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {tool.is_team_authorization === false ? (
                          <Button 
                            size="small" 
                            className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                            onClick={async () => {
                              setSelectedToolForAuth(tool);
                              try {
                                let detail: any = null;
                                if (tool.type === 'builtin') {
                                  detail = await apiService.fetchBuiltInToolList(tool.tool_name);
                                } else if (tool.type === 'api') {
                                  detail = await apiService.fetchCustomToolList(tool.tool_name);
                                } else if (tool.type === 'workflow') {
                                  detail = await apiService.fetchWorkflowToolDetail(tool.id);
                                } else if (tool.type === 'mcp') {
                                  detail = await apiService.fetchMcpProviderDetail(tool.id);
                                }
                                setToolDetailForAuth(detail);
                                setIsAuthDrawerOpen(true);
                              } catch (error) {
                                message.error('获取工具详情失败');
                              }
                            }}
                          >
                            工具未授权
                          </Button>
                        ) : (
                          <Switch 
                            size="small" 
                            checked={tool.enabled} 
                            onChange={(checked) => {
                              const newTools = [...tools];
                              newTools[index].enabled = checked;
                              setTools(newTools);
                            }} 
                          />
                        )}
                        <div className={`flex items-center gap-1 ${tool.is_team_authorization === false ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<Settings className="w-4 h-4" />}
                            className="text-gray-400 hover:text-primary-600"
                            onClick={() => setSelectedToolForParams(tool)}
                            disabled={tool.is_team_authorization === false}
                          />
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<Trash2 className="w-4 h-4" />}
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => {
                              const newTools = [...tools];
                              newTools.splice(index, 1);
                              setTools(newTools);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-white">
          <Popover 
            placement="topRight" 
            trigger="click"
            open={isPublishPopoverOpen}
            onOpenChange={setIsPublishPopoverOpen}
            styles={{ container: { padding: '12px', borderRadius: '12px' } }}
            content={
              <div className="w-64">
                <div className="mb-3">
                  <div className="text-gray-600 text-sm mb-1">当前草稿未发布</div>
                  <div className="text-gray-400 text-xs">
                    {isAutoSaving ? '正在自动保存...' : draftUpdatedAt ? `自动保存于 ${relativeTimeString}` : '自动保存 ·'}
                  </div>
                </div>
                <Button 
                  type="primary" 
                  block 
                  className="mb-2 bg-blue-600 h-10 rounded-lg font-medium" 
                  onClick={() => {
                    setIsPublishPopoverOpen(false);
                    onPublish();
                  }}
                >
                  发布
                </Button>
                <div className="space-y-1 mt-2">
                  <div 
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-700 group transition-colors"
                    onClick={() => {
                      setIsPublishPopoverOpen(false);
                      handleOpenMarketModal();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-sm">发布到应用市场</span>
                    </div>
                  </div>
                  <div 
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-700 group transition-colors"
                    onClick={() => {
                      setIsPublishPopoverOpen(false);
                      setIsEmbedModalOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-sm">嵌入网站</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            <Button 
              type="primary" 
              block 
              size="large"
              className="h-12 rounded-xl font-bold shadow-lg shadow-primary-500/20 bg-gradient-to-r from-primary-600 to-primary-500 border-none hover:scale-[1.02] transition-transform"
            >
              发布
            </Button>
          </Popover>
        </div>
      </div>

      {/* Market Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
              <Info className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">确认</span>
          </div>
        }
        open={isMarketModalOpen}
        onCancel={() => setIsMarketModalOpen(false)}
        onOk={handlePublishToMarket}
        okText="确认"
        cancelText="取消"
        confirmLoading={isPublishingToMarket}
        centered
        width={480}
        styles={{
          mask: { backdropFilter: 'blur(4px)' },
          header: { borderBottom: 'none', padding: '24px 24px 0' },
          body: { padding: '16px 24px 24px' },
          footer: { borderTop: 'none', padding: '0 24px 24px' }
        }}
        okButtonProps={{
          className: 'h-10 px-8 rounded-lg bg-blue-600 font-medium',
        }}
        cancelButtonProps={{
          className: 'h-10 px-8 rounded-lg font-medium',
        }}
      >
        <div className="space-y-4">
          <p className="text-gray-700 text-base font-medium">请选择发布分类</p>
          <Select
            className="w-full h-12"
            placeholder="请选择发布到应用市场的分类"
            loading={loadingCategories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categories.map(c => ({ label: c.category, value: c.id }))}
            dropdownStyle={{ borderRadius: '12px', padding: '8px' }}
            variant="outlined"
          />
        </div>
      </Modal>

      {/* Right Debug Area */}
      <div className="flex-grow flex flex-col bg-gray-50/50">
        {/* Debug Header */}
        <div className="h-14 border-b border-gray-100 px-6 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-900">调试与预览</span>
          </div>
          <div className="flex items-center gap-4">
            {models.length > 0 && !isMultiModel ? (
              <div className="flex items-center gap-3">
                <ModelSelect
                  className="w-48"
                  value={models[0]?.name || ''}
                  modelType={ModelTypeEnum.textGeneration}
                  onChange={(m, provider, rules) => updateModelParam(models[0]?.id || '', 'model_info', m, { provider, rules })}
                />
                <Tooltip title="添加模型对比">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<Plus className="w-4 h-4" />}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                    onClick={() => {
                      if (models.length === 0) return;
                      const newId = `model-${Date.now()}`;
                      const firstModel = models[0];
                      const secondModel = { ...DEFAULT_MODEL, id: newId, name: '' };
                      setModels([firstModel, secondModel]);
                      setMessages({
                        [firstModel.id]: messages[firstModel.id] || [],
                        [newId]: []
                      });
                      setIsMultiModel(true);
                    }}
                  />
                </Tooltip>
                <div className="w-px h-4 bg-gray-200"></div>
                <Tooltip title="重置对话">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<RotateCcw className="w-4 h-4" />}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                    onClick={resetChat}
                  />
                </Tooltip>
                <div className="w-px h-4 bg-gray-200"></div>
                <Tooltip title="参数设置">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<Settings2 className="w-4 h-4" />}
                    className={`text-gray-400 hover:text-primary-600 transition-colors ${models[0] && showParams === models[0].id ? 'text-primary-600 bg-primary-50' : ''}`}
                    onClick={() => models[0] && setShowParams(showParams === models[0].id ? null : models[0].id)}
                  />
                </Tooltip>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<Plus className="w-3.5 h-3.5" />}
                  className="text-primary-600 hover:text-primary-700 font-medium text-xs"
                  onClick={addModel}
                  disabled={models.length >= 4}
                >
                  添加模型({models.length}/4)
                </Button>
                <Button
                  type="text"
                  size="small"
                  className="text-gray-400 hover:text-primary-600 transition-colors text-xs"
                  onClick={() => setIsMultiModel(false)}
                >
                  切换单模型
                </Button>
                <div className="w-px h-4 bg-gray-200"></div>
                <Tooltip title="重置对话">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<RotateCcw className="w-4 h-4" />}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                    onClick={resetChat}
                  />
                </Tooltip>
                <div className="w-px h-4 bg-gray-200"></div>
                <Tooltip title="全局设置">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<Settings2 className="w-4 h-4" />}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                    // In multi-model mode, global settings might be different, but for now we can just toggle a global state or do nothing
                  />
                </Tooltip>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
          {/* Variables Area */}
          {variables.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 shrink-0 max-w-[1400px] w-full mx-auto">
              <div className="text-sm font-bold text-gray-900 mb-4">变量</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {variables.map(v => (
                  <div key={v.id} className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      {v.displayName || v.name}
                      {!v.required && <span className="text-gray-400 font-normal ml-1">(选填)</span>}
                    </div>
                    {v.type === 'text-input' && (
                      <Input 
                        placeholder={v.displayName || v.name} 
                        value={variableValues[v.id] || ''}
                        onChange={(e) => handleVariableChange(v.id, e.target.value)}
                        className="bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 h-10 rounded-lg transition-colors"
                      />
                    )}
                    {v.type === 'paragraph' && (
                      <Input.TextArea 
                        placeholder={v.displayName || v.name} 
                        value={variableValues[v.id] || ''}
                        onChange={(e) => handleVariableChange(v.id, e.target.value)}
                        autoSize={{ minRows: 3, maxRows: 6 }}
                        className="bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 rounded-lg transition-colors"
                      />
                    )}
                    {v.type === 'select' && (
                      <Select 
                        placeholder={v.displayName || v.name} 
                        value={variableValues[v.id]}
                        onChange={(val) => handleVariableChange(v.id, val)}
                        className="w-full h-10"
                        options={v.options?.map(o => ({ label: o, value: o })) || []}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`flex-grow max-w-[1400px] w-full mx-auto ${
            isMultiModel ? 'grid gap-4 grid-cols-2' : 'flex flex-col'
          }`}>
            {(isMultiModel ? models : models.slice(0, 1)).map((model, index) => (
              <div 
                key={model.id} 
                className={`flex flex-col min-h-[400px] relative ${
                  isMultiModel ? 'bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden' : ''
                }`}
              >
                {/* Model Header (Only in multi-model) */}
                {isMultiModel && (
                  <div className="h-12 px-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 italic">#{index + 1}</span>
                      <ModelSelect
                        className="w-44"
                        value={model.name}
                        modelType={ModelTypeEnum.textGeneration}
                        onChange={(m, provider, rules) => updateModelParam(model.id, 'model_info', m, { provider, rules })}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip title="参数设置">
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<Settings2 className="w-3.5 h-3.5" />} 
                          className="text-gray-400 hover:text-primary-600"
                          onClick={() => setShowParams(model.id)}
                        />
                      </Tooltip>
                      {models.length > 1 && (
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<Trash2 className="w-3.5 h-3.5" />} 
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => removeModel(model.id)}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className={`flex-grow overflow-y-auto custom-scrollbar relative ${isMultiModel ? 'p-5 space-y-5 bg-gray-50/10' : 'py-5 space-y-5'}`}>
                  {messages[model.id]?.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-xs text-gray-400 font-medium">开始对话</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {messages[model.id]?.map((msg, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group/message`}
                        >
                          <div className={`flex flex-col gap-2 max-w-[90%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                {msg.attachments.map((att, idx) => (
                                  <div key={idx} className="relative group">
                                    {att.url ? (
                                      <Image
                                        src={att.url}
                                        alt={att.name}
                                        className="rounded-2xl object-cover max-w-[300px] max-h-[300px]"
                                      />
                                    ) : (
                                      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm w-[280px]">
                                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-50/50 rounded-lg">
                                          {getFileIcon(att.name)}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                          <span className="text-sm text-gray-800 truncate font-medium" title={att.name}>{att.name}</span>
                                          <span className="text-xs text-gray-400 mt-0.5">{formatFileSize(att.size)}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {msg.content && (
                              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed relative ${
                                msg.role === 'user' 
                                  ? 'bg-[#eef5ff] text-gray-800 rounded-tr-none' 
                                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                              }`}>
                                <div className={`prose prose-sm max-w-none prose-p:leading-relaxed prose-p:first:mt-0 prose-p:last:mb-0 prose-pre:my-2 prose-pre:bg-gray-800 prose-pre:text-gray-100 break-words`}>
                                  {renderMarkdown(msg.content)}
                                </div>
                            {msg.role === 'assistant' && isStreaming[model.id] && i === messages[model.id].length - 1 && (
                              <span className="inline-block w-1.5 h-4 ml-1 bg-primary-500 animate-pulse align-middle" />
                            )}
                            {msg.citations && msg.citations.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="text-xs font-bold text-gray-500 mb-2 flex items-center">
                                  <Quote className="w-3 h-3 mr-1" />
                                  引用来源
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {msg.citations.map((citation, cIdx) => (
                                    <div
                                      key={cIdx}
                                      className="group relative flex items-center gap-1.5 px-2 py-1 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-md cursor-pointer transition-all"
                                      onClick={() => setCitationPreview(citation)}
                                    >
                                      <FileText className="w-3 h-3 text-gray-400 group-hover:text-primary-500" />
                                      <span className="text-[10px] text-gray-600 group-hover:text-primary-700 font-medium truncate max-w-[120px]">
                                        {citation.title || `来源 ${cIdx + 1}`}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {msg.role === 'assistant' && (
                              <>
                                {(msg.time_taken !== undefined || msg.total_tokens !== undefined) && (
                                  <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-2">
                                    {msg.time_taken !== undefined && <span>耗时: {msg.time_taken.toFixed(2)}s</span>}
                                    {msg.total_tokens !== undefined && <span>消费token: {msg.total_tokens}</span>}
                                  </div>
                                )}
                                
                                <div className="absolute -bottom-4 right-0 opacity-0 group-hover/message:opacity-100 transition-opacity flex items-center gap-1 bg-white shadow-sm border border-gray-100 rounded-md p-1 z-10">
                                  <Tooltip title="复制">
                                    <Button 
                                      type="text" 
                                      size="small" 
                                      icon={<Copy className="w-3 h-3 text-gray-500" />} 
                                      className="w-6 h-6 p-0 flex items-center justify-center hover:bg-gray-50"
                                      onClick={() => {
                                        navigator.clipboard.writeText(msg.content);
                                        message.success('已复制');
                                      }}
                                    />
                                  </Tooltip>
                                  <Tooltip title="重新生成">
                                    <Button 
                                      type="text" 
                                      size="small" 
                                      icon={<RotateCcw className="w-3 h-3 text-gray-500" />} 
                                      className="w-6 h-6 p-0 flex items-center justify-center hover:bg-gray-50"
                                      onClick={() => handleRegenerate(model.id, i)}
                                    />
                                  </Tooltip>
                                  {app?.mode === 'agent-chat' && (
                                    <Tooltip title="日志">
                                      <Button 
                                        type="text" 
                                        size="small" 
                                        icon={<FileText className="w-3 h-3 text-gray-500" />} 
                                        className="w-6 h-6 p-0 flex items-center justify-center hover:bg-gray-50"
                                        onClick={() => handleViewLogs(model.id, i)}
                                      />
                                    </Tooltip>
                                  )}
                                </div>
                              </>
                            )}
                            </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  <div ref={el => { chatEndRefs.current[model.id] = el; }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Citation Preview Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-500" />
              <span>引用详情</span>
            </div>
          }
          open={!!citationPreview}
          onCancel={() => setCitationPreview(null)}
          footer={null}
          width={800}
          centered
          className="citation-preview-modal"
        >
          {citationPreview && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{citationPreview.title}</h3>
                {citationPreview.url && (
                  <a 
                    href={citationPreview.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    查看原文
                  </a>
                )}
              </div>
              <div className="prose prose-sm max-w-none bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[200px] prose-p:leading-relaxed prose-p:first:mt-0 prose-p:last:mb-0 break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          {...props}
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code {...props} className={className}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {citationPreview.content || '暂无内容'}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </Modal>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex flex-wrap gap-3 mb-2">
              {attachments.map((att, i) => (
                <div key={i} className="relative group flex items-center">
                  {att.url ? (
                    <div className="relative w-16 h-16 rounded-lg border border-gray-200 shadow-sm">
                      <img src={att.url} alt={att.name} className="w-full h-full object-cover rounded-lg" />
                      <div 
                        className="absolute -top-2 -right-2 bg-white rounded-full shadow-sm border border-gray-100 cursor-pointer opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                        onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                      >
                        <div className="bg-gray-500 hover:bg-red-500 text-white rounded-full p-1 transition-colors">
                          <X className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Tooltip title={att.name}>
                      <div className="relative flex items-center gap-3 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm w-[240px]">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-50/50 rounded-lg">
                          {getFileIcon(att.name)}
                        </div>
                        <div className="flex flex-col overflow-hidden w-full">
                          <span className="text-sm text-gray-800 truncate font-medium">{att.name}</span>
                          <span className="text-xs text-gray-400 mt-0.5">{formatFileSize(att.size)}</span>
                        </div>
                        <div 
                          className="absolute -top-2 -right-2 bg-white rounded-full shadow-sm border border-gray-100 cursor-pointer opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                          onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                        >
                          <div className="bg-gray-500 hover:bg-red-500 text-white rounded-full p-1 transition-colors">
                            <X className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>
            <motion.div 
              whileFocus={{ scale: 1.01 }}
              className="relative flex items-center bg-white rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all px-4 py-2 shadow-sm"
            >
              {enabledFeatures.attachment && (
                <>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                  <Button type="text" icon={<Paperclip className="w-4 h-4 text-gray-400" />} className="p-0 w-8 h-8 flex items-center justify-center" onClick={() => fileInputRef.current?.click()} loading={uploading} />
                </>
              )}
              {enabledFeatures.stt && (
                <Button 
                  type="text" 
                  icon={<Mic className={`w-4 h-4 ${recording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />} 
                  className="p-0 w-8 h-8 flex items-center justify-center" 
                  onClick={handleSpeechToText} 
                />
              )}
              <Input 
                placeholder="和言复对话，获取您需要的信息" 
                variant="borderless"
                className="flex-grow text-sm py-2"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleSendMessage}
                disabled={Object.values(isStreaming).some(s => s)}
              />
              <Button 
                type="primary" 
                icon={Object.values(isStreaming).some(s => s) ? <Square className="w-4 h-4 fill-current" /> : <Send className="w-4 h-4" />} 
                className={`rounded-full h-10 w-10 flex items-center justify-center p-0 shadow-lg border-none hover:scale-110 transition-transform bg-blue-600 shadow-blue-500/20`}
                onClick={Object.values(isStreaming).some(s => s) ? handleStopMessage : handleSendMessage}
              />
            </motion.div>
            
            <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/50 rounded-xl border border-blue-100/50">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {Object.entries(enabledFeatures || {}).filter(([_, enabled]) => enabled).map(([id, _]) => {
                    const feature = features.find(f => f.id === id);
                    if (!feature) return null;
                    return (
                      <div key={id} className={`w-6 h-6 ${feature.color} rounded-md flex items-center justify-center text-white shadow-sm border border-white`}>
                        <feature.icon className="w-3.5 h-3.5" />
                      </div>
                    );
                  })}
                </div>
                <span className="text-xs text-blue-800 font-medium">功能已开启</span>
              </div>
              <Button 
                type="link" 
                size="small" 
                className="text-xs text-blue-600 p-0 flex items-center gap-1 hover:gap-2 transition-all font-medium"
                onClick={() => setShowFeaturesDrawer(true)}
              >
                管理 <ArrowUpRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Global Parameter Sidebar Overlay */}
        <AnimatePresence>
          {showParams && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-gray-100 z-30 flex flex-col"
            >
              {(() => {
                const model = models.find(m => m.id === showParams);
                if (!model) return null;
                return (
                  <>
                    <div className="h-14 px-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0">
                      <div className="flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-bold text-gray-900">参数设置</span>
                      </div>
                      <Button type="text" size="small" icon={<Plus className="w-4 h-4 rotate-45" />} onClick={() => setShowParams(null)} />
                    </div>
                    <div className="p-6 space-y-8 overflow-y-auto flex-grow custom-scrollbar">
                      {(model.rules || [
                        { label: { zh_Hans: '温度 (Temperature)', en_US: 'Temperature' }, name: 'temperature', min: 0, max: 2, type: 'slider', precision: 1 },
                        { label: { zh_Hans: 'Top P', en_US: 'Top P' }, name: 'top_p', min: 0, max: 1, type: 'slider', precision: 2 },
                        { label: { zh_Hans: '采样策略', en_US: 'Sampling Strategy' }, name: 'sampling_strategy', type: 'boolean' },
                        { label: { zh_Hans: '最大标记 (Max Tokens)', en_US: 'Max Tokens' }, name: 'max_tokens', min: 1, max: 4096, type: 'slider', precision: 0 },
                        { label: { zh_Hans: '联网搜索', en_US: 'Google Search' }, name: 'google_search', type: 'boolean' },
                        { label: { zh_Hans: '推理模式', en_US: 'Reasoning Mode' }, name: 'reasoning_mode', type: 'boolean' },
                      ]).map((rule: any) => {
                        const keyMap: Record<string, keyof LocalModelConfig> = {
                          'temperature': 'temperature',
                          'top_p': 'topP',
                          'presence_penalty': 'presencePenalty',
                          'frequency_penalty': 'frequencyPenalty',
                          'max_tokens': 'maxTokens',
                          'sampling_strategy': 'samplingStrategy',
                          'do_sample': 'samplingStrategy',
                          'google_search': 'googleSearch',
                          'web_search': 'googleSearch',
                          'reasoning_mode': 'reasoningMode',
                          'thinking': 'reasoningMode',
                          'response_format': 'responseFormat'
                        };
                        const configKey = keyMap[rule.name];
                        if (!configKey) return null;
                        
                        const label = typeof rule.label === 'string' ? rule.label : (rule.label?.zh_Hans || rule.label?.en_US || rule.name);
                        const help = typeof rule.help === 'string' ? rule.help : (rule.help?.zh_Hans || rule.help?.en_US);
                        const isRequired = model.requiredParams?.[configKey] ?? rule.required ?? false;

                        return (
                          <div key={rule.name} className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500">{label}</span>
                                {help && (
                                  <Tooltip title={help}>
                                    <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                                  </Tooltip>
                                )}
                                <Tooltip title="是否必填">
                                  <Switch 
                                    size="small" 
                                    checked={isRequired}
                                    onChange={checked => updateModelParam(model.id, 'required_param', checked, { paramName: configKey })}
                                  />
                                </Tooltip>
                              </div>
                              {(rule.type === 'slider' || rule.type === 'float' || rule.type === 'int') && rule.min !== null && rule.max !== null && (
                                <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-[10px] font-bold font-mono border border-primary-100">
                                  {(model as any)[configKey]}
                                </span>
                              )}
                            </div>
                            
                            {(rule.type === 'slider' || rule.type === 'float' || rule.type === 'int') && rule.min !== null && rule.max !== null ? (
                              <Slider 
                                min={rule.min ?? 0} 
                                max={rule.max ?? 1} 
                                step={rule.precision ? 1 / Math.pow(10, rule.precision) : (rule.name === 'max_tokens' ? 1 : 0.1)} 
                                value={(model as any)[configKey]} 
                                onChange={v => updateModelParam(model.id, configKey, v)}
                                tooltip={{ open: false }}
                                className="m-0"
                              />
                            ) : rule.type === 'boolean' ? (
                              <div className="flex gap-2">
                                <Button 
                                  size="small" 
                                  className={`flex-grow rounded-lg text-xs ${ (model as any)[configKey] ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-100 text-gray-400' }`}
                                  onClick={() => updateModelParam(model.id, configKey, true)}
                                >
                                  True
                                </Button>
                                <Button 
                                  size="small" 
                                  className={`flex-grow rounded-lg text-xs ${ !(model as any)[configKey] ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-100 text-gray-400' }`}
                                  onClick={() => updateModelParam(model.id, configKey, false)}
                                >
                                  False
                                </Button>
                              </div>
                            ) : rule.type === 'string' && rule.options?.length > 0 ? (
                              <Select 
                                size="small" 
                                value={(model as any)[configKey]} 
                                className="w-full"
                                onChange={v => updateModelParam(model.id, configKey, v)}
                                options={rule.options.map((opt: any) => ({ value: opt, label: opt }))}
                              />
                            ) : (
                              <Input 
                                size="small"
                                value={(model as any)[configKey]}
                                onChange={e => updateModelParam(model.id, configKey, e.target.value)}
                              />
                            )}
                          </div>
                        );
                      })}
                      <Divider className="my-2" />
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FeaturesDrawer 
        isOpen={showFeaturesDrawer} 
        onClose={() => setShowFeaturesDrawer(false)} 
        enabledFeatures={enabledFeatures}
        setEnabledFeatures={setEnabledFeatures}
        openingStatement={openingStatement}
        setOpeningStatement={setOpeningStatement}
        suggestedQuestions={suggestedQuestions}
        setSuggestedQuestions={setSuggestedQuestions}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
      <PromptGeneratorModal 
        isOpen={isPromptModalOpen} 
        onClose={() => setIsPromptModalOpen(false)} 
        onGenerate={(data) => {
          setPrompt(data.prompt);
          if (data.opening_statement) {
            setEnabledFeatures(prev => ({ ...prev, opening: true }));
          }
          if (data.variables && data.variables.length > 0) {
            // Add new variables that don't exist yet
            const newVars: Variable[] = [...variables];
            data.variables.forEach(varName => {
              if (!newVars.find(v => v.name === varName)) {
                newVars.push({
                  id: `var-${Math.random().toString(36).substring(7)}`,
                  name: varName,
                  displayName: varName,
                  type: 'text-input',
                  required: true,
                  maxLength: 48
                });
              }
            });
            setVariables(newVars);
          }
        }}
        modelConfig={models[0]}
      />
      
      <KnowledgeBaseModal 
        isOpen={isKBModalOpen} 
        onClose={() => setIsKBModalOpen(false)} 
        onAdd={handleKBAdd}
        excludeIds={knowledgeBases.map(kb => kb.id)}
      />

      <Drawer
        title="知识库设置"
        placement="right"
        onClose={() => setIsKBSettingsOpen(false)}
        open={isKBSettingsOpen}
        size="large"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsKBSettingsOpen(false)}>取消</Button>
            <Button 
              type="primary" 
              loading={isSavingKB} 
              onClick={handleSaveKBSettings}
            >
              确定
            </Button>
          </div>
        }
      >
        {editingKB && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">知识库名称</label>
                <Input 
                  value={editingKB.name} 
                  onChange={(e) => updateKBSettings({ name: e.target.value })}
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">知识库描述</label>
                <Input.TextArea 
                  value={editingKB.description} 
                  onChange={(e) => updateKBSettings({ description: e.target.value })}
                  rows={3}
                  placeholder="请输入知识库描述..."
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            <Divider className="my-4" />

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">可见权限</label>
                <Select
                  className="w-full"
                  value={editingKB.permission}
                  onChange={(v) => updateKBSettings({ permission: v })}
                  options={[
                    { value: 'only_me', label: '只有我' },
                    { value: 'all_team_members', label: '所有团队成员' },
                    { value: 'partial_members', label: '部分团队成员' },
                  ]}
                />
              </div>

              {editingKB.permission === 'partial_members' && (
                <div className="p-4 bg-blue-50 rounded-lg space-y-4 border border-blue-100">
                  <PartialTeamMembersSelector 
                    partialTeamData={editingKB.partial_team_data || { roles: [], departments: [], members: [] }}
                    updateKBSettings={updateKBSettings}
                    onMembersLoaded={(members, roles) => {
                      setMemberList(members);
                      setRoleList(roles);
                    }}
                  />
                </div>
              )}
            </div>

            <Divider className="my-4" />

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">索引模式</label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${editingKB.indexing_technique === 'high_quality' ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => updateKBSettings({ indexing_technique: 'high_quality' })}
                  >
                    <div className="flex items-center gap-2 font-medium text-sm text-gray-900 mb-1">
                      <Sun className="w-4 h-4 text-orange-500" /> 高质量
                      {editingKB.indexing_technique === 'high_quality' && <Check className="w-4 h-4 text-blue-600 ml-auto" />}
                    </div>
                    <div className="text-xs text-gray-500">调用 Embedding 模型进行处理，在用户查询时提供更高的准确度。</div>
                  </div>
                  <div 
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${editingKB.indexing_technique === 'economy' ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => updateKBSettings({ indexing_technique: 'economy' })}
                  >
                    <div className="flex items-center gap-2 font-medium text-sm text-gray-900 mb-1">
                      <Database className="w-4 h-4 text-blue-500" /> 经济
                      {editingKB.indexing_technique === 'economy' && <Check className="w-4 h-4 text-blue-600 ml-auto" />}
                    </div>
                    <div className="text-xs text-gray-500">使用离线的向量引擎、关键词索引等方式，降低了准确度但无需花费 Token。</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 opacity-50 pointer-events-none">
                <label className="text-sm font-medium text-gray-900">Embedding 模型</label>
                <ModelSelect
                  value={editingKB.embedding_model}
                  onChange={(model) => updateKBSettings({ embedding_model: model })}
                  modelType={ModelTypeEnum.textEmbedding}
                  className="bg-gray-100 border-gray-200 cursor-not-allowed"
                  disabled={true}
                />
              </div>
            </div>

            <Divider className="my-4" />

            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-900">检索设置</label>
              
              {/* Vector Search Option */}
              <div 
                className={`border rounded-xl transition-colors cursor-pointer ${editingKB.retrieval_config?.search_method === 'semantic' ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => updateKBSettings({ retrieval_config: { search_method: 'semantic' } })}
              >
                <div className={`p-4 ${editingKB.retrieval_config?.search_method === 'semantic' ? 'bg-blue-50/30 rounded-t-xl' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-200">
                      <LayoutGrid className={`w-4 h-4 ${editingKB.retrieval_config?.search_method === 'semantic' ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">向量检索</div>
                      <div className="text-xs text-gray-500 mt-0.5">通过生成查询嵌入并查询与其向量表示最相似的文本分段</div>
                    </div>
                  </div>
                </div>
                
                {editingKB.retrieval_config?.search_method === 'semantic' && (
                  <div className="p-4 pt-0 bg-blue-50/30 rounded-b-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Switch 
                        size="small" 
                        checked={editingKB.retrieval_config?.reranking_enable}
                        onChange={(v) => updateKBSettings({ retrieval_config: { reranking_enable: v } })}
                      />
                      <span className="text-sm font-medium text-gray-900">Rerank 模型</span>
                      <Tooltip title="重排序模型配置"><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></Tooltip>
                    </div>
                    
                    <ModelSelect
                      className="w-full mb-6"
                      modelType={ModelTypeEnum.rerank}
                      value={editingKB.retrieval_config?.reranking_model?.reranking_model_name || 'gte-rerank'}
                      onChange={(model, provider) => updateKBSettings({ 
                        retrieval_config: { 
                          reranking_model: { 
                            reranking_provider_name: provider, 
                            reranking_model_name: model 
                          } 
                        } 
                      })}
                      disabled={!editingKB.retrieval_config?.reranking_enable}
                    />
                    
                    <div className="flex items-center gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                          Top K <Tooltip title="返回的文档数量"><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></Tooltip>
                        </div>
                        <div className="flex items-center gap-3">
                          <InputNumber 
                            min={1} 
                            max={20} 
                            value={editingKB.retrieval_config?.top_k || 3}
                            onChange={(v) => updateKBSettings({ retrieval_config: { top_k: v } })}
                            className="w-16"
                          />
                          <Slider 
                            className="flex-1"
                            min={1} 
                            max={20} 
                            value={editingKB.retrieval_config?.top_k || 3}
                            onChange={(v) => updateKBSettings({ retrieval_config: { top_k: v } })}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Switch 
                            size="small" 
                            checked={editingKB.retrieval_config?.score_threshold_enabled}
                            onChange={(v) => updateKBSettings({ retrieval_config: { score_threshold_enabled: v } })}
                          />
                          Score 阈值 <Tooltip title="相似度阈值"><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></Tooltip>
                        </div>
                        <div className="flex items-center gap-3">
                          <InputNumber 
                            min={0} 
                            max={1} 
                            step={0.01}
                            value={editingKB.retrieval_config?.score_threshold || 0.5}
                            onChange={(v) => updateKBSettings({ retrieval_config: { score_threshold: v } })}
                            className="w-16"
                            disabled={!editingKB.retrieval_config?.score_threshold_enabled}
                          />
                          <Slider 
                            className="flex-1"
                            min={0} 
                            max={1} 
                            step={0.01}
                            value={editingKB.retrieval_config?.score_threshold || 0.5}
                            onChange={(v) => updateKBSettings({ retrieval_config: { score_threshold: v } })}
                            disabled={!editingKB.retrieval_config?.score_threshold_enabled}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Text Search Option */}
              <div 
                className={`border rounded-xl transition-colors cursor-pointer ${editingKB.retrieval_config?.search_method === 'keyword' ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => updateKBSettings({ retrieval_config: { search_method: 'keyword' } })}
              >
                <div className={`p-4 ${editingKB.retrieval_config?.search_method === 'keyword' ? 'bg-blue-50/30 rounded-t-xl' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-200">
                      <Database className={`w-4 h-4 ${editingKB.retrieval_config?.search_method === 'keyword' ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">全文检索</div>
                      <div className="text-xs text-gray-500 mt-0.5">索引文档中的所有词汇，从而允许用户查询任意词汇，并返回包含这些词汇的文本片段</div>
                    </div>
                  </div>
                </div>
                
                {editingKB.retrieval_config?.search_method === 'keyword' && (
                  <div className="p-4 pt-0 bg-blue-50/30 rounded-b-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Switch 
                        size="small" 
                        checked={editingKB.retrieval_config?.reranking_enable}
                        onChange={(v) => updateKBSettings({ retrieval_config: { reranking_enable: v } })}
                      />
                      <span className="text-sm font-medium text-gray-900">Rerank 模型</span>
                      <Tooltip title="重排序模型配置"><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></Tooltip>
                    </div>
                    
                    <ModelSelect
                      className="w-full mb-6"
                      modelType={ModelTypeEnum.rerank}
                      value={editingKB.retrieval_config?.reranking_model?.reranking_model_name || 'gte-rerank'}
                      onChange={(model, provider) => updateKBSettings({ 
                        retrieval_config: { 
                          reranking_model: { 
                            reranking_provider_name: provider, 
                            reranking_model_name: model 
                          } 
                        } 
                      })}
                      disabled={!editingKB.retrieval_config?.reranking_enable}
                    />
                    
                    <div className="flex items-center gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                          Top K <Tooltip title="返回的文档数量"><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></Tooltip>
                        </div>
                        <div className="flex items-center gap-3">
                          <InputNumber 
                            min={1} 
                            max={20} 
                            value={editingKB.retrieval_config?.top_k || 3}
                            onChange={(v) => updateKBSettings({ retrieval_config: { top_k: v } })}
                            className="w-16"
                          />
                          <Slider 
                            className="flex-1"
                            min={1} 
                            max={20} 
                            value={editingKB.retrieval_config?.top_k || 3}
                            onChange={(v) => updateKBSettings({ retrieval_config: { top_k: v } })}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Switch 
                            size="small" 
                            checked={editingKB.retrieval_config?.score_threshold_enabled}
                            onChange={(v) => updateKBSettings({ retrieval_config: { score_threshold_enabled: v } })}
                          />
                          Score 阈值 <Tooltip title="相似度阈值"><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></Tooltip>
                        </div>
                        <div className="flex items-center gap-3">
                          <InputNumber 
                            min={0} 
                            max={1} 
                            step={0.01}
                            value={editingKB.retrieval_config?.score_threshold || 0.5}
                            onChange={(v) => updateKBSettings({ retrieval_config: { score_threshold: v } })}
                            className="w-16"
                            disabled={!editingKB.retrieval_config?.score_threshold_enabled}
                          />
                          <Slider 
                            className="flex-1"
                            min={0} 
                            max={1} 
                            step={0.01}
                            value={editingKB.retrieval_config?.score_threshold || 0.5}
                            onChange={(v) => updateKBSettings({ retrieval_config: { score_threshold: v } })}
                            disabled={!editingKB.retrieval_config?.score_threshold_enabled}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hybrid Search Option */}
              <div 
                className={`border rounded-xl transition-colors cursor-pointer ${editingKB.retrieval_config?.search_method === 'hybrid' ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => updateKBSettings({ retrieval_config: { search_method: 'hybrid' } })}
              >
                <div className={`p-4 ${editingKB.retrieval_config?.search_method === 'hybrid' ? 'bg-blue-50/30 rounded-t-xl' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-200">
                      <LayoutGrid className={`w-4 h-4 ${editingKB.retrieval_config?.search_method === 'hybrid' ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm text-gray-900">混合检索</div>
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">推荐</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">同时执行全文检索和向量检索，并应用重排序步骤，从两类查询结果中选择匹配用户问题的最佳结果，用户可以选择设置权重或配置重新排序模型。</div>
                    </div>
                  </div>
                </div>
                
                {editingKB.retrieval_config?.search_method === 'hybrid' && (
                  <div className="p-4 pt-0 bg-blue-50/30 rounded-b-xl">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div 
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${editingKB.retrieval_config?.reranking_mode === 'weighted_score' ? 'border-blue-500 bg-white shadow-sm' : 'border-gray-200 bg-gray-50/50'}`}
                        onClick={(e) => { e.stopPropagation(); updateKBSettings({ retrieval_config: { reranking_mode: 'weighted_score' } }); }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <Layers className={`w-4 h-4 ${editingKB.retrieval_config?.reranking_mode === 'weighted_score' ? 'text-blue-600' : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 mb-1">权重设置</div>
                            <div className="text-xs text-gray-500 leading-relaxed">通过调整分配的权重，重新排序策略确定是优先进行语义匹配还是关键字匹配。</div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${editingKB.retrieval_config?.reranking_mode === 'weighted_score' ? 'border-blue-600' : 'border-gray-300'}`}>
                            {editingKB.retrieval_config?.reranking_mode === 'weighted_score' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                          </div>
                        </div>
                      </div>
                      <div 
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${editingKB.retrieval_config?.reranking_mode === 'reranking_model' ? 'border-blue-500 bg-white shadow-sm' : 'border-gray-200 bg-gray-50/50'}`}
                        onClick={(e) => { e.stopPropagation(); updateKBSettings({ retrieval_config: { reranking_mode: 'reranking_model' } }); }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <SlidersHorizontal className={`w-4 h-4 ${editingKB.retrieval_config?.reranking_mode === 'reranking_model' ? 'text-blue-600' : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 mb-1">Rerank 模型</div>
                            <div className="text-xs text-gray-500 leading-relaxed">重排序模型将根据候选文档列表与用户问题语义匹配度进行重新排序，从而改进语义排序的结果</div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${editingKB.retrieval_config?.reranking_mode === 'reranking_model' ? 'border-blue-600' : 'border-gray-300'}`}>
                            {editingKB.retrieval_config?.reranking_mode === 'reranking_model' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {editingKB.retrieval_config?.reranking_mode === 'weighted_score' && (
                      <div className="mb-6 px-2">
                        <Slider
                          min={0}
                          max={1}
                          step={0.1}
                          value={editingKB.retrieval_config?.weights?.vector_setting?.vector_weight || 0.5}
                          tooltip={{ formatter: null }}
                          trackStyle={{ backgroundColor: '#0ea5e9' }}
                          railStyle={{ backgroundColor: '#10b981' }}
                          handleStyle={{ borderColor: '#e5e7eb', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                          onChange={(v) => updateKBSettings({ 
                            retrieval_config: { 
                              weights: {
                                weight_type: 'customized',
                                vector_setting: { 
                                  vector_weight: v,
                                  embedding_provider_name: editingKB.retrieval_config?.weights?.vector_setting?.embedding_provider_name || '',
                                  embedding_model_name: editingKB.retrieval_config?.weights?.vector_setting?.embedding_model_name || ''
                                },
                                keyword_setting: { keyword_weight: parseFloat((1 - v).toFixed(1)) }
                              }
                            } 
                          })}
                        />
                        <div className="flex items-center justify-between mt-2 text-sm font-medium">
                          <span className="text-sky-500">语义 {editingKB.retrieval_config?.weights?.vector_setting?.vector_weight || 0.5}</span>
                          <span className="text-emerald-500">{editingKB.retrieval_config?.weights?.keyword_setting?.keyword_weight || 0.5} 关键词</span>
                        </div>
                      </div>
                    )}

                    {editingKB.retrieval_config?.reranking_mode === 'reranking_model' && (
                      <ModelSelect
                        className="w-full mb-6"
                        modelType={ModelTypeEnum.rerank}
                        value={editingKB.retrieval_config?.reranking_model?.reranking_model_name || 'gte-rerank'}
                        onChange={(model, provider) => updateKBSettings({ 
                          retrieval_config: { 
                            reranking_model: { 
                              reranking_provider_name: provider, 
                              reranking_model_name: model 
                            } 
                          } 
                        })}
                      />
                    )}
                    
                    <div className="flex items-center gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                          Top K <Tooltip title="返回的文档数量"><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></Tooltip>
                        </div>
                        <div className="flex items-center gap-3">
                          <InputNumber 
                            min={1} 
                            max={20} 
                            value={editingKB.retrieval_config?.top_k || 3}
                            onChange={(v) => updateKBSettings({ retrieval_config: { top_k: v } })}
                            className="w-16"
                          />
                          <Slider 
                            className="flex-1"
                            min={1} 
                            max={20} 
                            value={editingKB.retrieval_config?.top_k || 3}
                            onChange={(v) => updateKBSettings({ retrieval_config: { top_k: v } })}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Switch 
                            size="small" 
                            checked={editingKB.retrieval_config?.score_threshold_enabled}
                            onChange={(v) => updateKBSettings({ retrieval_config: { score_threshold_enabled: v } })}
                          />
                          Score 阈值 <Tooltip title="相似度阈值"><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></Tooltip>
                        </div>
                        <div className="flex items-center gap-3">
                          <InputNumber 
                            min={0} 
                            max={1} 
                            step={0.01}
                            value={editingKB.retrieval_config?.score_threshold || 0.5}
                            onChange={(v) => updateKBSettings({ retrieval_config: { score_threshold: v } })}
                            className="w-16"
                            disabled={!editingKB.retrieval_config?.score_threshold_enabled}
                          />
                          <Slider 
                            className="flex-1"
                            min={0} 
                            max={1} 
                            step={0.01}
                            value={editingKB.retrieval_config?.score_threshold || 0.5}
                            onChange={(v) => updateKBSettings({ retrieval_config: { score_threshold: v } })}
                            disabled={!editingKB.retrieval_config?.score_threshold_enabled}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        title={
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b border-blue-100">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">召回设置</div>
              <div className="text-xs text-gray-500 font-normal">默认使用多路召回，通过检索与重排序优化结果。</div>
            </div>
          </div>
        }
        open={isRecallSettingsModalOpen}
        onCancel={() => setIsRecallSettingsModalOpen(false)}
        footer={
          <div className="flex justify-end gap-3 p-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
            <Button onClick={() => setIsRecallSettingsModalOpen(false)} className="rounded-lg">取消</Button>
            <Button type="primary" onClick={() => {
              if (editingKB) {
                const updatedRetrievalConfig = {
                  ...editingKB.retrieval_config,
                  reranking_mode: rerankingMode,
                  reranking_model: {
                    reranking_provider_name: rerankingModel.provider,
                    reranking_model_name: rerankingModel.model
                  },
                  weights: {
                    vector_setting: {
                      vector_weight: vectorWeight,
                      embedding_provider_name: 'default', // Assuming default for now
                      embedding_model_name: 'default'
                    },
                    keyword_setting: {
                      keyword_weight: 1 - vectorWeight
                    }
                  },
                  top_k: topK,
                  score_threshold_enabled: scoreThresholdEnabled,
                  score_threshold: scoreThreshold
                };
                setEditingKB({
                  ...editingKB,
                  retrieval_config: updatedRetrievalConfig
                });
              }
              setIsRecallSettingsModalOpen(false);
            }} className="rounded-lg bg-blue-600 hover:bg-blue-700">保存设置</Button>
          </div>
        }
        width={600}
        centered
        styles={{ header: { padding: 0 }, body: { padding: '24px' } }}
      >
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
              RERANK 模式
            </div>
            <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200">
              <Button 
                type={rerankingMode === RerankingModeEnum.WeightedScore ? 'primary' : 'text'}
                className={`flex-1 h-10 rounded-lg transition-all ${rerankingMode === RerankingModeEnum.WeightedScore ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-gray-600'}`}
                onClick={() => setRerankingMode(RerankingModeEnum.WeightedScore)}
              >
                权重设置
              </Button>
              <Button 
                type={rerankingMode === RerankingModeEnum.RerankingModel ? 'primary' : 'text'}
                className={`flex-1 h-10 rounded-lg transition-all ${rerankingMode === RerankingModeEnum.RerankingModel ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-gray-600'}`}
                onClick={() => setRerankingMode(RerankingModeEnum.RerankingModel)}
              >
                Rerank 模型
              </Button>
            </div>
          </div>

          {rerankingMode === RerankingModeEnum.WeightedScore ? (
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 space-y-4">
              <div className="flex items-center justify-between text-sm font-bold text-gray-800">
                <span>语义匹配</span>
                <span>关键词匹配</span>
              </div>
              <Slider 
                min={0} 
                max={1} 
                step={0.1} 
                value={vectorWeight} 
                onChange={setVectorWeight}
                trackStyle={{ background: 'linear-gradient(90deg, #2563eb, #4f46e5)' }}
                handleStyle={{ borderColor: '#2563eb', backgroundColor: '#fff' }}
              />
              <div className="flex items-center justify-between text-xs font-mono font-bold text-blue-700">
                <span>{vectorWeight.toFixed(1)}</span>
                <span>{(1 - vectorWeight).toFixed(1)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-bold text-gray-900">选择 Rerank 模型</div>
              <ModelSelect
                className="w-full h-12 rounded-xl border-gray-200"
                modelType={ModelTypeEnum.rerank}
                value={rerankingModel.model}
                onChange={(model, provider) => setRerankingModel({ provider, model })}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-sm font-bold text-gray-900">Top K</div>
              <div className="flex items-center gap-3">
                <InputNumber 
                  min={1} 
                  max={20} 
                  value={topK} 
                  onChange={(v) => setTopK(v || 4)} 
                  className="w-20 h-10 rounded-lg"
                />
                <Slider 
                  className="flex-1"
                  min={1} 
                  max={20} 
                  value={topK} 
                  onChange={(v) => setTopK(v)} 
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-gray-900">Score 阈值</div>
                <Switch 
                  checked={scoreThresholdEnabled} 
                  onChange={setScoreThresholdEnabled} 
                  size="small"
                  className={scoreThresholdEnabled ? 'bg-green-500' : ''}
                />
              </div>
              <div className="flex items-center gap-3">
                <InputNumber 
                  min={0} 
                  max={1} 
                  step={0.01} 
                  value={scoreThreshold} 
                  onChange={(v) => setScoreThreshold(v || 0.5)} 
                  className="w-20 h-10 rounded-lg"
                  disabled={!scoreThresholdEnabled}
                />
                <Slider 
                  className="flex-1"
                  min={0} 
                  max={1} 
                  step={0.01} 
                  value={scoreThreshold} 
                  onChange={setScoreThreshold} 
                  disabled={!scoreThresholdEnabled}
                  trackStyle={{ backgroundColor: scoreThresholdEnabled ? '#22c55e' : '#d1d5db' }}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <VariableEditModal 
        isOpen={isVariableModalOpen} 
        onClose={() => setIsVariableModalOpen(false)} 
        variable={editingVariable}
        onSave={(updatedVar) => {
          const existingIndex = variables.findIndex(v => v.id === updatedVar.id);
          if (existingIndex >= 0) {
            const newVars = [...variables];
            newVars[existingIndex] = updatedVar;
            setVariables(newVars);
            message.success('变量已更新');
          } else {
            setVariables([...variables, updatedVar]);
            message.success('变量已添加');
            // Set default value if it exists
            if (updatedVar.default !== undefined) {
              setVariableValues(prev => ({ ...prev, [updatedVar.id]: updatedVar.default }));
            }
          }
          setIsVariableModalOpen(false);
        }}
      />

      <EmbedModal 
        isOpen={isEmbedModalOpen} 
        onClose={() => setIsEmbedModalOpen(false)} 
        publicUrl={publicUrl} 
      />

      <ToolSettingDrawer />
      <ToolAuthDrawer 
        isOpen={isAuthDrawerOpen}
        onClose={() => setIsAuthDrawerOpen(false)}
        tool={selectedToolForAuth}
        toolDetail={toolDetailForAuth}
        onAuthorize={handleAuthorize}
        onEdit={handleEditTool}
      />

      <LogDetailModal
        visible={logModalVisible}
        onClose={() => setLogModalVisible(false)}
        currentLogMsg={currentLogMsg}
      />
    </div>
  );
};

const FeaturesDrawer = ({ 
  isOpen, 
  onClose, 
  enabledFeatures, 
  setEnabledFeatures,
  openingStatement,
  setOpeningStatement,
  suggestedQuestions,
  setSuggestedQuestions
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  enabledFeatures: Record<string, boolean>;
  setEnabledFeatures: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  openingStatement: string;
  setOpeningStatement: (val: string) => void;
  suggestedQuestions: string[];
  setSuggestedQuestions: (val: string[]) => void;
}) => {
  return (
    <Drawer title="功能" open={isOpen} onClose={onClose} size="default">
      <div className="text-sm text-gray-500 mb-4">增强 web app 用户体验</div>
      <div className="space-y-4">
        {features.map(f => (
          <div key={f.id} className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className={`w-10 h-10 rounded-lg ${f.color} flex items-center justify-center text-white shrink-0`}>
                <f.icon className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <div className="font-bold text-gray-900">{f.name}</div>
                <div className="text-xs text-gray-500">{f.desc}</div>
              </div>
              <Switch 
                size="small" 
                checked={enabledFeatures[f.id]}
                onChange={(checked) => setEnabledFeatures(prev => ({ ...prev, [f.id]: checked }))}
              />
            </div>
            
            {f.id === 'opening' && enabledFeatures.opening && (
              <div className="ml-13 space-y-3">
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-gray-700">开场白内容</div>
                  <TextArea 
                    rows={3} 
                    placeholder="输入开场白内容..." 
                    value={openingStatement}
                    onChange={(e) => setOpeningStatement(e.target.value)}
                    className="text-xs rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-gray-700">推荐问题</div>
                  <div className="space-y-2">
                    {suggestedQuestions.map((q, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input 
                          size="small" 
                          value={q}
                          onChange={(e) => {
                            const newQs = [...suggestedQuestions];
                            newQs[idx] = e.target.value;
                            setSuggestedQuestions(newQs);
                          }}
                          className="text-xs rounded-md"
                        />
                        <Trash2 
                          className="w-3.5 h-3.5 text-gray-300 hover:text-red-500 cursor-pointer" 
                          onClick={() => setSuggestedQuestions(suggestedQuestions.filter((_, i) => i !== idx))}
                        />
                      </div>
                    ))}
                    <Button 
                      type="dashed" 
                      size="small" 
                      block 
                      icon={<Plus className="w-3 h-3" />}
                      className="text-[10px]"
                      onClick={() => setSuggestedQuestions([...suggestedQuestions, ''])}
                    >
                      添加推荐问题
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Drawer>
  );
};

export default AppConfig;
