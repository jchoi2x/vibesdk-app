import { type IStateManager } from '@/agents/services/interfaces/IStateManager';
import { type IFileManager } from '@/agents/services/interfaces/IFileManager';
import { type StructuredLogger } from '@/logger';
import { type BaseProjectState } from '@/agents/core/state';

/**
 * Common options for all agent services
 */
export interface ServiceOptions<TState extends BaseProjectState = BaseProjectState> {
    env: Env,
    stateManager: IStateManager<TState>;
    fileManager: IFileManager;
    getLogger: () => StructuredLogger;
}
