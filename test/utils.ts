import 'mocha';
import chai, { expect } from 'chai';
import chaiQuantifiers from 'chai-quantifiers';
import { cloneError, errorEntries, isError, isErrorLike } from '../src/utils';

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
    })

    context('when object: null', () => {
        beforeEach(() => object = null);
        it('should return: false', () => expect(isError(object)).to.be.false);
    });

    context('when object: instanceof TypeError', () => {
        beforeEach(() => object = new TypeError());
        it('should return: true', () => expect(isError(object)).to.be.true);
    })

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
    })

    context('when object: null', () => {
        beforeEach(() => object = null);
        it('should return: false', () => expect(isErrorLike(object)).to.be.false);
    });

    context('when object: instanceof TypeError', () => {
        beforeEach(() => object = new TypeError());
        it('should return: true', () => expect(isErrorLike(object)).to.be.true);
    })

    context('when object: { name: \'Foo\', message: \'Bar\' }', () => {
        beforeEach(() => object = { name: 'Foo', message: 'Bar' });
        it('should return: true', () => expect(isErrorLike(object)).to.be.true);
    });
});

describe('errorEntries(error: Error, stack: boolean): Array<unknown[]>', () => {
    let error: Error;
    let stack: boolean;
    beforeEach(() => error = new TypeError());

    it('should return: Array<unknown[]>', () => expect(errorEntries(error)).to.be.instanceof(Array<unknown[]>));

    context('when stack: false', () => {
        beforeEach(() => stack = false);
        it('should not include: keyof \'stack\'', () => expect(errorEntries(error, stack)).to.containAll(x => x[0] !== 'stack'));
    });

    context('when stack: true', () => {
        beforeEach(() => stack = true);
        it('should include: keyof \'stack\'', () => expect(errorEntries(error, stack)).to.containExactlyOne(x => x[0] === 'stack'));
        it('keyof \'stack\' should be: typeof string', () => expect(typeof errorEntries(error, stack).filter(x => x[0] === 'stack')[0][1]).to.equal('string'));
    });

    context('when error.cause: instanceof RangeError', () => {
        beforeEach(() => (error as Error & { cause: unknown }).cause = new RangeError());
        it('should include: keyof \'cause\'', () => expect(errorEntries(error, stack)).to.containExactlyOne(x => x[0] === 'cause'));
        it('keyof \'cause\' should be: ErrorLike', () => expect(isErrorLike(errorEntries(error, stack).filter(x => x[0] === 'cause')[0][1])).to.be.true);
    });
});

describe('cloneError(error: Error, stack: boolean): Error', () => {
    let error: Error;
    let stack: boolean;
    beforeEach(() => error = new SyntaxError('Foo'));

    it('return should be: ErrorLike', () => expect(isErrorLike(cloneError(error))).to.be.true);

    context('when stack: false', () => {
        beforeEach(() => stack = false);
        it('should not have property: stack', () => expect(cloneError(error, stack)).to.not.haveOwnProperty('stack'));
    });

    context('when stack: true', () => {
        beforeEach(() => stack = true);
        it('should have property: stack', () => expect(cloneError(error, stack)).to.haveOwnProperty('stack'));
        it('stack should be: typeof string', () => expect(typeof cloneError(error, stack).stack).to.equal('string'));
    });

    context('when error.cause: instanceof RangeError', () => {
        beforeEach(() => (error as Error & { cause: unknown }).cause = new RangeError());
        it('should have property: cause', () => expect(cloneError(error, stack)).to.haveOwnProperty('cause'));
        it('cause should be: ErrorLike', () => expect(isErrorLike((cloneError(error, stack) as Error & { cause: Error }).cause)).to.be.true);
        it('cause.name should be: \'RangeError\'', () => expect((cloneError(error, stack) as Error & { cause: Error }).cause.name).to.equal('RangeError'));
    });

    context('when error: { name: \'Foobar\' }', () => {
        beforeEach(() => error = { name: 'Foobar' } as Error);
        it('return should be: { name: \'Foobar\' }', () => expect(cloneError(error)).to.deep.equal({ name: 'Foobar' }));
    });

    context('when error: {}', () => {
        beforeEach(() => error = {} as Error);
        it('should throw: TypeError', () => expect(() => cloneError(error)).to.throw(TypeError, 'error does not match interface for type Error'));
    });
});
