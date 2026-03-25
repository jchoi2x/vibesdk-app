export type KdfAlgorithm = 'argon2id' | 'webauthn-prf';

export type SecretType = 'secret';

export interface SecretMetadata {
  provider?: string;
  envVarName?: string;
  [key: string]: unknown;
}

export interface VaultConfig {
  kdfAlgorithm: KdfAlgorithm;
  kdfSalt: Uint8Array<ArrayBuffer>;
  kdfParams?: Argon2Params;
  prfCredentialId?: string;
  prfSalt?: Uint8Array<ArrayBuffer>;
  verificationBlob: Uint8Array<ArrayBuffer>;
  verificationNonce: Uint8Array<ArrayBuffer>;
  hasRecoveryCodes: boolean;
}

export interface Argon2Params {
  time: number;
  mem: number;
  parallelism: number;
}

export interface VaultStatusResponse {
  exists: boolean;
  kdfAlgorithm?: KdfAlgorithm;
  hasRecoveryCodes?: boolean;
}

export interface VaultConfigResponse {
  kdfAlgorithm: KdfAlgorithm;
  kdfSalt: string;
  kdfParams?: Argon2Params;
  prfCredentialId?: string;
  prfSalt?: string;
  verificationBlob: string;
  verificationNonce: string;
  hasRecoveryCodes: boolean;
}

export interface SetupVaultRequest {
  kdfAlgorithm: KdfAlgorithm;
  kdfSalt: ArrayBuffer;
  kdfParams?: Argon2Params;
  prfCredentialId?: string;
  prfSalt?: ArrayBuffer;
  encryptedRecoveryCodes?: ArrayBuffer;
  recoveryCodesNonce?: ArrayBuffer;
  verificationBlob: ArrayBuffer;
  verificationNonce: ArrayBuffer;
}

export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
export const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
export const STORAGE_LIMITS = {
  MAX_SECRET_VALUE_SIZE: 50 * 1024,
  MAX_SECRET_NAME_LENGTH: 200,
  MAX_METADATA_SIZE: 10 * 1024,
} as const;

export interface SecretTemplate {
  id: string;
  displayName: string;
  envVarName: string;
  provider: string;
  icon: string;
  description: string;
  instructions: string;
  placeholder: string;
  validation: string;
  required: boolean;
  category: string;
}

export interface SecretTemplatesData {
  templates: SecretTemplate[];
}
