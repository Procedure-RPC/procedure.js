import 'mocha';
import { expect } from 'chai';
import TimeoutSignal from '../src/timeout-signal';

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
