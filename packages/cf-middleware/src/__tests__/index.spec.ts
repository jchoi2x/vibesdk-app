import { describe, it, expect } from 'vitest';
import {
  compose,
  cors,
  requestId,
  securityHeaders,
  type TTMiddleware,
} from '../index';

const makeReq = (
  opts: RequestInit & { url?: string; headers?: Record<string, string> } = {},
) => {
  const { url = 'https://example.com/', headers, ...rest } = opts;
  return new Request(url, { ...rest, headers });
};

const finalHandler = async () => new Response('ok', { status: 200 });

describe('compose', () => {
  it('calls middlewares in left-to-right order', async () => {
    const order: number[] = [];
    const m1: TMiddleware = async (_req, next) => {
      order.push(1);
      const res = await next();
      order.push(4);
      return res;
    };
    const m2: TMiddleware = async (_req, next) => {
      order.push(2);
      const res = await next();
      order.push(3);
      return res;
    };
    await compose(m1, m2)(makeReq(), finalHandler);
    expect(order).toEqual([1, 2, 3, 4]);
  });

  it('passes the final handler response through the chain', async () => {
    const pass: TMiddleware = async (_req, next) => next();
    const res = await compose(pass, pass)(makeReq(), finalHandler);
    expect(await res.text()).toBe('ok');
  });

  it('allows a middleware to short-circuit without calling next', async () => {
    const short: TMiddleware = async () =>
      new Response('short', { status: 403 });
    const res = await compose(short)(makeReq(), finalHandler);
    expect(res.status).toBe(403);
  });

  it('throws when next() is called more than once', async () => {
    const bad: TMiddleware = async (_req, next) => {
      await next();
      return next();
    };
    await expect(compose(bad)(makeReq(), finalHandler)).rejects.toThrow(
      'next() called multiple times',
    );
  });

  it('composes zero middlewares and calls the final handler directly', async () => {
    const res = await compose()(makeReq(), finalHandler);
    expect(await res.text()).toBe('ok');
  });
});

describe('cors', () => {
  it('sets Allow-Origin for a wildcard origin config', async () => {
    const mw = cors({ origins: '*' });
    const req = makeReq({ headers: { origin: 'https://any.com' } });
    const res = await mw(req, finalHandler);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://any.com',
    );
  });

  it('sets Allow-Origin for a matching string origin', async () => {
    const mw = cors({ origins: 'https://allowed.com' });
    const req = makeReq({ headers: { origin: 'https://allowed.com' } });
    const res = await mw(req, finalHandler);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://allowed.com',
    );
  });

  it('does not set Allow-Origin for a disallowed origin', async () => {
    const mw = cors({ origins: 'https://allowed.com' });
    const req = makeReq({ headers: { origin: 'https://other.com' } });
    const res = await mw(req, finalHandler);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('allows origins from an array', async () => {
    const mw = cors({ origins: ['https://a.com', 'https://b.com'] });
    const req = makeReq({ headers: { origin: 'https://b.com' } });
    const res = await mw(req, finalHandler);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://b.com',
    );
  });

  it('rejects origins not in the array', async () => {
    const mw = cors({ origins: ['https://a.com'] });
    const req = makeReq({ headers: { origin: 'https://c.com' } });
    const res = await mw(req, finalHandler);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('allows origins matching a regex', async () => {
    const mw = cors({ origins: /\.example\.com$/ });
    const req = makeReq({ headers: { origin: 'https://sub.example.com' } });
    const res = await mw(req, finalHandler);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://sub.example.com',
    );
  });

  it('rejects origins not matching a regex', async () => {
    const mw = cors({ origins: /\.example\.com$/ });
    const req = makeReq({ headers: { origin: 'https://other.net' } });
    const res = await mw(req, finalHandler);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('returns 204 with CORS headers for OPTIONS preflight', async () => {
    const mw = cors({ origins: '*' });
    const req = makeReq({
      method: 'OPTIONS',
      headers: { origin: 'https://foo.com' },
    });
    const res = await mw(req, finalHandler);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Methods')).toBeTruthy();
    expect(res.headers.get('Access-Control-Allow-Headers')).toBeTruthy();
    expect(res.headers.get('Access-Control-Max-Age')).toBeTruthy();
  });

  it('sets Allow-Credentials when credentials option is true', async () => {
    const mw = cors({ origins: 'https://foo.com', credentials: true });
    const req = makeReq({ headers: { origin: 'https://foo.com' } });
    const res = await mw(req, finalHandler);
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
  });

  it('does not set Allow-Credentials when credentials option is false', async () => {
    const mw = cors({ origins: '*', credentials: false });
    const req = makeReq({ headers: { origin: 'https://foo.com' } });
    const res = await mw(req, finalHandler);
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBeNull();
  });
});

describe('requestId', () => {
  it('sets x-request-id on the response', async () => {
    const mw = requestId();
    const res = await mw(makeReq(), finalHandler);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  it('preserves an existing x-request-id from the request', async () => {
    const mw = requestId();
    const req = makeReq({ headers: { 'x-request-id': 'my-fixed-id' } });
    const res = await mw(req, finalHandler);
    expect(res.headers.get('x-request-id')).toBe('my-fixed-id');
  });

  it('generates a unique ID when the request has none', async () => {
    const mw = requestId();
    const r1 = await mw(makeReq(), finalHandler);
    const r2 = await mw(makeReq(), finalHandler);
    const id1 = r1.headers.get('x-request-id');
    const id2 = r2.headers.get('x-request-id');
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });
});

describe('securityHeaders', () => {
  it('sets X-Content-Type-Options to nosniff', async () => {
    const mw = securityHeaders();
    const res = await mw(makeReq(), finalHandler);
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('sets X-Frame-Options to DENY', async () => {
    const mw = securityHeaders();
    const res = await mw(makeReq(), finalHandler);
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('sets X-XSS-Protection to 0', async () => {
    const mw = securityHeaders();
    const res = await mw(makeReq(), finalHandler);
    expect(res.headers.get('X-XSS-Protection')).toBe('0');
  });

  it('sets Referrer-Policy to strict-origin-when-cross-origin', async () => {
    const mw = securityHeaders();
    const res = await mw(makeReq(), finalHandler);
    expect(res.headers.get('Referrer-Policy')).toBe(
      'strict-origin-when-cross-origin',
    );
  });

  it('does not alter the response status or body', async () => {
    const mw = securityHeaders();
    const res = await mw(makeReq(), finalHandler);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('ok');
  });
});
