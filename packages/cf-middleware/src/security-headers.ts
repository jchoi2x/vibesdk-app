import type { TMiddleware } from './types';

export function securityHeaders(): TMiddleware {
	return async (_req, next) => {
		const res = await next();
		res.headers.set('X-Content-Type-Options', 'nosniff');
		res.headers.set('X-Frame-Options', 'DENY');
		res.headers.set('X-XSS-Protection', '0');
		res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		return res;
	};
}
