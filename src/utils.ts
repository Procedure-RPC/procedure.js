/**
 * Type guard for determining whether a given object is an `Error`.
 * @param object The object.
 * @returns `true` if the object is determined to be an `Error`, otherwise `false`.
 */
export function isError(object: unknown): object is Error {
    return object instanceof Error;
}

/**
 * Type guard for determining whether a given object is `Error`-like, i.e. it matches the most basic `Error` interface.
 * @param object The object.
 * @returns `true` if the object is determined to fit the shape of an `Error`, otherwise `false`.
 */
export function isErrorLike(object: unknown): object is Error {
    return typeof object === 'object' && object !== null && (isError(object) || 'name' in object);
}

/**
 * A utility function for retrieving the properties of a given `Error` instance in `Object.entries` format.
 * @param {Error} error The error.
 * @param {boolean} [stack=false] Whether or not we should retrieve the `stack` property, if defined. Defaults to `false`.
 * @returns An array of key-value pairs.
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
 * @returns The cloned `Error`.
 */
export function cloneError(error: Error, stack = false): Error {
    if (isErrorLike(error)) {
        return Object.fromEntries(errorEntries(error, stack)) as Error;
    } else {
        throw new TypeError('error does not match interface for type Error');
    }
}
