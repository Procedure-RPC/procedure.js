/**
 * Type guard for determining whether a given object is an {@link AbortSignal} instance.
 * @param {unknown} object The object.
 * @returns {object is AbortSignal} `true` if {@link object} is determined to be an {@link AbortSignal}, otherwise `false`.
 */
export function isAbortSignal(object: unknown): object is AbortSignal {
    return object instanceof AbortSignal;
}

/**
 * A helpful interface to allow use of {@link AbortSignal AbortSignal's} {@link EventTarget} interface when TypeScript hates us.
 */
export interface Signal {
    addEventListener: (event: 'abort', callback: () => void) => void;
    removeEventListener: (event: 'abort') => void;
    readonly aborted: boolean;
}

/**
 * Type guard for determining whether a given object conforms to the {@link Signal} interface.
 * @param {unknown} object The object.
 * @returns {object is Signal} `true` if {@link object} conforms to the {@link Signal} interface, otherwise `false`.
 */
export function isSignal(object: unknown): object is Signal {
    return isAbortSignal(object) && 'addEventListener' in object && 'removeEventListener' in object
        && typeof (<Signal>object).addEventListener === 'function' && typeof (<Signal>object).removeEventListener === 'function';
}

/**
 * A simple interface representing a ping.
 * @internal
 */
export interface Ping {
    ping: string;
}

/**
 * Type guard for determining whether a given object conforms to the `Ping` interface.
 * @param {unknown} object The object.
 * @returns {object is Ping} `true` if the object conforms to the `Ping` interface, otherwise `false`.
 */
export function isPing(object: unknown): object is Ping {
    return typeof object === 'object' && object !== null && 'ping' in object && typeof (object as { ping: unknown }).ping === 'string';
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

/**
 * A utility function for retrieving the properties of a given `Error` instance in `Object.entries` format.
 * @param {Error} error The error.
 * @param {boolean} [stack=false] Whether or not we should retrieve the `stack` property, if defined. Defaults to `false`.
 * @returns {Array<unknown[]>} An array of key-value pairs.
 */
export function errorEntries(error: Error, stack = false): Array<unknown[]> {
    return [
        ["name", error.name],
        ...Object.entries(Object.getOwnPropertyDescriptors(error))
            .filter(x => stack || x[0] !== 'stack')
            .map(x => { x[1] = isErrorLike(x[1].value) ? cloneError(x[1].value, stack) : x[1].value; return x; })
    ];
}

/**
 * A utility function for cloning `Error` instances.
 * @param {Error} error The `Error` to clone.
 * @param {boolean} [stack=false] Whether or not we should clone the `stack` property, if defined. Defaults to `false`.
 * @returns {Error} The cloned `Error`.
 */
export function cloneError(error: Error, stack = false): Error {
    if (isErrorLike(error)) {
        return Object.fromEntries(errorEntries(error, stack)) as Error;
    } else {
        throw new TypeError('error does not match interface for type Error');
    }
}