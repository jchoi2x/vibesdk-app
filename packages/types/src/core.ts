// Result<T, E> — explicit success/failure without exceptions
export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = Error> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

// HTTP
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

// Pagination
export interface PageParams {
  page: number;
  limit: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// API response envelope
export type ApiSuccess<T = unknown> = {
  readonly success: true;
  readonly data: T;
};
export type ApiFailure = {
  readonly success: false;
  readonly error: string;
  readonly code?: ErrorCode;
  readonly details?: Record<string, unknown>;
};
export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiFailure;

// Standard error codes
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

// Branded types — add nominal typing to primitives
export type Brand<T, B extends string> = T & { readonly __brand: B };

// ISO 8601 timestamp string
export type ISODateString = Brand<string, 'ISODateString'>;

// Common entity timestamps
export interface Timestamps {
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// Utilities
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export type NonEmptyArray<T> = [T, ...T[]];

export type Awaitable<T> = T | Promise<T>;

// Flattens intersection types for readable hover tooltips
export type Prettify<T> = { [K in keyof T]: T[K] } & object;
