import 'mocha';
import { expect } from 'chai';
import TimeoutSignal from '../src/timeout-signal';

describe('TimeoutSignal', () => {
    context('when timeout is undefined', () => {
        const instance = new TimeoutSignal();
        describe('signal', () => it('should be undefined', () => expect(instance.signal).to.be.undefined));
        describe('timeout', () => it('should be undefined', () => expect(instance.timeout).to.be.undefined));
    });

    context('when timeout is NaN', () => {
        const instance = new TimeoutSignal(NaN);
        describe('signal', () => it('should be undefined', () => expect(instance.signal).to.be.undefined));
        describe('timeout', () => it('should be undefined', () => expect(instance.timeout).to.be.undefined));
    });

    context('when timeout is infinite', () => {
        const instance = new TimeoutSignal(Infinity);
        describe('signal', () => it('should be undefined', () => expect(instance.signal).to.be.undefined));
        describe('timeout', () => it('should be undefined', () => expect(instance.timeout).to.be.undefined));
    });

    context('when timeout is negative', () => {
        const instance = new TimeoutSignal(-1);
        describe('signal', () => it('should be undefined', () => expect(instance.signal).to.be.undefined));
        describe('timeout', () => it('should be undefined', () => expect(instance.timeout).to.be.undefined));
    });

    context('when timeout is non-NaN, finite and >=0', () => {
        const instance = new TimeoutSignal(1000);
        describe('signal', () => it('should be defined', () => expect(instance.signal).to.not.be.undefined));
        describe('timeout', () => it('should be defined', () => expect(instance.timeout).to.not.be.undefined));
    });
});
