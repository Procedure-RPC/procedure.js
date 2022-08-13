/** Codes for determining the cause of errors encountered while working with procedures. */
export enum ProcedureErrorCodes {
    // 0 - 99: Reserved for exceptions of unknown origin.
    /** An unhandled exception of unknown origin was thrown while handling the request. */
    UNKNOWN_ERROR = 0,

    // 100 - 199: Reserved for exceptions originating from the client.
    /** An unhandled exception was thrown while attempting to call the procedure. */
    INTERNAL_CLIENT_ERROR = 100,
    /** The procedure could not be found at the stated endpoint. */
    NOT_FOUND = 101,
    /** The operation was cancelled by the client. */
    CANCELLED = 102,
    /** Timed out waiting for the operation to complete. */
    TIMED_OUT = 103,
    /** The response from the server was invalid. */
    INVALID_RESPONSE = 104,

    // 200 - 299: Reserved for exceptions originating from the server.
    /** An unhandled exception was thrown while attempting to handle the procedure. */
    INTERNAL_SERVER_ERROR = 200,
    /** An unhandled exception was thrown during procedure execution. */
    EXECUTION_ERROR = 201
}

/** 
 * Defines the interface of errors relating to procedures.
 * @internal
 * @remarks Intended for internal use; may not be exported in future.
 */
export abstract class ProcedureError implements Error {
    /** The name of the error type. */
    abstract name: string;
    /** The code used to identify the error type. */
    abstract code: ProcedureErrorCodes;
    /** A message indicating the cause of the error. */
    abstract message: string;
    /** An optional dictionary of data which will be passed to a procedure's caller when thrown. */
    data?: Record<string, unknown>;

    /**
     * Initializes a new instance of {@link ProcedureError}
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
    constructor(data?: Record<string, unknown>) {
        if (data) {
            this.data = data;
        }
    }
}

/** When thrown, indicates that an unhandled exception of unknown origin was thrown while handling the request. */
export class ProcedureUnknownError extends ProcedureError {
    name = 'ProcedureUnknownError';
    code = ProcedureErrorCodes.UNKNOWN_ERROR;
    message = 'An unhandled exception of unknown origin was thrown while handling the request.';
    /**
     * Initializes an instance of {@link ProcedureUnknownError}.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
    constructor(data?: Record<string, unknown>) { super(data) }
}

/** When thrown, indicates that an unhandled exception was thrown while attempting to call the procedure. */
export class ProcedureInternalClientError extends ProcedureError {
    name = 'ProcedureInternalClientError';
    code = ProcedureErrorCodes.INTERNAL_CLIENT_ERROR;
    message = 'An unhandled exception was thrown while attempting to call the procedure.';
    /**
     * Initializes an instance of {@link ProcedureInternalClientError}.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
     constructor(data?: Record<string, unknown>) { super(data) }
}

/** When thrown, indicates that the procedure could not be found at the stated endpoint. */
export class ProcedureNotFoundError extends ProcedureError {
    name = 'ProcedureNotFoundError';
    code = ProcedureErrorCodes.NOT_FOUND;
    message = 'The procedure could not be found at the stated endpoint.';
    /**
     * Initializes an instance of {@link ProcedureNotFoundError}.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
     constructor(data?: Record<string, unknown>) { super(data) }
}

/** When thrown, indicates that the operation was cancelled by the client. */
export class ProcedureCancelledError extends ProcedureError {
    name = 'ProcedureCancelledError';
    code = ProcedureErrorCodes.CANCELLED;
    message = 'The operation was cancelled by the client.';
    /**
     * Initializes an instance of {@link ProcedureCancelledError}.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
     constructor(data?: Record<string, unknown>) { super(data) }
}

/** When thrown, indicates that the request timed out waiting for the operation to complete. */
export class ProcedureTimedOutError extends ProcedureError {
    name = 'ProcedureTimedOutError';
    code = ProcedureErrorCodes.TIMED_OUT;
    message = 'Timed out waiting for the operation to complete.';
    /**
     * Initializes an instance of {@link ProcedureTimedOutError}.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
     constructor(data?: Record<string, unknown>) { super(data) }
}

/** When thrown, indicates that the response from the server was invalid. */
export class ProcedureInvalidResponseError extends ProcedureError {
    name = 'ProcedureInvalidResponseError';
    code = ProcedureErrorCodes.INVALID_RESPONSE;
    message = 'The response from the server was invalid.';
    /**
     * Initializes an instance of {@link ProcedureInvalidResponseError}.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
     constructor(data?: Record<string, unknown>) { super(data) }
}

/** When thrown, indicates that an unhandled exception was thrown while attempting to handle the procedure. */
export class ProcedureInternalServerError extends ProcedureError {
    name = 'ProcedureInternalServerError';
    code = ProcedureErrorCodes.INTERNAL_SERVER_ERROR;
    message = 'An unhandled exception was thrown while attempting to handle the procedure.';
    /**
     * Initializes an instance of {@link ProcedureInternalServerError}.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
     constructor(data?: Record<string, unknown>) { super(data) }
}

/** When thrown, indicates that an unhandled exception was thrown during procedure execution. */
export class ProcedureExecutionError extends ProcedureError {
    name = 'ProcedureExecutionError';
    code = ProcedureErrorCodes.EXECUTION_ERROR;
    message = 'An unhandled exception was thrown during procedure execution.';
    /**
     * Initializes an instance of {@link ProcedureExecutionError}.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
     constructor(data?: Record<string, unknown>) { super(data) }
}

/**
 * Type guard for determining whether a given {@link object} is an {@link Error} instance.
 * @param {unknown} object The object.
 * @returns {object is Error} `true` if the {@link object} is determined to be an {@link Error}, otherwise `false`.
 * @internal
 * @remarks Intended for internal use; may not be exported in future.
 */
export function isError(object: unknown): object is Error {
    return object instanceof Error;
}

/**
 * Type guard for determining whether a given {@link object} is {@link Error}-like, i.e. it conforms to the most basic {@link Error} interface.
 * @param {unknown} object The object.
 * @returns {object is Error} `true` if the {@link object} conforms to the {@link Error} interface, otherwise `false`.
 * @internal
 * @remarks Intended for internal use; may not be exported in future.
 */
export function isErrorLike(object: unknown): object is Error {
    return typeof object === 'object' && object !== null && (isError(object) || 'name' in object);
}

/**
 * Type guard for determining whether a given {@link object} conforms to the {@link ProcedureError} interface.
 * @param {unknown} object The object.
 * @returns {object is ProcedureError} `true` if the {@link object} conforms to the {@link ProcedureError} interface, otherwise `false`.
 */
export function isProcedureError(object: unknown): object is ProcedureError {
    return object instanceof ProcedureError || (isErrorLike(object) && object.name.startsWith('Procedure') && object.name.endsWith('Error')
        && 'message' in object
        && 'code' in object && (<{ code: number }>object).code in ProcedureErrorCodes);
}
