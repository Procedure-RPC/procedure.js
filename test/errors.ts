import 'mocha';
import chai, { expect } from 'chai';
import chaiQuantifiers from 'chai-quantifiers';
import { isError, isErrorLike } from '../src/errors';

chai.use(chaiQuantifiers);

describe('isError(object: unknown): object is Error', () => {
    let object: unknown;
    context('when object: instanceof Error', () => {
        beforeEach(() => object = new Error());
        it('should return: true', () => expect(isError(object)).to.be.true);
    });

    context('when object: undefined', () => {
        beforeEach(() => object = undefined);
        it('should return: false', () => expect(isError(object)).to.be.false);
    });

    context('when object: null', () => {
        beforeEach(() => object = null);
        it('should return: false', () => expect(isError(object)).to.be.false);
    });

    context('when object: instanceof TypeError', () => {
        beforeEach(() => object = new TypeError());
        it('should return: true', () => expect(isError(object)).to.be.true);
    });

    context('when object: { name: \'Foo\', message: \'Bar\' }', () => {
        beforeEach(() => object = { name: 'Foo', message: 'Bar' });
        it('should return: false', () => expect(isError(object)).to.be.false);
    });
});

describe('isErrorLike(object: unknown): object is Error', () => {
    let object: unknown;
    context('when object: instanceof Error', () => {
        beforeEach(() => object = new Error());
        it('should return: true', () => expect(isErrorLike(object)).to.be.true);
    });

    context('when object: undefined', () => {
        beforeEach(() => object = undefined);
        it('should return: false', () => expect(isErrorLike(object)).to.be.false);
    });

    context('when object: null', () => {
        beforeEach(() => object = null);
        it('should return: false', () => expect(isErrorLike(object)).to.be.false);
    });

    context('when object: instanceof TypeError', () => {
        beforeEach(() => object = new TypeError());
        it('should return: true', () => expect(isErrorLike(object)).to.be.true);
    });

    context('when object: { name: \'Foo\', message: \'Bar\' }', () => {
        beforeEach(() => object = { name: 'Foo', message: 'Bar' });
        it('should return: true', () => expect(isErrorLike(object)).to.be.true);
    });
});

// TODO: Add error constructor tests
