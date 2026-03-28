import { UserSecretsStore } from '@/user-secrets-store';
import type { PendingWsTicket } from '@/ticket-types';
import { Hono } from 'hono';
import { type SetupVaultRequest } from './vault-types';
import { showRoutes } from 'hono/dev';

const app = new Hono<{ Bindings: Env }>();
export { UserSecretsStore };

function stub(env: Env, userId: string) {
	const id = env.USER_VAULT.idFromName(userId);
	return env.USER_VAULT.get(id);
}

function uint8ArrayToBase64(arr: Uint8Array): string {
	let binary = '';
	for (let i = 0; i < arr.length; i++) {
		binary += String.fromCharCode(arr[i]);
	}
	return btoa(binary);
}

function base64ToArrayBuffer(str: string): ArrayBuffer {
	const binary = atob(str);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	const buffer = new ArrayBuffer(bytes.length);
	new Uint8Array(buffer).set(bytes);
	return buffer;
}

type SetupBody = {
	kdfAlgorithm: 'argon2id' | 'webauthn-prf';
	kdfSalt: string;
	kdfParams?: { time: number; mem: number; parallelism: number };
	prfCredentialId?: string;
	prfSalt?: string;
	encryptedRecoveryCodes?: string;
	recoveryCodesNonce?: string;
	verificationBlob: string;
	verificationNonce: string;
};

/** Match prior fetch handler: strip trailing slash before routing. */
function withNormalizedPath(request: Request): Request {
	const url = new URL(request.url);
	const normalized = url.pathname.replace(/\/$/, '') || '/';
	if (normalized === url.pathname) {
		return request;
	}
	const next = new URL(url.href);
	next.pathname = normalized;
	return new Request(next, request);
}

app.use('/vault/ws', async (c) => {
	const userId = c.req.query('user_id');
	if (!userId) {
		return c.json({ error: 'Missing user_id' }, 400);
	}
	if (c.req.header('Upgrade') !== 'websocket') {
		return new Response('Expected WebSocket', { status: 426 });
	}
	return stub(c.env, userId).fetch(c.req.raw);
});

app.get('/vault/status', async (c) => {
	const userId = c.req.query('user_id');
	if (!userId) {
		return c.json({ error: 'Missing user_id' }, 400);
	}
	const s = stub(c.env, userId);
	const statusRes = await s.getVaultStatus();
	return c.json(statusRes);
});

app.get('/vault/config', async (c) => {
	const userId = c.req.query('user_id');
	if (!userId) {
		return new Response('Missing user_id', { status: 400 });
	}
	const s = stub(c.env, userId);
	const config = await s.getVaultConfig();
	if (!config) {
		return c.json(null, 404);
	}
	return c.json({
		kdfAlgorithm: config.kdfAlgorithm,
		kdfSalt: uint8ArrayToBase64(config.kdfSalt),
		kdfParams: config.kdfParams,
		prfCredentialId: config.prfCredentialId,
		prfSalt: config.prfSalt ? uint8ArrayToBase64(config.prfSalt) : undefined,
		verificationBlob: uint8ArrayToBase64(config.verificationBlob),
		verificationNonce: uint8ArrayToBase64(config.verificationNonce),
		hasRecoveryCodes: config.hasRecoveryCodes,
	});
});

app.post('/vault/setup', async (c) => {
	const userId = c.req.query('user_id');
	if (!userId) {
		return new Response('Missing user_id', { status: 400 });
	}

	let body: SetupBody;
	try {
		body = (await c.req.json()) as SetupBody;
	} catch {
		return c.json({ ok: false, error: 'invalid_json' }, 400);
	}

	let kdfSalt: ArrayBuffer;
	let verificationBlob: ArrayBuffer;
	let verificationNonce: ArrayBuffer;
	let prfSalt: ArrayBuffer | undefined;
	let encryptedRecoveryCodes: ArrayBuffer | undefined;
	let recoveryCodesNonce: ArrayBuffer | undefined;

	try {
		kdfSalt = base64ToArrayBuffer(body.kdfSalt?.trim() ?? '');
		verificationBlob = base64ToArrayBuffer(body.verificationBlob?.trim() ?? '');
		verificationNonce = base64ToArrayBuffer(body.verificationNonce?.trim() ?? '');

		if (
			kdfSalt.byteLength !== 32 ||
			verificationBlob.byteLength === 0 ||
			verificationNonce.byteLength === 0
		) {
			return c.json({ ok: false, error: 'invalid_payload' }, 400);
		}

		if (body.kdfAlgorithm === 'webauthn-prf') {
			if (!body.prfCredentialId?.trim() || !body.prfSalt?.trim()) {
				return c.json({ ok: false, error: 'invalid_prf' }, 400);
			}
			prfSalt = base64ToArrayBuffer(body.prfSalt.trim());
			if (prfSalt.byteLength !== 32) {
				return c.json({ ok: false, error: 'invalid_prf_salt' }, 400);
			}
		}

		if (body.encryptedRecoveryCodes || body.recoveryCodesNonce) {
			if (!body.encryptedRecoveryCodes?.trim() || !body.recoveryCodesNonce?.trim()) {
				return c.json({ ok: false, error: 'invalid_recovery' }, 400);
			}
			encryptedRecoveryCodes = base64ToArrayBuffer(body.encryptedRecoveryCodes.trim());
			recoveryCodesNonce = base64ToArrayBuffer(body.recoveryCodesNonce.trim());
			if (
				encryptedRecoveryCodes.byteLength === 0 ||
				recoveryCodesNonce.byteLength === 0
			) {
				return c.json({ ok: false, error: 'invalid_recovery' }, 400);
			}
		}
	} catch {
		return c.json({ ok: false, error: 'invalid_payload' }, 400);
	}

	const setupRequest: SetupVaultRequest = {
		kdfAlgorithm: body.kdfAlgorithm,
		kdfSalt,
		kdfParams: body.kdfParams,
		prfCredentialId: body.prfCredentialId?.trim() || undefined,
		prfSalt,
		encryptedRecoveryCodes,
		recoveryCodesNonce,
		verificationBlob,
		verificationNonce,
	};

	const success = await stub(c.env, userId).setupVault(setupRequest);
	if (!success) {
		return c.json({ success: false }, 409);
	}
	return c.json({ success: true });
});

app.post('/vault/reset', async (c) => {
	const userId = c.req.query('user_id');
	if (!userId) {
		return new Response('Missing user_id', { status: 400 });
	}
	await stub(c.env, userId).resetVault();
	return c.json({ success: true });
});

app.post('/vault/ticket/store', async (c) => {
	const userId = c.req.query('user_id');
	if (!userId) {
		return new Response('Missing user_id', { status: 400 });
	}
	const ticket = (await c.req.json()) as PendingWsTicket;
	await stub(c.env, userId).storeWsTicket(ticket);
	return c.json({ ok: true });
});

app.post('/vault/ticket/consume', async (c) => {
	const userId = c.req.query('user_id');
	if (!userId) {
		return new Response('Missing user_id', { status: 400 });
	}
	const { token } = (await c.req.json()) as { token: string };
	const result = await stub(c.env, userId).consumeWsTicket(token);
	if (!result) {
		return c.json(null, 404);
	}
	return c.json(result);
});

app.post('/vault/agent/secret', async (c) => {
	const userId = c.req.query('user_id');
	if (!userId) {
		return new Response('Missing user_id', { status: 400 });
	}
	const query = (await c.req.json()) as {
		provider?: string;
		envVarName?: string;
		secretId?: string;
	};
	const result = await stub(c.env, userId).requestSecret(query);
	return c.json(result);
});

app.get('/vault/agent/unlocked', async (c) => {
	const userId = c.req.query('user_id');
	if (!userId) {
		return new Response('Missing user_id', { status: 400 });
	}
	const unlocked = await stub(c.env, userId).isVaultUnlocked();
	return c.json({ unlocked });
});

app.notFound((c) => c.text('Not found', 404));


showRoutes(app);

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
		return app.fetch(withNormalizedPath(request), env, ctx);
	},
} satisfies ExportedHandler<Env>;
