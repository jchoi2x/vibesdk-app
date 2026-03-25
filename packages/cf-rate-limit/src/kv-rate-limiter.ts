import type { ISlidingWindowOptions, IRateLimiter, IRateLimitResult } from './types';

/**
 * KV-backed sliding window rate limiter.
 * Suitable for low-to-medium traffic. For high throughput use a DO-backed limiter.
 */
export function createKVRateLimiter(
	kv: KVNamespace,
	opts: ISlidingWindowOptions,
): IRateLimiter {
	const prefixedKey = (k: string) => `rl:${k}`;

	return {
		async check(k): Promise<IRateLimitResult> {
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
