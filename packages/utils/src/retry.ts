import { sleep } from './sleep';

export interface IRetryOptions {
	attempts: number;
	delayMs?: number;
	backoff?: 'linear' | 'exponential';
	onRetry?: (attempt: number, error: unknown) => void;
}

export async function retry<T>(
	fn: () => Promise<T>,
	opts: IRetryOptions,
): Promise<T> {
	const { attempts, delayMs = 0, backoff = 'linear', onRetry } = opts;
	let lastError: unknown;

	for (let i = 0; i < attempts; i++) {
		try {
			return await fn();
		} catch (e) {
			lastError = e;
			if (i < attempts - 1) {
				onRetry?.(i + 1, e);
				if (delayMs > 0) {
					const delay =
						backoff === 'exponential' ? delayMs * 2 ** i : delayMs;
					await sleep(delay);
				}
			}
		}
	}

	throw lastError;
}
