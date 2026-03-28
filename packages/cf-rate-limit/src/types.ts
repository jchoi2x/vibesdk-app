export interface IRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix ms
}

/**
 * Any `check` implementation that resolves to a rate-limit outcome.
 * Use a concrete function type to fix argument arity (e.g. per-call window options).
 */
export type RateLimitCheckFn = (
  key: string,
) => Promise<IRateLimitResult>;

/**
 * Rate limiter: configurable `check` signature; `reset` clears state for `check`'s first argument.
 */
export type RateLimiter<
  TCheck extends RateLimitCheckFn = (
    key: string,
  ) => Promise<IRateLimitResult>,
> = {
  check: TCheck;
  reset: (key: Parameters<TCheck>[0]) => Promise<void>;
};

/** Fixed `(key) => result` sliding-window limiter (KV, in-memory factories). */
export type IRateLimiter = RateLimiter<
  (key: string) => Promise<IRateLimitResult>
>;

export interface ISlidingWindowOptions {
  windowMs: number;
  max: number;
}

/** Input for `slidingWindowCheck` — storage-agnostic sliding window step. */
export interface SlidingWindowCheckParams {
  timestamps: readonly number[];
  windowMs: number;
  max: number;
  /** Defaults to `Date.now()` when omitted. */
  nowMs?: number;
}

/** Updated timestamp list plus the limiter result for one check. */
export interface SlidingWindowCheckResult {
  result: IRateLimitResult;
  timestamps: number[];
}
