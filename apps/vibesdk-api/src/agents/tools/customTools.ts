import type { ToolDefinition } from '@/agents/tools/types';
import { type StructuredLogger } from '@/logger';
import { type RenderToolCall } from '@/agents/operations/UserConversationProcessor';
import { toolWebSearchDefinition } from '@/agents/tools/toolkit/web-search';
import { toolFeedbackDefinition } from '@/agents/tools/toolkit/feedback';
import { createQueueRequestTool } from '@/agents/tools/toolkit/queue-request';
import { createGetLogsTool } from '@/agents/tools/toolkit/get-logs';
import { createDeployPreviewTool } from '@/agents/tools/toolkit/deploy-preview';
import { createDeepDebuggerTool } from '@/agents/tools/toolkit/deep-debugger';
import { createRenameProjectTool } from '@/agents/tools/toolkit/rename-project';
import { createAlterBlueprintTool } from '@/agents/tools/toolkit/alter-blueprint';
import { createReadFilesTool } from '@/agents/tools/toolkit/read-files';
import { createExecCommandsTool } from '@/agents/tools/toolkit/exec-commands';
import { createRunAnalysisTool } from '@/agents/tools/toolkit/run-analysis';
import { createRegenerateFileTool } from '@/agents/tools/toolkit/regenerate-file';
import { createGenerateFilesTool } from '@/agents/tools/toolkit/generate-files';
import { createWaitTool } from '@/agents/tools/toolkit/wait';
import { createGetRuntimeErrorsTool } from '@/agents/tools/toolkit/get-runtime-errors';
import { createWaitForGenerationTool } from '@/agents/tools/toolkit/wait-for-generation';
import { createWaitForDebugTool } from '@/agents/tools/toolkit/wait-for-debug';
import { createGitTool } from '@/agents/tools/toolkit/git';
import { type ICodingAgent } from '@/agents/services/interfaces/ICodingAgent';
import { type Message } from '@/agents/inferutils/common';
import { type ChatCompletionMessageFunctionToolCall } from 'openai/resources';
import { type DeepDebuggerSession } from '@/agents/operations/DeepDebugger';

export async function executeToolWithDefinition<TArgs, TResult>(
  toolCall: ChatCompletionMessageFunctionToolCall,
  toolDef: ToolDefinition<TArgs, TResult>,
  args: TArgs,
): Promise<TResult> {
  await toolDef.onStart?.(toolCall, args);
  const result = await toolDef.implementation(args);
  await toolDef.onComplete?.(toolCall, args, result);
  return result;
}

/**
 * Build all available tools for the agent
 * Add new tools here - they're automatically included in the conversation
 */
export function buildTools(
  agent: ICodingAgent,
  logger: StructuredLogger,
  toolRenderer: RenderToolCall,
  streamCb: (chunk: string) => void,
): ToolDefinition<any, any>[] {
  return [
    toolWebSearchDefinition,
    toolFeedbackDefinition,
    createQueueRequestTool(agent, logger),
    createGetLogsTool(agent, logger),
    createDeployPreviewTool(agent, logger),
    createWaitForGenerationTool(agent, logger),
    createWaitForDebugTool(agent, logger),
    createRenameProjectTool(agent, logger),
    createAlterBlueprintTool(agent, logger),
    // Git tool (safe version - no reset for user conversations)
    createGitTool(agent, logger, { excludeCommands: ['reset'] }),
    // Deep autonomous debugging assistant tool
    createDeepDebuggerTool(agent, logger, toolRenderer, streamCb),
  ];
}

export function buildDebugTools(
  session: DeepDebuggerSession,
  logger: StructuredLogger,
  toolRenderer?: RenderToolCall,
): ToolDefinition<any, any>[] {
  const tools = [
    createGetLogsTool(session.agent, logger),
    createGetRuntimeErrorsTool(session.agent, logger),
    createReadFilesTool(session.agent, logger),
    createRunAnalysisTool(session.agent, logger),
    createExecCommandsTool(session.agent, logger),
    createRegenerateFileTool(session.agent, logger),
    createGenerateFilesTool(session.agent, logger),
    createDeployPreviewTool(session.agent, logger),
    createWaitTool(logger),
    createGitTool(session.agent, logger),
  ];
  return withRenderer(tools, toolRenderer);
}

/**
 * Decorate tools with renderer for UI visualization and conversation sync
 */
export function withRenderer(
  tools: ToolDefinition<any, any>[],
  toolRenderer?: RenderToolCall,
  onComplete?: (message: Message) => Promise<void>,
): ToolDefinition<any, any>[] {
  if (!toolRenderer) return tools;

  return tools.map((td) => {
    const originalOnStart = td.onStart;
    const originalOnComplete = td.onComplete;

    return {
      ...td,
      onStart: async (
        tc: ChatCompletionMessageFunctionToolCall,
        args: Record<string, unknown>,
      ) => {
        await originalOnStart?.(tc, args);
        if (toolRenderer) {
          toolRenderer({ name: td.name, status: 'start', args });
        }
      },
      onComplete: async (
        tc: ChatCompletionMessageFunctionToolCall,
        args: Record<string, unknown>,
        result: unknown,
      ) => {
        await originalOnComplete?.(tc, args, result);
        if (toolRenderer) {
          toolRenderer({
            name: td.name,
            status: 'success',
            args,
            result:
              typeof result === 'string' ? result : JSON.stringify(result),
          });
        }
        if (onComplete) {
          const toolMessage: Message = {
            role: 'tool',
            content:
              typeof result === 'string' ? result : JSON.stringify(result),
            name: td.name,
            tool_call_id: tc.id,
          };
          await onComplete(toolMessage);
        }
      },
    };
  });
}
