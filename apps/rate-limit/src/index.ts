import { Hono } from 'hono';
import { RateLimitStore } from './rate-limit-store.do';

export { RateLimitStore };

const app = new Hono<{ Bindings: Env }>();
app.use('*', async (c, next) => {
  const request = c.req.raw;
  const url = new URL(request.url);

  const key = url.searchParams.get('key');
  if (!key) {
    return new Response('Missing key', { status: 400 });
  }
  // Shard by key prefix for distributed rate limiting
  const shardKey = key.split(':')[0] ?? key;
  const id = c.env.RATE_LIMIT_STORE.idFromName(shardKey);
  const stub = c.env.RATE_LIMIT_STORE.get(id);
  return stub.fetch(request);
});


export default app;
