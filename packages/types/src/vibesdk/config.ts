// Model and agent configuration types.
// This file mirrors worker/agents/inferutils/config.types.ts — no cross-app imports needed.

export type ReasoningEffortType = 'minimal' | 'low' | 'medium' | 'high';
export type ReasoningEffort = ReasoningEffortType;

export enum ModelSize {
  LITE = 'lite',
  REGULAR = 'regular',
  LARGE = 'large',
}

export interface AIModelConfig {
  name: string;
  size: ModelSize;
  provider: string;
  creditCost: number;
  contextSize: number;
  nonReasoning?: boolean;
  directOverride?: boolean;
}

const MODELS_MASTER = {
  DISABLED: {
    id: 'disabled',
    config: {
      name: 'Disabled',
      size: ModelSize.LITE,
      provider: 'None',
      creditCost: 0,
      contextSize: 0,
    },
  },
  GEMINI_2_5_PRO: {
    id: 'google-ai-studio/gemini-2.5-pro',
    config: {
      name: 'Gemini 2.5 Pro',
      size: ModelSize.LARGE,
      provider: 'google-ai-studio',
      creditCost: 5,
      contextSize: 1048576,
    },
  },
  GEMINI_2_5_FLASH: {
    id: 'google-ai-studio/gemini-2.5-flash',
    config: {
      name: 'Gemini 2.5 Flash',
      size: ModelSize.REGULAR,
      provider: 'google-ai-studio',
      creditCost: 1.2,
      contextSize: 1048576,
    },
  },
  GEMINI_2_5_FLASH_LITE: {
    id: 'google-ai-studio/gemini-2.5-flash-lite',
    config: {
      name: 'Gemini 2.5 Flash-Lite',
      size: ModelSize.LITE,
      provider: 'google-ai-studio',
      creditCost: 0.4,
      contextSize: 1048576,
    },
  },
  GEMINI_2_5_FLASH_LATEST: {
    id: 'google-ai-studio/gemini-2.5-flash-latest',
    config: {
      name: 'Gemini 2.5 Flash (Latest)',
      size: ModelSize.REGULAR,
      provider: 'google-ai-studio',
      creditCost: 1.2,
      contextSize: 1048576,
    },
  },
  GEMINI_2_5_FLASH_LITE_LATEST: {
    id: 'google-ai-studio/gemini-2.5-flash-lite-latest',
    config: {
      name: 'Gemini 2.5 Flash-Lite (Latest)',
      size: ModelSize.LITE,
      provider: 'google-ai-studio',
      creditCost: 0.4,
      contextSize: 1048576,
    },
  },
  GEMINI_2_5_PRO_LATEST: {
    id: 'google-ai-studio/gemini-2.5-pro-latest',
    config: {
      name: 'Gemini 2.5 Pro (Latest)',
      size: ModelSize.LARGE,
      provider: 'google-ai-studio',
      creditCost: 5,
      contextSize: 1048576,
    },
  },
  GEMINI_3_PRO_PREVIEW: {
    id: 'google-ai-studio/gemini-3-pro-preview',
    config: {
      name: 'Gemini 3.0 Pro Preview',
      size: ModelSize.LARGE,
      provider: 'google-ai-studio',
      creditCost: 8,
      contextSize: 1048576,
    },
  },
  GEMINI_3_FLASH_PREVIEW: {
    id: 'google-ai-studio/gemini-3-flash-preview',
    config: {
      name: 'Gemini 3.0 Flash Preview',
      size: ModelSize.REGULAR,
      provider: 'google-ai-studio',
      creditCost: 2,
      contextSize: 1048576,
    },
  },
  CLAUDE_3_7_SONNET_20250219: {
    id: 'anthropic/claude-3-7-sonnet-20250219',
    config: {
      name: 'Claude 3.7 Sonnet',
      size: ModelSize.LARGE,
      provider: 'anthropic',
      creditCost: 12,
      contextSize: 200000,
    },
  },
  CLAUDE_4_SONNET: {
    id: 'anthropic/claude-sonnet-4-20250514',
    config: {
      name: 'Claude 4 Sonnet',
      size: ModelSize.LARGE,
      provider: 'anthropic',
      creditCost: 12,
      contextSize: 200000,
    },
  },
  CLAUDE_4_5_SONNET: {
    id: 'anthropic/claude-sonnet-4-5',
    config: {
      name: 'Claude 4.5 Sonnet',
      size: ModelSize.LARGE,
      provider: 'anthropic',
      creditCost: 12,
      contextSize: 200000,
    },
  },
  CLAUDE_4_5_OPUS: {
    id: 'anthropic/claude-opus-4-5',
    config: {
      name: 'Claude 4.5 Opus',
      size: ModelSize.LARGE,
      provider: 'anthropic',
      creditCost: 20,
      contextSize: 200000,
    },
  },
  CLAUDE_4_5_HAIKU: {
    id: 'anthropic/claude-haiku-4-5',
    config: {
      name: 'Claude 4.5 Haiku',
      size: ModelSize.REGULAR,
      provider: 'anthropic',
      creditCost: 4,
      contextSize: 200000,
    },
  },
  OPENAI_5: {
    id: 'openai/gpt-5',
    config: {
      name: 'GPT-5',
      size: ModelSize.LARGE,
      provider: 'openai',
      creditCost: 5,
      contextSize: 400000,
    },
  },
  OPENAI_5_1: {
    id: 'openai/gpt-5.1',
    config: {
      name: 'GPT-5.1',
      size: ModelSize.LARGE,
      provider: 'openai',
      creditCost: 5,
      contextSize: 400000,
    },
  },
  OPENAI_5_2: {
    id: 'openai/gpt-5.2',
    config: {
      name: 'GPT-5.2',
      size: ModelSize.LARGE,
      provider: 'openai',
      creditCost: 7,
      contextSize: 400000,
    },
  },
  OPENAI_5_MINI: {
    id: 'openai/gpt-5-mini',
    config: {
      name: 'GPT-5 Mini',
      size: ModelSize.LITE,
      provider: 'openai',
      creditCost: 1,
      contextSize: 400000,
    },
  },
  GROK_CODE_FAST_1: {
    id: 'grok/grok-code-fast-1',
    config: {
      name: 'Grok Code Fast 1',
      size: ModelSize.LITE,
      provider: 'grok',
      creditCost: 0.8,
      contextSize: 256000,
      nonReasoning: true,
    },
  },
  GROK_4_FAST: {
    id: 'grok/grok-4-fast',
    config: {
      name: 'Grok 4 Fast',
      size: ModelSize.LITE,
      provider: 'grok',
      creditCost: 0.8,
      contextSize: 2_000_000,
      nonReasoning: true,
    },
  },
  GROK_4_1_FAST: {
    id: 'grok/grok-4-1-fast-reasoning',
    config: {
      name: 'Grok 4.1 Fast',
      size: ModelSize.LITE,
      provider: 'grok',
      creditCost: 0.8,
      contextSize: 2_000_000,
      nonReasoning: true,
    },
  },
  GROK_4_1_FAST_NON_REASONING: {
    id: 'grok/grok-4-1-fast-non-reasoning',
    config: {
      name: 'Grok 4.1 Fast Non reasoning',
      size: ModelSize.LITE,
      provider: 'grok',
      creditCost: 0.8,
      contextSize: 2_000_000,
      nonReasoning: true,
    },
  },
  VERTEX_GPT_OSS_120: {
    id: 'google-vertex-ai/openai/gpt-oss-120b-maas',
    config: {
      name: 'Google Vertex GPT OSS 120B',
      size: ModelSize.LITE,
      provider: 'google-vertex-ai',
      creditCost: 0.36,
      contextSize: 131072,
    },
  },
  VERTEX_KIMI_THINKING: {
    id: 'google-vertex-ai/moonshotai/kimi-k2-thinking-maas',
    config: {
      name: 'Google Vertex Kimi K2 Thinking',
      size: ModelSize.LITE,
      provider: 'google-vertex-ai',
      creditCost: 2,
      contextSize: 262144,
    },
  },
  QWEN_3_CODER_480B: {
    id: 'google-vertex-ai/qwen/qwen3-coder-480b-a35b-instruct-maas',
    config: {
      name: 'Qwen 3 Coder 480B',
      size: ModelSize.LITE,
      provider: 'google-vertex-ai',
      creditCost: 8,
      contextSize: 262144,
    },
  },
} as const;

export const AIModels = Object.fromEntries(
  Object.entries(MODELS_MASTER).map(([key, value]) => [key, value.id]),
) as { [K in keyof typeof MODELS_MASTER]: (typeof MODELS_MASTER)[K]['id'] };

export type AIModels = (typeof AIModels)[keyof typeof AIModels];

export const AI_MODEL_CONFIG: Record<AIModels, AIModelConfig> =
  Object.fromEntries(
    Object.values(MODELS_MASTER).map((entry) => [entry.id, entry.config]),
  ) as Record<AIModels, AIModelConfig>;

export interface ModelConfig {
  name: AIModels | string;
  reasoning_effort?: ReasoningEffort;
  max_tokens?: number;
  temperature?: number;
  frequency_penalty?: number;
  fallbackModel?: AIModels | string;
}

export interface AgentConfig {
  templateSelection: ModelConfig;
  blueprint: ModelConfig;
  projectSetup: ModelConfig;
  phaseGeneration: ModelConfig;
  phaseImplementation: ModelConfig;
  firstPhaseImplementation: ModelConfig;
  fileRegeneration: ModelConfig;
  screenshotAnalysis: ModelConfig;
  realtimeCodeFixer: ModelConfig;
  fastCodeFixer: ModelConfig;
  conversationalResponse: ModelConfig;
  deepDebugger: ModelConfig;
  agenticProjectBuilder: ModelConfig;
}

export type ProviderOverrideType = 'cloudflare' | 'direct';
export type AgentActionKey = keyof AgentConfig;

export interface CredentialsPayload {
  providers?: Record<string, { apiKey: string }>;
  aiGateway?: { baseUrl: string; token: string };
}

export interface UserModelConfigWithMetadata extends ModelConfig {
  isUserOverride: boolean;
  userConfigId?: string;
}

export interface ModelTestResult {
  success: boolean;
  error?: string;
  responsePreview?: string;
  latencyMs: number;
  modelUsed: string;
  timestamp?: Date;
}

export interface UserProviderStatus {
  provider: string;
  hasValidKey: boolean;
  keyPreview?: string;
}

export interface ModelsByProvider {
  [provider: string]: AIModels[];
}

export interface ModelConfigsData {
  configs: Record<AgentActionKey, UserModelConfigWithMetadata>;
  defaults: Record<AgentActionKey, ModelConfig>;
  message: string;
}

export interface ModelConfigData {
  config: UserModelConfigWithMetadata;
  defaultConfig: ModelConfig;
  message: string;
}

export interface ModelConfigUpdateData {
  config: {
    id: string;
    userId: string;
    agentActionName: string;
    modelName: string | null;
    maxTokens: number | null;
    temperature: number | null;
    reasoningEffort: string | null;
    providerOverride: string | null;
    fallbackModel: string | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
  message: string;
}

export interface ModelConfigTestData {
  testResult: ModelTestResult;
  message: string;
}

export interface ModelConfigResetData {
  resetCount: number;
  message: string;
}

export interface ModelConfigDefaultsData {
  defaults: Record<AgentActionKey, ModelConfig>;
  message: string;
}

export interface ModelConfigDeleteData {
  message: string;
}

export interface ByokProvidersData {
  providers: UserProviderStatus[];
  modelsByProvider: ModelsByProvider;
  platformModels: AIModels[];
}
