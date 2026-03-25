import { StatsController } from '@/api/controllers/stats/controller';
import { type Hono } from 'hono';
import { type AppEnv } from '@/types/appenv';
import { adaptController } from '@/api/honoAdapter';
import { AuthConfig, setAuthLevel } from '@/middleware/auth/routeAuth';

/**
 * Setup user statistics routes
 */
export function setupStatsRoutes(app: Hono<AppEnv>): void {
  // User statistics
  app.get(
    '/api/stats',
    setAuthLevel(AuthConfig.authenticated),
    adaptController(StatsController, StatsController.getUserStats),
  );

  // User activity timeline
  app.get(
    '/api/stats/activity',
    setAuthLevel(AuthConfig.authenticated),
    adaptController(StatsController, StatsController.getUserActivity),
  );
}
