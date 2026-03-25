import { Hono } from "hono";

const app = new Hono<{Bindings: Env }>();

app.use('/api/*', async (c) => {
	return c.env.VIBESDK_API.fetch(c.req.raw);
});

app.use('/', (c) => {
	return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
