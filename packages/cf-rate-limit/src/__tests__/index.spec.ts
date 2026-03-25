import { describe, it, expect, vi } from 'vitest';
import { createInMemoryRateLimiter, createKVRateLimiter } from '../index';

describe('createInMemoryRateLimiter', () => {
  it('allows requests up to the configured max', async () => {
    const limiter = createInMemoryRateLimiter({ windowMs: 60_000, max: 3 });
    const r1 = await limiter.check('user1');
    const r2 = await limiter.check('user1');
    const r3 = await limiter.check('user1');
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
  });

  it('blocks the request that exceeds max', async () => {
    const limiter = createInMemoryRateLimiter({ windowMs: 60_000, max: 2 });
    await limiter.check('user1');
    await limiter.check('user1');
    const r = await limiter.check('user1');
    expect(r.allowed).toBe(false);
  });

  it('decrements remaining correctly', async () => {
    const limiter = createInMemoryRateLimiter({ windowMs: 60_000, max: 3 });
    const r1 = await limiter.check('user1');
    expect(r1.remaining).toBe(2);
    const r2 = await limiter.check('user1');
    expect(r2.remaining).toBe(1);
    const r3 = await limiter.check('user1');
    expect(r3.remaining).toBe(0);
  });

  it('returns remaining 0 for blocked requests', async () => {
    const limiter = createInMemoryRateLimiter({ windowMs: 60_000, max: 1 });
    await limiter.check('user1');
    const blocked = await limiter.check('user1');
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('returns resetAt in the future', async () => {
    const now = Date.now();
    const limiter = createInMemoryRateLimiter({ windowMs: 5_000, max: 10 });
    const r = await limiter.check('user1');
    expect(r.resetAt).toBeGreaterThanOrEqual(now + 5_000 - 50);
  });

  it('allows requests again after reset', async () => {
    const limiter = createInMemoryRateLimiter({ windowMs: 60_000, max: 1 });
    await limiter.check('user1');
    const blocked = await limiter.check('user1');
    expect(blocked.allowed).toBe(false);

    await limiter.reset('user1');

    const after = await limiter.check('user1');
    expect(after.allowed).toBe(true);
  });

  it('tracks separate keys independently', async () => {
    const limiter = createInMemoryRateLimiter({ windowMs: 60_000, max: 1 });
    await limiter.check('user1');
    const r = await limiter.check('user2');
    expect(r.allowed).toBe(true);
  });

  it('reset on a key that was never used does not throw', async () => {
    const limiter = createInMemoryRateLimiter({ windowMs: 60_000, max: 5 });
    await expect(limiter.reset('nonexistent')).resolves.toBeUndefined();
  });
});

describe('createKVRateLimiter', () => {
  const makeKV = (initial: Record<string, number[]> = {}) => {
    const store = new Map<string, string>(
      Object.entries(initial).map(([k, v]) => [k, JSON.stringify(v)]),
    );
    return {
      get: vi.fn(async (key: string, type: string) => {
        const val = store.get(key);
        if (val === undefined) return null;
        return type === 'json' ? JSON.parse(val) : val;
      }),
      put: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      delete: vi.fn(async (key: string) => {
        store.delete(key);
      }),
    };
  };

  it('allows requests within the limit', async () => {
    const kv = makeKV();
    const limiter = createKVRateLimiter(kv as unknown as KVNamespace, {
      windowMs: 60_000,
      max: 2,
    });
    const r1 = await limiter.check('user1');
    const r2 = await limiter.check('user1');
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });

  it('blocks requests exceeding the limit', async () => {
    const kv = makeKV();
    const limiter = createKVRateLimiter(kv as unknown as KVNamespace, {
      windowMs: 60_000,
      max: 2,
    });
    await limiter.check('user1');
    await limiter.check('user1');
    const r = await limiter.check('user1');
    expect(r.allowed).toBe(false);
  });

  it('uses the prefixed key (rl:<key>) for KV reads and writes', async () => {
    const kv = makeKV();
    const limiter = createKVRateLimiter(kv as unknown as KVNamespace, {
      windowMs: 60_000,
      max: 5,
    });
    await limiter.check('mykey');
    expect(kv.get).toHaveBeenCalledWith('rl:mykey', 'json');
    expect(kv.put).toHaveBeenCalledWith(
      'rl:mykey',
      expect.any(String),
      expect.any(Object),
    );
  });

  it('stores timestamps as a JSON array in KV', async () => {
    const kv = makeKV();
    const limiter = createKVRateLimiter(kv as unknown as KVNamespace, {
      windowMs: 60_000,
      max: 5,
    });
    await limiter.check('user1');
    const [, stored] = kv.put.mock.calls[0] as [string, string, object];
    const parsed = JSON.parse(stored);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
  });

  it('sets expirationTtl derived from windowMs', async () => {
    const kv = makeKV();
    const limiter = createKVRateLimiter(kv as unknown as KVNamespace, {
      windowMs: 30_000,
      max: 5,
    });
    await limiter.check('user1');
    const [, , opts] = kv.put.mock.calls[0] as [
      string,
      string,
      { expirationTtl: number },
    ];
    expect(opts.expirationTtl).toBe(30);
  });

  it('reset calls kv.delete with the prefixed key', async () => {
    const kv = makeKV();
    const limiter = createKVRateLimiter(kv as unknown as KVNamespace, {
      windowMs: 60_000,
      max: 5,
    });
    await limiter.reset('mykey');
    expect(kv.delete).toHaveBeenCalledWith('rl:mykey');
  });

  it('returns resetAt in the future', async () => {
    const kv = makeKV();
    const now = Date.now();
    const limiter = createKVRateLimiter(kv as unknown as KVNamespace, {
      windowMs: 10_000,
      max: 5,
    });
    const r = await limiter.check('user1');
    expect(r.resetAt).toBeGreaterThanOrEqual(now + 10_000 - 50);
  });
});
