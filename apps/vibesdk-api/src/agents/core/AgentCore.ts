import { type GitVersionControl } from '@/agents/git';
import { type DeploymentManager } from '@/agents/services/implementations/DeploymentManager';
import { type FileManager } from '@/agents/services/implementations/FileManager';
import { type StructuredLogger } from '@/logger';
import { type BaseProjectState } from '@/agents/core/state';
import { type WebSocketMessageType } from '@/api/websocketTypes';
import { type WebSocketMessageData } from '@/api/websocketTypes';
import {
  type ConversationMessage,
  type ConversationState,
} from '@/agents/inferutils/common';
import { type TemplateDetails } from '@/services/sandbox/sandboxTypes';

/**
 * Infrastructure interface for agent implementations.
 * Provides access to:
 * - Core infrastructure (state, env, sql, logger)
 * - Services (fileManager, deploymentManager, git)
 */
export interface AgentInfrastructure<TState extends BaseProjectState> {
  readonly state: TState;
  setState(state: TState): void;
  getWebSockets(): WebSocket[];
  broadcast<T extends WebSocketMessageType>(
    type: T,
    data?: WebSocketMessageData<T>,
  ): void;
  getAgentId(): string;
  logger(): StructuredLogger;
  readonly env: Env;

  setConversationState(state: ConversationState): void;
  getConversationState(): ConversationState;
  addConversationMessage(message: ConversationMessage): void;
  clearConversation(): void;

  // Services
  readonly fileManager: FileManager;
  readonly deploymentManager: DeploymentManager;
  readonly git: GitVersionControl;

  // Git export infrastructure
  exportGitObjects(): Promise<{
    gitObjects: Array<{ path: string; data: Uint8Array }>;
    query: string;
    hasCommits: boolean;
    templateDetails: TemplateDetails | null;
  }>;
}
