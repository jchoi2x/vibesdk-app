import type { ILogger } from './types';

export function createNoopLogger(): ILogger {
  const noop = () => undefined;
  const logger: ILogger = {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    child: () => logger,
  };
  return logger;
}
