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
