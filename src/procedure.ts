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
 * Allows you to turn any generic function or callback into a procedure, which remote or local processes can call.
 * Includes the functionality to ping procedures to check whether they are available.
 */
export default class Procedure<Input extends Nullable = null, Output extends Nullable = null> extends (EventEmitter as { new <Input>(): TypedEmitter<ProcedureEvents<Input>> })<Input> implements ProcedureOptions {
    [key: keyof ProcedureOptions]: ProcedureOptions[keyof ProcedureOptions];

    /** The options in use by the procedure, including defaults. */
    protected options: ProcedureOptions;
    /** The underlying nanomsg socket used for data transmission. */
    protected sockets: Socket[] = [];

    /** A v5 uuid generated for this endpoint, used for checking whether a Procedure is available and ready to respond to requests. */
    protected readonly uuid: string;

    get verbose() { return this.options.verbose; }
    set verbose(value) { this.options.verbose = value; }

    get workers() { return this.options.workers; }
    protected set workers(value) {
        this.options.workers = !isNaN(value) && isFinite(value)
            ? Math.max(value, 1)
            : 1;
    }

    get extensionCodec() { return this.options.extensionCodec; }
    protected set extensionCodec(value) { this.options.extensionCodec = value; }

    /**
     * Initializes a new Procedure at the given endpoint.
     * @param {string} endpoint The endpoint at which the procedure will be callable. It is your task to ensure endpoints are unique per procedure.
     * @param {Callback<Input, Output>} callback The callback function powering the procedure itself. The callback may be asynchronous.
     * @param {Partial<ProcedureOptions>} [options={}] An options bag defining how the procedure should be run. Defaults to `{}`.
     */
    constructor(public readonly endpoint: string, protected callback: Callback<Input, Output>, options: Partial<ProcedureOptions> = {}) {
        super();
        this.options = {
            ...{
                verbose: false,
                workers: 1
            },
            ...options
        };

        this.uuid = uuidv5(endpoint, uuidNamespace);

        for (const prop in this.options) {
            this[prop] = this.options[prop];
        }
    }

    /**
     * Binds the procedure to its endpoint, making it available to be called.
     * @returns {this} The bound Procedure for chaining convenience.
     */
    bind(): this {
        this.unbind();
        for (let i = 0; i < this.workers; i++) {
            const socket = this.sockets[this.sockets.push(createSocket('rep')) - 1];
            socket
                .on('data', (data: Buffer) => this.#onRepSocketData(data, socket))
                .on('error', (error: unknown) => this.#onRepSocketError(error))
                .once('close', () => this.#onRepSocketClose())
                .bind(this.endpoint); // bind the socket to the endpoint
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
     * @param {Input | null} [input=null] The input value for the procedure. Pass `null` to indicate no input value. Defaults to `null`.
     * @param {ProcedureCallOptions} [options={}] An options bag defining how the Procedure should be called. Defaults to `{}`.
     * @returns {Promise<Output>} A promise which when resolved passes the output value to the promise's `then` handler(s).
     */
    static async call<Input extends Nullable = null, Output extends Nullable = null>(endpoint: string, input: Input | null = null, options: Partial<ProcedureCallOptions> = {}): Promise<Output> {
        const socket = createSocket('req');
        const opts: ProcedureCallOptions = {
            ...{ timeout: 1000, ping: false },
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
                socket.send(Procedure.#encode(input, opts.extensionCodec)); // send the encoded input data to the endpoint

                const [buffer]: [Buffer] = await once(socket, 'data', { signal }) as [Buffer]; // await a response from the endpoint
                const response = Procedure.#decode<Response<Output>>(buffer, opts.extensionCodec); // decode the response
                if ('error' in response) {
                    throw response.error;
                } else if (response.output !== undefined) {
                    return response.output;
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
     * Non-NaN, finite values will be clamped to between `0` and `Number.MAX_SAFE_INTEGER`.
     * Defaults to `100`.
     * @param {AbortSignal | undefined} [signal=undefined] An optional AbortSignal which, when passed, will be used to abort awaiting the ping.
     * Defaults to `undefined`.
     * @returns {Promise<boolean>} A promise which, when resolved, indicates whether the endpoint correctly responded to the ping.
     */
    static async ping(endpoint: string, timeout: number | undefined = 100, signal?: AbortSignal): Promise<boolean> {
        const socket = createSocket('req');

        const timeoutSignal = new TimeoutSignal(timeout);
        signal = new AggregateSignal(signal, timeoutSignal.signal).signal;

        if (signal?.aborted) {
            throw new Error('signal was aborted');
        } else {
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
     * @returns {Buffer} A buffer containing the encoded value.
     */
    static #encode(value: unknown, extensionCodec?: ExtensionCodec): Buffer {
        const encoded = encode(value, { extensionCodec });
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
            return { output: await this.callback(input) };
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
            return Procedure.#encode(response, this.extensionCodec);
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
        const { input, error } = this.#tryDecodeInput(data);

        if (this.#tryHandlePing(input, socket)) { // input was a ping of valid uuid & pong was successfully sent
            if (this.verbose) {
                console.log(`PONG sent at endpoint ${this.endpoint}`);
            }
        } else {
            if (input !== undefined) {
                this.#emitAndLogData(input as Input);
            }

            const response = input !== undefined
                ? await this.#tryGetCallbackResponse(input as Input)
                : { error };

            if (response.output !== undefined && this.verbose) {
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
            return this.#trySendBuffer(this.#tryEncodeResponse({ pong: uuidv5(this.endpoint, object.ping) }), socket);
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
        //TODO: Write unit tests
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
     * @param {unknown} [error=undefined] The error.
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
 * Represents a nullable value, which cannot be `undefined`.
 */
export type Nullable = unknown | null;

/**
 * Represents a simple callback function with a single nullable input value and likewise nullable output value.
 */
export type Callback<Input extends Nullable = null, Output extends Nullable = null> = (input: Input) => Output;

/**
 * A response from a procedure call. If the call returned successfully, the response will be of shape `{ output: Output }`, otherwise `{ error: unknown }`.
 */
export type Response<Output extends Nullable = null>
    = { output: Output, error?: never, pong?: never }
    | { output?: never, error: unknown, pong?: never }
    | { output?: never, error?: never, pong: string };

/**
 * Options for defining a Procedure.
 */
export interface ProcedureOptions {
    [key: string]: unknown;
    /** The number of socket workers to spin up for the Procedure. Useful for Procedures which may take a long time to complete. Defaults to `1`. */
    workers: number;
    /** A boolean indicating whether to output errors and events to the console. Defaults to `false`. */
    verbose: boolean;
    /** The msgpack `ExtensionCodec` to use for encoding and decoding messages. Defaults to `undefined`. */
    extensionCodec?: ExtensionCodec;
}

/**
 * Options for calling a Procedure.
 */
export interface ProcedureCallOptions {
    /** The number of milliseconds after which the Procedure call will automatically be aborted.
     * Set to `Infinity` or `NaN` to never timeout.
     * Non-NaN, finite values will be clamped between `0` and `Number.MAX_SAFE_INTEGER`.
     * Defaults to `1000`. */
    timeout: number;
    /** The number of millisceonds to wait for a ping-pong from the endpoint before calling the remote procedure.
     * Set to `false` to skip pinging the endpoint.
     * Defaults to `false`. */
    ping: number | false;
    /** An optional msgpack `ExtensionCodec` to use for encoding and decoding messages.
     * Defaults to `undefined`. */
    extensionCodec?: ExtensionCodec;
    /** An optional `AbortSignal` which will be used to abort the Procedure call.
     * Defaults to `undefined`. */
    signal?: AbortSignal;
}

/**
 * A map of the names of events emitted by Procedures and their function signatures.
 */
type ProcedureEvents<Input extends Nullable = null> = {
    data: (data: Input) => void;
    error: (error: unknown) => void;
    unbind: () => void;
}
