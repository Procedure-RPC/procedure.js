import 'mocha';
import chai, { expect } from 'chai';
import chaiQuantifiers from 'chai-quantifiers';
import {
    ProcedureError, ProcedureUnknownError, ProcedureInternalClientError, ProcedureNotFoundError,
    ProcedureCancelledError, ProcedureTimedOutError, ProcedureInvalidResponseError,
    ProcedureInternalServerError, ProcedureExecutionError,
    isError, isProcedureError, ProcedureErrorCodes
} from '../src/errors';

chai.use(chaiQuantifiers);

describe('ProcedureUnknownError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureUnknownError;

        context('when no parameters passed', () => {
            beforeEach(() => instance = new ProcedureUnknownError());

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureUnknownError', () => expect(instance).to.be.instanceof(ProcedureUnknownError));

            describe('message', () =>
                it('should be: \'An unhandled exception of unknown origin was thrown while handling the request.\'', () =>
                    expect(instance.message).to.equal('An unhandled exception of unknown origin was thrown while handling the request.')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance.data).to.not.exist);
            });
        });

        context('when message: \'Expected n to be typeof number, got object\', data: undefined', () => {
            beforeEach(() => instance = new ProcedureUnknownError('Expected n to be typeof number, got object'));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureUnknownError', () => expect(instance).to.be.instanceof(ProcedureUnknownError));

            describe('message', () =>
                it('should be: \'Expected n to be typeof number, got object\'', () =>
                    expect(instance.message).to.equal('Expected n to be typeof number, got object')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance).to.not.have.property('data'));
            });
        });

        context('when message: undefined, data: { foo: \'bar\' }', () => {
            beforeEach(() => instance = new ProcedureUnknownError(undefined, { foo: 'bar' }));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureUnknownError', () => expect(instance).to.be.instanceof(ProcedureUnknownError));

            describe('message', () =>
                it('should be: \'An unhandled exception of unknown origin was thrown while handling the request.\'', () =>
                    expect(instance.message).to.equal('An unhandled exception of unknown origin was thrown while handling the request.')));

            describe('data', () => {
                it('should equal: { foo: \'bar\' }', () =>
                    expect(instance.data).to.deep.equal({ foo: 'bar' }));
            });
        });
    });
});

describe('ProcedureInternalClientError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureInternalClientError;

        context('when no parameters passed', () => {
            beforeEach(() => instance = new ProcedureInternalClientError());

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureInternalClientError', () => expect(instance).to.be.instanceof(ProcedureInternalClientError));

            describe('message', () =>
                it('should be: \'An unhandled exception was thrown while attempting to call the procedure.\'', () =>
                    expect(instance.message).to.equal('An unhandled exception was thrown while attempting to call the procedure.')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance.data).to.not.exist);
            });
        });

        context('when message: \'Expected n to be typeof number, got object\', data: undefined', () => {
            beforeEach(() => instance = new ProcedureInternalClientError('Expected n to be typeof number, got object'));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureInternalClientError', () => expect(instance).to.be.instanceof(ProcedureInternalClientError));

            describe('message', () =>
                it('should be: \'Expected n to be typeof number, got object\'', () =>
                    expect(instance.message).to.equal('Expected n to be typeof number, got object')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance).to.not.have.property('data'));
            });
        });

        context('when message: undefined, data: { foo: \'bar\' }', () => {
            beforeEach(() => instance = new ProcedureInternalClientError(undefined, { foo: 'bar' }));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureInternalClientError', () => expect(instance).to.be.instanceof(ProcedureInternalClientError));

            describe('message', () =>
                it('should be: \'An unhandled exception was thrown while attempting to call the procedure.\'', () =>
                    expect(instance.message).to.equal('An unhandled exception was thrown while attempting to call the procedure.')));

            describe('data', () => {
                it('should equal: { foo: \'bar\' }', () =>
                    expect(instance.data).to.deep.equal({ foo: 'bar' }));
            });
        });
    });
});

describe('ProcedureNotFoundError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureNotFoundError;

        context('when no parameters passed', () => {
            beforeEach(() => instance = new ProcedureNotFoundError());

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureNotFoundError', () => expect(instance).to.be.instanceof(ProcedureNotFoundError));

            describe('message', () =>
                it('should be: \'The procedure could not be found at the stated endpoint.\'', () =>
                    expect(instance.message).to.equal('The procedure could not be found at the stated endpoint.')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance.data).to.not.exist);
            });
        });

        context('when message: \'Expected n to be typeof number, got object\', data: undefined', () => {
            beforeEach(() => instance = new ProcedureNotFoundError('Expected n to be typeof number, got object'));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureNotFoundError', () => expect(instance).to.be.instanceof(ProcedureNotFoundError));

            describe('message', () =>
                it('should be: \'Expected n to be typeof number, got object\'', () =>
                    expect(instance.message).to.equal('Expected n to be typeof number, got object')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance).to.not.have.property('data'));
            });
        });

        context('when message: undefined, data: { foo: \'bar\' }', () => {
            beforeEach(() => instance = new ProcedureNotFoundError(undefined, { foo: 'bar' }));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureNotFoundError', () => expect(instance).to.be.instanceof(ProcedureNotFoundError));

            describe('message', () =>
                it('should be: \'The procedure could not be found at the stated endpoint.\'', () =>
                    expect(instance.message).to.equal('The procedure could not be found at the stated endpoint.')));

            describe('data', () => {
                it('should equal: { foo: \'bar\' }', () =>
                    expect(instance.data).to.deep.equal({ foo: 'bar' }));
            });
        });
    });
});

describe('ProcedureCancelledError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureCancelledError;

        context('when no parameters passed', () => {
            beforeEach(() => instance = new ProcedureCancelledError());

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureCancelledError', () => expect(instance).to.be.instanceof(ProcedureCancelledError));

            describe('message', () =>
                it('should be: \'The operation was cancelled by the client.\'', () =>
                    expect(instance.message).to.equal('The operation was cancelled by the client.')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance.data).to.not.exist);
            });
        });

        context('when message: \'Expected n to be typeof number, got object\', data: undefined', () => {
            beforeEach(() => instance = new ProcedureCancelledError('Expected n to be typeof number, got object'));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureCancelledError', () => expect(instance).to.be.instanceof(ProcedureCancelledError));

            describe('message', () =>
                it('should be: \'Expected n to be typeof number, got object\'', () =>
                    expect(instance.message).to.equal('Expected n to be typeof number, got object')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance).to.not.have.property('data'));
            });
        });

        context('when message: undefined, data: { foo: \'bar\' }', () => {
            beforeEach(() => instance = new ProcedureCancelledError(undefined, { foo: 'bar' }));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureCancelledError', () => expect(instance).to.be.instanceof(ProcedureCancelledError));

            describe('message', () =>
                it('should be: \'The operation was cancelled by the client.\'', () =>
                    expect(instance.message).to.equal('The operation was cancelled by the client.')));

            describe('data', () => {
                it('should equal: { foo: \'bar\' }', () =>
                    expect(instance.data).to.deep.equal({ foo: 'bar' }));
            });
        });
    });
});

describe('ProcedureTimedOutError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureTimedOutError;

        context('when no parameters passed', () => {
            beforeEach(() => instance = new ProcedureTimedOutError());

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureTimedOutError', () => expect(instance).to.be.instanceof(ProcedureTimedOutError));

            describe('message', () =>
                it('should be: \'Timed out waiting for the operation to complete.\'', () =>
                    expect(instance.message).to.equal('Timed out waiting for the operation to complete.')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance.data).to.not.exist);
            });
        });

        context('when message: \'Expected n to be typeof number, got object\', data: undefined', () => {
            beforeEach(() => instance = new ProcedureTimedOutError('Expected n to be typeof number, got object'));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureTimedOutError', () => expect(instance).to.be.instanceof(ProcedureTimedOutError));

            describe('message', () =>
                it('should be: \'Expected n to be typeof number, got object\'', () =>
                    expect(instance.message).to.equal('Expected n to be typeof number, got object')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance).to.not.have.property('data'));
            });
        });

        context('when message: undefined, data: { foo: \'bar\' }', () => {
            beforeEach(() => instance = new ProcedureTimedOutError(undefined, { foo: 'bar' }));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureTimedOutError', () => expect(instance).to.be.instanceof(ProcedureTimedOutError));

            describe('message', () =>
                it('should be: \'Timed out waiting for the operation to complete.\'', () =>
                    expect(instance.message).to.equal('Timed out waiting for the operation to complete.')));

            describe('data', () => {
                it('should equal: { foo: \'bar\' }', () =>
                    expect(instance.data).to.deep.equal({ foo: 'bar' }));
            });
        });
    });
});

describe('ProcedureInvalidResponseError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureInvalidResponseError;

        context('when no parameters passed', () => {
            beforeEach(() => instance = new ProcedureInvalidResponseError());

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureInvalidResponseError', () => expect(instance).to.be.instanceof(ProcedureInvalidResponseError));

            describe('message', () =>
                it('should be: \'The response from the server was invalid.\'', () =>
                    expect(instance.message).to.equal('The response from the server was invalid.')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance.data).to.not.exist);
            });
        });

        context('when message: \'Expected n to be typeof number, got object\', data: undefined', () => {
            beforeEach(() => instance = new ProcedureInvalidResponseError('Expected n to be typeof number, got object'));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureInvalidResponseError', () => expect(instance).to.be.instanceof(ProcedureInvalidResponseError));

            describe('message', () =>
                it('should be: \'Expected n to be typeof number, got object\'', () =>
                    expect(instance.message).to.equal('Expected n to be typeof number, got object')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance).to.not.have.property('data'));
            });
        });

        context('when message: undefined, data: { foo: \'bar\' }', () => {
            beforeEach(() => instance = new ProcedureInvalidResponseError(undefined, { foo: 'bar' }));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureInvalidResponseError', () => expect(instance).to.be.instanceof(ProcedureInvalidResponseError));

            describe('message', () =>
                it('should be: \'The response from the server was invalid.\'', () =>
                    expect(instance.message).to.equal('The response from the server was invalid.')));

            describe('data', () => {
                it('should equal: { foo: \'bar\' }', () =>
                    expect(instance.data).to.deep.equal({ foo: 'bar' }));
            });
        });
    });
});

describe('ProcedureInternalServerError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureInternalServerError;

        context('when no parameters passed', () => {
            beforeEach(() => instance = new ProcedureInternalServerError());

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureInternalServerError', () => expect(instance).to.be.instanceof(ProcedureInternalServerError));

            describe('message', () =>
                it('should be: \'An unhandled exception was thrown while attempting to handle the procedure.\'', () =>
                    expect(instance.message).to.equal('An unhandled exception was thrown while attempting to handle the procedure.')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance.data).to.not.exist);
            });
        });

        context('when message: \'Expected n to be typeof number, got object\', data: undefined', () => {
            beforeEach(() => instance = new ProcedureInternalServerError('Expected n to be typeof number, got object'));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureInternalServerError', () => expect(instance).to.be.instanceof(ProcedureInternalServerError));

            describe('message', () =>
                it('should be: \'Expected n to be typeof number, got object\'', () =>
                    expect(instance.message).to.equal('Expected n to be typeof number, got object')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance).to.not.have.property('data'));
            });
        });

        context('when message: undefined, data: { foo: \'bar\' }', () => {
            beforeEach(() => instance = new ProcedureInternalServerError(undefined, { foo: 'bar' }));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureInternalServerError', () => expect(instance).to.be.instanceof(ProcedureInternalServerError));

            describe('message', () =>
                it('should be: \'An unhandled exception was thrown while attempting to handle the procedure.\'', () =>
                    expect(instance.message).to.equal('An unhandled exception was thrown while attempting to handle the procedure.')));

            describe('data', () => {
                it('should equal: { foo: \'bar\' }', () =>
                    expect(instance.data).to.deep.equal({ foo: 'bar' }));
            });
        });
    });
});

describe('ProcedureExecutionError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureExecutionError;

        context('when no parameters passed', () => {
            beforeEach(() => instance = new ProcedureExecutionError());

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureExecutionError', () => expect(instance).to.be.instanceof(ProcedureExecutionError));

            describe('message', () =>
                it('should be: \'An unhandled exception was thrown during procedure execution.\'', () =>
                    expect(instance.message).to.equal('An unhandled exception was thrown during procedure execution.')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance.data).to.not.exist);
            });
        });

        context('when message: \'Expected n to be typeof number, got object\', data: undefined', () => {
            beforeEach(() => instance = new ProcedureExecutionError('Expected n to be typeof number, got object'));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureExecutionError', () => expect(instance).to.be.instanceof(ProcedureExecutionError));

            describe('message', () =>
                it('should be: \'Expected n to be typeof number, got object\'', () =>
                    expect(instance.message).to.equal('Expected n to be typeof number, got object')));

            describe('data', () => {
                it('should not be set', () =>
                    expect(instance).to.not.have.property('data'));
            });
        });

        context('when message: undefined, data: { foo: \'bar\' }', () => {
            beforeEach(() => instance = new ProcedureExecutionError(undefined, { foo: 'bar' }));

            it('should be: instanceof ProcedureError', () => expect(instance).to.be.instanceof(ProcedureError));
            it('should be: instanceof ProcedureExecutionError', () => expect(instance).to.be.instanceof(ProcedureExecutionError));

            describe('message', () =>
                it('should be: \'An unhandled exception was thrown during procedure execution.\'', () =>
                    expect(instance.message).to.equal('An unhandled exception was thrown during procedure execution.')));

            describe('data', () => {
                it('should equal: { foo: \'bar\' }', () =>
                    expect(instance.data).to.deep.equal({ foo: 'bar' }));
            });
        });
    });
});

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
        it('should return: true', () => expect(isError(object)).to.be.true);
    });

    context('when object: { name: \'Foo\' }', () => {
        beforeEach(() => object = { name: 'Foo' });
        it('should return: false', () => expect(isError(object)).to.be.false);
    })
});

describe('isProcedureError(object: unknown): object is ProcedureError', () => {
    let object: unknown;
    context('when object: instanceof Error', () => {
        beforeEach(() => object = new Error());
        it('should return: false', () => expect(isProcedureError(object)).to.be.false);
    });

    context('when object: undefined', () => {
        beforeEach(() => object = undefined);
        it('should return: false', () => expect(isProcedureError(object)).to.be.false);
    });

    context('when object: null', () => {
        beforeEach(() => object = null);
        it('should return: false', () => expect(isProcedureError(object)).to.be.false);
    });

    context('when object: instanceof TypeError', () => {
        beforeEach(() => object = new TypeError());
        it('should return: false', () => expect(isProcedureError(object)).to.be.false);
    });

    context('when object: { name: \'Foo\', message: \'Bar\' }', () => {
        beforeEach(() => object = { name: 'Foo', message: 'Bar' });
        it('should return: false', () => expect(isProcedureError(object)).to.be.false);
    });

    context('when object: { name: \'Foo\' }', () => {
        beforeEach(() => object = { name: 'Foo' });
        it('should return: false', () => expect(isProcedureError(object)).to.be.false);
    })

    context('when object: instanceof ProcedureError', () => {
        beforeEach(() => object = new ProcedureUnknownError());
        it('should return: true', () => expect(isProcedureError(object)).to.be.true);
    });

    context('when object: { name: \'ProcedureError\', message: \'foo\', code: ProcedureErrorCodes.NOT_FOUND }', () => {
        beforeEach(() => object = { name: 'ProcedureError', message: 'foo', code: ProcedureErrorCodes.NOT_FOUND });
        it('should return: true', () => expect(isProcedureError(object)).to.be.true);
    });

    context('when object: { name: \'ProcedureError\', message: \'foo\', code: -1 }', () => {
        beforeEach(() => object = { name: 'ProcedureError', message: 'foo', code: -1 });
        it('should return: false', () => expect(isProcedureError(object)).to.be.false);
    });
});
