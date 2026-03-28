import {
  type SecretRequestQuery,
  type SecretRequestResult,
  type VaultSecretsRpc,
} from '@/services/secrets/SecretsClient';
import { vaultServiceFetch } from '@/services/secrets/vault-service';

export function createVaultAgentStub(
  secretsFetcher: Fetcher,
  userId: string,
): VaultSecretsRpc {
  return {
    async requestSecret(query: SecretRequestQuery): Promise<SecretRequestResult> {
      const r = await vaultServiceFetch(
        secretsFetcher,
        '/vault/agent/secret',
        userId,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(query),
        },
      );
      return r.json() as Promise<SecretRequestResult>;
    },

    async isVaultUnlocked(): Promise<boolean> {
      const r = await vaultServiceFetch(
        secretsFetcher,
        '/vault/agent/unlocked',
        userId,
      );
      if (!r.ok) {
        return false;
      }
      const body = (await r.json()) as { unlocked: boolean };
      return body.unlocked;
    },
  };
}
