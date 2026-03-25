export abstract class BaseDurableObject implements DurableObject {
	protected readonly state: DurableObjectState;
	protected readonly env: Record<string, unknown>;

	constructor(state: DurableObjectState, env: Record<string, unknown>) {
		this.state = state;
		this.env = env;
	}

	abstract fetch(request: Request): Promise<Response>;
}

export function rpcResponse<T>(data: T, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export function rpcError(message: string, status = 500): Response {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

/**
 * Calls a JSON RPC method on a Durable Object stub.
 * Throws if the DO returns a non-2xx response.
 */
export async function callRPC<T>(
	stub: DurableObjectStub,
	path: string,
	body?: unknown,
): Promise<T> {
	const hasBody = body !== undefined;
	const res = await stub.fetch(`https://do${path}`, {
		method: hasBody ? 'POST' : 'GET',
		headers: hasBody ? { 'Content-Type': 'application/json' } : {},
		body: hasBody ? JSON.stringify(body) : undefined,
	});

	if (!res.ok) {
		const payload = await res.json<{ error?: string }>();
		throw new Error(
			payload.error ?? `RPC failed with status ${res.status}`,
		);
	}

	return res.json<T>();
}

export interface StorageGetOptions {
	allowConcurrency?: boolean;
	allowUnconfirmed?: boolean;
}

/**
 * Returns the stored value or a default if the key is absent.
 */
export async function getOrDefault<T>(
	storage: DurableObjectStorage,
	key: string,
	defaultValue: T,
	opts?: StorageGetOptions,
): Promise<T> {
	const stored = await storage.get<T>(key, opts);
	return stored ?? defaultValue;
}
