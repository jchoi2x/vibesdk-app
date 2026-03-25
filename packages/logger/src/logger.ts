import type { TLogLevel, TLogWriter, ILogger } from './types';

const LEVELS: Record<TLogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export function createLogger(
  write: TLogWriter,
  bindings: Record<string, unknown> = {},
  minLevel: TLogLevel = 'info',
): ILogger {
  const log = (
    level: TLogLevel,
    msg: string,
    ctx?: Record<string, unknown>,
  ): void => {
    if ((LEVELS[level] ?? 0) < (LEVELS[minLevel] ?? 0)) return;
    write({ level, msg, ts: Date.now(), ctx: { ...bindings, ...ctx } });
  };

  return {
    debug: (msg, ctx) => log('debug', msg, ctx),
    info: (msg, ctx) => log('info', msg, ctx),
    warn: (msg, ctx) => log('warn', msg, ctx),
    error: (msg, ctx) => log('error', msg, ctx),
    child: (extra) => createLogger(write, { ...bindings, ...extra }, minLevel),
  };
}
