/**
 * Authentication type definitions for vibesdk platform.
 * Self-contained - no imports from worker or cross-app paths.
 */

export type OAuthProvider = 'google' | 'github';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  provider?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  isAnonymous?: boolean;
}

export interface AuthSession {
  userId: string;
  email: string;
  sessionId: string;
  expiresAt: Date | null;
}

export interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
  email: string;
  type: 'access' | 'refresh';
  jti?: string;
  sessionId: string;
  ipHash?: string;
}

export interface AuthUserSession {
  user: AuthUser;
  sessionId: string;
}

export interface AuthResult extends AuthUserSession {
  expiresAt: Date | null;
  accessToken: string;
  isNewUser?: boolean;
  requiresEmailVerification?: boolean;
  redirectUrl?: string;
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: Date | null;
  lastUsed: Date | null;
  isActive: boolean | null;
}

export interface SessionResponse {
  user: AuthUser;
  sessionId: string;
  expiresAt: Date | null;
}

export interface AuthProvidersResponseData {
  providers: {
    google: boolean;
    github: boolean;
    email: boolean;
  };
  hasOAuth: boolean;
  requiresEmailAuth: boolean;
  csrfToken?: string;
  csrfExpiresIn?: number;
}

export interface ActiveSessionsData {
  sessions: Array<{
    id: string;
    userAgent: string | null;
    ipAddress: string | null;
    lastActivity: Date;
    createdAt: Date;
    isCurrent: boolean;
  }>;
}

export interface ApiKeysData {
  keys: Array<{
    id: string;
    name: string;
    keyPreview: string;
    createdAt: Date | null;
    lastUsed: Date | null;
    isActive: boolean;
  }>;
}

export interface PasswordValidationResult {
  valid: boolean;
  errors?: string[];
  score: number;
  requirements?: {
    minLength: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
    notCommon: boolean;
    noSequential: boolean;
  };
  suggestions?: string[];
}

export interface SecurityContext {
  ipAddress: string;
  userAgent: string;
  requestId: string;
  country?: string;
  region?: string;
  isp?: string;
  deviceFingerprint?: string;
  riskScore?: number;
  riskFactors?: string[];
}

export interface PendingWsTicket {
  token: string;
  user: AuthUser;
  sessionId: string;
  createdAt: number;
  expiresAt: number;
}

export interface TicketConsumptionResult {
  user: AuthUser;
  sessionId: string;
}
