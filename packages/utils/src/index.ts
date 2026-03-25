export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryOptions {
	attempts: number;
	delayMs?: number;
	backoff?: 'linear' | 'exponential';
	onRetry?: (attempt: number, error: unknown) => void;
}

export async function retry<T>(
	fn: () => Promise<T>,
	opts: RetryOptions,
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

export function pick<T extends object, K extends keyof T>(
	obj: T,
	keys: K[],
): Pick<T, K> {
	const result = {} as Pick<T, K>;
	for (const key of keys) {
		if (key in obj) result[key] = obj[key];
	}
	return result;
}

export function omit<T extends object, K extends keyof T>(
	obj: T,
	keys: K[],
): Omit<T, K> {
	const result = { ...obj } as Record<string, unknown>;
	for (const key of keys) {
		delete result[key as string];
	}
	return result as Omit<T, K>;
}

export function slugify(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function truncate(s: string, maxLen: number, suffix = '...'): string {
	if (s.length <= maxLen) return s;
	return s.slice(0, maxLen - suffix.length) + suffix;
}

export function isNonNull<T>(value: T | null | undefined): value is T {
	return value !== null && value !== undefined;
}

export function isDefined<T>(value: T | undefined): value is T {
	return value !== undefined;
}

export function chunk<T>(arr: T[], size: number): T[][] {
	if (size <= 0) throw new RangeError('chunk size must be > 0');
	const result: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		result.push(arr.slice(i, i + size));
	}
	return result;
}

export function groupBy<T>(
	arr: T[],
	key: (item: T) => string,
): Record<string, T[]> {
	const result: Record<string, T[]> = {};
	for (const item of arr) {
		const k = key(item);
		(result[k] ??= []).push(item);
	}
	return result;
}

export function uniqueBy<T>(arr: T[], key: (item: T) => unknown): T[] {
	const seen = new Set<unknown>();
	return arr.filter((item) => {
		const k = key(item);
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});
}

export function deepMerge<T extends object>(
	target: T,
	...sources: Partial<T>[]
): T {
	const result = { ...target } as unknown as Record<string, unknown>;
	for (const source of sources) {
		for (const [key, val] of Object.entries(source)) {
			if (val === undefined) continue;
			const existing = result[key];
			if (isPlainObject(existing) && isPlainObject(val)) {
				result[key] = deepMerge(
					existing,
					val as Partial<typeof existing>,
				);
			} else {
				result[key] = val;
			}
		}
	}
	return result as T;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
	return (
		typeof v === 'object' &&
		v !== null &&
		Object.getPrototypeOf(v) === Object.prototype
	);
}
