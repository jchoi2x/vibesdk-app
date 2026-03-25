/**
 * Centralized API types - re-exports shared types from @jchoi2x/types/vibesdk.
 * This file serves as the single source of truth for frontend-worker API communication.
 */
import type { SessionResponse, AuthUser } from '@jchoi2x/types/vibesdk';

// Base API Response Types
export type {
  ControllerResponse,
  ApiResponse,
  RateLimitErrorResponse,
} from '@jchoi2x/types/vibesdk';

// Database Types
export type {
  PaginationInfo,
  EnhancedAppData,
  AppWithFavoriteStatus,
  TimePeriod,
  AppSortOption,
  SortOrder,
  AppQueryOptions,
  PublicAppQueryOptions,
  FavoriteToggleResult,
  UserStats,
  UserActivity,
} from '@jchoi2x/types/vibesdk';

// App-related API Types
export type {
  AppsListData,
  PublicAppsData,
  SingleAppData,
  FavoriteToggleData,
  CreateAppData,
  UpdateAppVisibilityData,
  AppDeleteData,
  AppWithUserAndStats,
  AppDetailsData,
  AppStarToggleData,
  GeneratedCodeFile,
  GitCloneTokenData,
  UserAppsData,
  ProfileUpdateData,
} from '@jchoi2x/types/vibesdk';

// Stats API Types
export type { UserStatsData, UserActivityData } from '@jchoi2x/types/vibesdk';

// Analytics API Types
export type {
  UserAnalyticsResponseData,
  AgentAnalyticsResponseData,
} from '@jchoi2x/types/vibesdk';

export type { PlatformStatusData } from '@jchoi2x/types/vibesdk';

export type { CapabilitiesData } from '@jchoi2x/types/vibesdk';

export type {
  ViewMode,
  FeatureCapabilities,
  FeatureDefinition,
  ViewDefinition,
  PlatformCapabilities,
  PlatformCapabilitiesConfig,
} from '@jchoi2x/types/vibesdk';

export {
  DEFAULT_FEATURE_DEFINITIONS,
  getBehaviorTypeForProject,
} from '@jchoi2x/types/vibesdk';

// Model Config API Types
export type {
  ModelConfigsData,
  ModelConfigData,
  ModelConfigUpdateData,
  ModelConfigTestData,
  ModelConfigResetData,
  ModelConfigDefaultsData,
  ModelConfigDeleteData,
  ByokProvidersData,
  UserProviderStatus,
  ModelsByProvider,
  UserModelConfigWithMetadata,
  ModelTestResult,
} from '@jchoi2x/types/vibesdk';

// Model Provider API Types
export type {
  ModelProvidersListData,
  ModelProviderData,
  ModelProviderCreateData,
  ModelProviderUpdateData,
  ModelProviderDeleteData,
  ModelProviderTestData,
  CreateProviderRequest,
  UpdateProviderRequest,
  TestProviderRequest,
} from '@jchoi2x/types/vibesdk';

// Frontend model config update interface that matches backend schema
export interface ModelConfigUpdate {
  modelName?: string | null;
  maxTokens?: number | null;
  temperature?: number | null;
  reasoningEffort?: string | null;
  fallbackModel?: string | null;
  isUserOverride?: boolean;
}

// Secrets API Types
export type {
  SecretTemplatesData,
  SecretTemplate,
} from '@jchoi2x/types/vibesdk';

// Vault API Types
export type {
  VaultConfig,
  VaultConfigResponse,
  VaultStatusResponse,
  SetupVaultRequest,
  KdfAlgorithm,
  Argon2Params,
  SecretMetadata,
} from '@jchoi2x/types/vibesdk';

// Agent/CodeGen API Types
export type { AgentConnectionData } from '@jchoi2x/types/vibesdk';

// Template Types
export type { TemplateDetails } from '@jchoi2x/types/vibesdk';

// WebSocket Types
export type {
  WebSocketMessage,
  WebSocketMessageData,
  CodeFixEdits,
  ModelConfigsInfoMessage,
  AgentDisplayConfig,
  ModelConfigsInfo,
} from '@jchoi2x/types/vibesdk';

// Database/Schema Types commonly used in frontend
export type {
  App,
  User,
  UserModelConfig,
  UserModelProvider,
} from '@jchoi2x/types/vibesdk';

// Agent/Generator Types
export type {
  Blueprint as BlueprintType,
  PhasicBlueprint,
  CodeReviewOutputType,
  FileConceptType,
  FileOutputType as GeneratedFile,
} from '@jchoi2x/types/vibesdk';

export type { AgentState, PhasicState } from '@jchoi2x/types/vibesdk';

export type { BehaviorType, ProjectType } from '@jchoi2x/types/vibesdk';

export type { ConversationMessage } from '@jchoi2x/types/vibesdk';

export type {
  RuntimeError,
  StaticAnalysisResponse,
} from '@jchoi2x/types/vibesdk';

// Config/Inference Types
export type {
  AgentActionKey,
  AgentConfig,
  ModelConfig,
  ReasoningEffortType as ReasoningEffort,
  ProviderOverrideType as ProviderOverride,
  AIModels,
} from '@jchoi2x/types/vibesdk';

export type { RateLimitError } from '@jchoi2x/types/errors';
export type { AgentPreviewResponse, CodeGenArgs } from '@jchoi2x/types/vibesdk';
export { MAX_AGENT_QUERY_LENGTH } from '@jchoi2x/types/vibesdk';
export {
  RateLimitExceededError,
  SecurityError,
  SecurityErrorType,
} from '@jchoi2x/types/errors';

// Model selection types
export type ModelSelectionMode = 'platform' | 'byok' | 'custom';

// Match chat FileType interface
export interface FileType {
  filePath: string;
  fileContents: string;
  explanation?: string;
  isGenerating?: boolean;
  needsFixing?: boolean;
  hasErrors?: boolean;
  language?: string;
}

// Streaming response wrapper types for agent session creation
export interface StreamingResponse {
  success: boolean;
  stream: Response;
}

export type AgentStreamingResponse = StreamingResponse;

export {
  type ImageAttachment,
  isSupportedImageType,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGES_PER_MESSAGE,
  SUPPORTED_IMAGE_MIME_TYPES,
} from '@jchoi2x/types/vibesdk';

// Auth types
export type {
  AuthSession,
  ApiKeyInfo,
  AuthResult,
  AuthUser,
  OAuthProvider,
  SessionResponse,
  AuthProvidersResponseData,
  ActiveSessionsData,
  ApiKeysData,
} from '@jchoi2x/types/vibesdk';

// Auth API Response Types
export type LoginResponseData = SessionResponse;

export type RegisterResponseData = SessionResponse & {
  requiresVerification?: boolean;
};

export type ProfileResponseData = {
  user: AuthUser;
  sessionId: string;
};

export interface CsrfTokenResponseData {
  token: string;
  headerName: string;
  expiresIn?: number;
}

export type {
  GitHubExportOptions,
  GitHubExportResult,
} from '@jchoi2x/types/vibesdk';
