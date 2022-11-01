import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    jest,
} from '@jest/globals';

import Procedure, { tryPing } from '../../../src';

describe('tryPing(endpoint: string, timeout: number | undefined = 100, signal?: AbortSignal): Promise<boolean>', () => {
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

            it('should not emit: data', async () => {
                const data = jest.fn();
                procedure.on('data', data);
                await tryPing(<string>pingEndpoint);
                expect(data).not.toHaveBeenCalled();
                procedure.removeListener('data', data);
            });

            it('should resolve: true', async () => {
                await expect(tryPing(<string>pingEndpoint)).resolves.toEqual(
                    true
                );
            });

            describe('when signal: already aborted AbortSignal', () => {
                let ac: AbortController;

                beforeEach(() => {
                    ac = new AbortController();
                    ac.abort();
                });

                it('should resolve: false', async () => {
                    await expect(
                        tryPing(<string>pingEndpoint, 500, false, ac.signal)
                    ).resolves.toEqual(false);
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
                await tryPing(<string>pingEndpoint);
                expect(data).not.toHaveBeenCalled();
                procedure.removeListener('data', data);
            });

            it('should resolve: false', async () => {
                await expect(tryPing(<string>pingEndpoint)).resolves.toEqual(
                    false
                );
            });

            describe('when signal: already aborted AbortSignal', () => {
                let ac: AbortController;

                beforeEach(() => {
                    ac = new AbortController();
                    ac.abort();
                });

                it('should resolve: false', async () => {
                    await expect(
                        tryPing(<string>pingEndpoint, 500, false, ac.signal)
                    ).resolves.toEqual(false);
                });
            });
        });

        it.todo('when timeout: Infinity');
        it.todo('when timeout: NaN');
        it.todo('when abortion signaled during tryPing');
    });
});
