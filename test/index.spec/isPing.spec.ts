import { beforeEach, describe, expect, it } from '@jest/globals';

import { isPing } from '../../src';

describe('isPing(object: unknown): object is Ping', () => {
    let object: unknown;

    describe("when object: { ping: 'foobar' }", () => {
        beforeEach(() => {
            object = { ping: 'foobar' };
        });
        it('should return: true', () => {
            expect(isPing(object)).toEqual(true);
        });
    });

    describe('when object: undefined', () => {
        beforeEach(() => {
            object = undefined;
        });
        it('should return: false', () => {
            expect(isPing(object)).toEqual(false);
        });
    });

    describe('when object: null', () => {
        beforeEach(() => {
            object = null;
        });
        it('should return: false', () => {
            expect(isPing(object)).toEqual(false);
        });
    });

    describe('when object: instanceof TypeError', () => {
        beforeEach(() => {
            object = new TypeError();
        });
        it('should return: true', () => {
            expect(isPing(object)).toEqual(false);
        });
    });

    describe("when object: { name: 'Foo', message: 'Bar' }", () => {
        beforeEach(() => {
            object = { name: 'Foo', message: 'Bar' };
        });
        it('should return: false', () => {
            expect(isPing(object)).toEqual(false);
        });
    });
});
