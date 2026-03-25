import {
	deriveKey,
	encrypt,
	decrypt,
	generateSalt,
	timingSafeEqual,
} from '@jchoi2x/cf-crypto';
import { DurableObject } from 'cloudflare:workers';
import { Hono } from 'hono';
import { logger } from 'hono/logger';

interface SecretRecord {
	encryptedValue: number[];
	nonce: number[];
	createdAt: number;
	updatedAt: number;
	expiresAt?: number;
}

type TSetSecretPayload = {
	key: string;
	value: string;
	masterKey: string;
	expiresAt?: number;
}


export class SecretsStore extends DurableObject<Env> {
	app = new Hono<{Bindings: Env }>();


	constructor(private readonly state: DurableObjectState, _env: Env) {
		super(state, _env);

		this.state = state;
		this.configureRoutes();
	}

	private configureRoutes(): void {
		this.app.use(logger())

		this.app.put('/secrets/set', async (c) => {
			return this.handleSet(c.req.raw);
		});
		this.app.get('/secrets/get', async (c) => {
			return this.handleGet(c.req.raw);
		});
		this.app.delete('/secrets/delete', async (c) => {
			return this.handleDelete(c.req.raw);
		});
		this.app.get('/secrets/list', async (c) => {
			return this.handleList();
		});
		this.app.onError((err, c) => {
			const message = err instanceof Error ? err.message : 'Unknown error';
			return c.json({ error: message }, { status: 500 });
		});

		this.app.notFound((c) => {
			return new Response('Not found', { status: 404 });
		});
	}

	fetch = async (request: Request): Promise<Response> => this.app.fetch(request);


	private async handleSet(request: Request): Promise<Response> {
		const { key, value, masterKey, expiresAt } = await request.json<TSetSecretPayload>();

		const salt = generateSalt();
		const cryptoKey = await deriveKey(masterKey, { salt });
		const { ciphertext, nonce } = await encrypt(value, cryptoKey);

		const record: SecretRecord = {
			encryptedValue: Array.from(ciphertext),
			nonce: Array.from(nonce),
			createdAt: Date.now(),
			updatedAt: Date.now(),
			expiresAt,
		};

		// Store salt alongside record
		await this.state.storage.put(`salt:${key}`, Array.from(salt));
		await this.state.storage.put(`secret:${key}`, record);

		return new Response(JSON.stringify({ ok: true }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}


	private async handleGet(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const key = url.searchParams.get('key');
		const masterKey = url.searchParams.get('master_key');

		if (!key || !masterKey) {
			return new Response('Missing key or master_key', { status: 400 });
		}

		const record = await this.state.storage.get<SecretRecord>(
			`secret:${key}`,
		);
		const saltArr = await this.state.storage.get<number[]>(`salt:${key}`);

		if (!record || !saltArr) {
			return new Response(JSON.stringify({ value: null }), {
				headers: { 'Content-Type': 'application/json' },
			});
		}

		if (record.expiresAt && record.expiresAt < Date.now()) {
			await this.state.storage.delete(`secret:${key}`);
			await this.state.storage.delete(`salt:${key}`);
			return new Response(JSON.stringify({ value: null }), {
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const salt = new Uint8Array(saltArr);
		const cryptoKey = await deriveKey(masterKey, { salt });
		const plaintext = await decrypt(
			new Uint8Array(record.encryptedValue),
			new Uint8Array(record.nonce),
			cryptoKey,
		);

		const value = new TextDecoder().decode(plaintext);
		return new Response(JSON.stringify({ value }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	private async handleDelete(request: Request): Promise<Response> {
		const { key } = await request.json<{ key: string }>();
		await this.state.storage.delete(`secret:${key}`);
		await this.state.storage.delete(`salt:${key}`);
		return new Response(JSON.stringify({ ok: true }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	private async handleList(): Promise<Response> {
		const all = await this.state.storage.list({ prefix: 'secret:' });
		const keys = [...all.keys()].map((k) => k.replace('secret:', ''));
		return new Response(JSON.stringify({ keys }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

// Silence unused import warning — timingSafeEqual is available for consumers
void timingSafeEqual;
