/**
 * WebSocket Ticket Routes
 */

import { type Hono } from 'hono';
import { type AppEnv } from '@/types/appenv';
import { AuthConfig, setAuthLevel } from '@/middleware/auth/routeAuth';
import { adaptController } from '@/api/honoAdapter';
import { TicketController } from '@/api/controllers/ticket/controller';

export function setupTicketRoutes(app: Hono<AppEnv>): void {
	// Create WebSocket ticket - requires authentication
	// Ownership check is done in the controller based on resourceType
	app.post(
		'/api/ws-ticket',
		setAuthLevel(AuthConfig.authenticated),
		adaptController(TicketController, TicketController.createTicket)
	);
}
