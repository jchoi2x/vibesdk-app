export type TLogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogEntry {
	level: TLogLevel;
	msg: string;
	ts: number;
	ctx: Record<string, unknown>;
}

export interface ILogger {
	debug(msg: string, ctx?: Record<string, unknown>): void;
	info(msg: string, ctx?: Record<string, unknown>): void;
	warn(msg: string, ctx?: Record<string, unknown>): void;
	error(msg: string, ctx?: Record<string, unknown>): void;
	child(bindings: Record<string, unknown>): ILogger;
}

export type TLogWriter = (entry: ILogEntry) => void;
