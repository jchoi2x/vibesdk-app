import type { IDeriveKeyOptions } from './types';

/**
 * Derives a CryptoKey from a password using PBKDF2 + AES-GCM.
 * Uses only Web Crypto API — available in all CF Workers runtimes.
 */
export async function deriveKey(
  password: string | Uint8Array,
  opts: IDeriveKeyOptions,
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
