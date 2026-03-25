import { Hono } from 'hono';
import { SentryTunnelController } from '@/api/controllers/sentry/tunnelController';
import { type AppEnv } from '@/types/appenv';
import { adaptController } from '@/api/honoAdapter';
import { AuthConfig, setAuthLevel } from '@/middleware/auth/routeAuth';

export function setupSentryRoutes(app: Hono<AppEnv>): void {
  const sentryRouter = new Hono<AppEnv>();

  // Sentry tunnel endpoint for frontend events (public - no auth required)
  sentryRouter.post(
    '/tunnel',
    setAuthLevel(AuthConfig.public),
    adaptController(SentryTunnelController, SentryTunnelController.tunnel),
  );

  // Mount the router under /api/sentry
  app.route('/api/sentry', sentryRouter);
}
