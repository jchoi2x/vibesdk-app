import { SecretsController } from '@/api/controllers/secrets/controller';
import { Hono } from 'hono';
import { type AppEnv } from '@/types/appenv';
import { adaptController } from '@/api/honoAdapter';
import { AuthConfig, setAuthLevel } from '@/middleware/auth/routeAuth';

export function setupSecretsRoutes(app: Hono<AppEnv>): void {
    const secretsRouter = new Hono<AppEnv>();
    
    secretsRouter.get('/templates', setAuthLevel(AuthConfig.authenticated), adaptController(SecretsController, SecretsController.getTemplates));
    app.route('/api/secrets', secretsRouter);
}