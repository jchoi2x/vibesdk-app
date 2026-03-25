import { type IStateManager } from './IStateManager';
import { type IFileManager } from './IFileManager';
import { type StructuredLogger } from '../../../logger';
import { type BaseProjectState } from '../../core/state';

/**
 * Common options for all agent services
 */
export interface ServiceOptions<TState extends BaseProjectState = BaseProjectState> {
    env: Env,
    stateManager: IStateManager<TState>;
    fileManager: IFileManager;
    getLogger: () => StructuredLogger;
}
