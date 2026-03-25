export function generateSalt(length = 32): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

export function generateNonce(length = 12): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}
