import type { SlidingWindowCheckParams, SlidingWindowCheckResult } from './types';

/**
 * Pure sliding-window step: prune expired timestamps, apply max, optionally record this request.
 * Persist `timestamps` after calling; use `result` for the HTTP/API response.
 */
export function slidingWindowCheck(
  params: SlidingWindowCheckParams,
): SlidingWindowCheckResult {
  return slidingWindowCheckWithCount({ ...params, increment: 1 });
}

/**
 * Sliding-window check that consumes `increment` slots in one step (e.g. LLM credit cost).
 */
export function slidingWindowCheckWithCount(
  params: SlidingWindowCheckParams & { increment?: number },
): SlidingWindowCheckResult {
  const now = params.nowMs ?? Date.now();
  const increment = Math.max(1, params.increment ?? 1);
  const cutoff = now - params.windowMs;
  const timestamps = params.timestamps.filter((t) => t > cutoff);
  const allowed = timestamps.length + increment <= params.max;

  if (allowed) {
    for (let i = 0; i < increment; i++) {
      timestamps.push(now);
    }
  }

  return {
    result: {
      allowed,
      remaining: Math.max(0, params.max - timestamps.length),
      resetAt: now + params.windowMs,
    },
    timestamps,
  };
}
