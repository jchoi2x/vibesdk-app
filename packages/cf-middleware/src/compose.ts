import type { TMiddleware } from './types';

/**
 * Composes middlewares left-to-right. Each calls next() to pass control forward.
 */
export function compose(...middlewares: TMiddleware[]): TMiddleware {
  return async (req, next) => {
    let index = -1;

    const dispatch = async (i: number): Promise<Response> => {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      const fn = i === middlewares.length ? next : middlewares[i];
      if (!fn) throw new Error(`middleware[${i}] is undefined`);
      return fn(req, () => dispatch(i + 1));
    };

    return dispatch(0);
  };
}
