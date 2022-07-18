/**
 * A helper class to either wrap a given AbortSignal or obtain one which will signal when a timeout is called.
 */
export default class TimeoutSignal {
    /** The underlying AbortSignal. */
    public readonly signal?: AbortSignal;
    /** If defined, the ID of a timeout which will signal abortion. */
    public readonly timeout?: ReturnType<typeof setTimeout>;

    /**
     * Initializes a new TimeoutSignal.
     * @param {number} [timeout] When a non-NaN, finite and >=0 number is passed, constructs an AbortController and sets a
     * timeout which will call the AbortController's `abort` method after the given number of milliseconds and wraps its signal.
     */
    constructor(timeout?: number) {
        if (timeout !== undefined && !isNaN(timeout) && isFinite(timeout) && timeout >= 0) { // number is not-NaN, finite and positive
            const ac = new AbortController();
            this.signal = ac.signal; // wrap the AbortController's signal
            this.timeout = setTimeout(() => ac.abort(), timeout); // abort after the given number of milliseconds
        }
    }
}
