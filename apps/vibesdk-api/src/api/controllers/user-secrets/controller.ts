/**
 * Vault Controller - API endpoints for the user secrets vault
 */

import { BaseController } from '@/api/controllers/baseController';
import {
  type ApiResponse,
  type ControllerResponse,
} from '@/api/controllers/types';
import { type RouteContext } from '@/api/types/route-context';
import { createLogger } from '@/logger';
import type {
  VaultStatusResponse,
  VaultConfigResponse,
} from '@/services/secrets/vault-types';
import { vaultServiceFetch, vaultServiceUrl } from '@/services/secrets/vault-service';

type VaultStatusData = VaultStatusResponse;
type VaultConfigData = { config: VaultConfigResponse };
type VaultSetupData = { success: boolean };

/** Interface for the JSON body received from frontend (base64 strings) */
interface SetupVaultBody {
  kdfAlgorithm: 'argon2id' | 'webauthn-prf';
  kdfSalt: string;
  kdfParams?: { time: number; mem: number; parallelism: number };
  prfCredentialId?: string;
  prfSalt?: string;
  encryptedRecoveryCodes?: string;
  recoveryCodesNonce?: string;
  verificationBlob: string;
  verificationNonce: string;
}

export class UserSecretsController extends BaseController {
  static logger = createLogger('UserSecretsController');

  private static base64ToUint8Array(str: string): Uint8Array {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private static base64ToArrayBuffer(str: string): ArrayBuffer {
    const bytes = this.base64ToUint8Array(str);
    const buffer = new ArrayBuffer(bytes.length);
    new Uint8Array(buffer).set(bytes);
    return buffer;
  }

  // ========== WEBSOCKET CONNECTION ==========

  /**
   * GET /api/vault/ws
   * WebSocket connection to the user's vault Durable Object
   */
  static async handleWebSocketConnection(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
    context: RouteContext,
  ): Promise<Response> {
    const userId = context.user!.id;
    this.logger.info('Vault WebSocket connection request', { userId });

    try {
      return env.SECRETS_STORE.fetch(
        new Request(vaultServiceUrl('/vault/ws', userId), request),
      );
    } catch (error) {
      this.logger.error(
        'Failed to establish vault WebSocket connection:',
        error,
      );
      const { 0: client, 1: server } = new WebSocketPair();
      server.accept();
      server.send(
        JSON.stringify({
          type: 'error',
          message: 'Failed to connect to vault',
        }),
      );
      server.close(1011, 'Internal error');
      return new Response(null, { status: 101, webSocket: client });
    }
  }

  // ========== VAULT LIFECYCLE ==========

  /**
   * GET /api/vault/status
   */
  static async getVaultStatus(
    _request: Request,
    env: Env,
    _ctx: ExecutionContext,
    context: RouteContext,
  ): Promise<ControllerResponse<ApiResponse<VaultStatusData>>> {
    try {
      const r = await vaultServiceFetch(
        env.SECRETS_STORE,
        '/vault/status',
        context.user!.id,
      );
      if (!r.ok) {
        return this.createErrorResponse<VaultStatusData>(
          'Failed to get vault status',
          500,
        );
      }
      const status = (await r.json()) as VaultStatusData;
      return this.createSuccessResponse(status);
    } catch (error) {
      this.logger.error('Error getting vault status:', error);
      return this.createErrorResponse<VaultStatusData>(
        'Failed to get vault status',
        500,
      );
    }
  }

  /**
   * GET /api/vault/config
   */
  static async getVaultConfig(
    _request: Request,
    env: Env,
    _ctx: ExecutionContext,
    context: RouteContext,
  ): Promise<ControllerResponse<ApiResponse<VaultConfigData>>> {
    try {
      const r = await vaultServiceFetch(
        env.SECRETS_STORE,
        '/vault/config',
        context.user!.id,
      );

      if (r.status === 404) {
        return this.createErrorResponse<VaultConfigData>(
          'Vault not set up',
          404,
        );
      }

      if (!r.ok) {
        return this.createErrorResponse<VaultConfigData>(
          'Failed to get vault config',
          500,
        );
      }

      const configResponse = (await r.json()) as VaultConfigResponse;

      const isInvalidConfig =
        typeof configResponse.kdfSalt !== 'string' ||
        atob(configResponse.kdfSalt).length !== 32 ||
        !configResponse.verificationBlob?.length ||
        !configResponse.verificationNonce?.length ||
        (configResponse.kdfAlgorithm === 'webauthn-prf' &&
          (!configResponse.prfCredentialId ||
            !configResponse.prfSalt ||
            atob(configResponse.prfSalt).length !== 32));

      if (isInvalidConfig) {
        return this.createErrorResponse<VaultConfigData>(
          'Vault configuration invalid. Reset your vault and set it up again.',
          500,
        );
      }

      return this.createSuccessResponse({ config: configResponse });
    } catch (error) {
      this.logger.error('Error getting vault config:', error);
      return this.createErrorResponse<VaultConfigData>(
        'Failed to get vault config',
        500,
      );
    }
  }

  /**
   * POST /api/vault/setup
   */
  static async setupVault(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
    context: RouteContext,
  ): Promise<ControllerResponse<ApiResponse<VaultSetupData>>> {
    try {
      const bodyResult = await this.parseJsonBody<SetupVaultBody>(request);
      if (!bodyResult.success) {
        return bodyResult.response as ControllerResponse<
          ApiResponse<VaultSetupData>
        >;
      }

      const body = bodyResult.data!;

      const trimmedKdfSalt = body.kdfSalt?.trim();
      const trimmedVerificationBlob = body.verificationBlob?.trim();
      const trimmedVerificationNonce = body.verificationNonce?.trim();

      if (
        !trimmedKdfSalt ||
        !trimmedVerificationBlob ||
        !trimmedVerificationNonce
      ) {
        return this.createErrorResponse<VaultSetupData>(
          'Invalid vault setup payload',
          400,
        );
      }

      try {
        const kdfSalt = this.base64ToArrayBuffer(trimmedKdfSalt);
        const verificationBlob = this.base64ToArrayBuffer(
          trimmedVerificationBlob,
        );
        const verificationNonce = this.base64ToArrayBuffer(
          trimmedVerificationNonce,
        );

        if (
          kdfSalt.byteLength !== 32 ||
          verificationBlob.byteLength === 0 ||
          verificationNonce.byteLength === 0
        ) {
          return this.createErrorResponse<VaultSetupData>(
            'Invalid vault setup payload',
            400,
          );
        }

        if (body.kdfAlgorithm === 'webauthn-prf') {
          const trimmedPrfSalt = body.prfSalt?.trim();
          const trimmedCredentialId = body.prfCredentialId?.trim();
          if (!trimmedCredentialId || !trimmedPrfSalt) {
            return this.createErrorResponse<VaultSetupData>(
              'Passkey vault requires PRF configuration',
              400,
            );
          }
          const prfSalt = this.base64ToArrayBuffer(trimmedPrfSalt);
          if (prfSalt.byteLength !== 32) {
            return this.createErrorResponse<VaultSetupData>(
              'Invalid PRF salt',
              400,
            );
          }
        }

        if (body.encryptedRecoveryCodes || body.recoveryCodesNonce) {
          const trimmedEncryptedRecoveryCodes =
            body.encryptedRecoveryCodes?.trim();
          const trimmedRecoveryCodesNonce = body.recoveryCodesNonce?.trim();
          if (!trimmedEncryptedRecoveryCodes || !trimmedRecoveryCodesNonce) {
            return this.createErrorResponse<VaultSetupData>(
              'Invalid recovery codes payload',
              400,
            );
          }
          const encryptedRecoveryCodes = this.base64ToArrayBuffer(
            trimmedEncryptedRecoveryCodes,
          );
          const recoveryCodesNonce = this.base64ToArrayBuffer(
            trimmedRecoveryCodesNonce,
          );
          if (
            encryptedRecoveryCodes.byteLength === 0 ||
            recoveryCodesNonce.byteLength === 0
          ) {
            return this.createErrorResponse<VaultSetupData>(
              'Invalid recovery codes payload',
              400,
            );
          }
        }
      } catch {
        return this.createErrorResponse<VaultSetupData>(
          'Invalid vault setup payload',
          400,
        );
      }

      const wire = {
        kdfAlgorithm: body.kdfAlgorithm,
        kdfSalt: trimmedKdfSalt,
        kdfParams: body.kdfParams,
        prfCredentialId: body.prfCredentialId?.trim() || undefined,
        prfSalt: body.prfSalt?.trim() || undefined,
        encryptedRecoveryCodes: body.encryptedRecoveryCodes?.trim() || undefined,
        recoveryCodesNonce: body.recoveryCodesNonce?.trim() || undefined,
        verificationBlob: trimmedVerificationBlob,
        verificationNonce: trimmedVerificationNonce,
      };

      const setupRes = await vaultServiceFetch(
        env.SECRETS_STORE,
        '/vault/setup',
        context.user!.id,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wire),
        },
      );

      if (setupRes.status === 409) {
        return this.createErrorResponse<VaultSetupData>(
          'Vault already exists',
          409,
        );
      }

      if (!setupRes.ok) {
        return this.createErrorResponse<VaultSetupData>(
          'Failed to setup vault',
          500,
        );
      }

      return this.createSuccessResponse({ success: true });
    } catch (error) {
      this.logger.error('Error setting up vault:', error);
      return this.createErrorResponse<VaultSetupData>(
        'Failed to setup vault',
        500,
      );
    }
  }

  /**
   * POST /api/vault/reset
   */
  static async resetVault(
    _request: Request,
    env: Env,
    _ctx: ExecutionContext,
    context: RouteContext,
  ): Promise<ControllerResponse<ApiResponse<{ success: boolean }>>> {
    try {
      const r = await vaultServiceFetch(
        env.SECRETS_STORE,
        '/vault/reset',
        context.user!.id,
        { method: 'POST' },
      );
      if (!r.ok) {
        return this.createErrorResponse<{ success: boolean }>(
          'Failed to reset vault',
          500,
        );
      }
      return this.createSuccessResponse({ success: true });
    } catch (error) {
      this.logger.error('Error resetting vault:', error);
      return this.createErrorResponse<{ success: boolean }>(
        'Failed to reset vault',
        500,
      );
    }
  }
}
