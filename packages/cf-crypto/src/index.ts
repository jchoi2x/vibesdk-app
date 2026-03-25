export interface EncryptResult {
	ciphertext: Uint8Array;
	nonce: Uint8Array;
}

export interface DeriveKeyOptions {
	salt: Uint8Array;
	iterations?: number;
	keyLength?: number;
	hash?: 'SHA-256' | 'SHA-512';
}

/**
 * Derives a CryptoKey from a password using PBKDF2 + AES-GCM.
 * Uses only Web Crypto API — available in all CF Workers runtimes.
 */
export async function deriveKey(
	password: string | Uint8Array,
	opts: DeriveKeyOptions,
): Promise<CryptoKey> {
	const {
		salt,
		iterations = 100_000,
		keyLength = 256,
		hash = 'SHA-256',
	} = opts;

	const raw =
		typeof password === 'string'
			? new TextEncoder().encode(password)
			: password;

	const base = await crypto.subtle.importKey('raw', raw, 'PBKDF2', false, [
		'deriveKey',
	]);

	return crypto.subtle.deriveKey(
		{ name: 'PBKDF2', salt, iterations, hash },
		base,
		{ name: 'AES-GCM', length: keyLength },
		false,
		['encrypt', 'decrypt'],
	);
}

/**
 * Encrypts plaintext with AES-GCM using a random 96-bit nonce.
 * Returns ciphertext and the nonce needed for decryption.
 */
export async function encrypt(
	data: string | Uint8Array,
	key: CryptoKey,
): Promise<EncryptResult> {
	const nonce = crypto.getRandomValues(new Uint8Array(12));
	const plaintext =
		typeof data === 'string' ? new TextEncoder().encode(data) : data;

	const buf = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv: nonce },
		key,
		plaintext,
	);

	return { ciphertext: new Uint8Array(buf), nonce };
}

/**
 * Decrypts AES-GCM ciphertext. Throws if authentication fails.
 */
export async function decrypt(
	ciphertext: Uint8Array,
	nonce: Uint8Array,
	key: CryptoKey,
): Promise<Uint8Array> {
	const buf = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: nonce },
		key,
		ciphertext,
	);
	return new Uint8Array(buf);
}

export function generateSalt(length = 32): Uint8Array {
	return crypto.getRandomValues(new Uint8Array(length));
}

export function generateNonce(length = 12): Uint8Array {
	return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Constant-time byte comparison to prevent timing attacks.
 */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) {
		diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
	}
	return diff === 0;
}
