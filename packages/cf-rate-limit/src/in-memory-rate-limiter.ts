import type { ISlidingWindowOptions, IRateLimiter, IRateLimitResult } from './types';

/**
 * In-memory rate limiter. Useful for tests and single-process scenarios.
 * Not suitable for distributed use — state is lost on Worker restart.
 */
export function createInMemoryRateLimiter(
	opts: ISlidingWindowOptions,
): IRateLimiter {
	const windows = new Map<string, number[]>();

	return {
		async check(key): Promise<IRateLimitResult> {
			const now = Date.now();
			const cutoff = now - opts.windowMs;
			const timestamps = (windows.get(key) ?? []).filter(
				(t) => t > cutoff,
			);
			const allowed = timestamps.length < opts.max;

			if (allowed) timestamps.push(now);
			windows.set(key, timestamps);

			return {
				allowed,
				remaining: Math.max(0, opts.max - timestamps.length),
				resetAt: now + opts.windowMs,
			};
		},
		async reset(key) {
			windows.delete(key);
		},
	};
}
