import { RateLimitStore } from './rate-limit-store';

export { RateLimitStore };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/rate-limit/')) {
      const key = url.searchParams.get('key');
      if (!key) {
        return new Response('Missing key', { status: 400 });
      }
      // Shard by key prefix for distributed rate limiting
      const shardKey = key.split(':')[0] ?? key;
      const id = env.RATE_LIMIT_STORE.idFromName(shardKey);
      const stub = env.RATE_LIMIT_STORE.get(id);
      return stub.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
