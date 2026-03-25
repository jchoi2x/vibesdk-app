// Explicit interface definitions mirroring Drizzle schema inferences.
// These allow the frontend and types package to reference DB shapes without Drizzle ORM.

export type Visibility = 'private' | 'public';

export interface User {
  id: string;
  email: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  provider: string;
  providerId: string;
  emailVerified: boolean | null;
  passwordHash: string | null;
  failedLoginAttempts: number | null;
  lockedUntil: Date | null;
  passwordChangedAt: Date | null;
  preferences: unknown;
  theme: 'light' | 'dark' | 'system' | null;
  timezone: string | null;
  isActive: boolean | null;
  isSuspended: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  lastActiveAt: Date | null;
  deletedAt: Date | null;
}

export interface App {
  id: string;
  title: string;
  description: string | null;
  iconUrl: string | null;
  originalPrompt: string;
  finalPrompt: string | null;
  framework: string | null;
  userId: string | null;
  sessionToken: string | null;
  visibility: 'private' | 'public';
  status: 'generating' | 'completed';
  deploymentId: string | null;
  githubRepositoryUrl: string | null;
  githubRepositoryVisibility: 'public' | 'private' | null;
  isArchived: boolean | null;
  isFeatured: boolean | null;
  version: number | null;
  parentAppId: string | null;
  screenshotUrl: string | null;
  screenshotCapturedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  lastDeployedAt: Date | null;
}

export interface UserModelConfig {
  id: string;
  userId: string;
  agentActionName: string;
  modelName: string | null;
  maxTokens: number | null;
  temperature: number | null;
  reasoningEffort: 'low' | 'medium' | 'high' | null;
  providerOverride: 'cloudflare' | 'direct' | null;
  fallbackModel: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UserModelProvider {
  id: string;
  userId: string;
  name: string;
  baseUrl: string;
  secretId: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface EnhancedAppData extends App {
  userName: string | null;
  userAvatar: string | null;
  starCount: number;
  userStarred: boolean;
  userFavorited: boolean;
  viewCount?: number;
  forkCount?: number;
  likeCount?: number;
}

export interface AppWithFavoriteStatus extends App {
  isFavorite: boolean;
  updatedAtFormatted: string;
}

export interface FavoriteToggleResult {
  isFavorite: boolean;
}

export type PaginationParams = Partial<
  Pick<PaginationInfo, 'limit' | 'offset'>
>;

export type TimePeriod = 'today' | 'week' | 'month' | 'all';
export type AppSortOption = 'recent' | 'popular' | 'trending' | 'starred';
export type SortOrder = 'asc' | 'desc';

export interface AppQueryOptions extends PaginationParams {
  framework?: string;
  search?: string;
  sort?: AppSortOption;
  order?: SortOrder;
  period?: TimePeriod;
  status?: 'generating' | 'completed';
  visibility?: Visibility;
}

export interface PublicAppQueryOptions extends PaginationParams {
  framework?: string;
  search?: string;
  sort?: AppSortOption;
  order?: SortOrder;
  period?: TimePeriod;
  userId?: string;
}

export interface UserStats {
  appCount: number;
  publicAppCount: number;
  favoriteCount: number;
  totalLikesReceived: number;
  totalViewsReceived: number;
  streakDays: number;
  achievements: string[];
}

export interface UserActivity {
  type: 'created' | 'updated' | 'favorited';
  title: string;
  timestamp: Date | null;
  metadata: Record<string, unknown>;
}
