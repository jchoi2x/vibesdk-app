import type { IEncryptResult } from './types';

/**
 * Encrypts plaintext with AES-GCM using a random 96-bit nonce.
 * Returns ciphertext and the nonce needed for decryption.
 */
export async function encrypt(
  data: string | Uint8Array,
  key: CryptoKey,
): Promise<IEncryptResult> {
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
