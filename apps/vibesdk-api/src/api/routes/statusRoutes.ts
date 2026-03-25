import { Hono } from 'hono';
import { StatusController } from '@/api/controllers/status/controller';
import { adaptController } from '@/api/honoAdapter';
import { type AppEnv } from '@/types/appenv';
import { AuthConfig, setAuthLevel } from '@/middleware/auth/routeAuth';

export function setupStatusRoutes(app: Hono<AppEnv>): void {
  const statusRouter = new Hono<AppEnv>();

  statusRouter.get(
    '/',
    setAuthLevel(AuthConfig.public),
    adaptController(StatusController, StatusController.getPlatformStatus),
  );

  app.route('/api/status', statusRouter);
}
