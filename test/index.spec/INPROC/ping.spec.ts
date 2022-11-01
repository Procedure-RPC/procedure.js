import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    jest,
} from '@jest/globals';

import Procedure, { ping } from '../../../src';
import { ProcedureErrorCodes } from '../../../src/errors';

describe('ping(endpoint: string, timeout: number | undefined = 100, signal?: AbortSignal): Promise<boolean>', () => {
    let fn: ReturnType<typeof jest.fn>;
    let procedure: Procedure<unknown, unknown>;
    let procedureEndpoint: string;
    let pingEndpoint: string | undefined;

    describe('when procedure callback: Callback<number, number> (simple accumulator function)', () => {
        beforeEach(() => {
            let i = 0;
            fn = jest.fn((n: number) => {
                if (typeof n !== 'number') {
                    throw new TypeError('Expected a number');
                }

                return (i += n);
            });

            procedureEndpoint = 'inproc://Procedure/Add';
            procedure = new Procedure(fn, { workers: 3 });
            procedure.bind(procedureEndpoint);
        });

        afterEach(() => {
            procedure.unbind();
        });

        describe('when endpoint: correct', () => {
            beforeEach(() => {
                pingEndpoint = procedureEndpoint;
            });

            afterEach(() => {
                pingEndpoint = undefined;
            });

            it('should not emit: data', async () => {
                const data = jest.fn();
                procedure.on('data', data);
                await ping(<string>pingEndpoint);
                expect(data).not.toHaveBeenCalled();
            });

            it('should not be rejected', async () => {
                await expect(
                    ping(<string>pingEndpoint)
                ).resolves.toBeUndefined();
            });

            describe('when signal: already aborted AbortSignal', () => {
                let ac: AbortController;

                beforeEach(() => {
                    ac = new AbortController();
                    ac.abort();
                });

                it('should throw: ProcedureCancelledError', async () => {
                    await expect(
                        ping(<string>pingEndpoint, 500, false, ac.signal)
                    ).rejects.toMatchObject({
                        code: ProcedureErrorCodes.CANCELLED,
                    });
                });
            });
        });

        describe('when endpoint: incorrect', () => {
            beforeEach(() => {
                pingEndpoint = procedureEndpoint.substring(
                    0,
                    procedureEndpoint.length - 2
                );
            });

            afterEach(() => {
                pingEndpoint = undefined;
            });

            it('should not emit: data', async () => {
                const data = jest.fn();
                procedure.on('data', data);
                await expect(ping(<string>pingEndpoint)).rejects.toMatchObject({
                    code: ProcedureErrorCodes.TIMED_OUT,
                });
                expect(data).not.toHaveBeenCalled();
                procedure.removeListener('data', data);
            });

            it('should throw: ProcedureTimedOutError', async () => {
                await expect(ping(<string>pingEndpoint)).rejects.toMatchObject({
                    code: ProcedureErrorCodes.TIMED_OUT,
                });
            });

            describe('when signal: already aborted AbortSignal', () => {
                let ac: AbortController;

                beforeEach(() => {
                    ac = new AbortController();
                    ac.abort();
                });

                it('should throw: ProcedureCancelledError', async () => {
                    await expect(
                        ping(<string>pingEndpoint, 500, false, ac.signal)
                    ).rejects.toMatchObject({
                        code: ProcedureErrorCodes.CANCELLED,
                    });
                });
            });
        });

        it.todo('when timeout: Infinity');
        it.todo('when timeout: NaN');
        it.todo('when abortion signaled during ping');
    });
});
