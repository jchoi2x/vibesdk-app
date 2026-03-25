import { describe, it, expect, vi } from 'vitest';
import {
  BaseDurableObject,
  rpcResponse,
  rpcError,
  callRPC,
  getOrDefault,
} from '../index';

// Concrete subclass for testing the abstract base
class TestDurableObject extends BaseDurableObject {
  async fetch(_req: Request): Promise<Response> {
    return new Response('handled', { status: 200 });
  }
}

describe('BaseDurableObject', () => {
  const makeState = () => ({ storage: {} }) as unknown as DurableObjectState;

  it('can be instantiated via a concrete subclass', () => {
    const do_ = new TestDurableObject(makeState(), {});
    expect(do_).toBeInstanceOf(BaseDurableObject);
  });

  it('delegates fetch to the subclass implementation', async () => {
    const do_ = new TestDurableObject(makeState(), {});
    const res = await do_.fetch(new Request('https://example.com/'));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('handled');
  });
});

describe('rpcResponse', () => {
  it('returns a 200 JSON response by default', async () => {
    const res = rpcResponse({ ok: true });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    expect(await res.json()).toEqual({ ok: true });
  });

  it('accepts a custom status code', async () => {
    const res = rpcResponse({ created: true }, 201);
    expect(res.status).toBe(201);
  });

  it('serialises the data payload to JSON', async () => {
    const data = { list: [1, 2, 3], nested: { a: 'b' } };
    const res = rpcResponse(data);
    expect(await res.json()).toEqual(data);
  });
});

describe('rpcError', () => {
  it('returns a 500 JSON error response by default', async () => {
    const res = rpcError('Something went wrong');
    expect(res.status).toBe(500);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    expect(await res.json()).toEqual({ error: 'Something went wrong' });
  });

  it('accepts a custom status code', async () => {
    const res = rpcError('Not found', 404);
    expect(res.status).toBe(404);
  });
});

describe('callRPC', () => {
  const makeStub = (responseBody: unknown, status = 200) => ({
    fetch: vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(responseBody), { status }),
      ),
  });

  it('makes a GET request when no body is provided', async () => {
    const stub = makeStub({ data: 42 });
    const result = await callRPC(stub as unknown as DurableObjectStub, '/test');
    expect(stub.fetch).toHaveBeenCalledWith(
      'https://do/test',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result).toEqual({ data: 42 });
  });

  it('makes a POST request when a body is provided', async () => {
    const stub = makeStub({ ok: true });
    await callRPC(stub as unknown as DurableObjectStub, '/create', {
      name: 'test',
    });
    const [, init] = stub.fetch.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual(
      expect.objectContaining({ 'Content-Type': 'application/json' }),
    );
    expect(JSON.parse(init.body as string)).toEqual({ name: 'test' });
  });

  it('throws with the error message from the response body', async () => {
    const stub = makeStub({ error: 'Not found' }, 404);
    await expect(
      callRPC(stub as unknown as DurableObjectStub, '/missing'),
    ).rejects.toThrow('Not found');
  });

  it('throws with a status-based message when no error field is present', async () => {
    const stub = makeStub({}, 503);
    await expect(
      callRPC(stub as unknown as DurableObjectStub, '/broken'),
    ).rejects.toThrow('RPC failed with status 503');
  });

  it('returns parsed JSON from a successful response', async () => {
    const stub = makeStub([1, 2, 3]);
    const result = await callRPC(stub as unknown as DurableObjectStub, '/list');
    expect(result).toEqual([1, 2, 3]);
  });
});

describe('getOrDefault', () => {
  it('returns the stored value when the key exists', async () => {
    const storage = {
      get: vi.fn().mockResolvedValue('stored'),
    } as unknown as DurableObjectStorage;
    const result = await getOrDefault(storage, 'key', 'default');
    expect(result).toBe('stored');
  });

  it('returns the default value when the key is absent', async () => {
    const storage = {
      get: vi.fn().mockResolvedValue(undefined),
    } as unknown as DurableObjectStorage;
    const result = await getOrDefault(storage, 'missing', 42);
    expect(result).toBe(42);
  });

  it('passes options through to storage.get', async () => {
    const storage = {
      get: vi.fn().mockResolvedValue(null),
    } as unknown as DurableObjectStorage;
    const opts = { allowConcurrency: true };
    await getOrDefault(storage, 'key', null, opts);
    expect(storage.get).toHaveBeenCalledWith('key', opts);
  });

  it('returns null default when storage returns null (falsy but set)', async () => {
    const storage = {
      get: vi.fn().mockResolvedValue(null),
    } as unknown as DurableObjectStorage;
    // null ?? defaultValue returns defaultValue because null is nullish
    const result = await getOrDefault(storage, 'key', 'fallback');
    expect(result).toBe('fallback');
  });
});
