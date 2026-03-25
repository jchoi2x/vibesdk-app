import {
  type FileOutputType,
  type FileConceptType,
  type Blueprint,
} from '@/agents/schemas';
import { type BaseSandboxService } from '@/services/sandbox/BaseSandboxService';
import {
  type ExecuteCommandsResponse,
  type PreviewType,
  type StaticAnalysisResponse,
  type RuntimeError,
} from '@/services/sandbox/sandboxTypes';
import { type ProcessedImageAttachment } from '@/types/image-attachment';
import {
  type BehaviorType,
  type DeepDebugResult,
  type DeploymentTarget,
  type ProjectType,
} from '@/agents/core/types';
import { type RenderToolCall } from '@/agents/operations/UserConversationProcessor';
import {
  type WebSocketMessageType,
  type WebSocketMessageData,
} from '@/api/websocketTypes';
import { type GitVersionControl } from '@/agents/git/git';
import { type OperationOptions } from '@/agents/operations/common';
import { type TemplateFile } from '@/services/sandbox/sandboxTypes';

export interface ICodingAgent {
  getBehavior(): BehaviorType;
  deployToSandbox(
    files?: FileOutputType[],
    redeploy?: boolean,
    commitMessage?: string,
    clearLogs?: boolean,
  ): Promise<PreviewType | null>;
  broadcast<T extends WebSocketMessageType>(
    msg: T,
    data?: WebSocketMessageData<T>,
  ): void;

  deployToCloudflare(
    target?: DeploymentTarget,
  ): Promise<{ deploymentUrl?: string; workersUrl?: string } | null>;

  queueUserRequest(request: string, images?: ProcessedImageAttachment[]): void;

  clearConversation(): void;

  deployPreview(clearLogs?: boolean, forceRedeploy?: boolean): Promise<string>;

  updateProjectName(newName: string): Promise<boolean>;

  setBlueprint(blueprint: Blueprint): Promise<void>;

  getProjectType(): ProjectType;

  importTemplate(
    templateName: string,
  ): Promise<{
    templateName: string;
    filesImported: number;
    files: TemplateFile[];
  }>;

  getOperationOptions(): OperationOptions;

  listFiles(): FileOutputType[];

  readFiles(
    paths: string[],
  ): Promise<{ files: { path: string; content: string }[] }>;

  deleteFiles(paths: string[]): Promise<{ success: boolean; error?: string }>;

  runStaticAnalysisCode(files?: string[]): Promise<StaticAnalysisResponse>;

  execCommands(
    commands: string[],
    shouldSave: boolean,
    timeout?: number,
  ): Promise<ExecuteCommandsResponse>;

  updateBlueprint(patch: Partial<Blueprint>): Promise<Blueprint>;

  generateFiles(
    phaseName: string,
    phaseDescription: string,
    requirements: string[],
    files: FileConceptType[],
  ): Promise<{ files: Array<{ path: string; purpose: string; diff: string }> }>;

  regenerateFileByPath(
    path: string,
    issues: string[],
  ): Promise<{ path: string; diff: string }>;

  isCodeGenerating(): boolean;

  waitForGeneration(): Promise<void>;

  isDeepDebugging(): boolean;

  waitForDeepDebug(): Promise<void>;

  executeDeepDebug(
    issue: string,
    toolRenderer: RenderToolCall,
    streamCb: (chunk: string) => void,
    focusPaths?: string[],
  ): Promise<DeepDebugResult>;

  get git(): GitVersionControl;

  getSandboxServiceClient(): BaseSandboxService;
}
