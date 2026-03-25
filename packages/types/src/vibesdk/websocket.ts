import type {
  FileConceptType,
  FileOutputType,
  CodeReviewOutputType,
  AgentState,
  ConversationState,
} from './agent';
import type {
  CodeIssue,
  RuntimeError,
  StaticAnalysisResponse,
  TemplateDetails,
} from './sandbox';
import type { RateLimitExceededError } from '../errors';

type ErrorMessage = { type: 'error'; error: string };
type StateMessage = { type: 'cf_agent_state'; state: AgentState };
type AgentConnectedMessage = {
  type: 'agent_connected';
  state: AgentState;
  templateDetails: TemplateDetails;
  previewUrl?: string;
};
type TemplateUpdatedMessage = {
  type: 'template_updated';
  templateDetails: TemplateDetails;
};
type ConversationStateMessage = {
  type: 'conversation_state';
  state: ConversationState;
  deepDebugSession?: { conversationId: string } | null;
};
type RateLimitErrorMessage = {
  type: 'rate_limit_error';
  error: RateLimitExceededError;
};
type GenerationStartedMessage = {
  type: 'generation_started';
  message: string;
  totalFiles: number;
};
type FileGeneratingMessage = {
  type: 'file_generating';
  filePath: string;
  filePurpose: string;
};
type FileRegeneratingMessage = {
  type: 'file_regenerating';
  filePath: string;
  original_issues?: string;
};
type FileChunkGeneratedMessage = {
  type: 'file_chunk_generated';
  filePath: string;
  chunk: string;
};
type FileGeneratedMessage = { type: 'file_generated'; file: FileOutputType };
type FileRegeneratedMessage = {
  type: 'file_regenerated';
  file: FileOutputType;
  original_issues: string;
};
type GenerationCompleteMessage = {
  type: 'generation_complete';
  instanceId?: string;
  previewURL?: string;
};

export type DeploymentStartedMessage = {
  type: 'deployment_started';
  message: string;
  files: { filePath: string }[];
};
export type DeploymentFailedMessage = {
  type: 'deployment_failed';
  error: string;
};
export type DeploymentCompletedMessage = {
  type: 'deployment_completed';
  previewURL: string;
  tunnelURL: string;
  instanceId: string;
  message: string;
};

type PreviewForceRefreshMessage = { type: 'preview_force_refresh' };
type CommandExecutingMessage = {
  type: 'command_executing';
  message: string;
  commands: string[];
};
type CommandExecutedMessage = {
  type: 'command_executed';
  message: string;
  commands: string[];
  output?: string;
};
type CommandExecutionFailedMessage = {
  type: 'command_execution_failed';
  message: string;
  commands: string[];
  error?: string;
};
type CodeReviewingMessage = {
  type: 'code_reviewing';
  message: string;
  staticAnalysis?: StaticAnalysisResponse;
  runtimeErrors: RuntimeError[];
};
type CodeReviewedMessage = {
  type: 'code_reviewed';
  message: string;
  review: CodeReviewOutputType;
};
type RuntimeErrorFoundMessage = {
  type: 'runtime_error_found';
  errors: RuntimeError[];
  count: number;
};

export type CodeFixEdits = {
  type: 'code_fix_edits';
  filePath: string;
  search: string;
  replacement: string;
};

type StaticAnalysisResults = {
  type: 'static_analysis_results';
  staticAnalysis: StaticAnalysisResponse;
};

type PhaseGeneratingMessage = {
  type: 'phase_generating';
  message: string;
  phase?: { name: string; description: string; files: FileConceptType[] };
  issues?: unknown;
  userSuggestions?: string[];
};
type PhaseGeneratedMessage = {
  type: 'phase_generated';
  message: string;
  phase: { name: string; description: string; files: FileConceptType[] };
};
type PhaseImplementingMessage = {
  type: 'phase_implementing';
  message: string;
  phase: { name: string; description: string; files: FileConceptType[] };
  issues?: unknown;
};
type PhaseImplementedMessage = {
  type: 'phase_implemented';
  message: string;
  phase: { name: string; description: string; files: FileConceptType[] };
};
type PhaseValidatingMessage = { type: 'phase_validating'; message: string };
type PhaseValidatedMessage = { type: 'phase_validated'; message: string };
type GenerationStoppedMessage = { type: 'generation_stopped'; message: string };
type GenerationResumedMessage = { type: 'generation_resumed'; message: string };

export type CloudflareDeploymentStartedMessage = {
  type: 'cloudflare_deployment_started';
  message: string;
};
export type CloudflareDeploymentCompletedMessage = {
  type: 'cloudflare_deployment_completed';
  message: string;
  instanceId: string;
  deploymentUrl: string;
  workersUrl?: string;
};
export type CloudflareDeploymentErrorMessage = {
  type: 'cloudflare_deployment_error';
  error: string;
  message: string;
};

type ScreenshotCaptureStartedMessage = {
  type: 'screenshot_capture_started';
  message: string;
};
type ScreenshotCaptureSuccessMessage = {
  type: 'screenshot_capture_success';
  url: string;
  message: string;
};
type ScreenshotCaptureErrorMessage = {
  type: 'screenshot_capture_error';
  error: string;
};
type ScreenshotAnalysisResultMessage = {
  type: 'screenshot_analysis_result';
  message: string;
  analysisResult: unknown;
};

type GitHubExportStartedMessage = {
  type: 'github_export_started';
  message: string;
};
type GitHubExportProgressMessage = {
  type: 'github_export_progress';
  message: string;
  step: 'creating_repository' | 'uploading_files' | 'finalizing';
  progress: number;
};
type GitHubExportCompletedMessage = {
  type: 'github_export_completed';
  repositoryUrl: string;
  message: string;
};
type GitHubExportErrorMessage = { type: 'github_export_error'; error: string };

type UserSuggestionsProcessingMessage = {
  type: 'user_suggestions_processing';
  message: string;
  isStreaming?: boolean;
  tool?: {
    name: string;
    status: 'start' | 'success' | 'error';
    args?: Record<string, unknown>;
    result?: string;
  };
};
type ConversationResponseMessage = {
  type: 'conversation_response';
  message: string;
  conversationId?: string;
  enhancedRequest?: string;
  pendingInputsCount?: number;
  isStreaming?: boolean;
  tool?: {
    name: string;
    status: 'start' | 'success' | 'error';
    args?: Record<string, unknown>;
    result?: string;
  };
};
type ConversationClearedMessage = {
  type: 'conversation_cleared';
  message: string;
  clearedMessageCount: number;
};
type ProjectNameUpdatedMessage = {
  type: 'project_name_updated';
  message: string;
  projectName: string;
};
type BlueprintUpdatedMessage = {
  type: 'blueprint_updated';
  message: string;
  updatedKeys: string[];
};
type BlueprintChunkMessage = { type: 'blueprint_chunk'; chunk: string };

type DeterministicCodeFixStartedMessage = {
  type: 'deterministic_code_fix_started';
  message: string;
  issues: CodeIssue[];
};
type DeterministicCodeFixCompletedMessage = {
  type: 'deterministic_code_fix_completed';
  message: string;
  fixResult: unknown;
  issues: CodeIssue[];
};

export type ModelConfigsInfoMessage = {
  type: 'model_configs_info';
  message: string;
  configs: {
    agents: Array<{
      key: string;
      name: string;
      description: string;
      constraint?: { enabled: boolean; allowedModels: string[] };
    }>;
    userConfigs: Record<
      string,
      {
        name?: string;
        max_tokens?: number;
        temperature?: number;
        reasoning_effort?: string;
        fallbackModel?: string;
        isUserOverride?: boolean;
      }
    >;
    defaultConfigs: Record<
      string,
      {
        name?: string;
        max_tokens?: number;
        temperature?: number;
        reasoning_effort?: string;
        fallbackModel?: string;
      }
    >;
  };
};

export type AgentDisplayConfig =
  ModelConfigsInfoMessage['configs']['agents'][number];
export type ModelConfigsInfo = ModelConfigsInfoMessage['configs'];

type TerminalCommandMessage = {
  type: 'terminal_command';
  command: string;
  timestamp: number;
};
type TerminalOutputMessage = {
  type: 'terminal_output';
  output: string;
  outputType: 'stdout' | 'stderr' | 'info';
  timestamp: number;
};
type ServerLogMessage = {
  type: 'server_log';
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  timestamp: number;
  source?: string;
};

type VaultUnlockedMessage = { type: 'vault_unlocked' };
type VaultLockedMessage = { type: 'vault_locked' };
type VaultRequiredMessage = {
  type: 'vault_required';
  reason: string;
  provider?: string;
  envVarName?: string;
  secretId?: string;
};

export type VaultStoreSecretRequest = {
  type: 'vault_store_secret';
  requestId: string;
  name: string;
  encryptedValue: string;
  secretType: 'secret';
  encryptedNameForStorage: string;
  metadata?: Record<string, unknown>;
};
export type VaultSecretStoredResponse = {
  type: 'vault_secret_stored';
  requestId: string;
  success: boolean;
  secretId?: string;
  error?: string;
};
export type VaultListSecretsRequest = {
  type: 'vault_list_secrets';
  requestId: string;
};
export type VaultSecretsListResponse = {
  type: 'vault_secrets_list';
  requestId: string;
  secrets: Array<{
    id: string;
    encryptedName: string;
    metadata?: Record<string, unknown>;
    secretType: 'secret';
    createdAt: string;
    updatedAt: string;
  }>;
};
export type VaultGetSecretRequest = {
  type: 'vault_get_secret';
  requestId: string;
  secretId: string;
};
export type VaultSecretValueResponse = {
  type: 'vault_secret_value';
  requestId: string;
  success: boolean;
  encryptedValue?: string;
  metadata?: Record<string, unknown>;
  error?: string;
};
export type VaultDeleteSecretRequest = {
  type: 'vault_delete_secret';
  requestId: string;
  secretId: string;
};
export type VaultSecretDeletedResponse = {
  type: 'vault_secret_deleted';
  requestId: string;
  success: boolean;
  error?: string;
};
export type VaultUpdateSecretRequest = {
  type: 'vault_update_secret';
  requestId: string;
  secretId: string;
  encryptedValue?: string;
  encryptedName?: string;
  metadata?: { expiresAt?: string; tags?: string[] };
};
export type VaultSecretUpdatedResponse = {
  type: 'vault_secret_updated';
  requestId: string;
  success: boolean;
  error?: string;
};

export type VaultWebSocketMessage =
  | VaultStoreSecretRequest
  | VaultSecretStoredResponse
  | VaultListSecretsRequest
  | VaultSecretsListResponse
  | VaultGetSecretRequest
  | VaultSecretValueResponse
  | VaultDeleteSecretRequest
  | VaultSecretDeletedResponse
  | VaultUpdateSecretRequest
  | VaultSecretUpdatedResponse;

export type WebSocketMessage =
  | StateMessage
  | AgentConnectedMessage
  | TemplateUpdatedMessage
  | ConversationStateMessage
  | GenerationStartedMessage
  | FileGeneratingMessage
  | FileRegeneratingMessage
  | FileChunkGeneratedMessage
  | FileGeneratedMessage
  | FileRegeneratedMessage
  | GenerationCompleteMessage
  | DeploymentStartedMessage
  | DeploymentCompletedMessage
  | DeploymentFailedMessage
  | PreviewForceRefreshMessage
  | CodeReviewingMessage
  | CodeReviewedMessage
  | CommandExecutingMessage
  | CommandExecutedMessage
  | CommandExecutionFailedMessage
  | RuntimeErrorFoundMessage
  | CodeFixEdits
  | StaticAnalysisResults
  | PhaseGeneratingMessage
  | PhaseGeneratedMessage
  | PhaseImplementingMessage
  | PhaseImplementedMessage
  | PhaseValidatingMessage
  | PhaseValidatedMessage
  | GenerationStoppedMessage
  | GenerationResumedMessage
  | CloudflareDeploymentStartedMessage
  | CloudflareDeploymentCompletedMessage
  | CloudflareDeploymentErrorMessage
  | ScreenshotCaptureStartedMessage
  | ScreenshotCaptureSuccessMessage
  | ScreenshotCaptureErrorMessage
  | ScreenshotAnalysisResultMessage
  | GitHubExportStartedMessage
  | GitHubExportProgressMessage
  | GitHubExportCompletedMessage
  | GitHubExportErrorMessage
  | ErrorMessage
  | RateLimitErrorMessage
  | UserSuggestionsProcessingMessage
  | ConversationResponseMessage
  | ConversationClearedMessage
  | ProjectNameUpdatedMessage
  | BlueprintUpdatedMessage
  | BlueprintChunkMessage
  | DeterministicCodeFixStartedMessage
  | DeterministicCodeFixCompletedMessage
  | ModelConfigsInfoMessage
  | TerminalCommandMessage
  | TerminalOutputMessage
  | ServerLogMessage
  | VaultUnlockedMessage
  | VaultLockedMessage
  | VaultRequiredMessage;

export type WebSocketMessageType = WebSocketMessage['type'];
export type WebSocketMessageData<T extends WebSocketMessageType> = Omit<
  Extract<WebSocketMessage, { type: T }>,
  'type'
>;
