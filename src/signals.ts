import { isSignal } from './utils';

/**
 * A helper class to create an {@link AbortSignal} which aborts as soon as any of the signals passed to its constructor do.
 */
export class AggregateSignal {
    /** The aggregate {@link AbortSignal}. */
    public readonly signal?: AbortSignal;

    /**
     * Initializes a new {@link AggregateSignal}.
     * @param {(AbortSignal | undefined)[]} abortSignals The {@link AbortSignal AbortSignals} to aggregate.
     */
    constructor(...abortSignals: (AbortSignal | undefined)[]) {
        const signals = abortSignals.filter(isSignal);

        if (signals.length === 1) {
            this.signal = signals[0];
        } else if (signals.filter(s => s.aborted).length > 0) {
            this.signal = signals.filter(s => s.aborted)[0];
        } else if (signals.length > 1) {
            const ac = new AbortController();
            this.signal = ac.signal;

            for (const signal of signals) {
                signal.addEventListener('abort', () => {
                    for (const signal of signals) {
                        signal.removeEventListener('abort');
                    }

                    ac.abort();
                });
            }
        }
    }
}

/**
 * A helper class to create an {@link AbortSignal} based on a timeout.
 */
export class TimeoutSignal {
    /** The underlying {@link AbortSignal}. */
    public readonly signal?: AbortSignal;
    /** If defined, the ID of a timeout which will signal abortion. */
    public readonly timeout?: ReturnType<typeof setTimeout>;

    /**
     * Initializes a new {@link TimeoutSignal}.
     * @param {number} [timeout] The number of milliseconds after which the {@link signal} should be aborted.
     * `undefined`, {@link Infinity infinite} or {@link NaN} values will result in {@link signal} being `undefined`.
     * Finite values will be clamped between `0` and {@link Number.MAX_SAFE_INTEGER} inclusive.
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
