import type { ISlidingWindowOptions, IRateLimiter } from './types';
import { slidingWindowCheck } from './sliding-window';

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
    async check(k) {
      const now = Date.now();
      const stored = (await kv.get(prefixedKey(k), 'json')) as number[] | null;
      const { result, timestamps } = slidingWindowCheck({
        timestamps: stored ?? [],
        windowMs: opts.windowMs,
        max: opts.max,
        nowMs: now,
      });

      await kv.put(prefixedKey(k), JSON.stringify(timestamps), {
        expirationTtl: Math.ceil(opts.windowMs / 1000),
      });

      return result;
    },
    async reset(k) {
      await kv.delete(prefixedKey(k));
    },
  };
}
