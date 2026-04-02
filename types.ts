
import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
  Viewport,
  XYPosition
} from 'reactflow'

export enum TransferMethod {
  all = 'all',
  local_file = 'local_file',
  remote_url = 'remote_url',
}

export type VisionFile = {
  id?: string
  type: string
  transfer_method: TransferMethod
  url: string
  upload_file_id: string
  belongs_to?: string
}
type Edge = any
type Node = any
type Metadata = any

export type Tag = {
  id: string
  name: string
  type: string
  binding_count: number
}

export interface Role {
  role_id: string;
  role_name: string;
}

export interface Department {
  dept_id: string;
  dept_name: string;
}

export interface Member {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
  real_name: string;
  last_login_at: string | null;
  last_active_at: string;
  created_at: string;
  role: string;
  status: string;
}

export type AppType = '全部' | '对话应用' | '智能体应用' | '工作流应用' | '定制应用' | '内置应用';

export interface MenuItem {
  name: string;
  path: string;
}

export interface AppCategory {
  id: string;
  category: string;
}

export type AppIconType = 'icon' | 'image' | 'sys-icon';

export interface AppItem {
  id: string;
  itemId?: string; // For custom apps, the outer item ID
  name: string;
  type: string;
  typeLabel: string;
  description: string;
  icon: string; // Lucide icon name OR base64/URL image string OR sys-icon ID
  iconType: AppIconType;
  icon_url?: string | null; // URL for image type
  tags: Tag[];
  iconBgColor?: string; // Tailwind class for background color
  category?: string;
  appUrl?: string;
  needToken?: boolean;
  loginUrl?: string;
  authUrl?: string;
  account?: string;
  password?: string;
  customMenu?: boolean;
  menuItems?: MenuItem[];
  mode?: AppMode;
  builtIn?: boolean;
  config?: any;
}

export type AppBasicInfo = {
  id: string
  mode: AppMode
  icon_type: string | null
  icon: string
  icon_background: string
  icon_url: string
  name: string
  description: string
  use_icon_as_answer_icon: boolean
}

export type ExploreApp = {
  app: AppBasicInfo
  app_id: string
  description: string
  copyright: string
  privacy_policy: string | null
  custom_disclaimer: string | null
  category: string  //AppCategory的id
  position: number
  is_listed: boolean
  install_count: number
  installed: boolean
  editable: boolean
  is_agent: boolean,
  label_type?: string,
  label_name?: string,
}

export type InstalledApp = {
  app: AppBasicInfo
  id: string
  uninstallable: boolean
  is_pinned: boolean
}

export interface NavTab {
  id: string;
  label: string;
}

export interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  app_id: string | null;
  app_name: string;
  tenant_id?: string;
  api_endpoint: string;
  method: string;
  request_body: any;
  status: 'active' | 'inactive';
  schedule_type: 'date' | 'interval' | 'cron';
  schedule_expression: string;
  created_at: string;
  updated_at: string;
  last_executed_at: string | null;
  appType?: 'internal' | 'external'; // Optional as it's not in the official doc but used in UI logic
}

export interface TaskLog {
  id: string;
  task_id: string;
  start_time: string;
  end_time: string;
  status: 'success' | 'failed' | 'running';
  result?: string;
  error_message?: string;
}

export type Label = {
  name: string
  icon: string
  label: TypeWithI18N
}

export interface ToolItem {
  id: string;
  author: string;
  name: string;
  description: {
    zh_Hans: string;
    en_US: string;
    pt_BR: string;
    ja_JP: string;
  };
  icon: string | { content: string; background: string };
  label: {
    zh_Hans: string;
    en_US: string;
    pt_BR: string;
    ja_JP: string;
  };
  type: 'builtin' | 'api' | 'workflow';
  team_credentials?: any;
  is_team_authorization: boolean;
  allow_delete: boolean;
  tools: any[];
  labels: string[];
  workflow_app_id?: string;
  is_authed?: boolean;
}

export interface ToolDetail {
  author: string;
  name: string;
  label: {
    en_US: string;
    zh_Hans: string;
    pt_BR: string;
    ja_JP: string;
  };
  description: {
    en_US: string;
    zh_Hans: string;
    pt_BR: string;
    ja_JP: string;
  };
  parameters: ToolParameter[];
  labels?: string[];
}

export interface ToolParameter {
  name: string;
  label: {
    en_US: string;
    zh_Hans: string;
    pt_BR: string;
    ja_JP: string;
  };
  human_description: {
    en_US: string;
    zh_Hans: string;
    pt_BR: string;
    ja_JP: string;
  };
  placeholder: string | null;
  type: string;
  form: string;
  llm_description: string | null;
  required: boolean;
  default: any;
  min: number | null;
  max: number | null;
  options: ToolParameterOption[] | null;
}

export interface ToolParameterOption {
  value: string;
  label: {
    en_US: string;
    zh_Hans: string;
    pt_BR: string;
    ja_JP: string;
  };
}

export interface CredentialSchemaItem {
  name: string;
  type: 'secret-input' | 'text-input' | 'select';
  required: boolean;
  default: any;
  options: any;
  label: {
    en_US: string;
    zh_Hans: string;
    pt_BR: string;
    ja_JP: string;
  };
  help?: {
    en_US: string;
    zh_Hans: string;
    pt_BR: string;
    ja_JP: string;
  };
  url?: string;
  placeholder?: {
    en_US: string;
    zh_Hans: string;
    pt_BR: string;
    ja_JP: string;
  };
}

export type CredentialData = Record<string, string>;

// --- New App Development Types ---

export type AppMode = 'chat' | 'agent-chat' | 'workflow' | 'completion' | 'custom' | 'advanced-chat';

export type App = {
  /** App ID */
  id: string
  /** Name */
  name: string
  /** Description */
  description: string

  /**
   * Icon Type
   * @default 'emoji'
  */
  icon_type: AppIconType | null
  /** Icon, stores file ID if icon_type is 'image' */
  icon: string
  /** Icon Background, only available when icon_type is null or 'emoji' */
  icon_background: string | null
  /** Icon URL, only available when icon_type is 'image' */
  icon_url: string | null
  /** Whether to use app icon as answer icon */
  use_icon_as_answer_icon: boolean

  /** Mode */
  mode: AppMode
  /** Enable web app */
  enable_site: boolean
  /** Enable web API */
  enable_api: boolean
  built_in: boolean
  /** API requests per minute, default is 60 */
  api_rpm: number
  /** API requests per hour, default is 3600 */
  api_rph: number
  /** Whether it's a demo app */
  is_demo: boolean
  /** Model configuration */
  model_config: ModelConfig
  app_model_config: ModelConfig
  /** Timestamp of creation */
  created_at: number
  /** Web Application Configuration */
  site: SiteConfig
  /** api site url */
  api_base_url: string
  tags: Tag[]
  workflow?: {
    id: string
    created_at: number
    created_by?: string
    updated_at: number
    updated_by?: string
  }
}

export enum PromptMode {
  simple = 'simple',
  advanced = 'advanced',
}
export type TextTypeFormItem = {
  default: string
  label: string
  variable: string
  required: boolean
  max_length: number
}

export type SelectTypeFormItem = {
  default: string
  label: string
  variable: string
  required: boolean
  options: string[]
}
export type UserInputFormItem = {
  'text-input': TextTypeFormItem
} | {
  'select': SelectTypeFormItem
} | {
  'paragraph': TextTypeFormItem
}
export enum TtsAutoPlay {
  enabled = 'enabled',
  disabled = 'disabled',
}
export type AnnotationReplyConfig = {
  id: string
  enabled: boolean
  score_threshold: number
  embedding_model: {
    embedding_provider_name: string
    embedding_model_name: string
  }
}
export enum AgentStrategy {
  functionCall = 'function_call',
  react = 'react',
}
export enum RETRIEVE_TYPE {
  oneWay = 'single',
  multiWay = 'multiple',
}
export enum LogicalOperator {
  and = 'and',
  or = 'or',
}
export enum ComparisonOperator {
  contains = 'contains',
  notContains = 'not contains',
  startWith = 'start with',
  endWith = 'end with',
  is = 'is',
  isNot = 'is not',
  empty = 'empty',
  notEmpty = 'not empty',
  equal = '=',
  notEqual = '≠',
  largerThan = '>',
  lessThan = '<',
  largerThanOrEqual = '≥',
  lessThanOrEqual = '≤',
  isNull = 'is null',
  isNotNull = 'is not null',
  in = 'in',
  notIn = 'not in',
  allOf = 'all of',
  exists = 'exists',
  notExists = 'not exists',
  before = 'before',
  after = 'after',
}
export type MetadataFilteringCondition = {
  id: string
  name: string
  comparison_operator: ComparisonOperator
  value?: string | number
}
export type MetadataFilteringConditions = {
  logical_operator: LogicalOperator
  conditions: MetadataFilteringCondition[]
}
export type NodeModelConfig = {
  provider: string
  name: string
  mode: string
  completion_params: Record<string, any>
}

export type DatasetConfigs = {
  retrieval_model: RETRIEVE_TYPE
  reranking_model: {
    reranking_provider_name: string
    reranking_model_name: string
  }
  top_k: number
  score_threshold_enabled: boolean
  score_threshold: number | null | undefined
  datasets: {
    datasets: {
      enabled: boolean
      id: string
    }[]
  }
  reranking_mode?: RerankingModeEnum
  weights?: {
    vector_setting: {
      vector_weight: number
      embedding_provider_name: string
      embedding_model_name: string
    }
    keyword_setting: {
      keyword_weight: number
    }
  }
  reranking_enable?: boolean
  metadata_filtering_mode?: MetadataFilteringModeEnum
  metadata_filtering_conditions?: MetadataFilteringConditions
  metadata_model_config?: NodeModelConfig
}
export enum Resolution {
  low = 'low',
  high = 'high',
}
export type VisionSettings = {
  enabled: boolean
  number_limits: number
  detail: Resolution
  transfer_methods: TransferMethod[]
  image_file_size_limit?: number | string
}
export enum SupportUploadFileTypes {
  image = 'image',
  document = 'document',
  audio = 'audio',
  video = 'video',
  custom = 'custom',
}
export type UploadFileSetting = {
  allowed_file_upload_methods: TransferMethod[]
  allowed_file_types: SupportUploadFileTypes[]
  allowed_file_extensions?: string[]
  max_length: number
  number_limits?: number
}
/**
 * 补全参数常量
 */
export const CompletionParams = ['temperature', 'top_p', 'presence_penalty', 'max_token', 'stop', 'frequency_penalty'] as const

export type ModelConfig = {
  opening_statement: string
  suggested_questions?: string[]
  pre_prompt: string
  prompt_type: PromptMode
  chat_prompt_config: ChatPromptConfig | {}
  completion_prompt_config: CompletionPromptConfig | {}
  user_input_form: UserInputFormItem[]
  dataset_query_variable?: string
  more_like_this: {
    enabled?: boolean
  }
  suggested_questions_after_answer: {
    enabled: boolean
  }
  speech_to_text: {
    enabled: boolean
  }
  text_to_speech: {
    enabled: boolean
    voice?: string
    language?: string
    autoPlay?: TtsAutoPlay
  }
  retriever_resource: {
    enabled: boolean
  }
  sensitive_word_avoidance: {
    enabled: boolean
  }
  annotation_reply?: AnnotationReplyConfig
  agent_mode: {
    enabled: boolean
    strategy?: AgentStrategy
    tools: ToolItem[]
  }
  model: {
    provider: string
    name: string
    mode: ModelModeType
    completion_params: Record<string, any>
  }
  dataset_configs: DatasetConfigs
  file_upload?: {
    image: VisionSettings
  } & UploadFileSetting
  files?: VisionFile[]
  created_at?: number
  updated_at?: number
}

export type PromptVariable = {
  key: string
  name: string
  description: string
  type: string | number
  default: string
  options: string[]
}

export type CompletionParam = {
  max_tokens: number
  temperature: number
  top_p: number
  echo: boolean
  stop: string[]
  presence_penalty: number
  frequency_penalty: number
}

export type SiteConfig = {
  access_token: string
  title: string
  author: string
  support_email: string
  default_language: string
  customize_domain: string
  theme: string
  customize_token_strategy: 'must' | 'allow' | 'not_allow'
  prompt_public: boolean
  copyright?: string
  privacy_policy?: string
  custom_disclaimer?: string
}

export enum DSLImportMode {
  YAML_CONTENT = 'yaml-content',
  YAML_URL = 'yaml-url',
}

export enum DSLImportStatus {
  COMPLETED = 'completed',
  COMPLETED_WITH_WARNINGS = 'completed-with-warnings',
  PENDING = 'pending',
  FAILED = 'failed',
}

export type AppListResponse = {
  data: App[]
  has_more: boolean
  limit: number
  page: number
  total: number
}

export type AppDetailResponse = App;

export type DSLImportResponse = {
  id: string
  status: DSLImportStatus
  app_id?: string
  current_dsl_version?: string
  imported_dsl_version?: string
  error: string
}

export interface AppSSO {
  enable_sso: boolean;
}

export type AppSSOResponse = { enabled: AppSSO['enable_sso'] }

export interface AppTemplate {
  name: string;
  description: string;
  mode: AppMode;
  model_config: ModelConfig;
}

export type AppTemplatesResponse = {
  data: AppTemplate[]
}

export type CreateAppResponse = App

export type UpdateAppSiteCodeResponse = { app_id: string } & SiteConfig

export type AppDailyMessagesResponse = {
  data: Array<{ date: string; message_count: number }>
}

export type AppDailyConversationsResponse = {
  data: Array<{ date: string; conversation_count: number }>
}

export type WorkflowDailyConversationsResponse = {
  data: Array<{ date: string; runs: number }>
}

export type AppStatisticsResponse = {
  data: Array<{ date: string;[key: string]: any }>
}

export type AppDailyEndUsersResponse = {
  data: Array<{ date: string; terminal_count: number }>
}

export type AppTokenCostsResponse = {
  data: Array<{ date: string; token_count: number; total_price: number; currency: string }>
}

export type UpdateModelConfigResponse = { result: string }
export type UpdateAppModelConfigResponse = { result: string }

export type ApiKeyItemResponse = {
  id: string
  token: string
  last_used_at: string
  created_at: string
}

export type ApiKeysListResponse = {
  data: ApiKeyItemResponse[]
}

export type CreateApiKeyResponse = {
  id: string
  token: string
  created_at: string
}

export type ValidateOpenAIKeyResponse = {
  result: string
  error?: string
}

export type UpdateOpenAIKeyResponse = ValidateOpenAIKeyResponse

export type GenerationIntroductionResponse = {
  introduction: string
}

export type AppVoicesListResponse = [{
  name: string
  value: string
}]

// Placeholders for missing types
export enum TracingProvider {
  langSmith = 'langsmith',
  langfuse = 'langfuse',
}

export type LangSmithConfig = {
  api_key: string
  project: string
  endpoint: string
}

export type LangFuseConfig = {
  public_key: string
  secret_key: string
  host: string
}


export type TracingStatus = {
  enabled: boolean
  tracing_provider: TracingProvider | null
}

export type TracingConfig = {
  tracing_provider: TracingProvider
  tracing_config: LangSmithConfig | LangFuseConfig
}


// --- Annotation Types ---

export type AnnotationItemBasic = {
  message_id?: string
  question: string
  answer: string
}

export type AnnotationItem = {
  id: string
  question: string
  answer: string
  created_at: number
  hit_count: number
}

export type HitHistoryItem = {
  id: string
  question: string
  match: string
  response: string
  source: string
  score: number
  created_at: number
}

export type EmbeddingModelConfig = {
  embedding_provider_name: string
  embedding_model_name: string
}

export enum AnnotationEnableStatus {
  enable = 'enable',
  disable = 'disable',
}

export enum JobStatus {
  waiting = 'waiting',
  processing = 'processing',
  completed = 'completed',
}

export type AnnotationSetting = {
  id: string
  score_threshold: number
  embedding_model: EmbeddingModelConfig
}

export type AnnotationJobResponse = {
  job_id: string
  job_status: JobStatus
}

export type FormValue = Record<string, any>

export type TypeWithI18N<T = string> = {
  en_US: T
  zh_Hans: T
  [key: string]: T
}

export enum VarType {
  string = 'string',
  number = 'number',
  integer = 'integer',
  secret = 'secret',
  boolean = 'boolean',
  object = 'object',
  file = 'file',
  array = 'array',
  arrayString = 'array[string]',
  arrayNumber = 'array[number]',
  arrayObject = 'array[object]',
  arrayBoolean = 'array[boolean]',
  arrayFile = 'array[file]',
  any = 'any',
  arrayAny = 'array[any]',
}

export enum FormTypeEnum {
  textInput = 'text-input',
  textNumber = 'number-input',
  secretInput = 'secret-input',
  select = 'select',
  radio = 'radio',
  boolean = 'boolean',
  files = 'files',
  file = 'file',
  modelSelector = 'model-selector',
  toolSelector = 'tool-selector',
  multiToolSelector = 'array[tools]',
  appSelector = 'app-selector',
}

export type FormOption = {
  label: TypeWithI18N
  value: string
  show_on: FormShowOnObject[]
}

export enum ModelTypeEnum {
  textGeneration = 'llm',
  textEmbedding = 'text-embedding',
  rerank = 'rerank',
  speech2text = 'speech2text',
  moderation = 'moderation',
  tts = 'tts',
}

export const MODEL_TYPE_TEXT = {
  [ModelTypeEnum.textGeneration]: 'LLM',
  [ModelTypeEnum.textEmbedding]: 'Text Embedding',
  [ModelTypeEnum.rerank]: 'Rerank',
  [ModelTypeEnum.speech2text]: 'Speech2text',
  [ModelTypeEnum.moderation]: 'Moderation',
  [ModelTypeEnum.tts]: 'TTS',
}

export enum ConfigurationMethodEnum {
  predefinedModel = 'predefined-model',
  customizableModel = 'customizable-model',
  fetchFromRemote = 'fetch-from-remote',
}

export enum ModelFeatureEnum {
  toolCall = 'tool-call',
  multiToolCall = 'multi-tool-call',
  agentThought = 'agent-thought',
  vision = 'vision',
  video = 'video',
  document = 'document',
  audio = 'audio',
}

export enum ModelFeatureTextEnum {
  toolCall = 'Tool Call',
  multiToolCall = 'Multi Tool Call',
  agentThought = 'Agent Thought',
  vision = 'Vision',
  video = 'Video',
  document = 'Document',
  audio = 'Audio',
}

export enum ModelStatusEnum {
  active = 'active',
  noConfigure = 'no-configure',
  quotaExceeded = 'quota-exceeded',
  noPermission = 'no-permission',
  disabled = 'disabled',
}

export const MODEL_STATUS_TEXT: { [k: string]: TypeWithI18N } = {
  'no-configure': {
    en_US: 'No Configure',
    zh_Hans: '未配置凭据',
  },
  'quota-exceeded': {
    en_US: 'Quota Exceeded',
    zh_Hans: '额度不足',
  },
  'no-permission': {
    en_US: 'No Permission',
    zh_Hans: '无使用权限',
  },
}

export enum CustomConfigurationStatusEnum {
  active = 'active',
  noConfigure = 'no-configure',
}

export type FormShowOnObject = {
  variable: string
  value: string
}

export type CredentialFormSchemaBase = {
  variable: string
  label: TypeWithI18N
  type: FormTypeEnum
  required: boolean
  default?: string
  tooltip?: TypeWithI18N
  show_on: FormShowOnObject[]
  url?: string
  scope?: string
}

export type CredentialFormSchemaTextInput = CredentialFormSchemaBase & {
  max_length?: number;
  placeholder?: TypeWithI18N,
  template?: {
    enabled: boolean
  },
  auto_generate?: {
    type: string
  }
}
export type CredentialFormSchemaNumberInput = CredentialFormSchemaBase & { min?: number; max?: number; placeholder?: TypeWithI18N }
export type CredentialFormSchemaSelect = CredentialFormSchemaBase & { options: FormOption[]; placeholder?: TypeWithI18N }
export type CredentialFormSchemaRadio = CredentialFormSchemaBase & { options: FormOption[] }
export type CredentialFormSchemaSecretInput = CredentialFormSchemaBase & { placeholder?: TypeWithI18N }
export type CredentialFormSchema = CredentialFormSchemaTextInput | CredentialFormSchemaSelect | CredentialFormSchemaRadio | CredentialFormSchemaSecretInput

export type ModelItem = {
  model: string
  label: TypeWithI18N
  model_type: ModelTypeEnum
  features?: ModelFeatureEnum[]
  fetch_from: ConfigurationMethodEnum
  status: ModelStatusEnum
  model_properties: Record<string, string | number>
  load_balancing_enabled: boolean
  deprecated?: boolean
}

export enum PreferredProviderTypeEnum {
  system = 'system',
  custom = 'custom',
}

export enum CurrentSystemQuotaTypeEnum {
  trial = 'trial',
  free = 'free',
  paid = 'paid',
}

export enum QuotaUnitEnum {
  times = 'times',
  tokens = 'tokens',
  credits = 'credits',
}

export type QuotaConfiguration = {
  quota_type: CurrentSystemQuotaTypeEnum
  quota_unit: QuotaUnitEnum
  quota_limit: number
  quota_used: number
  last_used: number
  is_valid: boolean
}

export type ModelProvider = {
  provider: string
  label: TypeWithI18N
  description?: TypeWithI18N
  help: {
    title: TypeWithI18N
    url: TypeWithI18N
  }
  icon_small: TypeWithI18N
  icon_large: TypeWithI18N
  background?: string
  supported_model_types: ModelTypeEnum[]
  configurate_methods: ConfigurationMethodEnum[]
  provider_credential_schema: {
    credential_form_schemas: CredentialFormSchema[]
  }
  model_credential_schema: {
    model: {
      label: TypeWithI18N
      placeholder: TypeWithI18N
    }
    credential_form_schemas: CredentialFormSchema[]
  }
  preferred_provider_type: PreferredProviderTypeEnum
  custom_configuration: {
    status: CustomConfigurationStatusEnum
  }
  system_configuration: {
    enabled: boolean
    current_quota_type: CurrentSystemQuotaTypeEnum
    quota_configurations: QuotaConfiguration[]
  }
}

export type Model = {
  provider: string
  icon_large: TypeWithI18N
  icon_small: TypeWithI18N
  label: TypeWithI18N
  models: ModelItem[]
  status: ModelStatusEnum
}

export type DefaultModelResponse = {
  model: string
  model_type: ModelTypeEnum
  provider: {
    provider: string
    icon_large: TypeWithI18N
    icon_small: TypeWithI18N
  }
}

export enum IndexingType {
  QUALIFIED = 'high_quality',
  ECONOMICAL = 'economy',
}
export enum RETRIEVE_METHOD {
  semantic = 'semantic_search',
  fullText = 'full_text_search',
  hybrid = 'hybrid_search',
  invertedIndex = 'invertedIndex',
  keywordSearch = 'keyword_search',
}
export enum RerankingModeEnum {
  RerankingModel = 'reranking_model',
  WeightedScore = 'weighted_score',
}
export enum WeightedScoreEnum {
  SemanticFirst = 'semantic_first',
  KeywordFirst = 'keyword_first',
  Customized = 'customized',
}
export type RetrievalConfig = {
  search_method: RETRIEVE_METHOD
  reranking_enable: boolean
  reranking_model: {
    reranking_provider_name: string
    reranking_model_name: string
  }
  top_k: number
  score_threshold_enabled: boolean
  score_threshold: number
  reranking_mode?: RerankingModeEnum
  weights?: {
    weight_type: WeightedScoreEnum
    vector_setting: {
      vector_weight: number
      embedding_provider_name: string
      embedding_model_name: string
    }
    keyword_setting: {
      keyword_weight: number
    }
  }
}
export enum MetadataFilteringVariableType {
  string = 'string',
  number = 'number',
  time = 'time',
}
export type MetadataInDoc = {
  value: string
  id: string
  type: MetadataFilteringVariableType
  name: string
}
export type Fetcher<T, P> = (params: P) => Promise<T>

export enum DataSourceType {
  FILE = 'upload_file',
  NOTION = 'notion_import',
  WEB = 'website_crawl',
}

export enum DatasetPermission {
  onlyMe = 'only_me',
  allTeamMembers = 'all_team_members',
  partialMembers = 'partial_members',
}

export enum ChunkingMode {
  text = 'text_model', // General text
  qa = 'qa_model', // General QA
  parentChild = 'hierarchical_model', // Parent-Child
}

export enum MetadataFilteringModeEnum {
  disabled = 'disabled',
  automatic = 'automatic',
  manual = 'manual',
}

export type DataSet = {
  graph_id?: string
  id: string
  name: string
  icon: string
  icon_background: string
  description: string
  permission: DatasetPermission
  data_source_type: DataSourceType
  indexing_technique: IndexingType
  created_by: string
  updated_by: string
  updated_at: number
  app_count: number
  doc_form: ChunkingMode
  document_count: number
  word_count: number
  provider: string
  favorite?: string
  embedding_model: string
  embedding_model_provider: string
  embedding_available: boolean
  retrieval_model_dict: RetrievalConfig
  retrieval_model: RetrievalConfig
  tags: Tag[]
  partial_member_list?: { user_id: string; role: string }[]
  external_knowledge_info: {
    external_knowledge_id: string
    external_knowledge_api_id: string
    external_knowledge_api_name: string
    external_knowledge_api_endpoint: string
  }
  external_retrieval_model: {
    top_k: number
    score_threshold: number
    score_threshold_enabled: boolean
  }
  built_in_field_enabled: boolean
  doc_metadata?: MetadataInDoc[]
}


export type DataSetListResponse = {
  data: DataSet[]
  has_more: boolean
  limit: number
  page: number
  total: number
}

export type DefaultModel = {
  provider: string
  model: string
}

export type IterationDurationMap = Record<string, number>
export type LoopDurationMap = Record<string, number>
export type LoopVariableMap = Record<string, any>

export enum BlockEnum {
  Start = 'start',
  End = 'end',
  Answer = 'answer',
  LLM = 'llm',
  KnowledgeRetrieval = 'knowledge-retrieval',
  QuestionClassifier = 'question-classifier',
  IfElse = 'if-else',
  Code = 'code',
  TemplateTransform = 'template-transform',
  HttpRequest = 'http-request',
  VariableAssigner = 'variable-assigner',
  VariableAggregator = 'variable-aggregator',
  Tool = 'tool',
  ParameterExtractor = 'parameter-extractor',
  Iteration = 'iteration',
  DocExtractor = 'document-extractor',
  ListFilter = 'list-operator',
  IterationStart = 'iteration-start',
  Assigner = 'assigner', // is now named as VariableAssigner
  Agent = 'agent',
  Loop = 'loop',
  LoopStart = 'loop-start',
  LoopEnd = 'loop-end',
  DataSource = 'datasource',
  DataSourceEmpty = 'datasource-empty',
  KnowledgeBase = 'knowledge-index',
  TriggerSchedule = 'trigger-schedule',
  TriggerWebhook = 'trigger-webhook',
  TriggerPlugin = 'trigger-plugin',
}

export type AgentLogItem = {
  node_execution_id: string
  message_id: string
  node_id: string
  parent_id?: string
  label: string
  data: object // debug data
  error?: string
  status: string
  metadata?: {
    elapsed_time?: number
    provider?: string
    icon?: string
  }
}

export enum ErrorHandleTypeEnum {
  none = 'none',
  failBranch = 'fail-branch',
  defaultValue = 'default-value',
}

export type NodeTracingListResponse = {
  data: NodeTracing[]
}

export type AgentLogItemWithChildren = AgentLogItem & {
  hasCircle?: boolean
  children: AgentLogItemWithChildren[]
}

export type NodeTracing = {
  id: string
  index: number
  predecessor_node_id: string
  node_id: string
  iteration_id?: string
  loop_id?: string
  node_type: BlockEnum
  title: string
  inputs: any
  inputs_truncated: boolean
  process_data: any
  process_data_truncated: boolean
  outputs?: Record<string, any>
  outputs_truncated: boolean
  outputs_full_content?: {
    download_url: string
  }
  status: string
  parallel_run_id?: string
  error?: string
  elapsed_time: number
  execution_metadata?: {
    total_tokens: number
    total_price: number
    currency: string
    iteration_id?: string
    iteration_index?: number
    loop_id?: string
    loop_index?: number
    parallel_id?: string
    parallel_start_node_id?: string
    parent_parallel_id?: string
    parent_parallel_start_node_id?: string
    parallel_mode_run_id?: string
    iteration_duration_map?: IterationDurationMap
    loop_duration_map?: LoopDurationMap
    error_strategy?: ErrorHandleTypeEnum
    agent_log?: AgentLogItem[]
    tool_info?: {
      agent_strategy?: string
      icon?: string
    }
    loop_variable_map?: Record<string, any>
  }
  metadata: {
    iterator_length: number
    iterator_index: number
    loop_length: number
    loop_index: number
  }
  created_at: number
  created_by: {
    id: string
    name: string
    email: string
  }
  iterDurationMap?: IterationDurationMap
  loopDurationMap?: LoopDurationMap
  finished_at: number
  extras?: any
  expand?: boolean // for UI
  details?: NodeTracing[][] // iteration or loop detail
  retryDetail?: NodeTracing[] // retry detail
  retry_index?: number
  parallelDetail?: { // parallel detail. if is in parallel, this field will be set
    isParallelStartNode?: boolean
    parallelTitle?: string
    branchTitle?: string
    children?: NodeTracing[]
  }
  parallel_id?: string
  parallel_start_node_id?: string
  parent_parallel_id?: string
  parent_parallel_start_node_id?: string
  agentLog?: AgentLogItemWithChildren[] // agent log
}

export type CustomConfigurationModelFixedFields = {
  __model_name: string
  __model_type: ModelTypeEnum
}

export type ModelParameterRule = {
  default?: number | string | boolean | string[]
  help?: TypeWithI18N
  label: TypeWithI18N
  min?: number
  max?: number
  name: string
  precision?: number
  required: boolean
  type: string
  use_template?: string
  options?: string[]
  tagPlaceholder?: TypeWithI18N
}

/** 通用响应结构 */
export interface CommonResponse {
  result: string;
}

export type ModelLoadBalancingConfigEntry = {
  /** model balancing config entry id */
  id?: string
  /** is config entry enabled */
  enabled?: boolean
  /** config entry name */
  name: string
  /** model balancing credential */
  credentials: Record<string, string | undefined | boolean>
  /** is config entry currently removed from Round-robin queue */
  in_cooldown?: boolean
  /** cooldown time (in seconds) */
  ttl?: number
}

export type ModelLoadBalancingConfig = {
  /** is load balancing enabled */
  enabled: boolean
  /** load balancing configs */
  configs: ModelLoadBalancingConfigEntry[]
}

export enum LOC {
  tools = 'tools',
  app = 'app',
}

export enum AuthType {
  none = 'none',
  apiKey = 'api_key',
  apiKeyHeader = 'api_key_header',
  apiKeyQuery = 'api_key_query',
}

export enum AuthHeaderPrefix {
  basic = 'basic',
  bearer = 'bearer',
  custom = 'custom',
}

export type Credential = {
  auth_type: AuthType
  api_key_header?: string
  api_key_value?: string
  api_key_header_prefix?: AuthHeaderPrefix
  api_key_query_param?: string
}

export enum CollectionType {
  all = 'all',
  builtIn = 'builtin',
  custom = 'api',
  model = 'model',
  workflow = 'workflow',
  mcp = 'mcp',
  datasource = 'datasource',
  trigger = 'trigger',
}

export type Emoji = {
  background: string
  content: string
}

export interface LogItem {
  id: string;
  status: string;
  from_source: string;
  from_end_user_id: string | null;
  from_end_user_session_id: string | null;
  from_account_id: string | null;
  from_account_name: string | null;
  name: string;
  summary: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  annotated: boolean;
  message_count: number;
  user_feedback_stats: {
    like: number;
    dislike: number;
  };
  admin_feedback_stats: {
    like: number;
    dislike: number;
  };
  model_config: {
    model: string | { name: string;[key: string]: any } | null;
    pre_prompt: string;
  };
}

export interface LogListResponse {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
  data: LogItem[];
}

export interface Message {
  id: string;
  conversation_id: string;
  inputs: Record<string, any>;
  query: string;
  answer: string;
  message_files: any[];
  feedback: {
    rating: 'like' | 'dislike' | null;
  } | null;
  created_at: string;
  agent_thoughts: {
    id: string;
    message_id: string;
    position: number;
    thought: string;
    tool: string;
    tool_input: string;
    created_at: string;
    observation: string;
  }[];
}

export interface MessageListResponse {
  limit: number;
  has_more: boolean;
  data: Message[];
}

export interface LogQuery {
  page: number;
  limit: number;
  start?: string;
  end?: string;
  keyword?: string;
  status?: string;
  annotated?: boolean;
  sort_by?: string;
  direction?: 'asc' | 'desc';
  period?: string | number;
}

export type Collection = {
  id: string
  name: string
  author: string
  description: TypeWithI18N
  icon: string | { content: string; background: string }
  icon_dark?: string | { content: string; background: string }
  icon_url?: string | null
  label: TypeWithI18N
  type: CollectionType | string
  team_credentials: Record<string, any>
  is_team_authorization: boolean
  allow_delete: boolean
  labels: string[]
  plugin_id?: string
  letter?: string
  server_url?: string
  updated_at?: number
  server_identifier?: string
  is_authorized?: boolean
  provider?: string
  credential_id?: string
  is_dynamic_registration?: boolean
  authentication?: {
    client_id?: string
    client_secret?: string
  }
  configuration?: {
    timeout?: number
    sse_read_timeout?: number
  }
  workflow_app_id?: string
  tools?: any[]
}

export interface ToolProvider {
  provider: string;
  type: string;
  is_valid: boolean;
  tools: any[];
}

export interface McpToolParameter {
  name: string;
  label: TypeWithI18N | null;
  placeholder: string | null;
  scope: string | null;
  auto_generate: string | null;
  template: string | null;
  required: boolean;
  default: any | null;
  min: number | null;
  max: number | null;
  precision: number | null;
  options: string[];
  type: string;
  human_description: TypeWithI18N | null;
  form: string;
  llm_description: string;
  input_schema: any | null;
}

export interface McpTool {
  author: string;
  name: string;
  label: TypeWithI18N;
  description: TypeWithI18N;
  parameters: McpToolParameter[];
  labels: string[];
  output_schema: any | null;
}

export interface McpProvider {
  id: string;
  author: string;
  name: string;
  description: TypeWithI18N;
  icon: string;
  icon_dark: string | null;
  icon_url?: string | null;
  label: TypeWithI18N;
  type: string;
  masked_credentials: any | null;
  original_credentials: any | null;
  is_team_authorization: boolean;
  allow_delete: boolean;
  plugin_id: string;
  plugin_unique_identifier: string;
  tools: McpTool[];
  labels: string[];
  server_url: string;
  updated_at: number;
  server_identifier: string;

  // Keep these optional fields for UI/other API endpoints compatibility
  icon_type?: string;
  icon_background?: string;
  is_authed?: boolean;
  is_dynamic_registration?: boolean;
  authentication?: {
    client_id?: string
    client_secret?: string
  }
  configuration?: {
    timeout?: number
    sse_read_timeout?: number
  }
  headers?: { key: string; value: string }[];
  extra?: Record<string, any>;
}

export interface McpProviderRequest {
  name: string;
  server_url: string;
  icon: string;
  icon_type: string;
  icon_background?: string;
  server_identifier: string;
  is_dynamic_registration?: boolean;
  is_team_authorization?: boolean;
  authentication?: {
    client_id?: string
    client_secret?: string
  }
  configuration?: {
    timeout?: number
    sse_read_timeout?: number
  }
  headers?: { key: string; value: string }[];
  extra?: Record<string, any>;
}

export interface McpProviderUpdateRequest extends McpProviderRequest {
  provider_id: string;
}

export type ToolExtensionParameter = {
  name: string
  label: TypeWithI18N
  human_description: TypeWithI18N
  type: string
  form: string
  llm_description: string
  required: boolean
  multiple: boolean
  default: string
  options?: {
    label: TypeWithI18N
    value: string
  }[]
  min?: number
  max?: number
}

export type TriggerParameter = {
  name: string
  label: TypeWithI18N
  human_description: TypeWithI18N
  type: string
  form: string
  llm_description: string
  required: boolean
  multiple: boolean
  default: string
  options?: {
    label: TypeWithI18N
    value: string
  }[]
}

export type Event = {
  name: string
  author: string
  label: TypeWithI18N
  description: TypeWithI18N
  parameters: TriggerParameter[]
  labels: string[]
  output_schema: Record<string, any>
}

export type ToolExtension = {
  name: string
  author: string
  label: TypeWithI18N
  description: any
  parameters: ToolExtensionParameter[]
  labels: string[]
  output_schema: Record<string, any>
}

export type ToolCredential = {
  name: string
  label: TypeWithI18N
  help: TypeWithI18N | null
  placeholder: TypeWithI18N
  type: string
  required: boolean
  default: string
  options?: {
    label: TypeWithI18N
    value: string
  }[]
}

export type CustomCollectionBackend = {
  provider: string
  original_provider?: string
  credentials: Credential
  icon: Emoji
  schema_type: string
  schema: string
  privacy_policy: string
  custom_disclaimer: string
  tools?: ParamItem[]
  id: string
  labels: string[]
}

export type ParamItem = {
  name: string
  label: TypeWithI18N
  human_description: TypeWithI18N
  llm_description: string
  type: string
  form: string
  required: boolean
  default: string
  min?: number
  max?: number
  options?: {
    label: TypeWithI18N
    value: string
  }[]
}

export type CustomParamSchema = {
  operation_id: string
  summary: string
  server_url: string
  method: string
  parameters: ParamItem[]
}

export type WorkflowToolProviderParameter = {
  name: string
  form: string
  description: string
  required?: boolean
  type?: string
}

export type WorkflowToolProviderOutputParameter = {
  name: string
  description: string
  type?: VarType
  reserved?: boolean
}

export type WorkflowToolProviderOutputSchema = {
  type: string
  properties: Record<string, {
    type: string
    description: string
  }>
}

export type WorkflowToolProviderRequest = {
  name: string
  label: string
  icon: string | Emoji
  description: string
  parameters: WorkflowToolProviderParameter[]
  labels: string[]
  privacy_policy: string
}

export type WorkflowToolProviderResponse = {
  workflow_app_id: string
  workflow_tool_id: string
  label: string
  name: string
  icon: Emoji
  description: string
  synced: boolean
  tool: {
    author: string
    name: string
    label: TypeWithI18N
    description: TypeWithI18N
    labels: string[]
    parameters: ParamItem[]
    output_schema: WorkflowToolProviderOutputSchema
  }
  privacy_policy: string
}

export type MCPServerDetail = {
  id: string
  server_code: string
  description: string
  status: string
  parameters?: Record<string, string>
  headers?: Record<string, string>
}

export enum MCPAuthMethod {
  authentication = 'authentication',
  headers = 'headers',
  configurations = 'configurations',
}

// --- 日志与标注相关类型 (补充) ---

/**
 * 对话信息
 */
export type Conversation = {
  id: string
  key: string
  conversationId: string
  question: string
  answer: string
  userRate: number
  adminRate: number
}

/**
 * 对话列表响应
 */
export type ConversationListResponse = {
  logs: Conversation[]
}

/**
 * 补全参数类型
 */
export type CompletionParamType = typeof CompletionParams[number]

/**
 * 补全参数详细配置
 */
export type CompletionParamsType = {
  max_tokens: number
  temperature: number
  top_p: number
  stop: string[]
  presence_penalty: number
  frequency_penalty: number
}

/**
 * 日志模型配置
 */
export type LogModelConfig = {
  name: string
  provider: string
  completion_params: CompletionParamsType
}

/**
 * 模型配置详情
 */
export type ModelConfigDetail = {
  introduction: string
  prompt_template: string
  prompt_variables: Array<{
    key: string
    name: string
    description: string
    type: string | number
    default: string
    options: string[]
  }>
  completion_params: CompletionParamsType
}

/**
 * 日志标注信息
 */
export type LogAnnotation = {
  id: string
  content: string
  question?: string
  answer?: string
  account: {
    id: string
    name: string
    email: string
  }
  created_at: number
}

/**
 * 标注信息
 */
export type Annotation = {
  id: string
  authorName: string
  logAnnotation?: LogAnnotation
  created_at?: number
}

/**
 * 消息内容详情
 */
export type MessageContent = {
  id: string
  conversation_id: string
  query: string
  inputs: Record<string, any>
  message: { role: string; text: string; files?: VisionFile[] }[]
  message_tokens: number
  answer_tokens: number
  answer: string
  provider_response_latency: number
  created_at: number
  annotation: LogAnnotation
  annotation_hit_history: {
    annotation_id: string
    annotation_create_account: {
      id: string
      name: string
      email: string
    }
    created_at: number
  }
  feedbacks: Array<{
    rating: 'like' | 'dislike' | null
    content: string | null
    from_source?: 'admin' | 'user'
    from_end_user_id?: string
  }>
  message_files: VisionFile[]
  metadata: Metadata
  agent_thoughts: any[]
  workflow_run_id: string
  parent_message_id: string | null
}

/**
 * 补全对话概览详情
 */
export type CompletionConversationGeneralDetail = {
  id: string
  status: 'normal' | 'finished'
  from_source: 'api' | 'console'
  from_end_user_id: string
  from_end_user_session_id: string
  from_account_id: string
  read_at: Date
  created_at: number
  updated_at: number
  annotation: Annotation
  user_feedback_stats: {
    like: number
    dislike: number
  }
  admin_feedback_stats: {
    like: number
    dislike: number
  }
  model_config: {
    provider: string
    model_id: string
    configs: Pick<ModelConfigDetail, 'prompt_template'>
  }
  message: Pick<MessageContent, 'inputs' | 'query' | 'answer' | 'message'>
}

/**
 * 补全对话完整详情响应
 */
export type CompletionConversationFullDetailResponse = {
  id: string
  status: 'normal' | 'finished'
  from_source: 'api' | 'console'
  from_end_user_id: string
  from_account_id: string
  // read_at: Date
  created_at: number
  model_config: {
    provider: string
    model_id: string
    configs: ModelConfigDetail
  }
  message: MessageContent
}

/**
 * 补全对话列表响应
 */
export type CompletionConversationsResponse = {
  data: Array<CompletionConversationGeneralDetail>
  has_more: boolean
  limit: number
  total: number
  page: number
}

/**
 * 补全对话列表请求
 */
export type CompletionConversationsRequest = {
  keyword: string
  start: string
  end: string
  annotation_status: string
  page: number
  limit: number
}

/**
 * 聊天对话概览详情
 */
export type ChatConversationGeneralDetail = Omit<CompletionConversationGeneralDetail, 'message' | 'annotation'> & {
  summary: string
  message_count: number
  annotated: boolean
}

/**
 * 聊天对话列表响应
 */
export type ChatConversationsResponse = {
  data: Array<ChatConversationGeneralDetail>
  has_more: boolean
  limit: number
  total: number
  page: number
}

/**
 * 聊天对话列表请求
 */
export type ChatConversationsRequest = CompletionConversationsRequest & { message_count: number }

/**
 * 聊天对话完整详情响应
 */
export type ChatConversationFullDetailResponse = Omit<CompletionConversationGeneralDetail, 'message' | 'model_config'> & {
  message_count: number
  model_config: {
    provider: string
    model_id: string
    configs: ModelConfigDetail
    model: LogModelConfig
  }
}

/**
 * 聊天消息列表请求
 */
export type ChatMessagesRequest = {
  conversation_id: string
  first_id?: string
  limit: number
}

/**
 * 聊天消息
 */
export type ChatMessage = MessageContent

/**
 * 聊天消息列表响应
 */
export type ChatMessagesResponse = {
  data: Array<ChatMessage>
  has_more: boolean
  limit: number
}

/**
 * 消息评分常量
 */
export const MessageRatings = ['like', 'dislike', null] as const

/**
 * 消息评分类型
 */
export type MessageRating = typeof MessageRatings[number]

/**
 * 日志消息反馈请求
 */
export type LogMessageFeedbacksRequest = {
  message_id: string
  rating: MessageRating
  content?: string
}

/**
 * 日志消息反馈响应
 */
export type LogMessageFeedbacksResponse = {
  result: 'success' | 'error'
}

/**
 * 日志消息标注请求
 */
export type LogMessageAnnotationsRequest = {
  message_id: string
  question: string
  answer: string
}

/**
 * 日志消息标注响应
 */
export type LogMessageAnnotationsResponse = LogMessageFeedbacksResponse

/**
 * 标注数量响应
 */
export type AnnotationsCountResponse = {
  count: number
}

/**
 * 工作流运行详情
 */
export type WorkflowRunDetail = {
  id: string
  version: string
  status: 'running' | 'succeeded' | 'failed' | 'stopped'
  error?: string
  elapsed_time: number
  total_tokens: number
  total_price: number
  currency: string
  total_steps: number
  finished_at: number
}

/**
 * 账户信息
 */
export type AccountInfo = {
  id: string
  name: string
  email: string
}

/**
 * 终端用户信息
 */
export type EndUserInfo = {
  id: string
  type: 'browser' | 'service_api'
  is_anonymous: boolean
  session_id: string
}

/**
 * 工作流应用日志详情
 */
export type WorkflowAppLogDetail = {
  id: string
  workflow_run: WorkflowRunDetail
  created_from: 'service-api' | 'web-app' | 'explore'
  created_by_role: 'account' | 'end_user'
  created_by_account?: AccountInfo
  created_by_end_user?: EndUserInfo
  created_at: number
  read_at?: number
}

/**
 * 工作流日志列表响应
 */
export type WorkflowLogsResponse = {
  data: Array<WorkflowAppLogDetail>
  has_more: boolean
  limit: number
  total: number
  page: number
}

/**
 * 工作流日志列表请求
 */
export type WorkflowLogsRequest = {
  keyword: string
  status: string
  page: number
  limit: number
}

/**
 * 工作流运行详情响应
 */
export type WorkflowRunDetailResponse = {
  id: string
  sequence_number: number
  version: string
  graph: {
    nodes: Node[]
    edges: Edge[]
    viewport?: Viewport
  }
  inputs: string
  status: 'running' | 'succeeded' | 'failed' | 'stopped'
  outputs?: string
  error?: string
  elapsed_time?: number
  total_tokens?: number
  total_steps: number
  created_by_role: 'account' | 'end_user'
  created_by_account?: AccountInfo
  created_by_end_user?: EndUserInfo
  created_at: number
  finished_at: number
  exceptions_count?: number
  detail?: any
  tracing?: any
}

/**
 * 智能体日志元数据
 */
export type AgentLogMeta = {
  status: string
  executor: string
  start_time: string
  elapsed_time: number
  total_tokens: number
  agent_mode: string
  iterations: number
  error?: string
}

/**
 * 工具调用详情
 */
export type ToolCall = {
  status: string
  error?: string | null
  time_cost?: number
  tool_icon: any
  tool_input?: any
  tool_output?: any
  tool_name?: string
  tool_label?: any
  tool_parameters?: any
}

/**
 * 智能体迭代详情
 */
export type AgentIteration = {
  created_at: string
  files: string[]
  thought: string
  tokens: number
  tool_calls: ToolCall[]
  tool_raw: {
    inputs: string
    outputs: string
  }
}

/**
 * 智能体日志文件
 */
export type AgentLogFile = {
  id: string
  type: string
  url: string
  name: string
  belongs_to: string
}

/**
 * 智能体日志详情请求
 */
export type AgentLogDetailRequest = {
  conversation_id: string
  message_id: string
}

/**
 * 智能体日志详情响应
 */
export type AgentLogDetailResponse = {
  meta: AgentLogMeta
  iterations: AgentIteration[]
  files: AgentLogFile[]
}

/**
 * 自动化规则生成响应
 */
export type AutomaticRes = {
  prompt: string // 提示文本
  variables: string[] // 变量数组
  opening_statement: string // 开场白
  error?: string // 错误信息（可选）
}

/**
 * 规则代码生成响应
 */
export type CodeGenRes = {
  code: string // 生成的代码
  language: string[] // 语言数组（注意：这里原定义可能有问题，应该是string而不是string[]）
  error?: string // 错误信息（可选）
}

export type IOnDataMoreInfo = {
  conversationId?: string
  taskId?: string
  messageId: string
  errorMessage?: string
  errorCode?: string
}

export type FileEntity = {
  id: string
  name: string
  size: number
  type: string
  progress: number
  transferMethod: TransferMethod
  supportFileType: string
  originalFile?: File
  uploadedId?: string
  base64Url?: string
  url?: string
}

export type ThoughtItem = {
  id: string
  tool: string // plugin or dataset. May has multi.
  thought: string
  tool_input: string
  tool_labels?: { [key: string]: TypeWithI18N }
  message_id: string
  observation: string
  position: number
  files?: string[]
  message_files?: FileEntity[]
}

export type FileResponse = {
  related_id: string
  extension: string
  filename: string
  size: number
  mime_type: string
  transfer_method: TransferMethod
  type: string
  url: string
  upload_file_id: string
  remote_url: string
}

export type MessageEnd = {
  id: string
  metadata: Metadata
  files?: FileResponse[]
}

export type MessageReplace = {
  id: string
  task_id: string
  answer: string
  conversation_id: string
}

export enum PromptRole {
  system = 'system',
  user = 'user',
  assistant = 'assistant',
}

export type PromptItem = {
  role?: PromptRole
  text: string
}

export type IOnData = (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => void
export type IOnCompleted = (hasError?: boolean, errorMessage?: string) => void
export type IOnFile = (file: VisionFile) => void
export type IOnThought = (though: ThoughtItem) => void
export type IOnMessageEnd = (messageEnd: MessageEnd) => void
export type IOnMessageReplace = (messageReplace: MessageReplace) => void
export type IOnError = (msg: string, code?: string) => void
export type ChatPromptConfig = {
  prompt: PromptItem[]
}
export type ConversationHistoriesRole = {
  user_prefix: string
  assistant_prefix: string
}
export type CompletionPromptConfig = {
  prompt: PromptItem
  conversation_histories_role: ConversationHistoriesRole
}
export enum ModelModeType {
  chat = 'chat',
  completion = 'completion',
}
