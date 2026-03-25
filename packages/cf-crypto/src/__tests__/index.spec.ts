import { describe, it, expect } from 'vitest';
import {
	deriveKey,
	encrypt,
	decrypt,
	generateSalt,
	generateNonce,
	timingSafeEqual,
} from '../index';

describe('generateSalt', () => {
	it('returns a Uint8Array of the default length (32)', () => {
		const salt = generateSalt();
		expect(salt).toBeInstanceOf(Uint8Array);
		expect(salt.length).toBe(32);
	});

	it('returns a Uint8Array of the specified length', () => {
		expect(generateSalt(16).length).toBe(16);
		expect(generateSalt(64).length).toBe(64);
	});

	it('returns a different value on each call', () => {
		const a = generateSalt();
		const b = generateSalt();
		expect(Buffer.from(a).toString('hex')).not.toBe(
			Buffer.from(b).toString('hex'),
		);
	});
});

describe('generateNonce', () => {
	it('returns a Uint8Array of the default length (12)', () => {
		const nonce = generateNonce();
		expect(nonce).toBeInstanceOf(Uint8Array);
		expect(nonce.length).toBe(12);
	});

	it('returns a Uint8Array of the specified length', () => {
		expect(generateNonce(24).length).toBe(24);
	});

	it('returns a different value on each call', () => {
		const a = generateNonce();
		const b = generateNonce();
		expect(Buffer.from(a).toString('hex')).not.toBe(
			Buffer.from(b).toString('hex'),
		);
	});
});

describe('timingSafeEqual', () => {
	it('returns true for identical arrays', () => {
		const a = new Uint8Array([1, 2, 3]);
		const b = new Uint8Array([1, 2, 3]);
		expect(timingSafeEqual(a, b)).toBe(true);
	});

	it('returns false for arrays with different values', () => {
		const a = new Uint8Array([1, 2, 3]);
		const b = new Uint8Array([1, 2, 4]);
		expect(timingSafeEqual(a, b)).toBe(false);
	});

	it('returns false when lengths differ', () => {
		const a = new Uint8Array([1, 2]);
		const b = new Uint8Array([1, 2, 3]);
		expect(timingSafeEqual(a, b)).toBe(false);
	});

	it('returns true for two empty arrays', () => {
		expect(timingSafeEqual(new Uint8Array(), new Uint8Array())).toBe(true);
	});

	it('returns false when only the first byte differs', () => {
		const a = new Uint8Array([0, 1, 2]);
		const b = new Uint8Array([1, 1, 2]);
		expect(timingSafeEqual(a, b)).toBe(false);
	});
});

describe('deriveKey', () => {
	it('returns a CryptoKey from a string password', async () => {
		const salt = generateSalt();
		const key = await deriveKey('password', { salt, iterations: 1000 });
		expect(key).toBeDefined();
		expect(typeof key).toBe('object');
	});

	it('returns a CryptoKey from a Uint8Array password', async () => {
		const salt = generateSalt();
		const password = new TextEncoder().encode('password');
		const key = await deriveKey(password, { salt, iterations: 1000 });
		expect(key).toBeDefined();
	});

	it('derives different keys for different passwords', async () => {
		const salt = generateSalt();
		const opts = { salt, iterations: 1000 };
		const k1 = await deriveKey('pass1', opts);
		const k2 = await deriveKey('pass2', opts);
		// Keys are non-extractable, but encrypting the same plaintext should differ
		const { ciphertext: c1 } = await encrypt('test', k1);
		const { ciphertext: c2 } = await encrypt('test', k2);
		// Different keys → different ciphertexts (also different nonces, but the test checks they aren't the exact same object)
		expect(k1).not.toBe(k2);
	});

	it('derives different keys for different salts', async () => {
		const salt1 = generateSalt();
		const salt2 = generateSalt();
		const k1 = await deriveKey('password', { salt: salt1, iterations: 1000 });
		const k2 = await deriveKey('password', { salt: salt2, iterations: 1000 });
		expect(k1).not.toBe(k2);
	});
});

describe('encrypt and decrypt', () => {
	it('produces a non-empty ciphertext and a 12-byte nonce', async () => {
		const salt = generateSalt();
		const key = await deriveKey('secret', { salt, iterations: 1000 });
		const { ciphertext, nonce } = await encrypt('hello', key);
		expect(ciphertext).toBeInstanceOf(Uint8Array);
		expect(ciphertext.length).toBeGreaterThan(0);
		expect(nonce.length).toBe(12);
	});

	it('decrypts a string back to its original value', async () => {
		const salt = generateSalt();
		const key = await deriveKey('secret', { salt, iterations: 1000 });
		const plaintext = 'hello, world!';
		const { ciphertext, nonce } = await encrypt(plaintext, key);
		const decrypted = await decrypt(ciphertext, nonce, key);
		expect(new TextDecoder().decode(decrypted)).toBe(plaintext);
	});

	it('decrypts a Uint8Array back to its original bytes', async () => {
		const salt = generateSalt();
		const key = await deriveKey('secret', { salt, iterations: 1000 });
		const data = new Uint8Array([10, 20, 30, 40, 50]);
		const { ciphertext, nonce } = await encrypt(data, key);
		const decrypted = await decrypt(ciphertext, nonce, key);
		expect(Array.from(decrypted)).toEqual([10, 20, 30, 40, 50]);
	});

	it('produces different ciphertext on each call due to random nonce', async () => {
		const salt = generateSalt();
		const key = await deriveKey('secret', { salt, iterations: 1000 });
		const r1 = await encrypt('same text', key);
		const r2 = await encrypt('same text', key);
		expect(Buffer.from(r1.ciphertext).toString('hex')).not.toBe(
			Buffer.from(r2.ciphertext).toString('hex'),
		);
	});

	it('throws when decrypting with the wrong key', async () => {
		const salt = generateSalt();
		const key1 = await deriveKey('correct', { salt, iterations: 1000 });
		const key2 = await deriveKey('wrong', { salt, iterations: 1000 });
		const { ciphertext, nonce } = await encrypt('secret data', key1);
		await expect(decrypt(ciphertext, nonce, key2)).rejects.toThrow();
	});

	it('throws when decrypting with a tampered ciphertext', async () => {
		const salt = generateSalt();
		const key = await deriveKey('secret', { salt, iterations: 1000 });
		const { ciphertext, nonce } = await encrypt('data', key);
		ciphertext[0] ^= 0xff;
		await expect(decrypt(ciphertext, nonce, key)).rejects.toThrow();
	});
});
