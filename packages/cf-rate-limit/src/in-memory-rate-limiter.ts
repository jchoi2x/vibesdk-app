import type { ISlidingWindowOptions, IRateLimiter } from './types';
import { slidingWindowCheck } from './sliding-window';

/**
 * In-memory rate limiter. Useful for tests and single-process scenarios.
 * Not suitable for distributed use — state is lost on Worker restart.
 */
export function createInMemoryRateLimiter(
  opts: ISlidingWindowOptions,
): IRateLimiter {
  const windows = new Map<string, number[]>();

  return {
    async check(key) {
      const now = Date.now();
      const { result, timestamps } = slidingWindowCheck({
        timestamps: windows.get(key) ?? [],
        windowMs: opts.windowMs,
        max: opts.max,
        nowMs: now,
      });
      windows.set(key, timestamps);

      return result;
    },
    async reset(key) {
      windows.delete(key);
    },
  };
}
