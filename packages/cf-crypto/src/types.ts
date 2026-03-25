export interface IEncryptResult {
	ciphertext: Uint8Array;
	nonce: Uint8Array;
}

export interface IDeriveKeyOptions {
	salt: Uint8Array;
	iterations?: number;
	keyLength?: number;
	hash?: 'SHA-256' | 'SHA-512';
}
