export type Next = () => Promise<Response>;
export type Middleware = (req: Request, next: Next) => Promise<Response>;

/**
 * Composes middlewares left-to-right. Each calls next() to pass control forward.
 */
export function compose(...middlewares: Middleware[]): Middleware {
	return async (req, next) => {
		let index = -1;

		const dispatch = async (i: number): Promise<Response> => {
			if (i <= index) throw new Error('next() called multiple times');
			index = i;
			const fn = i === middlewares.length ? next : middlewares[i];
			if (!fn) throw new Error(`middleware[${i}] is undefined`);
			return fn(req, () => dispatch(i + 1));
		};

		return dispatch(0);
	};
}

export interface CorsOptions {
	origins: string | string[] | RegExp;
	methods?: string[];
	headers?: string[];
	maxAge?: number;
	credentials?: boolean;
}

export function cors(opts: CorsOptions): Middleware {
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
				res.headers.set(
					'Access-Control-Allow-Methods',
					methods.join(', '),
				);
				res.headers.set(
					'Access-Control-Allow-Headers',
					headers.join(', '),
				);
				res.headers.set('Access-Control-Max-Age', String(maxAge));
				if (credentials)
					res.headers.set(
						'Access-Control-Allow-Credentials',
						'true',
					);
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

export function requestId(): Middleware {
	return async (req, next) => {
		const existing = req.headers.get('x-request-id');
		const id = existing ?? crypto.randomUUID();
		const res = await next();
		res.headers.set('x-request-id', id);
		return res;
	};
}

export function securityHeaders(): Middleware {
	return async (_req, next) => {
		const res = await next();
		res.headers.set('X-Content-Type-Options', 'nosniff');
		res.headers.set('X-Frame-Options', 'DENY');
		res.headers.set('X-XSS-Protection', '0');
		res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		return res;
	};
}
