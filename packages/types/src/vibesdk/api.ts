/**
 * Base API response type definitions for vibesdk platform.
 * Self-contained - imports only from sibling vibesdk files or @jchoi2x/types/errors.
 */

import type { SecurityErrorType, RateLimitError } from '../errors';

export interface BaseErrorResponse {
    message: string;
    name: string;
    type?: SecurityErrorType;
}

export interface RateLimitErrorResponse extends BaseErrorResponse {
    details: RateLimitError;
}

export interface BaseApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: BaseErrorResponse | RateLimitErrorResponse;
    message?: string;
}

export type ControllerResponse<T> = Response & {
    __typedData: T;
};

export type ApiResponse<T = unknown> = BaseApiResponse<T>;

export interface PlatformStatusData {
    globalUserMessage: string;
    changeLogs: string;
    hasActiveMessage: boolean;
}
