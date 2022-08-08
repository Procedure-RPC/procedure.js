// TODO: add and test ipv6 support
// TODO: rework error handling to throw a generic error with status code, and optionally an object containing an error message and relevant data - look at grpc for examples

/// <reference types='node' />
import { Ping, isPing, isErrorLike, cloneError } from './utils';
import AggregateSignal from './aggregate-signal';
import TimeoutSignal from './timeout-signal'
import { createSocket, Socket } from 'nanomsg';
import { encode, decode, ExtensionCodec } from '@msgpack/msgpack'
import { once, EventEmitter } from 'events'
import TypedEmitter from 'typed-emitter'
import { v5 as uuidv5 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const homepage: string = require('../package.json').funding;
const uuidNamespace = uuidv5(homepage, uuidv5.URL);

/**
 * A simple abstraction of a procedure (the P in RPC).
 * Allows you to turn any generic function or callback into a procedure, which can be called via the transport specified.
 * Includes the functionality to ping procedures to check whether they are available.
 */
export default class Procedure<Input extends Nullable = undefined, Output extends Nullable = undefined> extends (EventEmitter as { new <Input>(): TypedEmitter<ProcedureEvents<Input>> })<Input> implements ProcedureDefinitionOptions {
    [key: keyof ProcedureDefinitionOptions]: ProcedureDefinitionOptions[keyof ProcedureDefinitionOptions];

    #endpoint?: string;
    /** The endpoint at which the procedure, when bound, can be called. */
    get endpoint() { return this.#endpoint; }
    protected set endpoint(value) { this.#endpoint = value; }

    /** The options in use by the procedure, including defaults. */
    protected options: ProcedureDefinitionOptions;
    /** The underlying nanomsg socket used for data transmission. */
    protected sockets: Socket[] = [];

    #uuid?: string;
    /** A v5 uuid generated for this endpoint, used for checking whether a Procedure is available and ready to respond to requests. */
    protected get uuid() { return this.#uuid; }
    protected set uuid(value) { this.#uuid = value; }

    get verbose() { return this.options.verbose; }
    set verbose(value) { this.options.verbose = value; }

    get workers() { return this.options.workers; }
    protected set workers(value) {
        this.options.workers = !isNaN(value) && isFinite(value)
            ? Math.min(Math.max(value, 1), Number.MAX_SAFE_INTEGER)
            : 1;
    }

    get extensionCodec() { return this.options.extensionCodec; }
    protected set extensionCodec(value) { this.options.extensionCodec = value; }

    get optionalParameterSupport() { return this.options.optionalParameterSupport; }
    protected set optionalParameterSupport(value) { this.options.optionalParameterSupport = value; }

    get stripUndefinedProperties() { return this.options.stripUndefinedProperties; }
    protected set stripUndefinedProperties(value) { this.options.stripUndefinedProperties = value; }

    /**
     * Initializes a new Procedure at the given endpoint.
     * @param {Callback<Input, Output>} callback The callback function powering the procedure itself. The callback may be asynchronous.
     * @param {Partial<ProcedureDefinitionOptions>} [options={}] An options bag defining how the procedure should be run. Defaults to `{}`.
     */
    constructor(protected callback: Callback<Input, Output>, options: Partial<ProcedureDefinitionOptions> = {}) {
        super();
        this.options = {
            ...{
                verbose: false,
                workers: 1,
                optionalParameterSupport: true,
                stripUndefinedProperties: true
            },
            ...options
        };
        this.workers = this.options.workers; // explicitly run setter logic
    }
    
    /**
     * Binds the procedure to its endpoint, making it available to be called.
     * Does nothiung if the procedure has not previously been bound to an endpoint.
     * @param {string} [endpoint=undefined] The endpoint at which the procedure will be callable. When `undefined`, uses the previously set endpoint.
     * @returns {this} The bound Procedure for chaining convenience.
     */
    bind(endpoint?: string): this {
        this.unbind();
        this.endpoint = endpoint ?? this.endpoint;

        if (typeof this.endpoint === 'string') {
            this.uuid = uuidv5(this.endpoint, uuidNamespace);
            for (let i = 0; i < this.workers; i++) {
                const socket = this.sockets[this.sockets.push(createSocket('rep')) - 1];
                socket
                    .on('data', (data: Buffer) => this.#onRepSocketData(data, socket))
                    .on('error', (error: unknown) => this.#onRepSocketError(error))
                    .once('close', () => this.#onRepSocketClose())
                    .bind(this.endpoint); // bind the socket to the endpoint
            }
        }

        return this;
    }

    /**
     * Releases the procedure from its endpoint.
     * @returns {this} The unbound Procedure for chaining convenience.
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
     * Asynchronously calls a Procedure at a given endpoint with given a input.
     * @param {string} endpoint The endpoint at which the Procedure is bound.
     * @param {Input} [input] The input value for the procedure. Pass `null` to indicate no input value. Defaults to `null`.
     * @param {ProcedureCallOptions} [options={}] An options bag defining how the Procedure should be called. Defaults to `{}`.
     * @returns {Promise<Output>} A promise which when resolved passes the output value to the promise's `then` handler(s).
     */
    static async call<Output extends Nullable = undefined>(endpoint: string, input?: Nullable, options: Partial<ProcedureCallOptions> = {}): Promise<Output> {
        const socket = createSocket('req');
        const opts: ProcedureCallOptions = {
            ...{
                timeout: 1000,
                ping: false,
                optionalParameterSupport: true,
                stripUndefinedProperties: true
            },
            ...options
        };

        const timeoutSignal = new TimeoutSignal(opts.timeout);
        const signal = new AggregateSignal(timeoutSignal.signal, opts.signal).signal;

        if (signal?.aborted) {
            throw new Error('signal was aborted');
        } else {
            try {
                if (opts.ping && !await Procedure.ping(endpoint, opts.ping, signal)) {
                    throw new Error(`ping returned false at endpoint: ${endpoint}`);
                }

                socket.connect(endpoint);
                socket.send(Procedure.#encode(input, opts.extensionCodec, opts.stripUndefinedProperties)); // send the encoded input data to the endpoint

                const [buffer]: [Buffer] = await once(socket, 'data', { signal }) as [Buffer]; // await a response from the endpoint
                const response = Procedure.#decode<Response<Output>>(buffer, opts.extensionCodec); // decode the response
                if ('error' in response) {
                    throw response.error;
                } else if ('output' in response) {
                    return response.output
                        ?? <Output>(opts.optionalParameterSupport
                            ? undefined
                            : response.output);
                } else {
                    throw new RangeError(`Response is not of valid shape: ${JSON.stringify(response)}`);
                }
            } finally {
                socket.removeAllListeners().close(); // clear all listeners and close the socket
                clearTimeout(timeoutSignal?.timeout); // clear the TimeoutSignal's timeout, if any
            }
        }
    }

    /**
     * Asynchonously pings a Procedure at a given endpoint to check that it is ready to respond to requests.
     * @param {string} endpoint The endpoint to ping at which a Procedure is expected to be bound.
     * @param {number | undefined} [timeout=100] How long to wait for a response before timing out.
     * NaN, undefined or infinite values will result in the ping never timing out if no response is received, unless
     * `signal` is a valid `AbortSignal` and gets aborted.
     * Non-NaN, finite values will be clamped between `0` and `Number.MAX_SAFE_INTEGER` inclusive.
     * Defaults to `100`.
     * @param {AbortSignal | undefined} [signal=undefined] An optional AbortSignal which, when passed, will be used to abort awaiting the ping.
     * Defaults to `undefined`.
     * @returns {Promise<boolean>} A promise which, when resolved, indicates whether the endpoint correctly responded to the ping.
     */
    static async ping(endpoint: string, timeout: number | undefined = 100, signal?: AbortSignal): Promise<boolean> {
        if (signal?.aborted) {
            throw new Error('signal was aborted');
        } else {
            const socket = createSocket('req');
            const timeoutSignal = new TimeoutSignal(timeout);
            signal = new AggregateSignal(signal, timeoutSignal.signal).signal;

            try {
                const ping = uuidv5(endpoint, uuidNamespace);

                socket.connect(endpoint);
                socket.send(Procedure.#encode({ ping }));
                const [buffer]: [Buffer] = await once(socket, 'data', { signal }) as [Buffer];
                const response = Procedure.#decode<Response<unknown>>(buffer);

                if ('pong' in response) {
                    return response.pong === uuidv5(endpoint, ping);
                } else if ('error' in response) {
                    throw response.error;
                } else {
                    throw response;
                }
            } finally {
                socket.removeAllListeners().close();
                clearTimeout(timeoutSignal.timeout);
            }
        }
    }

    /**
     * Encodes a given value for transmission via nanomsg.
     * @param {unknown} value The value to be encoded.
     * @param {ExtensionCodec} [extensionCodec] The extension codec to use.
     * @param {boolean} [ignoreUndefined=false] Whether to strip `undefined` values from objects or not.
     * @returns {Buffer} A buffer containing the encoded value.
     */
    static #encode(value: unknown, extensionCodec?: ExtensionCodec, ignoreUndefined = false): Buffer {
        const encoded = encode(value, { extensionCodec, ignoreUndefined });
        return Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
    }

    /**
     * Decodes a given nanomsg data buffer.
     * @param {Buffer} buffer The buffer to be decoded.
     * @param {ExtensionCodec} [extensionCodec] The extension codec to use.
     * @returns {T} The buffer, decoded into an object.
     */
    static #decode<T = unknown>(buffer: Buffer, extensionCodec?: ExtensionCodec): T {
        return decode(buffer, { extensionCodec }) as T;
    }

    /**
     * Attempts to decode the given buffer into a usable input value for the Procedure.
     * @param {Buffer} buffer The buffer to decode.
     * @returns {{ input: Input, error?: never } | { input?: never, error: unknown }} If successful, an object of shape `{ input: Input }`, otherwise `{ error: unknown }`.
     */
    #tryDecodeInput(buffer: Buffer): { input: Input | Ping, error?: never } | { input?: never, error: unknown } {
        try {
            return { input: Procedure.#decode<Input | Ping>(buffer, this.extensionCodec) };
        } catch (error) {
            this.#emitAndLogError('Procedure input data could not be decoded', error);
            return { error };
        }
    }

    /**
     * Attempts to asynchronously call the Procedure's callback and return a response containing its output value.
     * @param {Input} input The input value for the callback.
     * @returns {Promise<Response<Output>>} A promise which when resolved passes the response to the promise's `then` handler.
     */
    async #tryGetCallbackResponse(input: Input): Promise<Response<Output>> {
        try {
            return {
                output: await this.callback(input
                    ?? <Input>(this.optionalParameterSupport
                        ? undefined
                        : input))
            };
        } catch (error) {
            this.#emitAndLogError('Procedure encountered an error while executing callback', error);
            return { error };
        }
    }

    /**
     * Attempts to encode the given response for transmission back to the Procedure's caller.
     * @param {Response<Output>} response The response to encode.
     * @returns {Buffer} A buffer containing the encoded response.
     */
    #tryEncodeResponse(response: Response<Output>): Buffer {
        try {
            if (isErrorLike(response.error)) { // clone the error so that it can be encoded for transmission
                response.error = cloneError(response.error);
            }
            return Procedure.#encode(response, this.extensionCodec, this.stripUndefinedProperties);
        } catch (error) {
            this.#emitAndLogError('Procedure response could not be encoded for transmission', error);
            return this.#tryEncodeResponse({ // As the response could not be encoded, encode and return a new response containing the thrown error
                error: 'output' in response
                    ? error // output failed to encode
                    : null // error failed to encode, should break any infinite loops unless msgpack or the extension codec is broken
            });
        }
    }

    /**
     * Attempts to send the encoded buffer back to the Procedure's caller.
     * @param {Buffer} buffer A buffer containing the encoded response.
     * @param {Socket} socket The socket to send the response on.
     * @returns {boolean} `true` when the encoded buffer was successfully sent, otherwise false.
     */
    #trySendBuffer(buffer: Buffer, socket: Socket): boolean {
        try {
            socket.send(buffer);
            return true;
        } catch (error) {
            this.#emitAndLogError('Procedure response could not be sent', error);
            return false;
        }
    }

    /**
     * Asynchrously handles the socket's data event, representing requests to call the Procedure.
     * @param {Buffer} data The encoded input buffer.
     * @param {Socket} socket The socket the data was received on.
     */
    async #onRepSocketData(data: Buffer, socket: Socket): Promise<void> {
        const decoded = this.#tryDecodeInput(data);

        if (this.#tryHandlePing(decoded.input, socket)) { // input was a ping of valid uuid & pong was successfully sent
            if (this.verbose) {
                console.log(`PONG sent at endpoint ${this.endpoint}`);
            }
        } else {
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
     * Handles ping requests for a given socket
     * @param {unknown} object The decoded incoming data object.
     * @param {Socket} socket The socket the data was received on.
     * @returns {boolean} `true` when the decoded data object was a valid `Ping` and a `Pong` was successfully sent back, otherwise `false`.
     */
    #tryHandlePing(object: unknown, socket: Socket): boolean {
        if (isPing(object) && object.ping === this.uuid) {
            if (this.verbose) {
                console.log(`PING received at endpoint: ${this.endpoint}`);
            }
            return this.#trySendBuffer(this.#tryEncodeResponse({ pong: uuidv5(<string>this.endpoint, object.ping) }), socket);
        } else {
            return false;
        }
    }

    /**
     * Handles the socket's error event.
     * @param {unknown} error The error data passed by the socket.
     */
    #onRepSocketError(error: unknown): void {
        this.#emitAndLogError('Socket encountered an error', error);
    }

    /**
     * Handles the socket's close event.
     */
    #onRepSocketClose(): void {
        this.#logSocketClose();
        if (this.sockets.every(socket => socket.closed)) {
            this.unbind();
            this.#emitAndLogUnbind(); // emit the unbind event
        }
    }

    /**
     * Emits and optionally logs input data.
     * @param {Input} data The input data to emit and log.
     */
    #emitAndLogData(data: Input) {
        this.emit('data', data);

        if (this.verbose) {
            console.log(`Received input data at endpoint: ${this.endpoint}`, data);
        }
    }

    /**
     * Handles the unbind event.
     */
    #emitAndLogUnbind() {
        this.emit('unbind');

        if (this.verbose) {
            console.log(`Procedure unbound at endpoint: ${this.endpoint}`);
        }
    }

    /**
     * Emits and optionally logs the given error, wrapping it in a new Error with a custom error message.
     * @param {string} message A custom error message describing the cause of the original error. The message will be concatenated with the Procedure's endpoint.
     * @param {unknown} [error] The error.
     */
    #emitAndLogError(message: string, error?: unknown) {
        message = message.concat(` at endpoint: ${this.endpoint}`); // concatenate the Procedure's endpoint to the custom error message.

        const e: Error & { cause?: unknown } = new Error(message);
        e.cause = error; // wrap the original error in the new, custom error

        if (this.listenerCount('error') > 0) { // only emit if there are listeners to prevent unhandled error exceptions
            this.emit('error', e);
        }

        if (this.verbose) { // optionally output the error to the console
            if (error !== undefined) {
                console.error(`${message}\r\n`, error);
            } else {
                console.error(message);
            }
        }
    }

    /**
     * Optionally logs the socket close event.
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
 * Represents a simple callback function with a single nullable input value and likewise nullable output value.
 */
export type Callback<Input extends Nullable = undefined, Output extends Nullable = undefined> = (input: Input) => Output;

/**
 * A response from a procedure call. If the call returned successfully, the response will be of shape `{ output: Output }`, otherwise `{ error: unknown }`.
 */
export type Response<Output extends Nullable = undefined>
    = { output: Output, error?: never, pong?: never }
    | { output?: never, error: unknown, pong?: never }
    | { output?: never, error?: never, pong: string };

export interface ProcedureCommonOptions {
    optionalParameterSupport: boolean;
    stripUndefinedProperties: boolean;
}

/**
 * Options for defining a Procedure.
 */
export interface ProcedureDefinitionOptions extends ProcedureCommonOptions {
    [key: string]: unknown;
    /** The number of socket workers to spin up for the Procedure. Useful for Procedures which may take a long time to complete.
     * Will be clamped between `1` and `Number.MAX_SAFE_INTEGER` inclusive.
     * Defaults to `1`. */
    workers: number;
    /** A boolean indicating whether to output errors and events to the console. Defaults to `false`. */
    verbose: boolean;
    /** The msgpack `ExtensionCodec` to use for encoding and decoding messages. Defaults to `undefined`. */
    extensionCodec?: ExtensionCodec | undefined;
}

/**
 * Options for calling a Procedure.
 */
export interface ProcedureCallOptions extends ProcedureCommonOptions {
    /** The number of milliseconds after which the Procedure call will automatically be aborted.
     * Set to `Infinity` or `NaN` to never timeout.
     * Non-NaN, finite values will be clamped between `0` and `Number.MAX_SAFE_INTEGER` inclusive.
     * Defaults to `1000`. */
    timeout: number;
    /** The number of millisceonds to wait for a ping-pong from the endpoint before calling the remote procedure.
     * Set to `false` to skip pinging the endpoint.
     * Defaults to `false`. */
    ping: number | false;
    /** An optional msgpack `ExtensionCodec` to use for encoding and decoding messages.
     * Defaults to `undefined`. */
    extensionCodec?: ExtensionCodec | undefined;
    /** An optional `AbortSignal` which will be used to abort the Procedure call.
     * Defaults to `undefined`. */
    signal?: AbortSignal | undefined;
}

/**
 * A map of the names of events emitted by Procedures and their function signatures.
 */
type ProcedureEvents<Input extends Nullable = undefined> = {
    data: (data: Input) => void;
    error: (error: unknown) => void;
    unbind: () => void;
}
