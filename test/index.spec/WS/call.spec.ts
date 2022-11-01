import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    jest,
} from '@jest/globals';

import Procedure, { call } from '../../../src';
import { ProcedureErrorCodes } from '../../../src/errors';

const consoleLogMockImplementation = <typeof console.log>(<unknown>undefined);

describe('call(endpoint: string, input: Input | null, options: Partial<ProcedureCallOptions>): Promise<Output>', () => {
    let fn: ReturnType<typeof jest.fn>;
    let procedure: Procedure<unknown, unknown>;
    let procedureEndpoint: string;
    let input: unknown;
    let callEndpoint: string | undefined;

    describe('WS tests', () => {
        describe('when procedure callback: Callback<number, number> (simple accumulator function)', () => {
            beforeEach(() => {
                let i = 0;
                fn = jest.fn((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return (i += n);
                });
                procedureEndpoint = 'ws://127.0.0.1:44444';
                procedure = new Procedure(fn, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            afterEach(() => {
                procedure.unbind();
            });

            describe('when endpoint: correct', () => {
                beforeEach(() => {
                    callEndpoint = procedureEndpoint;
                });

                describe('when input: 0', () => {
                    beforeEach(() => {
                        input = 0;
                    });

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = jest.fn((data: unknown) => (x = data));
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).toHaveBeenCalledTimes(1);
                        expect(x).toEqual(0);
                    });

                    it('should resolve: 0', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).resolves.toEqual(0);
                    });

                    afterEach(() => {
                        input = undefined;
                    });

                    describe('when verbose: true', () => {
                        beforeEach(() => {
                            procedure.verbose = true;
                        });

                        it('should call console.log', async () => {
                            const log = jest
                                .spyOn(console, 'log')
                                .mockImplementation(
                                    consoleLogMockImplementation
                                );
                            await call(<string>callEndpoint, input);
                            expect(log).toHaveBeenCalledTimes(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                        });
                    });
                });

                describe("when input: 'foo'", () => {
                    beforeEach(() => {
                        input = 'foo';
                    });

                    it('should throw: ProcedureExecutionError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.EXECUTION_ERROR,
                        });
                    });

                    afterEach(() => {
                        input = undefined;
                    });
                });

                describe('when input: 1000', () => {
                    beforeEach(() => {
                        input = 1000;
                    });

                    it('should resolve: 1000', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).resolves.toEqual(input);
                    });

                    afterEach(() => {
                        input = undefined;
                    });
                });

                describe('when input: undefined', () => {
                    beforeEach(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureExecutionError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.EXECUTION_ERROR,
                        });
                    });
                });

                describe('when ping: 100', () => {
                    describe('when input: 0', () => {
                        beforeEach(() => {
                            input = 0;
                        });

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => (x = data));
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, {
                                ping: 100,
                            });
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it('should resolve: 0', async () => {
                            await expect(
                                call(<string>callEndpoint, input, { ping: 100 })
                            ).resolves.toEqual(0);
                        });

                        afterEach(() => {
                            input = undefined;
                        });

                        describe('when verbose: true', () => {
                            beforeEach(() => {
                                procedure.verbose = true;
                            });

                            it('should call console.log', async () => {
                                const log = jest
                                    .spyOn(console, 'log')
                                    .mockImplementation(
                                        consoleLogMockImplementation
                                    );
                                await call(<string>callEndpoint, input, {
                                    ping: 100,
                                });
                                expect(log).toHaveBeenCalled();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                            });
                        });
                    });

                    describe("when input: 'foo'", () => {
                        beforeEach(() => {
                            input = 'foo';
                        });

                        it('should throw: ProcedureExecutionError', async () => {
                            await expect(
                                call(<string>callEndpoint, input, { ping: 100 })
                            ).rejects.toMatchObject({
                                code: ProcedureErrorCodes.EXECUTION_ERROR,
                            });
                        });

                        afterEach(() => {
                            input = undefined;
                        });
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => {
                            input = 1000;
                        });

                        it('should resolve: 1000', async () => {
                            await expect(
                                call(<string>callEndpoint, input, { ping: 100 })
                            ).resolves.toEqual(input);
                        });

                        afterEach(() => {
                            input = undefined;
                        });
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => {
                            input = undefined;
                        });

                        it('should throw: ProcedureExecutionError', async () => {
                            await expect(
                                call(<string>callEndpoint, input, { ping: 100 })
                            ).rejects.toMatchObject({
                                code: ProcedureErrorCodes.EXECUTION_ERROR,
                            });
                        });
                    });
                });

                afterEach(() => (callEndpoint = undefined));
            });

            describe('when endpoint: incorrect', () => {
                beforeEach(() => {
                    callEndpoint = procedureEndpoint.substring(
                        0,
                        procedureEndpoint.length - 2
                    );
                });

                afterEach(() => {
                    callEndpoint = undefined;
                });

                describe('when input: 0', () => {
                    beforeAll(() => {
                        input = 0;
                    });

                    afterAll(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureNotFoundError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.NOT_FOUND,
                        });
                    });
                });

                describe("when input: 'foo'", () => {
                    beforeAll(() => {
                        input = 'foo';
                    });

                    afterAll(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureNotFoundError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.NOT_FOUND,
                        });
                    });
                });

                describe('when input: 1000', () => {
                    beforeAll(() => {
                        input = 1000;
                    });

                    afterAll(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureNotFoundError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.NOT_FOUND,
                        });
                    });
                });

                describe('when input: undefined', () => {
                    beforeAll(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureNotFoundError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.NOT_FOUND,
                        });
                    });
                });
            });
        });

        describe('when procedure callback: Callback<number, null> (testing nullish returns)', () => {
            beforeEach(() => {
                fn = jest.fn((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return null;
                });

                procedureEndpoint = 'ws://127.0.0.1:44445';
                procedure = new Procedure(fn, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            afterEach(() => {
                procedure.unbind();
            });

            describe('when endpoint: correct', () => {
                beforeEach(() => {
                    callEndpoint = procedureEndpoint;
                });

                describe('when input: 0', () => {
                    beforeEach(() => {
                        input = 0;
                    });

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = jest.fn((data: unknown) => (x = data));
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).toHaveBeenCalledTimes(1);
                        expect(x).toEqual(0);
                    });

                    it('should resolve: undefined', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).resolves.toBeUndefined();
                    });

                    afterEach(() => {
                        input = undefined;
                    });

                    describe('when verbose: true', () => {
                        beforeEach(() => {
                            procedure.verbose = true;
                        });

                        it('should call console.log', async () => {
                            const log = jest
                                .spyOn(console, 'log')
                                .mockImplementation(
                                    consoleLogMockImplementation
                                );
                            await call(<string>callEndpoint, input);
                            expect(log).toHaveBeenCalledTimes(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                        });
                    });
                });

                describe("when input: 'foo'", () => {
                    beforeEach(() => {
                        input = 'foo';
                    });

                    it('should throw: ProcedureExecutionError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.EXECUTION_ERROR,
                        });
                    });

                    afterEach(() => {
                        input = undefined;
                    });
                });

                describe('when input: 1000', () => {
                    beforeEach(() => {
                        input = 1000;
                    });

                    it('should resolve: undefined', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).resolves.toBeUndefined();
                    });

                    afterEach(() => {
                        input = undefined;
                    });
                });

                describe('when input: undefined', () => {
                    beforeEach(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureExecutionError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.EXECUTION_ERROR,
                        });
                    });
                });

                describe('when ping: 100', () => {
                    describe('when input: 0', () => {
                        beforeEach(() => {
                            input = 0;
                        });

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => (x = data));
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, {
                                ping: 100,
                            });
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it('should resolve: undefined', async () => {
                            await expect(
                                call(<string>callEndpoint, input, { ping: 100 })
                            ).resolves.toBeUndefined();
                        });

                        afterEach(() => {
                            input = undefined;
                        });

                        describe('when verbose: true', () => {
                            beforeEach(() => {
                                procedure.verbose = true;
                            });

                            it('should call console.log', async () => {
                                const log = jest
                                    .spyOn(console, 'log')
                                    .mockImplementation(
                                        consoleLogMockImplementation
                                    );
                                await call(<string>callEndpoint, input, {
                                    ping: 100,
                                });
                                expect(log).toHaveBeenCalled();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                            });
                        });
                    });

                    describe("when input: 'foo'", () => {
                        beforeEach(() => {
                            input = 'foo';
                        });

                        it('should throw: ProcedureExecutionError', async () => {
                            await expect(
                                call(<string>callEndpoint, input, { ping: 100 })
                            ).rejects.toMatchObject({
                                code: ProcedureErrorCodes.EXECUTION_ERROR,
                            });
                        });

                        afterEach(() => {
                            input = undefined;
                        });
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => {
                            input = 1000;
                        });

                        it('should resolve: undefined', async () => {
                            await expect(
                                call(<string>callEndpoint, input, { ping: 100 })
                            ).resolves.toBeUndefined();
                        });

                        afterEach(() => {
                            input = undefined;
                        });
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => {
                            input = undefined;
                        });

                        it('should throw: ProcedureExecutionError', async () => {
                            await expect(
                                call(<string>callEndpoint, input, { ping: 100 })
                            ).rejects.toMatchObject({
                                code: ProcedureErrorCodes.EXECUTION_ERROR,
                            });
                        });
                    });
                });

                afterEach(() => (callEndpoint = undefined));
            });

            describe('when endpoint: incorrect', () => {
                beforeEach(() => {
                    callEndpoint = procedureEndpoint.substring(
                        0,
                        procedureEndpoint.length - 2
                    );
                });

                afterEach(() => {
                    callEndpoint = undefined;
                });

                describe('when input: 0', () => {
                    beforeAll(() => {
                        input = 0;
                    });

                    afterAll(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureNotFoundError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.NOT_FOUND,
                        });
                    });
                });

                describe("when input: 'foo'", () => {
                    beforeAll(() => {
                        input = 'foo';
                    });

                    afterAll(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureNotFoundError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.NOT_FOUND,
                        });
                    });
                });

                describe('when input: 1000', () => {
                    beforeAll(() => {
                        input = 1000;
                    });

                    afterAll(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureNotFoundError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.NOT_FOUND,
                        });
                    });
                });

                describe('when input: undefined', () => {
                    beforeAll(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureNotFoundError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.NOT_FOUND,
                        });
                    });
                });
            });
        });

        describe('when procedure callback: Callback<number, void> (testing nullish returns)', () => {
            beforeEach(() => {
                fn = jest.fn((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return;
                });

                procedureEndpoint = 'ws://127.0.0.1:44446';
                procedure = new Procedure(fn, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            afterEach(() => {
                procedure.unbind();
            });

            describe('when endpoint: correct', () => {
                beforeEach(() => {
                    callEndpoint = procedureEndpoint;
                });

                describe('when input: 0', () => {
                    beforeEach(() => {
                        input = 0;
                    });

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = jest.fn((data: unknown) => (x = data));
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).toHaveBeenCalledTimes(1);
                        expect(x).toEqual(0);
                    });

                    it('should resolve: undefined', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).resolves.toBeUndefined();
                    });

                    afterEach(() => {
                        input = undefined;
                    });

                    describe('when verbose: true', () => {
                        beforeEach(() => {
                            procedure.verbose = true;
                        });

                        it('should call console.log', async () => {
                            const log = jest
                                .spyOn(console, 'log')
                                .mockImplementation(
                                    consoleLogMockImplementation
                                );
                            await call(<string>callEndpoint, input);
                            expect(log).toHaveBeenCalledTimes(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                        });
                    });
                });

                describe("when input: 'foo'", () => {
                    beforeEach(() => {
                        input = 'foo';
                    });

                    it('should throw: ProcedureExecutionError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.EXECUTION_ERROR,
                        });
                    });

                    afterEach(() => {
                        input = undefined;
                    });
                });

                describe('when input: 1000', () => {
                    beforeEach(() => {
                        input = 1000;
                    });

                    it('should resolve: undefined', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).resolves.toBeUndefined();
                    });

                    afterEach(() => {
                        input = undefined;
                    });
                });

                describe('when input: undefined', () => {
                    beforeEach(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureExecutionError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.EXECUTION_ERROR,
                        });
                    });
                });

                describe('when ping: 100', () => {
                    describe('when input: 0', () => {
                        beforeEach(() => {
                            input = 0;
                        });

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => (x = data));
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, {
                                ping: 100,
                            });
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it('should resolve: undefined', async () => {
                            await expect(
                                call(<string>callEndpoint, input, { ping: 100 })
                            ).resolves.toBeUndefined();
                        });

                        afterEach(() => {
                            input = undefined;
                        });

                        describe('when verbose: true', () => {
                            beforeEach(() => {
                                procedure.verbose = true;
                            });

                            it('should call console.log', async () => {
                                const log = jest
                                    .spyOn(console, 'log')
                                    .mockImplementation(
                                        consoleLogMockImplementation
                                    );
                                await call(<string>callEndpoint, input, {
                                    ping: 100,
                                });
                                expect(log).toHaveBeenCalled();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                            });
                        });
                    });

                    describe("when input: 'foo'", () => {
                        beforeEach(() => {
                            input = 'foo';
                        });

                        it('should throw: ProcedureExecutionError', async () => {
                            await expect(
                                call(<string>callEndpoint, input, { ping: 100 })
                            ).rejects.toMatchObject({
                                code: ProcedureErrorCodes.EXECUTION_ERROR,
                            });
                        });

                        afterEach(() => {
                            input = undefined;
                        });
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => {
                            input = 1000;
                        });

                        it('should resolve: undefined', async () => {
                            await expect(
                                call(<string>callEndpoint, input, { ping: 100 })
                            ).resolves.toBeUndefined();
                        });

                        afterEach(() => {
                            input = undefined;
                        });
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => {
                            input = undefined;
                        });

                        it('should throw: ProcedureExecutionError', async () => {
                            await expect(
                                call(<string>callEndpoint, input, { ping: 100 })
                            ).rejects.toMatchObject({
                                code: ProcedureErrorCodes.EXECUTION_ERROR,
                            });
                        });
                    });
                });

                afterEach(() => (callEndpoint = undefined));
            });

            describe('when endpoint: incorrect', () => {
                beforeEach(() => {
                    callEndpoint = procedureEndpoint.substring(
                        0,
                        procedureEndpoint.length - 2
                    );
                });

                afterEach(() => {
                    callEndpoint = undefined;
                });

                describe('when input: 0', () => {
                    beforeAll(() => {
                        input = 0;
                    });

                    afterAll(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureNotFoundError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.NOT_FOUND,
                        });
                    });
                });

                describe("when input: 'foo'", () => {
                    beforeAll(() => {
                        input = 'foo';
                    });

                    afterAll(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureNotFoundError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.NOT_FOUND,
                        });
                    });
                });

                describe('when input: 1000', () => {
                    beforeAll(() => {
                        input = 1000;
                    });

                    afterAll(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureNotFoundError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.NOT_FOUND,
                        });
                    });
                });

                describe('when input: undefined', () => {
                    beforeAll(() => {
                        input = undefined;
                    });

                    it('should throw: ProcedureNotFoundError', async () => {
                        await expect(
                            call(<string>callEndpoint, input)
                        ).rejects.toMatchObject({
                            code: ProcedureErrorCodes.NOT_FOUND,
                        });
                    });
                });
            });
        });

        it.todo('optionalParameterSupport option works as intended');
        it.todo('ignoreUndefinedProperties option works as intended');
        it.todo('async callback completes as expected'); // completes normally, times out, throws error, infinite timeout, abortion signaled during execution, abortion signaled before execution...
    });
});
