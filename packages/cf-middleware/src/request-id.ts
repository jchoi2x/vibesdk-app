import type { TMiddleware } from './types';

export function requestId(): TMiddleware {
  return async (req, next) => {
    const existing = req.headers.get('x-request-id');
    const id = existing ?? crypto.randomUUID();
    const res = await next();
    res.headers.set('x-request-id', id);
    return res;
  };
}
