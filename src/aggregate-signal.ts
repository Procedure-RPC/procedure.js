import { isSignal } from './utils';

/**
 * A helper class to create an AbortSignal which aborts as soon as any of the signals passed to its constructor do.
 */
export default class AggregateSignal {
    /** The aggregate AbortSignal. */
    public readonly signal?: AbortSignal;

    /**
     * Initializes a new AggregateSignal.
     * @param {(AbortSignal | undefined)[]} abortSignals The AbortSignals to aggregate.
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
