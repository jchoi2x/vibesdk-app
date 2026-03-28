/**
 * HTTP client for the secrets-store Worker (USER_VAULT durable objects).
 */

const VAULT_ORIGIN = 'https://vault.service';

export function vaultServiceUrl(path: string, userId: string): string {
	const u = new URL(path, VAULT_ORIGIN);
	u.searchParams.set('user_id', userId);
	return u.toString();
}

export function vaultServiceFetch(
	secretsFetcher: Fetcher,
	pathWithLeadingSlash: string,
	userId: string,
	init?: RequestInit,
): Promise<Response> {
	const url = vaultServiceUrl(pathWithLeadingSlash, userId);
	return secretsFetcher.fetch(new Request(url, init));
}
