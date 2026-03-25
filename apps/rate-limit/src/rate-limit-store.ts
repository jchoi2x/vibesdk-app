import type { RateLimitResult } from '@jchoi2x/cf-rate-limit';

interface WindowState {
	timestamps: number[];
}

export class RateLimitStore implements DurableObject {
	private readonly state: DurableObjectState;

	constructor(state: DurableObjectState, _env: Env) {
		this.state = state;
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const method = request.method;

		try {
			if (method === 'POST' && url.pathname.endsWith('/check')) {
				return this.handleCheck(request);
			}
			if (method === 'DELETE' && url.pathname.endsWith('/reset')) {
				return this.handleReset(request);
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

	private async handleCheck(request: Request): Promise<Response> {
		const { key, windowMs, max } = await request.json<{
			key: string;
			windowMs: number;
			max: number;
		}>();

		const now = Date.now();
		const cutoff = now - windowMs;
		const stored = await this.state.storage.get<WindowState>(
			`window:${key}`,
		);
		const timestamps = (stored?.timestamps ?? []).filter((t) => t > cutoff);
		const allowed = timestamps.length < max;

		if (allowed) {
			timestamps.push(now);
		}

		await this.state.storage.put(`window:${key}`, { timestamps });

		// Set alarm to clean up expired windows
		const currentAlarm = await this.state.storage.getAlarm();
		if (currentAlarm === null) {
			await this.state.storage.setAlarm(now + windowMs);
		}

		const result: RateLimitResult = {
			allowed,
			remaining: Math.max(0, max - timestamps.length),
			resetAt: now + windowMs,
		};

		return new Response(JSON.stringify(result), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	private async handleReset(request: Request): Promise<Response> {
		const { key } = await request.json<{ key: string }>();
		await this.state.storage.delete(`window:${key}`);
		return new Response(JSON.stringify({ ok: true }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	async alarm(): Promise<void> {
		// Clean up all expired windows
		const now = Date.now();
		const all = await this.state.storage.list<WindowState>({
			prefix: 'window:',
		});
		const deletes: Promise<void>[] = [];

		for (const [k, v] of all) {
			// If no timestamps remain after filtering, delete the entry
			if (v.timestamps.length === 0 || (v.timestamps[v.timestamps.length - 1] ?? 0) < now) {
				deletes.push(this.state.storage.delete(k));
			}
		}

		await Promise.all(deletes);
	}
}
