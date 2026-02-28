
export type AppType = '全部' | '对话应用' | '智能体应用' | '工作流应用' | '定制应用' | '内置应用';

export interface MenuItem {
  name: string;
  path: string;
}

export interface AppCategory {
  id: string;
  category: string;
}

export interface AppItem {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  description: string;
  icon: string; // Lucide icon name OR base64/URL image string
  iconType: 'icon' | 'image';
  tags: string[];
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

export type AppMode = 'chat' | 'agent' | 'workflow' | 'completion';

export type App = {
  id: string
  name: string
  description: string
  mode: AppMode
  enable_site: boolean
  enable_api: boolean
  api_rpm: number
  api_rph: number
  is_demo: boolean
  model_config: AppModelConfig
  providers: Array<{ provider: string; token_is_set: boolean }>
  site: SiteConfig
  created_at: string
}

export type AppModelConfig = {
  provider: string
  model_id: string
  configs: {
    prompt_template: string
    prompt_variables: Array<PromptVariable>
    completion_params: CompletionParam
  }
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

export type AppDetailResponse = App

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
  model_config: AppModelConfig;
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
  data: Array<{ date: string }>
}

export type AppDailyEndUsersResponse = {
  data: Array<{ date: string; terminal_count: number }>
}

export type AppTokenCostsResponse = {
  data: Array<{ date: string; token_count: number; total_price: number; currency: number }>
}

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


// --- Model Service Types ---

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

export type DefaultModel = {
  provider: string
  model: string
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
  required: false
  type: string
  use_template?: string
  options?: string[]
  tagPlaceholder?: TypeWithI18N
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

export type Collection = {
  id: string
  name: string
  author: string
  description: TypeWithI18N
  icon: string | Emoji
  icon_dark?: string | Emoji
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
  timeout?: number
  sse_read_timeout?: number
  headers?: Record<string, string>
  masked_headers?: Record<string, string>
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
