import {
	deriveKey,
	encrypt,
	decrypt,
	generateSalt,
	timingSafeEqual,
} from '@jchoi2x/cf-crypto';

interface SecretRecord {
	encryptedValue: number[];
	nonce: number[];
	createdAt: number;
	updatedAt: number;
	expiresAt?: number;
}

export class SecretsStore implements DurableObject {
	private readonly state: DurableObjectState;

	constructor(state: DurableObjectState, _env: Env) {
		this.state = state;
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const method = request.method;

		try {
			if (method === 'PUT' && url.pathname.endsWith('/set')) {
				return this.handleSet(request);
			}
			if (method === 'GET' && url.pathname.endsWith('/get')) {
				return this.handleGet(request);
			}
			if (method === 'DELETE' && url.pathname.endsWith('/delete')) {
				return this.handleDelete(request);
			}
			if (method === 'GET' && url.pathname.endsWith('/list')) {
				return this.handleList();
			}
			return new Response('Not found', { status: 404 });
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return new Response(JSON.stringify({ error: message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}

	private async handleSet(request: Request): Promise<Response> {
		const { key, value, masterKey, expiresAt } = await request.json<{
			key: string;
			value: string;
			masterKey: string;
			expiresAt?: number;
		}>();

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
