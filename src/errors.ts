export enum ProcedureErrorCodes {
    UNKNOWN_ERROR = 0,
    INTERNAL_CLIENT_ERROR = 100,
    NOT_FOUND = 101,
    CANCELLED = 102,
    TIMED_OUT = 103,
    INVALID_RESPONSE = 104,
    INTERNAL_SERVER_ERROR = 200,
    EXECUTION_ERROR = 201
}

export interface ProcedureError extends Error {
    name: string;
    code: ProcedureErrorCodes;
    message: string;
    data?: Record<string, unknown>;
}

export class ProcedureUnknownError implements ProcedureError {
    name = 'ProcedureUnknownError';
    code = ProcedureErrorCodes.UNKNOWN_ERROR;
    message = 'An unhandled exception of unknown origin was thrown while handling the request';
    constructor(public data?: Record<string, unknown>) { }
}

export class ProcedureInternalClientError implements ProcedureError {
    name = 'ProcedureInternalClientError';
    code = ProcedureErrorCodes.INTERNAL_CLIENT_ERROR;
    message = 'An internal exception was thrown';
    constructor(public data?: Record<string, unknown>) { }
}

export class ProcedureNotFoundError implements ProcedureError {
    name = 'ProcedureNotFoundError';
    code = ProcedureErrorCodes.NOT_FOUND;
    message = 'The procedure could not be found at the endpoint';
    constructor(public data?: Record<string, unknown>) { }
}

export class ProcedureCancelledError implements ProcedureError {
    name = 'ProcedureCancelledError';
    code = ProcedureErrorCodes.CANCELLED;
    message = 'The operation was cancelled by the client';
    constructor(public data?: Record<string, unknown>) { }
}

export class ProcedureTimedOutError implements ProcedureError {
    name = 'ProcedureTimedOutError';
    code = ProcedureErrorCodes.TIMED_OUT;
    message = 'Timed out waiting for the operation to complete';
    constructor(public data?: Record<string, unknown>) { }
}

export class ProcedureInvalidResponseError implements ProcedureError {
    name = 'ProcedureInvalidResponseError';
    code = ProcedureErrorCodes.INVALID_RESPONSE;
    message = 'The response from the server was invalid';
    constructor(public data?: Record<string, unknown>) { }
}

export class ProcedureInternalServerError implements ProcedureError {
    name = 'ProcedureInternalServerError';
    code = ProcedureErrorCodes.INTERNAL_SERVER_ERROR;
    message = 'An internal exception was thrown';
    constructor(public data?: Record<string, unknown>) { }
}

export class ProcedureExecutionError implements ProcedureError {
    name = 'ProcedureExecutionError';
    code = ProcedureErrorCodes.EXECUTION_ERROR;
    message = 'An unhandled exception was thrown during procedure execution';
    constructor(public data?: Record<string, unknown>) { }
}

/**
 * Type guard for determining whether a given object is an `Error` instance.
 * @param {unknown} object The object.
 * @returns {object is Error} `true` if the object is determined to be an `Error`, otherwise `false`.
 */
export function isError(object: unknown): object is Error {
    return object instanceof Error;
}

/**
 * Type guard for determining whether a given object is `Error`-like, i.e. it matches the most basic `Error` interface.
 * @param {unknown} object The object.
 * @returns {object is Error} `true` if the object is determined to fit the shape of an `Error`, otherwise `false`.
 */
export function isErrorLike(object: unknown): object is Error {
    return typeof object === 'object' && object !== null && (isError(object) || 'name' in object);
}

export function isProcedureError(object: unknown): object is ProcedureError {
    return isErrorLike(object) && object.name.startsWith('Procedure') && object.name.endsWith('Error')
        && 'message' in object
        && 'code' in object && (<{ code: number }>object).code in ProcedureErrorCodes;
}
