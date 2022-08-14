// TODO: rework pings to be enabled by default, but with a variable (default 60 second) cache for successful pings by endpoint for the best of both worlds. for parallelisation, when one successful ping occurs, ideally it would make any pending pings immediately resolve. ping cache should be emptied if endpoint times out on a call
// TODO: add and test ipv6 support

/// <reference types='node' />
import {
    isProcedureError,
    ProcedureCancelledError, ProcedureInvalidResponseError, ProcedureInternalClientError, ProcedureInternalServerError, ProcedureExecutionError, ProcedureError, isError
} from './errors';
import { AggregateSignal, TimeoutSignal } from './signals';
import { createSocket, Socket } from 'nanomsg';
import { encode as msgpackEncode, decode as msgpackDecode, ExtensionCodec } from '@msgpack/msgpack'
import { once, EventEmitter } from 'events'
import TypedEmitter from 'typed-emitter'
import { v5 as uuidv5 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const homepage: string = require('../package.json').funding;
const uuidNamespace = uuidv5(homepage, uuidv5.URL);

/**
 * A simple abstraction of a procedure (the P in RPC).
 * Allows you to turn a function or callback into a procedure, which can be called via the transport specified.
 * @template Input Type of input parameter the procedure accepts. Defaults to `undefined`.
 * @template Output Type of output value the procedure returns. Defaults to `undefined`.
 */
export class Procedure<Input extends Nullable = undefined, Output extends Nullable = undefined>
    extends (EventEmitter as { new <Input>(): TypedEmitter<ProcedureEvents<Input>> })<Input> implements ProcedureDefinitionOptions {
    #endpoint?: string;
    /** 
     * The endpoint at which the {@link Procedure}, when {@link bind bound}, can be {@link Procedure.call called}.
    */
    get endpoint() { return this.#endpoint; }
    protected set endpoint(value) { this.#endpoint = value; }

    #uuid?: string;
    /** 
     * A v5 uuid generated from {@link endpoint}, used to identify ping requests.
     */
    protected get uuid() { return this.#uuid; }
    protected set uuid(value) { this.#uuid = value; }

    /** 
     * The options in use by the {@link Procedure}, including defaults.
     */
    protected options: ProcedureDefinitionOptions;

    /** 
     * The underlying nanomsg {@link Socket sockets} used for data transmission.
     */
    protected sockets: Socket[] = [];

    /**
     * @inheritDoc ProcedureDefinitionOptions.verbose
     */
    get verbose() { return this.options.verbose; }
    set verbose(value) { this.options.verbose = value; }

    /**
     * @inheritDoc ProcedureDefinitionOptions.workers
     */
    get workers() { return this.options.workers; }
    set workers(value) {
        this.options.workers = !isNaN(value) && isFinite(value)
            ? Math.min(Math.max(value, 1), Number.MAX_SAFE_INTEGER)
            : 1;
    }

    /**
     * @inheritDoc ProcedureDefinitionOptions.extensionCodec
     */
    get extensionCodec() { return this.options.extensionCodec; }
    set extensionCodec(value) { this.options.extensionCodec = value; }

    /**
     * @inheritDoc ProcedureOptions.optionalParameterSupport
     */
    get optionalParameterSupport() { return this.options.optionalParameterSupport; }
    set optionalParameterSupport(value) { this.options.optionalParameterSupport = value; }

    /**
     * @inheritDoc ProcedureOptions.ignoreUndefinedProperties
     */
    get ignoreUndefinedProperties() { return this.options.ignoreUndefinedProperties; }
    set ignoreUndefinedProperties(value) { this.options.ignoreUndefinedProperties = value; }

    /**
     * Initializes a new {@link Procedure}.
     * @param {Callback<Input, Output>} callback The underlying callback function powering the procedure itself. The callback may be asynchronous.
     * @param {Partial<ProcedureDefinitionOptions>} [options={}] Options for a {@link Procedure}. Defaults to `{}`.
     * @template Input Type of input parameter the procedure accepts. Defaults to `undefined`.
     * @template Output Type of output value the procedure returns. Defaults to `undefined`.
     */
    constructor(protected callback: Callback<Input, Output>, options: Partial<ProcedureDefinitionOptions> = {}) {
        super();
        this.options = {
            ...{
                verbose: false,
                workers: 1,
                optionalParameterSupport: true,
                ignoreUndefinedProperties: true
            },
            ...options
        };
        this.workers = this.options.workers; // explicitly run setter logic
    }

    /**
     * Binds the {@link Procedure} to an {@link endpoint}, making it available to be {@link Procedure.call called}.
     * @param {string} [endpoint=undefined] The endpoint at which the procedure will be callable. Defaults to {@link Procedure.endpoint}.
     * @returns {this} The bound {@link Procedure} for method chaining.
     * @see {@link unbind}
     */
    bind(endpoint?: string): this {
        endpoint = endpoint ?? this.endpoint;

        if (typeof endpoint === 'string') {
            this.unbind();
            this.uuid = uuidv5(endpoint, uuidNamespace);
            this.endpoint = endpoint;
            for (let i = 0; i < this.workers; i++) {
                const socket = this.sockets[this.sockets.push(createSocket('rep')) - 1];
                socket
                    .on('data', (data: Buffer) => this.#onRepSocketData(data, socket))
                    .on('error', (error: unknown) => this.#onRepSocketError(error))
                    .once('close', () => this.#onRepSocketClose())
                    .bind(endpoint); // bind the socket to the endpoint
            }
        }

        return this;
    }

    /**
     * Releases the {@link Procedure} from its {@link endpoint}.
     * @returns {this} The unbound {@link Procedure} for method chaining.
     * @see {@link bind}
     */
    unbind(): this {
        if (this.sockets.length > 0) {
            for (const socket of this.sockets) {
                socket.close();
                socket.removeAllListeners();
            }
            this.sockets = [];
        }
        return this;
    }

    /**
     * @deprecated alias of {@link call}. Slated for removal from API by v1.0
     */
    static call = call;

    /**
     * @deprecated alias of {@link ping}. Slated for removal from API by v1.0
     */
    static ping = ping;

    /**
     * @deprecated alias of {@link tryPing}. Slated for removal from API by v1.0
     */
    static tryPing = tryPing;

    /**
     * Attempts to decode the given {@link Buffer}.
     * @param {Buffer} buffer The {@link Buffer} to decode.
     * @returns {{ input: Input, error?: never } | { input?: never, error: unknown }} If successful, an object of shape `{ input: Input | Ping }`, otherwise `{ error: unknown }`.
     */
    #tryDecodeInput(buffer: Buffer): { input: Input | Ping, error?: never } | { input?: never, error: ProcedureInternalServerError } {
        try {
            return { input: decode<Input | Ping>(buffer, this.extensionCodec) };
        } catch (e) {
            const error = new ProcedureInternalServerError(undefined, { error: e });
            this.#emitAndLogError('Procedure input data could not be decoded', error);
            delete error.data;
            return { error };
        }
    }

    /**
     * Attempts to asynchronously call the {@link Procedure Procedure's} {@link callback} and return a response containing its output value.
     * @param {Input} input An input parameter to pass to the {@link callback}.
     * @returns {Promise<Response<Output>>} A {@link Promise} which when resolved passes the response to the {@link Promise.then then} handler(s).
     */
    async #tryGetCallbackResponse(input: Input): Promise<Response<Output>> {
        try {
            return {
                output: (await this.callback(input
                    ?? <Input>(this.optionalParameterSupport
                        ? undefined
                        : input))) ?? null
            };
        } catch (e) {
            const message = 'Procedure encountered an error while executing callback';
            if (isProcedureError(e)) {
                this.#emitAndLogError(message, e);
                return { error: e };
            } else {
                const error = new ProcedureExecutionError(undefined, { error: e });
                this.#emitAndLogError(message, error);
                delete error.data;
                return { error };
            }
        }
    }

    /**
     * Attempts to encode the given response for transmission back to the {@link Procedure Procedure's} caller.
     * @param {Response<Output>} response The response to encode.
     * @returns {Buffer} A {@link Buffer} containing the encoded response.
     */
    #tryEncodeResponse(response: Response<Output>): Buffer {
        try {
            return encode(response, this.extensionCodec, this.ignoreUndefinedProperties);
        } catch (e) {
            const error = new ProcedureInternalServerError(undefined, { error: e });
            this.#emitAndLogError('Procedure response could not be encoded for transmission', error);
            delete error.data;
            return this.#tryEncodeResponse({ // As the response could not be encoded, encode and return a new response containing the thrown error
                error: 'output' in response
                    ? error // output failed to encode
                    : undefined // error failed to encode, should break any infinite loops unless msgpack or the extension codec is broken
            });
        }
    }

    /**
     * Attempts to send the encoded buffer back to the {@link Procedure Procedure's} caller.
     * @param {Buffer} buffer A {@link Buffer} containing the encoded response.
     * @param {Socket} socket The {@link Socket} through which to send the response.
     * @returns {boolean} `true` when the encoded {@link Buffer} was successfully sent, otherwise `false`.
     */
    #trySendBuffer(buffer: Buffer, socket: Socket): boolean {
        try {
            socket.send(buffer);
            return true;
        } catch (error) {
            this.#emitAndLogError('Procedure response could not be sent', new ProcedureInternalServerError(undefined, { error }));
            return false;
        }
    }

    /**
     * Asynchrously handles the {@link socket socket's} data event, representing requests to call the {@link Procedure}.
     * @param {Buffer} data The encoded input {@link Buffer}.
     * @param {Socket} socket The {@link Socket} the data was received on.
     * @see {@link Socket}
     */
    async #onRepSocketData(data: Buffer, socket: Socket): Promise<void> {
        const decoded = this.#tryDecodeInput(data);

        if (!this.#tryHandlePing(decoded.input, socket)) { // input was not a ping, handle it
            if ('input' in decoded) {
                this.#emitAndLogData(decoded.input as Input);
            }

            const response = 'input' in decoded
                ? await this.#tryGetCallbackResponse(decoded.input as Input)
                : decoded;

            if ('output' in response && this.verbose) {
                console.log(`Generated output data at endpoint: ${this.endpoint}`, response.output);
            }

            if (this.#trySendBuffer(this.#tryEncodeResponse(response), socket) && this.verbose) {
                console.log(`Response sent at endpoint ${this.endpoint}`, response);
            }
        }
    }

    /**
     * Handles ping requests for a given {@link socket}.
     * @param {unknown} data The decoded incoming data object.
     * @param {Socket} socket The {@link Socket} the data was received on.
     * @returns {boolean} `true` when the decoded data object was a valid {@link Ping} and handled, otherwise `false`.
     */
    #tryHandlePing(data: unknown, socket: Socket): data is Ping {
        if (isPing(data) && data.ping === this.uuid) {
            if (this.verbose) {
                console.log(`PING received at endpoint: ${this.endpoint}`);
            }

            if (this.#trySendBuffer(this.#tryEncodeResponse({ pong: data.ping }), socket)) {
                if (this.verbose) {
                    console.log(`PONG sent at endpoint ${this.endpoint}`);
                }
            }

            return true;
        } else {
            return false;
        }
    }

    /**
     * Handles the error event for the underlying {@link sockets} of the {@link Procedure}.
     * @param {unknown} error The error data passed by the {@link Socket}.
     * @see {@link Socket}
     */
    #onRepSocketError(error: unknown): void {
        this.#emitAndLogError('Socket encountered an error', new ProcedureInternalServerError(undefined, { error }));
    }

    /**
     * Handles the close event for the underlying {@link sockets} of the {@link Procedure}.
     * @see {@link Socket}
     */
    #onRepSocketClose(): void {
        this.#logSocketClose();
        if (this.sockets.every(socket => socket.closed)) {
            this.unbind();
            this.#emitAndLogUnbind(); // emit the unbind event
        }
    }

    /**
     * Emits and optionally logs input {@link data}.
     * @param {Input} data The input data to emit and log.
     */
    #emitAndLogData(data: Input) {
        this.emit('data', data);

        if (this.verbose) {
            console.log(`Received input data at endpoint: ${this.endpoint}`, data);
        }
    }

    /**
     * Emits and optionally logs the unbind event.
     * @see {@link unbind}
     */
    #emitAndLogUnbind() {
        this.emit('unbind');

        if (this.verbose) {
            console.log(`Procedure unbound at endpoint: ${this.endpoint}`);
        }
    }

    /**
     * Emits and optionally logs a given {@link error}.
     * @param {string} message A custom error message describing the cause of the error. The message will be concatenated with the {@link Procedure Procedure's} {@link endpoint}.
     * @param {ProcedureError} [error] The error.
     */
    #emitAndLogError(message: string, error: ProcedureError) {
        message = message.concat(` at endpoint: ${this.endpoint}`); // concatenate the Procedure's endpoint to the custom error message.

        if (this.listenerCount('error') > 0) { // only emit if there are listeners to prevent unhandled error exceptions
            this.emit('error', error);
        }

        if (this.verbose) { // optionally output the error to the console
            console.error(`${message}\r\n`, error);
        }
    }

    /**
     * Optionally logs the close event of the {@link Procedure Procedure's} underlying {@link sockets}.
     */
    #logSocketClose() {
        if (this.verbose) { // optionally output the event to the console
            console.log(`Socket closed at endpoint: ${this.endpoint}`);
        }
    }
}

/**
 * Represents a nullable value.
 */
export type Nullable = unknown | null | undefined;

/**
 * Represents a simple callback function which can take a single input parameter.
 * @template Input The type of input parameter the callback accepts. Defaults to `undefined`.
 * @template Output The type of output value the callback returns. Defaults to `undefined`.
 * @see {@link Procedure}
 */
export type Callback<Input extends Nullable = undefined, Output extends Nullable = undefined> = (input: Input) => Output;

/**
 * A response from a {@link Procedure.call Procedure call}.
 * If the call returned successfully, the response will be of shape `{ output: Output }`, otherwise `{ error: ProcedureError }`.
 */
export type Response<Output extends Nullable = undefined>
    = { output: Output | null | undefined, error?: never, pong?: never }
    | { output?: never, error: ProcedureError | null | undefined, pong?: never }
    | { output?: never, error?: never, pong: string };

/**
 * Options for defining or calling a {@link Procedure}.
 * @see {@link ProcedureDefinitionOptions}
 * @see {@link ProcedureCallOptions}
 */
export interface ProcedureOptions {
    /**
     * Whether or not to enable optional parameter support. Defaults to `true`.
     * When `true` on a {@link Procedure Procedure definition}, a `null` input parameter will be coerced to `undefined`.
     * When `true` for a {@link Procedure.call Procedure call}, a `null` return value will be coerced to `undefined`.
     * 
     * @remarks
     * The {@link https://procedure-rpc.github.io/procedure.js procedure.js} library uses the {@link https://github.com/msgpack/msgpack-javascript msgpack} serialization
     * format for encoding JavaScript objects and values for transmission to and from remote {@link Procedure procedures}.
     * The JavaScript implementation of msgpack {@link https://github.com/msgpack/msgpack-javascript#messagepack-mapping-table maps undefined to null}.
     * For procedures which accept optional parameters, this is problematic.
     * It could also be an issue if you depend on the return value of a procedure to conditionally be `undefined`,
     * for the convenience of passing the return value into an optional parameter of another function call.
     * {@link optionalParameterSupport} aims to alleviate these issues by mapping `null` to `undefined`
     * for the input and output of your {@link Procedure} calls.
     * 
     * @see {@link ignoreUndefinedProperties}
     * @see {@link https://procedure-rpc.github.io/procedure.js#optional-parameter-support Optional parameter support}
     */
    optionalParameterSupport: boolean;
    /**
     * Whether or not to ignore `undefined` properties of objects passed to or from a {@link Procedure}. Defaults to `true`.
     * When `true` on a {@link Procedure Procedure definition}, only affects properties of input parameters.
     * When `true` on a {@link Procedure.call Procedure call}, only affects properties of the return value.
     * 
     * @remarks
     * The {@link https://procedure-rpc.github.io/procedure.js procedure.js} library uses the {@link https://github.com/msgpack/msgpack-javascript msgpack} serialization
     * format for encoding JavaScript objects and values for transmission to and from remote {@link Procedure procedures}.
     * The JavaScript implementation of msgpack {@link https://github.com/msgpack/msgpack-javascript#messagepack-mapping-table maps undefined to null}.
     * This means that when passing objects in or out of a {@link Procedure} (i.e. as a parameter or return value), any properties defined as `undefined`
     * will evaluate to `null` on receipt.
     * {@link ignoreUndefinedProperties} aims to alleviate this by signalling msgpack to ignore undefined properties from objects before they are encoded,
     * allowing `undefined` to be evaluated as `undefined` and `null` to be evaluated as `null`.
     * This operation incurs some overhead, and means that code relying on the presence of a property to infer meaning
     * may not operate as expected.
     * 
     * @see {@link https://procedure-rpc.github.io/procedure.js#null-and-undefined-properties null and undefined properties}
     */
    ignoreUndefinedProperties: boolean;
}

/**
 * Options for defining a {@link Procedure}.
 */
export interface ProcedureDefinitionOptions extends ProcedureOptions {
    /** 
     * The number of workers to spin up for the {@link Procedure}. Useful for procedures which may take a long time to complete.
     * Will be clamped between `1` and {@link Number.MAX_SAFE_INTEGER} inclusive.
     * Defaults to `1`. */
    workers: number;
    /** Whether or not to output errors and events to the console. Defaults to `false`. */
    verbose: boolean;
    /** An optional msgpack {@link ExtensionCodec} to use for encoding and decoding messages. */
    extensionCodec?: ExtensionCodec | undefined;
}

/**
 * Options for {@link Procedure.call calling} a {@link Procedure}.
 */
export interface ProcedureCallOptions extends ProcedureOptions {
    /** 
     * The number of milliseconds after which the {@link Procedure.call Procedure call} will automatically be aborted.
     * Set to {@link Infinity} or {@link NaN} to never timeout.
     * Non-{@link NaN}, finite values will be clamped between `0` and {@link Number.MAX_SAFE_INTEGER} inclusive.
     * Defaults to `1000`.
     */
    timeout: number;
    /** 
     * The number of milliseconds to wait for a ping-pong from the endpoint before calling the remote procedure.
     * When set, if a ping-pong is not received in the given time, the {@link Procedure.call Procedure call} will be aborted.
     * {@link NaN} or {@link Infinity infinite} numbers will result in the ping never timing out if no response is received, unless
     * {@link signal} is a valid {@link AbortSignal} and gets aborted.
     * Non-{@link NaN}, finite values will be clamped between `0` and {@link Number.MAX_SAFE_INTEGER} inclusive.
     */
    ping?: number | undefined;
    /** An optional msgpack {@link ExtensionCodec} to use for encoding and decoding messages. */
    extensionCodec?: ExtensionCodec | undefined;
    /** An optional {@link AbortSignal} which will be used to abort the Procedure call. */
    signal?: AbortSignal | undefined;
}

/**
 * A map of the names of events emitted by {@link Procedure Procedures} and their function signatures.
 * @template Input The type of input parameter passed to the data event.
 * @see {@link TypedEmitter}
 */
export type ProcedureEvents<Input extends Nullable = undefined> = {
    /**
     * Signature for the data event.
     * @param {Input} data The input parameter which was passed to the {@link Procedure}.
     */
    data: (data: Input) => void;
    /**
     * Signature for the error event.
     * @param {unknown} error The error data which was thrown by the {@link Procedure}.
     */
    error: (error: unknown) => void;
    /** Signature for the unbind event. */
    unbind: () => void;
}

/**
 * A simple interface representing a ping.
 * @internal
 * @remarks Intended for internal use; may not be exported in future.
 */
export interface Ping {
    ping: string;
}

/**
 * Type guard for determining whether a given {@link object} conforms to the {@link Ping} interface.
 * @param {unknown} object The object.
 * @returns {object is Ping} `true` if the {@link object} conforms to the {@link Ping} interface, otherwise `false`.
 * @internal
 * @remarks Intended for internal use; may not be exported in future.
 */
export function isPing(object: unknown): object is Ping {
    return typeof object === 'object' && object !== null && 'ping' in object && typeof (object as { ping: unknown }).ping === 'string';
}

/**
 * Asynchronously calls a {@link Procedure} at a given {@link endpoint} with given a {@link input}.
 * @param {string} endpoint The endpoint at which the {@link Procedure} is {@link Procedure.bind bound}.
 * @param {Nullable} [input] An input parameter to pass to the {@link Procedure}. Defaults to `undefined`.
 * @param {Partial<ProcedureCallOptions>} [options={}] Options for calling a {@link Procedure}. Defaults to `{}`.
 * @returns {Promise<Output>} A {@link Promise} which when resolved passes the output value to the {@link Promise.then then} handler(s).
 * @template Output The type of output value expected to be returned from the {@link Procedure}. Defaults to `unknown`.
 * @see {@link Procedure.endpoint}
 * @see {@link Procedure.ping}
 */
export async function call<Output extends Nullable = unknown>(endpoint: string, input?: Nullable, options: Partial<ProcedureCallOptions> = {}): Promise<Output> {
    try {
        const opts: ProcedureCallOptions = {
            ...{
                timeout: 1000,
                optionalParameterSupport: true,
                ignoreUndefinedProperties: true
            },
            ...options
        };

        if (opts.ping !== undefined) {
            await Procedure.ping(endpoint, opts.ping, opts.signal);
        }

        const response = await getResponse<Output>(endpoint, input, opts);

        if ('output' in response && !('error' in response)) {
            return response.output ?? <Output>(opts.optionalParameterSupport
                ? undefined
                : response.output);
        } else if (isProcedureError(response.error)) {
            throw response.error;
        } else {
            throw new ProcedureInvalidResponseError();
        }
    } catch (error) {
        throw isProcedureError(error)
            ? error
            : new ProcedureInternalClientError();
    }
}

/**
 * Asynchonously pings a {@link Procedure} at a given {@link endpoint} to check that it is available and ready to be {@link Procedure.call called}.
 * @param {string} endpoint The {@link Procedure.endpoint endpoint} to ping at which a {@link Procedure} is expected to be {@link Procedure.bind bound}.
 * @param {number} [timeout=1000] How long to wait for a response before timing out.
 * {@link NaN} or {@link Infinity infinite} values will result in the ping never timing out if no response is received, unless
 * {@link signal} is a valid {@link AbortSignal} and gets aborted.
 * Non-{@link NaN}, finite values will be clamped between `0` and {@link Number.MAX_SAFE_INTEGER} inclusive.
 * Defaults to `1000`.
 * @param {AbortSignal} [signal] An optional {@link AbortSignal} which, when passed, will be used to abort awaiting the ping.
 * Defaults to `undefined`.
 * @returns {Promise<void>} A {@link Promise} which when resolved indicates that the {@link endpoint} is available and ready to handle
 * {@link Procedure.call calls}.
 */
export async function ping(endpoint: string, timeout = 1000, signal?: AbortSignal): Promise<void> {
    try {
        const ping = uuidv5(endpoint, uuidNamespace);
        const response = await getResponse<{ pong: string }>(endpoint, { ping }, {
            timeout,
            signal,
            ignoreUndefinedProperties: false,
            optionalParameterSupport: false
        });

        if (response?.pong !== ping) {
            throw new ProcedureInvalidResponseError();
        }
    } catch (error) {
        throw isProcedureError(error)
            ? error
            : new ProcedureInternalClientError();
    }
}

/**
 * Asynchonously pings a {@link Procedure} at a given {@link endpoint} to check that it is available and ready to be {@link Procedure.call called}.
 * If any errors are thrown, absorbs them and returns `false`.
 * @param {string} endpoint The {@link Procedure.endpoint endpoint} to ping at which a {@link Procedure} is expected to be {@link Procedure.bind bound}.
 * @param {number} [timeout=1000] How long to wait for a response before timing out.
 * {@link NaN} or {@link Infinity infinite} values will result in the ping never timing out if no response is received, unless
 * {@link signal} is a valid {@link AbortSignal} and gets aborted.
 * Non-{@link NaN}, finite values will be clamped between `0` and {@link Number.MAX_SAFE_INTEGER} inclusive.
 * Defaults to `1000`.
 * @param {AbortSignal} [signal] An optional {@link AbortSignal} which, when passed, will be used to abort awaiting the ping.
 * Defaults to `undefined`.
 * @returns {Promise<void>} A {@link Promise} which when resolved indicated whether the {@link endpoint} is available and ready to handle
 * {@link Procedure.call calls}.
 * If errors were thrown, resolves to `false` instead of rejecting.
 */
export async function tryPing(endpoint: string, timeout = 1000, signal?: AbortSignal): Promise<boolean> {
    try {
        await ping(endpoint, timeout, signal);
        return true;
    } catch {
        return false;
    }
}


/**
 * Asynchronously encodes and transmits the given {@link input} to the {@link endpoint} and retrieves the response.
 * @param {string} endpoint The endpoint at which the {@link Procedure} is {@link Procedure.bind bound}.
 * @param {Nullable} input An input parameter to pass to the {@link Procedure}.
 * @param {ProcedureCallOptions} options Options for calling a {@link Procedure}.
 * @returns {Promise<Response<Output>>} A {@link Promise} which when resolved passes the {@link Response<Output> response} to the
 * {@link Promise.then then} handler(s).
 * @template Output The type of output value expected to be returned from the {@link Procedure}. Defaults to `unknown`.
 */
async function getResponse<Output extends Nullable = unknown>(endpoint: string, input: Nullable, options: ProcedureCallOptions): Promise<Response<Output>> {
    let socket: Socket | undefined;
    let timeoutSignal: TimeoutSignal | undefined = undefined;

    try {
        if (options.signal?.aborted) {
            throw new ProcedureCancelledError();
        }

        timeoutSignal = new TimeoutSignal(options.timeout);
        const signal = new AggregateSignal(options.signal, timeoutSignal.signal).signal;

        socket = createSocket('req');
        socket.connect(endpoint);
        socket.send(encode(input, options.extensionCodec, options.ignoreUndefinedProperties)); // send the encoded input data to the endpoint

        const [buffer]: [Buffer] = await once(socket, 'data', { signal }) as [Buffer]; // await buffered response
        return decode<Response<Output>>(buffer, options.extensionCodec); // decode response from buffer
    } catch (e) {
        if (isProcedureError(e)) {
            throw e;
        } else if (isError(e) && e.name === 'AbortError') {
            throw new ProcedureCancelledError();
        } else {
            throw new ProcedureInternalClientError();
        }
    } finally {
        clearTimeout(timeoutSignal?.timeout); // clear the TimeoutSignal's timeout, if any
        socket?.removeAllListeners().close(); // clear all listeners and close the socket
    }
}

/**
 * Encodes a given value for transmission.
 * @param {unknown} value The value to be encoded.
 * @param {ExtensionCodec} [extensionCodec] The {@link ExtensionCodec} to use for encoding.
 * @param {boolean} [ignoreUndefinedProperties=false] Whether to strip `undefined` properties from objects or not.
 * @returns {Buffer} A {@link Buffer} containing the encoded value.
 */
function encode(value: unknown, extensionCodec?: ExtensionCodec, ignoreUndefinedProperties = false): Buffer {
    const encoded = msgpackEncode(value, { extensionCodec, ignoreUndefined: ignoreUndefinedProperties });
    return Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
}

/**
 * Decodes a given {@link Buffer} and casts it as {@link T}.
 * @param {Buffer} buffer The {@link Buffer} to be decoded.
 * @param {ExtensionCodec} [extensionCodec] The {@link ExtensionCodec} to use for decoding.
 * @returns {T} The buffer, decoded and cast to type {@link T}.
 * @template T The type the decoded value should be cast to.
 */
function decode<T = unknown>(buffer: Buffer, extensionCodec?: ExtensionCodec): T {
    return msgpackDecode(buffer, { extensionCodec }) as T;
}
