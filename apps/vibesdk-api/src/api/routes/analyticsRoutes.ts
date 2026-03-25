/**
 * Setup routes for AI Gateway analytics endpoints
 */
import { AnalyticsController } from '@/api/controllers/analytics/controller';
import { type Hono } from 'hono';
import { type AppEnv } from '@/types/appenv';
import { AuthConfig, setAuthLevel } from '@/middleware/auth/routeAuth';
import { adaptController } from '@/api/honoAdapter';

/**
 * Setup analytics routes
 */
export function setupAnalyticsRoutes(app: Hono<AppEnv>): void {
    // User analytics - requires authentication
    app.get(
        '/api/user/:id/analytics',
        setAuthLevel(AuthConfig.ownerOnly),
        adaptController(AnalyticsController, AnalyticsController.getUserAnalytics)
    );

    // Agent/Chat analytics - requires authentication
    app.get(
        '/api/agent/:id/analytics',
        setAuthLevel(AuthConfig.ownerOnly),
        adaptController(AnalyticsController, AnalyticsController.getAgentAnalytics)
    );
}