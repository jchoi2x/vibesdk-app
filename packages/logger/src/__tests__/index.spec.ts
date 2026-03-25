import { describe, it, expect, vi } from 'vitest';
import {
  createLogger,
  createConsoleLogger,
  createNoopLogger,
  type IILogEntry,
} from '../index';

describe('createLogger', () => {
  it('calls write with correct level, message, and timestamp', () => {
    const write = vi.fn();
    const logger = createLogger(write);
    logger.info('test message');
    expect(write).toHaveBeenCalledOnce();
    const entry = write.mock.calls[0][0] as ILogEntry;
    expect(entry.level).toBe('info');
    expect(entry.msg).toBe('test message');
    expect(entry.ts).toBeTypeOf('number');
  });

  it('merges ctx with bindings in the log entry', () => {
    const write = vi.fn();
    const logger = createLogger(write, { service: 'api' });
    logger.info('msg', { requestId: 'abc' });
    const entry = write.mock.calls[0][0] as ILogEntry;
    expect(entry.ctx).toEqual({ service: 'api', requestId: 'abc' });
  });

  it('ctx overrides bindings for the same key', () => {
    const write = vi.fn();
    const logger = createLogger(write, { key: 'binding' });
    logger.info('msg', { key: 'ctx' });
    const entry = write.mock.calls[0][0] as ILogEntry;
    expect(entry.ctx.key).toBe('ctx');
  });

  it('does not call write for messages below minLevel', () => {
    const write = vi.fn();
    const logger = createLogger(write, {}, 'warn');
    logger.debug('d');
    logger.info('i');
    expect(write).not.toHaveBeenCalled();
  });

  it('calls write for messages at or above minLevel', () => {
    const write = vi.fn();
    const logger = createLogger(write, {}, 'warn');
    logger.warn('w');
    logger.error('e');
    expect(write).toHaveBeenCalledTimes(2);
  });

  it('supports all four log levels', () => {
    const write = vi.fn();
    const logger = createLogger(write, {}, 'debug');
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    expect(write).toHaveBeenCalledTimes(4);
    const levels = write.mock.calls.map((c) => (c[0] as ILogEntry).level);
    expect(levels).toEqual(['debug', 'info', 'warn', 'error']);
  });

  it('defaults to info minLevel', () => {
    const write = vi.fn();
    const logger = createLogger(write);
    logger.debug('ignored');
    logger.info('logged');
    expect(write).toHaveBeenCalledTimes(1);
    expect((write.mock.calls[0][0] as ILogEntry).level).toBe('info');
  });

  describe('child', () => {
    it('inherits parent bindings and adds new ones', () => {
      const write = vi.fn();
      const logger = createLogger(write, { parent: 1 });
      const child = logger.child({ child: 2 });
      child.info('msg');
      const entry = write.mock.calls[0][0] as ILogEntry;
      expect(entry.ctx).toEqual({ parent: 1, child: 2 });
    });

    it('child binding overrides parent binding', () => {
      const write = vi.fn();
      const logger = createLogger(write, { key: 'parent' });
      const child = logger.child({ key: 'child' });
      child.info('msg');
      expect((write.mock.calls[0][0] as ILogEntry).ctx.key).toBe('child');
    });

    it('child inherits the same minLevel', () => {
      const write = vi.fn();
      const logger = createLogger(write, {}, 'error');
      const child = logger.child({ x: 1 });
      child.warn('suppressed');
      expect(write).not.toHaveBeenCalled();
    });
  });
});

describe('createConsoleLogger', () => {
  it('uses console.log for info level', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const logger = createConsoleLogger();
    logger.info('hello');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('uses console.log for debug level', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const logger = createConsoleLogger({}, 'debug');
    logger.debug('dbg');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('uses console.warn for warn level', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logger = createConsoleLogger();
    logger.warn('oops');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('uses console.error for error level', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logger = createConsoleLogger();
    logger.error('bad');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('includes ctx object in log call when ctx has keys', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const logger = createConsoleLogger();
    logger.info('msg', { key: 'val' });
    // Called with line string and ctx object
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('INF msg'),
      expect.objectContaining({ key: 'val' }),
    );
    spy.mockRestore();
  });

  it('does not pass ctx arg when ctx is empty', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const logger = createConsoleLogger();
    logger.info('msg');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('INF msg'));
    expect(spy.mock.calls[0].length).toBe(1);
    spy.mockRestore();
  });
});

describe('createNoopLogger', () => {
  it('does not throw for any log level', () => {
    const logger = createNoopLogger();
    expect(() => {
      logger.debug('d');
      logger.info('i');
      logger.warn('w');
      logger.error('e');
    }).not.toThrow();
  });

  it('child returns the same noop logger instance', () => {
    const logger = createNoopLogger();
    expect(logger.child({ x: 1 })).toBe(logger);
  });
});
