import { Hono } from 'hono';
import { createLogger } from '@/logger';
import { isDispatcherAvailable } from '@/utils/dispatcherUtils';
import { createApp } from '@/app';
import type { AppEnv } from '@/types/appenv';
import { env } from 'cloudflare:workers';
// import * as Sentry from '@sentry/cloudflare';
// import { sentryOptions } from '@/observability/sentry';
import { getPreviewDomain } from '@/utils/urls';
import { proxyToAiGateway } from '@/services/aigateway-proxy/controller';
import { isOriginAllowed } from '@/config/security';
import { proxyToSandbox } from '@/services/sandbox/request-handler';
import {
  handleGitProtocolRequest,
  isGitProtocolRequest,
} from '@/api/handlers/git-protocol';
import { getAgentStub } from '@/agents';

// Durable Object and Service exports
export { UserAppSandboxService } from '@/services/sandbox/sandboxSdkClient';
export { CodeGeneratorAgent } from '@/agents/core/codingAgent';

// Logger for the main application and handlers
const logger = createLogger('App');

function setOriginControl(
  env: Env,
  request: Request,
  currentHeaders: Headers,
): Headers {
  const origin = request.headers.get('Origin');

  if (origin && isOriginAllowed(env, origin)) {
    currentHeaders.set('Access-Control-Allow-Origin', origin);
  }
  return currentHeaders;
}

/**
 * Handles requests for user-deployed applications on subdomains.
 * It first attempts to proxy to a live development sandbox. If that fails,
 * it dispatches the request to a permanently deployed worker via namespaces.
 * This function will NOT fall back to the main worker.
 *
 * @param request The incoming Request object.
 * @param env The environment bindings.
 * @returns A Response object from the sandbox, the dispatched worker, or an error.
 */
async function handleUserAppRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const { hostname } = url;
  logger.info(`Handling user app request for: ${hostname}`);

  // Check if this is an agent browser file serving request
  // Pattern: b-{agentid}-{token}.{previewDomain}
  const subdomain = hostname.split('.')[0];
  if (subdomain.startsWith('b-')) {
    // Extract agentId and token from subdomain
    const withoutPrefix = subdomain.substring(2); // Remove 'b-'
    const lastHyphenIndex = withoutPrefix.lastIndexOf('-');

    if (lastHyphenIndex !== -1) {
      const agentId = withoutPrefix.substring(0, lastHyphenIndex);
      logger.info(`Agent browser file serving request for agent: ${agentId}`);

      try {
        const agentStub = await getAgentStub(env, agentId);
        return await agentStub.handleBrowserFileServing(request);
      } catch (error: any) {
        logger.error(`Error forwarding to agent: ${error.message}`);
        return new Response('Agent not found', { status: 404 });
      }
    }
  }

  // 1. Attempt to proxy to a live development sandbox.
  // proxyToSandbox doesn't consume the request body on a miss, so no clone is needed here.
  const sandboxResponse = await proxyToSandbox(request, env);
  if (sandboxResponse) {
    logger.info(`Serving response from sandbox for: ${hostname}`);
    // If it was a websocket upgrade, we need to return the response as is
    if (sandboxResponse.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
      logger.info(`Serving websocket response from sandbox for: ${hostname}`);
      return sandboxResponse;
    }

    // Add headers to identify this as a sandbox response
    let headers = new Headers(sandboxResponse.headers);

    if (sandboxResponse.status === 500) {
      headers.set('X-Preview-Type', 'sandbox-error');
    } else {
      headers.set('X-Preview-Type', 'sandbox');
    }
    headers = setOriginControl(env, request, headers);
    headers.append('Vary', 'Origin');
    headers.set('Access-Control-Expose-Headers', 'X-Preview-Type');

    return new Response(sandboxResponse.body, {
      status: sandboxResponse.status,
      statusText: sandboxResponse.statusText,
      headers,
    });
  }

  // 2. If sandbox misses, attempt to dispatch to a deployed worker.
  logger.info(
    `Sandbox miss for ${hostname}, attempting dispatch to permanent worker.`,
  );
  if (!isDispatcherAvailable(env)) {
    logger.warn(`Dispatcher not available, cannot serve: ${hostname}`);
    return new Response('This application is not currently available.', {
      status: 404,
    });
  }

  // Extract the app name (e.g., "xyz" from "xyz.build.cloudflare.dev").
  const appName = subdomain;
  const dispatcher = env['DISPATCHER'];

  try {
    const worker = dispatcher.get(appName);
    const dispatcherResponse = await worker.fetch(request);

    // Add headers to identify this as a dispatcher response
    let headers = new Headers(dispatcherResponse.headers);

    headers.set('X-Preview-Type', 'dispatcher');
    headers = setOriginControl(env, request, headers);
    headers.append('Vary', 'Origin');
    headers.set('Access-Control-Expose-Headers', 'X-Preview-Type');

    return new Response(dispatcherResponse.body, {
      status: dispatcherResponse.status,
      statusText: dispatcherResponse.statusText,
      headers,
    });
  } catch (error: any) {
    // This block catches errors if the binding doesn't exist or if worker.fetch() fails.
    logger.warn(`Error dispatching to worker '${appName}': ${error.message}`);

    return new Response('An error occurred while loading this application.', {
      status: 500,
    });
  }
}

const ipHostnameRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

/**
 * Top-level Hono app: pre-flight checks, hostname routing, Git / AI proxy,
 * and delegation to the main API Hono app.
 */
function createWorkerApp(apiApp: Hono<AppEnv>): Hono<AppEnv> {
  const workerApp = new Hono<AppEnv>();

  workerApp.all('*', async (c) => {
    const request = c.req.raw;
    const workerEnv = c.env;
    const ctx = c.executionCtx;

    const previewDomain = getPreviewDomain(workerEnv);
    if (!previewDomain || previewDomain.trim() === '') {
      logger.error(
        'FATAL: env.CUSTOM_DOMAIN is not configured in wrangler.toml or the Cloudflare dashboard.',
      );
      return c.text(
        'Server configuration error: Application domain is not set.',
        500,
      );
    }

    const url = new URL(request.url);
    const { hostname, pathname } = url;

    if (ipHostnameRegex.test(hostname)) {
      return c.text('Access denied. Please use the assigned domain name.', 403);
    }

    const isMainDomainRequest =
      hostname === workerEnv.CUSTOM_DOMAIN || hostname === 'localhost';
    const isSubdomainRequest =
      hostname.endsWith(`.${previewDomain}`) ||
      (hostname.endsWith('.localhost') && hostname !== 'localhost');

    if (isMainDomainRequest) {
      if (isGitProtocolRequest(pathname)) {
        return handleGitProtocolRequest(request, workerEnv, ctx);
      }

      if (!pathname.startsWith('/api/')) {
        return c.text('Not Found', 404);
      }

      if (pathname.startsWith('/api/proxy/openai')) {
        const origin = request.headers.get('Origin');
        logger.info(`Origin: ${origin}, Preview Domain: ${previewDomain}`);
        return proxyToAiGateway(request, workerEnv, ctx);
      }

      logger.info(`Handling API request for: ${url}`);
      return apiApp.fetch(request, workerEnv, ctx);
    }

    if (isSubdomainRequest) {
      return handleUserAppRequest(request, workerEnv);
    }

    return c.text('Not Found', 404);
  });

  return workerApp;
}

const apiApp = createApp(env);
export default createWorkerApp(apiApp);

// Wrap the entire worker with Sentry for comprehensive error monitoring.
// export default Sentry.withSentry(sentryOptions, worker);
