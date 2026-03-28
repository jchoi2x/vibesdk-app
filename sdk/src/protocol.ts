// Re-export the platform's public wire types.
//
// IMPORTANT:
// - These are type-only exports.
// - The SDK build bundles declarations so consumers do not need the `worker/` tree.

export type {
	WebSocketMessage,
	WebSocketMessageData,
	CodeFixEdits,
	ModelConfigsInfoMessage,
	AgentDisplayConfig,
	ModelConfigsInfo,
} from '../../src/worker/api/websocketTypes';

export type { AgentState } from '../../src/worker/agents/core/state';
export type { BehaviorType, ProjectType } from '../../src/worker/agents/core/types';
export type { FileOutputType, FileConceptType, PhaseConceptType } from '../../src/worker/agents/schemas';
export type { TemplateDetails } from '../../src/worker/services/sandbox/sandboxTypes';

export type {
	AgentConnectionData,
	CodeGenArgs as PlatformCodeGenArgs,
	AgentPreviewResponse,
} from '../../src/worker/api/controllers/agent/types';

export type { ImageAttachment } from '../../src/worker/types/image-attachment';

// App schema type
export type { App } from '../../src/worker/database/schema';

// Database types
export type {
	Visibility,
	AppWithFavoriteStatus as PlatformAppWithFavoriteStatus,
	EnhancedAppData as PlatformEnhancedAppData,
	FavoriteToggleResult,
	PaginationInfo,
	PublicAppQueryOptions,
} from '../../src/worker/database/types';

// Apps controller response types
export type {
	AppWithUserAndStats as PlatformAppWithUserAndStats,
	AppsListData as PlatformAppsListData,
	PublicAppsData as PlatformPublicAppsData,
	UpdateAppVisibilityData as PlatformUpdateAppVisibilityData,
	AppDeleteData,
} from '../../src/worker/api/controllers/apps/types';

// AppView controller response types
export type {
	AppDetailsData as PlatformAppDetailsData,
	AppStarToggleData,
	GitCloneTokenData,
} from '../../src/worker/api/controllers/appView/types';

// API response wrapper
export type { BaseApiResponse } from '../../src/worker/api/responses';
