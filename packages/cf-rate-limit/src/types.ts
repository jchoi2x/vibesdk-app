export interface IRateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt: number; // Unix ms
}

export interface IRateLimiter {
	check(key: string): Promise<IRateLimitResult>;
	reset(key: string): Promise<void>;
}

export interface ISlidingWindowOptions {
	windowMs: number;
	max: number;
}
