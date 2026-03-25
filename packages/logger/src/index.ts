export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
	level: LogLevel;
	msg: string;
	ts: number;
	ctx: Record<string, unknown>;
}

export interface Logger {
	debug(msg: string, ctx?: Record<string, unknown>): void;
	info(msg: string, ctx?: Record<string, unknown>): void;
	warn(msg: string, ctx?: Record<string, unknown>): void;
	error(msg: string, ctx?: Record<string, unknown>): void;
	child(bindings: Record<string, unknown>): Logger;
}

export type LogWriter = (entry: LogEntry) => void;

const LEVELS: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
};

export function createLogger(
	write: LogWriter,
	bindings: Record<string, unknown> = {},
	minLevel: LogLevel = 'info',
): Logger {
	const log = (
		level: LogLevel,
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
		child: (extra) =>
			createLogger(write, { ...bindings, ...extra }, minLevel),
	};
}

const LEVEL_LABELS: Record<LogLevel, string> = {
	debug: 'DBG',
	info: 'INF',
	warn: 'WRN',
	error: 'ERR',
};

export function createConsoleLogger(
	bindings: Record<string, unknown> = {},
	minLevel: LogLevel = 'info',
): Logger {
	const write: LogWriter = ({ level, msg, ts, ctx }) => {
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

export function createNoopLogger(): Logger {
	const noop = () => undefined;
	const logger: Logger = {
		debug: noop,
		info: noop,
		warn: noop,
		error: noop,
		child: () => logger,
	};
	return logger;
}
