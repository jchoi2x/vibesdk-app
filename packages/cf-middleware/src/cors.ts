import type { ICorsOptions, TMiddleware } from './types';

export function cors(opts: ICorsOptions): TMiddleware {
  const {
    origins,
    methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    headers = ['Content-Type', 'Authorization'],
    maxAge = 86400,
    credentials = false,
  } = opts;

  const isAllowed = (origin: string): boolean => {
    if (origins instanceof RegExp) return origins.test(origin);
    if (Array.isArray(origins)) return origins.includes(origin);
    return origins === '*' || origins === origin;
  };

  return async (req, next) => {
    const origin = req.headers.get('origin') ?? '';
    const allowed = isAllowed(origin);

    if (req.method === 'OPTIONS') {
      const res = new Response(null, { status: 204 });
      if (allowed) {
        res.headers.set('Access-Control-Allow-Origin', origin || '*');
        res.headers.set('Access-Control-Allow-Methods', methods.join(', '));
        res.headers.set('Access-Control-Allow-Headers', headers.join(', '));
        res.headers.set('Access-Control-Max-Age', String(maxAge));
        if (credentials)
          res.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      return res;
    }

    const res = await next();
    if (allowed) {
      res.headers.set('Access-Control-Allow-Origin', origin || '*');
      if (credentials)
        res.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    return res;
  };
}
