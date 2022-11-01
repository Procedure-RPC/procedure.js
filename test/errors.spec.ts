import { beforeEach, describe, expect, it } from '@jest/globals';

import {
    ProcedureError,
    ProcedureUnknownError,
    ProcedureInternalClientError,
    ProcedureNotFoundError,
    ProcedureCancelledError,
    ProcedureTimedOutError,
    ProcedureInvalidResponseError,
    ProcedureInternalServerError,
    ProcedureExecutionError,
    isError,
    isProcedureError,
    ProcedureErrorCodes,
} from '../src/errors';

describe('ProcedureUnknownError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureUnknownError;

        describe('when no parameters passed', () => {
            beforeEach(() => {
                instance = new ProcedureUnknownError();
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureUnknownError', () => {
                expect(instance).toBeInstanceOf(ProcedureUnknownError);
            });

            describe('message', () =>
                it("should be: 'An unhandled exception of unknown origin was thrown while handling the request.'", () => {
                    expect(instance.message).toEqual(
                        'An unhandled exception of unknown origin was thrown while handling the request.'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: 'Expected n to be typeof number, got object', data: undefined", () => {
            beforeEach(() => {
                instance = new ProcedureUnknownError(
                    'Expected n to be typeof number, got object'
                );
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureUnknownError', () => {
                expect(instance).toBeInstanceOf(ProcedureUnknownError);
            });

            describe('message', () =>
                it("should be: 'Expected n to be typeof number, got object'", () => {
                    expect(instance.message).toEqual(
                        'Expected n to be typeof number, got object'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: undefined, data: { foo: 'bar' }", () => {
            beforeEach(() => {
                instance = new ProcedureUnknownError(undefined, { foo: 'bar' });
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureUnknownError', () => {
                expect(instance).toBeInstanceOf(ProcedureUnknownError);
            });

            describe('message', () =>
                it("should be: 'An unhandled exception of unknown origin was thrown while handling the request.'", () => {
                    expect(instance.message).toEqual(
                        'An unhandled exception of unknown origin was thrown while handling the request.'
                    );
                }));

            describe('data', () => {
                it("should equal: { foo: 'bar' }", () => {
                    expect(instance.data).toStrictEqual({ foo: 'bar' });
                });
            });
        });
    });
});

describe('ProcedureInternalClientError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureInternalClientError;

        describe('when no parameters passed', () => {
            beforeEach(() => {
                instance = new ProcedureInternalClientError();
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureInternalClientError', () => {
                expect(instance).toBeInstanceOf(ProcedureInternalClientError);
            });

            describe('message', () =>
                it("should be: 'An unhandled exception was thrown while attempting to call the procedure.'", () => {
                    expect(instance.message).toEqual(
                        'An unhandled exception was thrown while attempting to call the procedure.'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: 'Expected n to be typeof number, got object', data: undefined", () => {
            beforeEach(() => {
                instance = new ProcedureInternalClientError(
                    'Expected n to be typeof number, got object'
                );
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureInternalClientError', () => {
                expect(instance).toBeInstanceOf(ProcedureInternalClientError);
            });

            describe('message', () =>
                it("should be: 'Expected n to be typeof number, got object'", () => {
                    expect(instance.message).toEqual(
                        'Expected n to be typeof number, got object'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: undefined, data: { foo: 'bar' }", () => {
            beforeEach(() => {
                instance = new ProcedureInternalClientError(undefined, {
                    foo: 'bar',
                });
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureInternalClientError', () => {
                expect(instance).toBeInstanceOf(ProcedureInternalClientError);
            });

            describe('message', () =>
                it("should be: 'An unhandled exception was thrown while attempting to call the procedure.'", () => {
                    expect(instance.message).toEqual(
                        'An unhandled exception was thrown while attempting to call the procedure.'
                    );
                }));

            describe('data', () => {
                it("should equal: { foo: 'bar' }", () => {
                    expect(instance.data).toStrictEqual({ foo: 'bar' });
                });
            });
        });
    });
});

describe('ProcedureNotFoundError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureNotFoundError;

        describe('when no parameters passed', () => {
            beforeEach(() => {
                instance = new ProcedureNotFoundError();
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureNotFoundError', () => {
                expect(instance).toBeInstanceOf(ProcedureNotFoundError);
            });

            describe('message', () =>
                it("should be: 'The procedure could not be found at the stated endpoint.'", () => {
                    expect(instance.message).toEqual(
                        'The procedure could not be found at the stated endpoint.'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: 'Expected n to be typeof number, got object', data: undefined", () => {
            beforeEach(() => {
                instance = new ProcedureNotFoundError(
                    'Expected n to be typeof number, got object'
                );
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureNotFoundError', () => {
                expect(instance).toBeInstanceOf(ProcedureNotFoundError);
            });

            describe('message', () =>
                it("should be: 'Expected n to be typeof number, got object'", () => {
                    expect(instance.message).toEqual(
                        'Expected n to be typeof number, got object'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: undefined, data: { foo: 'bar' }", () => {
            beforeEach(() => {
                instance = new ProcedureNotFoundError(undefined, {
                    foo: 'bar',
                });
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureNotFoundError', () => {
                expect(instance).toBeInstanceOf(ProcedureNotFoundError);
            });

            describe('message', () =>
                it("should be: 'The procedure could not be found at the stated endpoint.'", () => {
                    expect(instance.message).toEqual(
                        'The procedure could not be found at the stated endpoint.'
                    );
                }));

            describe('data', () => {
                it("should equal: { foo: 'bar' }", () => {
                    expect(instance.data).toStrictEqual({ foo: 'bar' });
                });
            });
        });
    });
});

describe('ProcedureCancelledError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureCancelledError;

        describe('when no parameters passed', () => {
            beforeEach(() => {
                instance = new ProcedureCancelledError();
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureCancelledError', () => {
                expect(instance).toBeInstanceOf(ProcedureCancelledError);
            });

            describe('message', () =>
                it("should be: 'The operation was cancelled by the client.'", () => {
                    expect(instance.message).toEqual(
                        'The operation was cancelled by the client.'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: 'Expected n to be typeof number, got object', data: undefined", () => {
            beforeEach(() => {
                instance = new ProcedureCancelledError(
                    'Expected n to be typeof number, got object'
                );
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureCancelledError', () => {
                expect(instance).toBeInstanceOf(ProcedureCancelledError);
            });

            describe('message', () =>
                it("should be: 'Expected n to be typeof number, got object'", () => {
                    expect(instance.message).toEqual(
                        'Expected n to be typeof number, got object'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: undefined, data: { foo: 'bar' }", () => {
            beforeEach(() => {
                instance = new ProcedureCancelledError(undefined, {
                    foo: 'bar',
                });
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureCancelledError', () => {
                expect(instance).toBeInstanceOf(ProcedureCancelledError);
            });

            describe('message', () =>
                it("should be: 'The operation was cancelled by the client.'", () => {
                    expect(instance.message).toEqual(
                        'The operation was cancelled by the client.'
                    );
                }));

            describe('data', () => {
                it("should equal: { foo: 'bar' }", () => {
                    expect(instance.data).toStrictEqual({ foo: 'bar' });
                });
            });
        });
    });
});

describe('ProcedureTimedOutError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureTimedOutError;

        describe('when no parameters passed', () => {
            beforeEach(() => {
                instance = new ProcedureTimedOutError();
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureTimedOutError', () => {
                expect(instance).toBeInstanceOf(ProcedureTimedOutError);
            });

            describe('message', () =>
                it("should be: 'Timed out waiting for the operation to complete.'", () => {
                    expect(instance.message).toEqual(
                        'Timed out waiting for the operation to complete.'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: 'Expected n to be typeof number, got object', data: undefined", () => {
            beforeEach(() => {
                instance = new ProcedureTimedOutError(
                    'Expected n to be typeof number, got object'
                );
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureTimedOutError', () => {
                expect(instance).toBeInstanceOf(ProcedureTimedOutError);
            });

            describe('message', () =>
                it("should be: 'Expected n to be typeof number, got object'", () => {
                    expect(instance.message).toEqual(
                        'Expected n to be typeof number, got object'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: undefined, data: { foo: 'bar' }", () => {
            beforeEach(() => {
                instance = new ProcedureTimedOutError(undefined, {
                    foo: 'bar',
                });
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureTimedOutError', () => {
                expect(instance).toBeInstanceOf(ProcedureTimedOutError);
            });

            describe('message', () =>
                it("should be: 'Timed out waiting for the operation to complete.'", () => {
                    expect(instance.message).toEqual(
                        'Timed out waiting for the operation to complete.'
                    );
                }));

            describe('data', () => {
                it("should equal: { foo: 'bar' }", () => {
                    expect(instance.data).toStrictEqual({ foo: 'bar' });
                });
            });
        });
    });
});

describe('ProcedureInvalidResponseError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureInvalidResponseError;

        describe('when no parameters passed', () => {
            beforeEach(() => {
                instance = new ProcedureInvalidResponseError();
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureInvalidResponseError', () => {
                expect(instance).toBeInstanceOf(ProcedureInvalidResponseError);
            });

            describe('message', () =>
                it("should be: 'The response from the server was invalid.'", () => {
                    expect(instance.message).toEqual(
                        'The response from the server was invalid.'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: 'Expected n to be typeof number, got object', data: undefined", () => {
            beforeEach(() => {
                instance = new ProcedureInvalidResponseError(
                    'Expected n to be typeof number, got object'
                );
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureInvalidResponseError', () => {
                expect(instance).toBeInstanceOf(ProcedureInvalidResponseError);
            });

            describe('message', () =>
                it("should be: 'Expected n to be typeof number, got object'", () => {
                    expect(instance.message).toEqual(
                        'Expected n to be typeof number, got object'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: undefined, data: { foo: 'bar' }", () => {
            beforeEach(() => {
                instance = new ProcedureInvalidResponseError(undefined, {
                    foo: 'bar',
                });
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureInvalidResponseError', () => {
                expect(instance).toBeInstanceOf(ProcedureInvalidResponseError);
            });

            describe('message', () =>
                it("should be: 'The response from the server was invalid.'", () => {
                    expect(instance.message).toEqual(
                        'The response from the server was invalid.'
                    );
                }));

            describe('data', () => {
                it("should equal: { foo: 'bar' }", () => {
                    expect(instance.data).toStrictEqual({ foo: 'bar' });
                });
            });
        });
    });
});

describe('ProcedureInternalServerError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureInternalServerError;

        describe('when no parameters passed', () => {
            beforeEach(() => {
                instance = new ProcedureInternalServerError();
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureInternalServerError', () => {
                expect(instance).toBeInstanceOf(ProcedureInternalServerError);
            });

            describe('message', () =>
                it("should be: 'An unhandled exception was thrown while attempting to handle the procedure.'", () => {
                    expect(instance.message).toEqual(
                        'An unhandled exception was thrown while attempting to handle the procedure.'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: 'Expected n to be typeof number, got object', data: undefined", () => {
            beforeEach(() => {
                instance = new ProcedureInternalServerError(
                    'Expected n to be typeof number, got object'
                );
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureInternalServerError', () => {
                expect(instance).toBeInstanceOf(ProcedureInternalServerError);
            });

            describe('message', () =>
                it("should be: 'Expected n to be typeof number, got object'", () => {
                    expect(instance.message).toEqual(
                        'Expected n to be typeof number, got object'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: undefined, data: { foo: 'bar' }", () => {
            beforeEach(() => {
                instance = new ProcedureInternalServerError(undefined, {
                    foo: 'bar',
                });
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureInternalServerError', () => {
                expect(instance).toBeInstanceOf(ProcedureInternalServerError);
            });

            describe('message', () =>
                it("should be: 'An unhandled exception was thrown while attempting to handle the procedure.'", () => {
                    expect(instance.message).toEqual(
                        'An unhandled exception was thrown while attempting to handle the procedure.'
                    );
                }));

            describe('data', () => {
                it("should equal: { foo: 'bar' }", () => {
                    expect(instance.data).toStrictEqual({ foo: 'bar' });
                });
            });
        });
    });
});

describe('ProcedureExecutionError', () => {
    describe('constructor(message?: string, data?: Record<string, unknown>)', () => {
        let instance: ProcedureExecutionError;

        describe('when no parameters passed', () => {
            beforeEach(() => {
                instance = new ProcedureExecutionError();
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureExecutionError', () => {
                expect(instance).toBeInstanceOf(ProcedureExecutionError);
            });

            describe('message', () =>
                it("should be: 'An unhandled exception was thrown during procedure execution.'", () => {
                    expect(instance.message).toEqual(
                        'An unhandled exception was thrown during procedure execution.'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: 'Expected n to be typeof number, got object', data: undefined", () => {
            beforeEach(() => {
                instance = new ProcedureExecutionError(
                    'Expected n to be typeof number, got object'
                );
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureExecutionError', () => {
                expect(instance).toBeInstanceOf(ProcedureExecutionError);
            });

            describe('message', () =>
                it("should be: 'Expected n to be typeof number, got object'", () => {
                    expect(instance.message).toEqual(
                        'Expected n to be typeof number, got object'
                    );
                }));

            describe('data', () => {
                it('should not be set', () => {
                    expect(instance).not.toHaveProperty('data');
                });
            });
        });

        describe("when message: undefined, data: { foo: 'bar' }", () => {
            beforeEach(() => {
                instance = new ProcedureExecutionError(undefined, {
                    foo: 'bar',
                });
            });

            it('should be: instanceof ProcedureError', () => {
                expect(instance).toBeInstanceOf(ProcedureError);
            });
            it('should be: instanceof ProcedureExecutionError', () => {
                expect(instance).toBeInstanceOf(ProcedureExecutionError);
            });

            describe('message', () =>
                it("should be: 'An unhandled exception was thrown during procedure execution.'", () => {
                    expect(instance.message).toEqual(
                        'An unhandled exception was thrown during procedure execution.'
                    );
                }));

            describe('data', () => {
                it("should equal: { foo: 'bar' }", () => {
                    expect(instance.data).toStrictEqual({ foo: 'bar' });
                });
            });
        });
    });
});

describe('isError(object: unknown): object is Error', () => {
    let object: unknown;
    describe('when object: instanceof Error', () => {
        beforeEach(() => {
            object = new Error();
        });
        it('should return: true', () => {
            expect(isError(object)).toEqual(true);
        });
    });

    describe('when object: undefined', () => {
        beforeEach(() => {
            object = undefined;
        });
        it('should return: false', () => {
            expect(isError(object)).toEqual(false);
        });
    });

    describe('when object: null', () => {
        beforeEach(() => {
            object = null;
        });
        it('should return: false', () => {
            expect(isError(object)).toEqual(false);
        });
    });

    describe('when object: instanceof TypeError', () => {
        beforeEach(() => {
            object = new TypeError();
        });
        it('should return: true', () => {
            expect(isError(object)).toEqual(true);
        });
    });

    describe("when object: { name: 'Foo', message: 'Bar' }", () => {
        beforeEach(() => {
            object = { name: 'Foo', message: 'Bar' };
        });
        it('should return: true', () => {
            expect(isError(object)).toEqual(true);
        });
    });

    describe("when object: { name: 'Foo' }", () => {
        beforeEach(() => {
            object = { name: 'Foo' };
        });
        it('should return: false', () => {
            expect(isError(object)).toEqual(false);
        });
    });
});

describe('isProcedureError(object: unknown): object is ProcedureError', () => {
    let object: unknown;
    describe('when object: instanceof Error', () => {
        beforeEach(() => {
            object = new Error();
        });
        it('should return: false', () => {
            expect(isProcedureError(object)).toEqual(false);
        });
    });

    describe('when object: undefined', () => {
        beforeEach(() => {
            object = undefined;
        });
        it('should return: false', () => {
            expect(isProcedureError(object)).toEqual(false);
        });
    });

    describe('when object: null', () => {
        beforeEach(() => {
            object = null;
        });
        it('should return: false', () => {
            expect(isProcedureError(object)).toEqual(false);
        });
    });

    describe('when object: instanceof TypeError', () => {
        beforeEach(() => {
            object = new TypeError();
        });
        it('should return: false', () => {
            expect(isProcedureError(object)).toEqual(false);
        });
    });

    describe("when object: { name: 'Foo', message: 'Bar' }", () => {
        beforeEach(() => {
            object = { name: 'Foo', message: 'Bar' };
        });
        it('should return: false', () => {
            expect(isProcedureError(object)).toEqual(false);
        });
    });

    describe("when object: { name: 'Foo' }", () => {
        beforeEach(() => {
            object = { name: 'Foo' };
        });
        it('should return: false', () => {
            expect(isProcedureError(object)).toEqual(false);
        });
    });

    describe('when object: instanceof ProcedureError', () => {
        beforeEach(() => {
            object = new ProcedureUnknownError();
        });
        it('should return: true', () => {
            expect(isProcedureError(object)).toEqual(true);
        });
    });

    describe("when object: { name: 'ProcedureError', message: 'foo', code: ProcedureErrorCodes.NOT_FOUND }", () => {
        beforeEach(() => {
            object = {
                name: 'ProcedureError',
                message: 'foo',
                code: ProcedureErrorCodes.NOT_FOUND,
            };
        });
        it('should return: true', () => {
            expect(isProcedureError(object)).toEqual(true);
        });
    });

    describe("when object: { name: 'ProcedureError', message: 'foo', code: -1 }", () => {
        beforeEach(() => {
            object = { name: 'ProcedureError', message: 'foo', code: -1 };
        });
        it('should return: false', () => {
            expect(isProcedureError(object)).toEqual(false);
        });
    });
});
