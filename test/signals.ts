/// <reference types='node' />
import 'mocha';
import chai, { expect } from 'chai';
import spies from 'chai-spies';
import { AggregateSignal, TimeoutSignal } from '../src/signals';
import { Signal, isSignal } from '../src/utils';

chai.use(spies);

describe('AggregateSignal', () => {
    context('when no signals passed', () => {
        const instance = new AggregateSignal();
        describe('signal', () => it('should be: undefined', () =>
            expect(instance.signal).to.be.undefined));
    });

    context('when only undefined values are passed', () => {
        const instance = new AggregateSignal(undefined, undefined, undefined);
        describe('signal', () => it('should be: undefined', () =>
            expect(instance.signal).to.be.undefined));
    });

    context('when one valid AbortSignal is passed', () => {
        const ac = new AbortController();
        const instance = new AggregateSignal(ac.signal);

        describe('signal', () => {
            it('should be the valid AbortSignal', () =>
                expect(instance.signal).to.equal(ac.signal)
                    .and.to.not.be.undefined);

            it('should implement the EventTarget interface', () =>
                expect(isSignal(instance.signal)).to.be.true);

            it('should be aborted when the input AbortSignal aborts', () => {
                const abort = chai.spy(() => { return });
                (<unknown>(instance.signal) as Signal).addEventListener('abort', abort);
                ac.abort();
                expect(abort).to.have.been.called.exactly(1);
                expect(instance.signal?.aborted).to.be.true;
            });
        });
    });

    context('when multiple valid AbortSignals are passed', () => {
        const ac = new AbortController();
        const timeout = new TimeoutSignal(100);
        const instance = new AggregateSignal(undefined, ac.signal, undefined, timeout.signal, undefined);
        const abort = chai.spy(() => { return });
        (<unknown>(instance.signal) as Signal).addEventListener('abort', abort);

        describe('signal', () => {
            it('should not equal either of the original AbortSignals', () =>
                expect(instance.signal).to.not.equal(ac.signal)
                    .and.to.not.equal(timeout.signal)
                    .and.to.not.be.undefined);

            it('should implement the EventTarget interface', () =>
                expect(isSignal(instance.signal)).to.be.true);

            it('should be aborted when either AbortSignals abort', () => {
                expect(abort).to.have.been.called.exactly(1);
                expect(instance.signal?.aborted).to.be.true;
            });
        });
    });

    context('when multiple valid AbortSignals are passed, but one of them is already aborted', () => {
        const ac = new AbortController();
        ac.abort();
        const timeout = new TimeoutSignal(100);
        const instance = new AggregateSignal(undefined, ac.signal, undefined, timeout.signal, undefined);
        const abort = chai.spy(() => { return });
        (<unknown>(instance.signal) as Signal).addEventListener('abort', abort);

        describe('signal', () => {
            it('should equal the already aborted AbortSignal', () =>
                expect(instance.signal).to.equal(ac.signal)
                    .and.to.not.equal(timeout.signal)
                    .and.to.not.be.undefined);

            it('should implement the EventTarget interface', () =>
                expect(isSignal(instance.signal)).to.be.true);

            it('should immediately register as aborted', () => {
                expect(abort).to.have.been.called.exactly(0);
                expect(instance.signal?.aborted).to.be.true;
            });
        });
    });
});

describe('TimeoutSignal', () => {
    context('when timeout: undefined', () => {
        const instance = new TimeoutSignal();
        describe('signal', () => it('should be: undefined', () => expect(instance.signal).to.be.undefined));
        describe('timeout', () => it('should be: undefined', () => expect(instance.timeout).to.be.undefined));
    });

    context('when timeout: NaN', () => {
        const instance = new TimeoutSignal(NaN);
        describe('signal', () => it('should be: undefined', () => expect(instance.signal).to.be.undefined));
        describe('timeout', () => it('should be: undefined', () => expect(instance.timeout).to.be.undefined));
    });

    context('when timeout: Infinity', () => {
        const instance = new TimeoutSignal(Infinity);
        describe('signal', () => it('should be: undefined', () => expect(instance.signal).to.be.undefined));
        describe('timeout', () => it('should be: undefined', () => expect(instance.timeout).to.be.undefined));
    });

    context('when timeout: < 0', () => {
        const instance = new TimeoutSignal(-1);
        describe('signal', () => it('should not be: undefined', () => expect(instance.signal).to.not.be.undefined));
        describe('timeout', () => it('should not be: undefined', () => expect(instance.timeout).to.not.be.undefined));
    });

    context('when timeout: 1000', () => {
        const instance = new TimeoutSignal(1000);
        describe('signal', () => it('should not be: undefined', () => expect(instance.signal).to.not.be.undefined));
        describe('timeout', () => it('should not be: undefined', () => expect(instance.timeout).to.not.be.undefined));
    });
});