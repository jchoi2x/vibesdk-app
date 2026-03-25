import type { App, EnhancedAppData, AppWithFavoriteStatus, PaginationInfo, FavoriteToggleResult, UserStats, UserActivity } from './database';

export type AppWithUserAndStats = EnhancedAppData & {
	updatedAtFormatted: string;
};

export interface AppsListData {
	apps: AppWithFavoriteStatus[];
}

export interface PublicAppsData {
	apps: AppWithUserAndStats[];
	pagination: PaginationInfo;
}

export interface SingleAppData {
	app: AppWithFavoriteStatus;
}

export type FavoriteToggleData = FavoriteToggleResult;

export interface CreateAppData {
	app: App;
}

export interface UpdateAppVisibilityData {
	app: {
		id: string;
		title: string;
		visibility: App['visibility'];
		updatedAt: Date | null;
	};
	message: string;
}

export interface AppDeleteData {
	success: boolean;
	message: string;
}

export interface AgentSummary {
	query: string;
	generatedCode: Array<{ filePath: string; fileContents: string; filePurpose: string }>;
	conversation?: Array<{ role: string; content: string | null; conversationId: string }>;
}

export interface GeneratedCodeFile {
	filePath: string;
	fileContents: string;
	explanation?: string;
}

export interface AppDetailsData extends EnhancedAppData {
	cloudflareUrl: string | null;
	previewUrl: string | null;
	user: {
		id: string;
		displayName: string;
		avatarUrl: string | null;
	};
	agentSummary: AgentSummary | null;
}

export interface AppStarToggleData {
	isStarred: boolean;
	starCount: number;
}

export interface GitCloneTokenData {
	token: string;
	expiresIn: number;
	expiresAt: string;
	cloneUrl: string;
}

export interface UserAppsData {
	apps: EnhancedAppData[];
	pagination: PaginationInfo;
}

export interface ProfileUpdateData {
	success: boolean;
	message: string;
}

export type UserStatsData = UserStats;

export interface UserActivityData {
	activities: UserActivity[];
}

export interface UserAnalyticsResponseData {
	totalRequests: number;
	totalCost: number;
	tokensIn: number;
	tokensOut: number;
	errorRate: number;
	cacheHitRate: number;
	cachedRequests: number;
	erroredRequests: number;
	lastRequestAt: string | null;
	latestHourActivity: { count: number; timestamp: string } | null;
	timeRange: { start: string; end: string };
	queryResponseTime: number;
	userId: string;
}

export interface AgentAnalyticsResponseData {
	totalRequests: number;
	totalCost: number;
	tokensIn: number;
	tokensOut: number;
	errorRate: number;
	cacheHitRate: number;
	cachedRequests: number;
	erroredRequests: number;
	lastRequestAt: string | null;
	latestHourActivity: { count: number; timestamp: string } | null;
	timeRange: { start: string; end: string };
	queryResponseTime: number;
	chatId: string;
}

export interface ModelProvidersListData {
	providers: import('./database').UserModelProvider[];
}

export interface ModelProviderData {
	provider: import('./database').UserModelProvider;
}

export interface ModelProviderCreateData {
	provider: import('./database').UserModelProvider;
}

export interface ModelProviderUpdateData {
	provider: import('./database').UserModelProvider;
}

export interface ModelProviderDeleteData {
	success: boolean;
	providerId: string;
}

export interface ModelProviderTestData {
	success: boolean;
	error?: string;
	responseTime?: number;
}

export interface CreateProviderRequest {
	name: string;
	baseUrl: string;
	apiKey: string;
}

export interface UpdateProviderRequest {
	name?: string;
	baseUrl?: string;
	apiKey?: string;
	isActive?: boolean;
}

export interface TestProviderRequest {
	providerId?: string;
	baseUrl?: string;
	apiKey?: string;
}
