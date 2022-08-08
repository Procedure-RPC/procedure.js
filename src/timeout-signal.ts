/**
 * A helper class to create an AbortSignal based on a timeout.
 */
export default class TimeoutSignal {
    /** The underlying AbortSignal. */
    public readonly signal?: AbortSignal;
    /** If defined, the ID of a timeout which will signal abortion. */
    public readonly timeout?: ReturnType<typeof setTimeout>;

    /**
     * Initializes a new TimeoutSignal.
     * @param {number} [timeout] Constructs an AbortController and sets a timeout which will call the AbortController's `abort`
     * method after the given number of milliseconds, exposing its signal via the `signal` property.
     * Undefined, infinite or NaN values will result in the `signal` property being `undefined`.
     * Finite values will be clamped between `0` and `Number.MAX_SAFE_INTEGER` inclusive.
     */
    constructor(timeout?: number) {
        if (timeout !== undefined && isFinite(timeout) && !isNaN(timeout)) {
            timeout = Math.min(Math.max(timeout, 0), Number.MAX_SAFE_INTEGER); // clamp the timeout to a sensible range

            const ac = new AbortController();
            this.signal = ac.signal; // wrap the AbortController's signal
            this.timeout = setTimeout(() => ac.abort(), timeout); // abort after the given number of milliseconds
        }
    }
}
