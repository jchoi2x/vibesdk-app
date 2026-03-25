export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt: number; // Unix ms
}

export interface RateLimiter {
	check(key: string): Promise<RateLimitResult>;
	reset(key: string): Promise<void>;
}

export interface SlidingWindowOptions {
	windowMs: number;
	max: number;
}

/**
 * In-memory rate limiter. Useful for tests and single-process scenarios.
 * Not suitable for distributed use — state is lost on Worker restart.
 */
export function createInMemoryRateLimiter(
	opts: SlidingWindowOptions,
): RateLimiter {
	const windows = new Map<string, number[]>();

	return {
		async check(key): Promise<RateLimitResult> {
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

/**
 * KV-backed sliding window rate limiter.
 * Suitable for low-to-medium traffic. For high throughput use a DO-backed limiter.
 */
export function createKVRateLimiter(
	kv: KVNamespace,
	opts: SlidingWindowOptions,
): RateLimiter {
	const prefixedKey = (k: string) => `rl:${k}`;

	return {
		async check(k): Promise<RateLimitResult> {
			const now = Date.now();
			const cutoff = now - opts.windowMs;
			const stored = (await kv.get(prefixedKey(k), 'json')) as
				| number[]
				| null;
			const timestamps = (stored ?? []).filter((t) => t > cutoff);
			const allowed = timestamps.length < opts.max;

			if (allowed) timestamps.push(now);

			await kv.put(prefixedKey(k), JSON.stringify(timestamps), {
				expirationTtl: Math.ceil(opts.windowMs / 1000),
			});

			return {
				allowed,
				remaining: Math.max(0, opts.max - timestamps.length),
				resetAt: now + opts.windowMs,
			};
		},
		async reset(k) {
			await kv.delete(prefixedKey(k));
		},
	};
}
