import type { IStorageGetOptions } from './types';

/**
 * Returns the stored value or a default if the key is absent.
 */
export async function getOrDefault<T>(
	storage: DurableObjectStorage,
	key: string,
	defaultValue: T,
	opts?: IStorageGetOptions,
): Promise<T> {
	const stored = await storage.get<T>(key, opts);
	return stored ?? defaultValue;
}
