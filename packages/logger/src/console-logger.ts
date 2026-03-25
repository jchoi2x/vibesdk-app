import type { TLogLevel, TLogWriter, ILogger } from './types';
import { createLogger } from './logger';

const LEVEL_LABELS: Record<TLogLevel, string> = {
	debug: 'DBG',
	info: 'INF',
	warn: 'WRN',
	error: 'ERR',
};

export function createConsoleLogger(
	bindings: Record<string, unknown> = {},
	minLevel: TLogLevel = 'info',
): ILogger {
	const write: TLogWriter = ({ level, msg, ts, ctx }) => {
		const label = LEVEL_LABELS[level] ?? level.toUpperCase();
		const line = `[${new Date(ts).toISOString()}] ${label} ${msg}`;
		const fn =
			level === 'error'
				? console.error
				: level === 'warn'
					? console.warn
					: console.log;
		if (Object.keys(ctx).length > 0) {
			fn(line, ctx);
		} else {
			fn(line);
		}
	};

	return createLogger(write, bindings, minLevel);
}
