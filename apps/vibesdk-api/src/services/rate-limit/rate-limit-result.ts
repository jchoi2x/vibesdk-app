export interface RateLimitResult {
	success: boolean;
	remainingLimit?: number;
	exceededLimit?: 'main' | 'burst' | 'daily';
	limitValue?: number;
	periodSeconds?: number;
}
