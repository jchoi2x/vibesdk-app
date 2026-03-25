import { SandboxSdkClient } from "@/services/sandbox/sandboxSdkClient";
import { RemoteSandboxServiceClient } from "@/services/sandbox/remoteSandboxService";
import { type BaseSandboxService } from "@/services/sandbox/BaseSandboxService";
import { env } from 'cloudflare:workers'

export function getSandboxService(sessionId: string, agentId: string): BaseSandboxService {
    if (env.SANDBOX_SERVICE_TYPE == 'runner') {
        console.log("[getSandboxService] Using runner service for sandboxing");
        return new RemoteSandboxServiceClient(sessionId);
    }
    console.log("[getSandboxService] Using sandboxsdk service for sandboxing");
    return new SandboxSdkClient(sessionId, agentId);
}