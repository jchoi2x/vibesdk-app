import { setupAuthRoutes } from '@/api/routes/authRoutes';
import { setupAppRoutes } from '@/api/routes/appRoutes';
import { setupUserRoutes } from '@/api/routes/userRoutes';
import { setupStatsRoutes } from '@/api/routes/statsRoutes';
import { setupAnalyticsRoutes } from '@/api/routes/analyticsRoutes';
// import { setupUserSecretsRoutes } from '@/api/routes/userSecretsRoutes';
import { setupModelConfigRoutes } from '@/api/routes/modelConfigRoutes';
import { setupModelProviderRoutes } from '@/api/routes/modelProviderRoutes';
import { setupGitHubExporterRoutes } from '@/api/routes/githubExporterRoutes';
import { setupCodegenRoutes } from '@/api/routes/codegenRoutes';
import { setupScreenshotRoutes } from '@/api/routes/imagesRoutes';
import { setupSentryRoutes } from '@/api/routes/sentryRoutes';
import { setupCapabilitiesRoutes } from '@/api/routes/capabilitiesRoutes';
import { setupTicketRoutes } from '@/api/routes/ticketRoutes';
import { type Hono } from "hono";
import { type AppEnv } from "@/types/appenv";
import { setupStatusRoutes } from '@/api/routes/statusRoutes';

export function setupRoutes(app: Hono<AppEnv>): void {
    // Health check route
    app.get('/api/health', (c) => {
        return c.json({ status: 'ok' });
    }); 
    
    // Sentry tunnel routes (public - no auth required)
    setupSentryRoutes(app);

    // Platform status routes (public)
    setupStatusRoutes(app);

    // Platform capabilities routes (public)
    setupCapabilitiesRoutes(app);

    // Authentication and user management routes
    setupAuthRoutes(app);
    
    // WebSocket ticket routes
    setupTicketRoutes(app);
    
    // Codegen routes
    setupCodegenRoutes(app);
    
    // User dashboard and profile routes
    setupUserRoutes(app);
    
    // App management routes
    setupAppRoutes(app);
    
    // Stats routes
    setupStatsRoutes(app);
    
    // AI Gateway Analytics routes
    setupAnalyticsRoutes(app);
    
    // // Secrets management routes (legacy D1-based)
    // setupSecretsRoutes(app);

    // // User secrets vault routes
    // setupUserSecretsRoutes(app);
    
    // Model configuration and provider keys routes
    setupModelConfigRoutes(app);
    
    // Model provider routes
    setupModelProviderRoutes(app);

    // GitHub Exporter routes
    setupGitHubExporterRoutes(app);

    // Screenshot serving routes (public)
    setupScreenshotRoutes(app);
}
