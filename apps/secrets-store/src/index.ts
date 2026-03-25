import { SecretsStore } from './secrets-store';

import { env } from 'cloudflare:workers';
import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.use('/secrets/*', async (c) => {
  const _url = new URL(c.req.raw.url);
  const userId = _url.searchParams.get('user_id');
  if (!userId) {
    return new Response('Missing user_id', { status: 400 });
  }
  const id = env.SECRETS_STORE.idFromName(userId);
  const stub = env.SECRETS_STORE.get(id);
  return stub.fetch(c.req.raw);
});

export default app;
export { SecretsStore };
