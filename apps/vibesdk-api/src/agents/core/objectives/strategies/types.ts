import type { ExportOptions, ExportResult } from '@/agents/core/types';
import type { BaseProjectState } from '@/agents/core/state';
import type { StructuredLogger } from '@/logger';
import type { WebSocketMessageType, WebSocketMessageData } from '@/api/websocketTypes';

export interface ExportContext {
	env: Env;
	logger: StructuredLogger;
	agentId: string;
	state: BaseProjectState;
	broadcast: <T extends WebSocketMessageType>(type: T, data?: WebSocketMessageData<T>) => void;
}

export interface AdditionalExportStrategy {
	getSupportedKinds(): ExportOptions['kind'][];
	export(options: ExportOptions, ctx: ExportContext): Promise<ExportResult>;
}
