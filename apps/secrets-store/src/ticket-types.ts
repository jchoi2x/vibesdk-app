/**
 * Ticket types for WebSocket vault authentication (minimal copy for secrets-store worker).
 */

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
