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
    /** A string indicating the cause of the error. */
    message: string;
    /** An optional dictionary of data which will be passed to a procedure's caller when thrown. */
    data?: Record<string, unknown>;

    /**
     * Initializes a new instance of {@link ProcedureError}
     * @param {string} message A string indicating the cause of the error.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
    constructor(message: string, data?: Record<string, unknown>) {
        this.message = message;

        if (data) {
            this.data = data;
        }
    }
}

/** When thrown, indicates that an unhandled exception of unknown origin was thrown while handling the request. */
export class ProcedureUnknownError extends ProcedureError {
    name = 'ProcedureUnknownError';
    code = ProcedureErrorCodes.UNKNOWN_ERROR;
    /**
     * Initializes an instance of {@link ProcedureUnknownError}.
     * @param {string} [message] A string indicating the cause of the error.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
    constructor(message = 'An unhandled exception of unknown origin was thrown while handling the request.', data?: Record<string, unknown>) {
        super(message, data);
    }
}

/** When thrown, indicates that an unhandled exception was thrown while attempting to call the procedure. */
export class ProcedureInternalClientError extends ProcedureError {
    name = 'ProcedureInternalClientError';
    code = ProcedureErrorCodes.INTERNAL_CLIENT_ERROR;
    /**
     * Initializes an instance of {@link ProcedureInternalClientError}.
     * @param {string} [message] A string indicating the cause of the error.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
     constructor(message = 'An unhandled exception was thrown while attempting to call the procedure.', data?: Record<string, unknown>) {
        super(message, data);
    }
}

/** When thrown, indicates that the procedure could not be found at the stated endpoint. */
export class ProcedureNotFoundError extends ProcedureError {
    name = 'ProcedureNotFoundError';
    code = ProcedureErrorCodes.NOT_FOUND;
    /**
     * Initializes an instance of {@link ProcedureNotFoundError}.
     * @param {string} [message] A string indicating the cause of the error.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
    constructor(message = 'The procedure could not be found at the stated endpoint.', data?: Record<string, unknown>) {
        super(message, data);
    }
}

/** When thrown, indicates that the operation was cancelled by the client. */
export class ProcedureCancelledError extends ProcedureError {
    name = 'ProcedureCancelledError';
    code = ProcedureErrorCodes.CANCELLED;
    /**
     * Initializes an instance of {@link ProcedureCancelledError}.
     * @param {string} [message] A string indicating the cause of the error.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
    constructor(message = 'The operation was cancelled by the client.', data?: Record<string, unknown>) {
        super(message, data);
    }
}

/** When thrown, indicates that the request timed out waiting for the operation to complete. */
export class ProcedureTimedOutError extends ProcedureError {
    name = 'ProcedureTimedOutError';
    code = ProcedureErrorCodes.TIMED_OUT;
    /**
     * Initializes an instance of {@link ProcedureTimedOutError}.
     * @param {string} [message] A string indicating the cause of the error.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
    constructor(message = 'Timed out waiting for the operation to complete.', data?: Record<string, unknown>) {
        super(message, data);
    }
}

/** When thrown, indicates that the response from the server was invalid. */
export class ProcedureInvalidResponseError extends ProcedureError {
    name = 'ProcedureInvalidResponseError';
    code = ProcedureErrorCodes.INVALID_RESPONSE;
    /**
     * Initializes an instance of {@link ProcedureInvalidResponseError}.
     * @param {string} [message] A string indicating the cause of the error.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
    constructor(message = 'The response from the server was invalid.', data?: Record<string, unknown>) {
        super(message, data);
    }
}

/** When thrown, indicates that an unhandled exception was thrown while attempting to handle the procedure. */
export class ProcedureInternalServerError extends ProcedureError {
    name = 'ProcedureInternalServerError';
    code = ProcedureErrorCodes.INTERNAL_SERVER_ERROR;
    /**
     * Initializes an instance of {@link ProcedureInternalServerError}.
     * @param {string} [message] A string indicating the cause of the error.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
    constructor(message = 'An unhandled exception was thrown while attempting to handle the procedure.', data?: Record<string, unknown>) {
        super(message, data);
    }
}

/** When thrown, indicates that an unhandled exception was thrown during procedure execution. */
export class ProcedureExecutionError extends ProcedureError {
    name = 'ProcedureExecutionError';
    code = ProcedureErrorCodes.EXECUTION_ERROR;
    /**
     * Initializes an instance of {@link ProcedureExecutionError}.
     * @param {string} [message] A string indicating the cause of the error.
     * @param {Record<string, unknown>} [data] An optional dictionary of data which will be passed to a procedure's caller when thrown.
     */
    constructor(message = 'An unhandled exception was thrown during procedure execution.', data?: Record<string, unknown>) {
        super(message, data);
    }
}

/**
 * Type guard for determining whether a given {@link object} conforms to the {@link Error} interface.
 * @param {unknown} object The object.
 * @returns {object is Error} `true` if the {@link object} conforms to the {@link Error} interface, otherwise `false`.
 * @internal
 * @remarks Intended for internal use; may not be exported in future.
 */
export function isError(object: unknown): object is Error {
    return object instanceof Error || (typeof object === 'object' && object !== null && 'name' in object && 'message' in object);
}

/**
 * Type guard for determining whether a given {@link object} conforms to the {@link ProcedureError} interface.
 * @param {unknown} object The object.
 * @returns {object is ProcedureError} `true` if the {@link object} conforms to the {@link ProcedureError} interface, otherwise `false`.
 */
export function isProcedureError(object: unknown): object is ProcedureError {
    return object instanceof ProcedureError || (isError(object) && object.name.startsWith('Procedure') && object.name.endsWith('Error')
        && 'message' in object
        && 'code' in object && (<{ code: number }>object).code in ProcedureErrorCodes);
}
