/// <reference types="@cloudflare/workers-types" />

interface Env {
	VIBESDK_API: Fetcher;
}

/**
 * Intercepts all /api/* requests and forwards them to vibesdk-api via the
 * VIBESDK_API service binding. The full URL (including the /api prefix) is
 * preserved because vibesdk-api's Hono routes are all mounted under /api/*.
 *
 * This never leaves Cloudflare's network — service bindings are in-process
 * calls with no external HTTP hop.
 */
export const onRequest: PagesFunction<Env> = (context) => {
	return context.env.VIBESDK_API.fetch(context.request);
};
