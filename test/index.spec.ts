import { ExtensionCodec } from '@msgpack/msgpack';
import Procedure, { call, ping, tryPing, isPing, Callback } from '../src';
import { ProcedureInternalServerError } from '../src/errors';

describe('Procedure', () => {
    describe('constructor(endpoint: string, callback: Callback, options: Partial<ProcedureOptions>)', () => {
        let instance: Procedure;

        describe('when options.verbose: true', () => {
            beforeEach(() => { instance = new Procedure(x => x, { verbose: true }) });
            describe('verbose', () => it('should be: true', () => { expect(instance.verbose).toEqual(true) }));
        });

        describe('when options.verbose is false', () => {
            beforeEach(() => { instance = new Procedure(x => x, { verbose: false }) });
            describe('verbose', () => it('should be: false', () => { expect(instance.verbose).toEqual(false) }));
        });

        describe('when options.verbose: undefined', () => {
            beforeEach(() => { instance = new Procedure(x => x) });
            describe('verbose', () => it('should be: false', () => { expect(instance.verbose).toEqual(false) }));
        });

        describe('when options.workers: undefined', () => {
            beforeEach(() => { instance = new Procedure(x => x) });
            describe('workers', () => it('should be: 1', () => { expect(instance.workers).toEqual(1) }));
        });

        describe('when options.workers: NaN', () => {
            beforeEach(() => { instance = new Procedure(x => x, { workers: NaN }) });
            describe('workers', () => it('should be: 1', () => { expect(instance.workers).toEqual(1) }));
        });

        describe('when options.workers: Infinity', () => {
            beforeEach(() => { instance = new Procedure(x => x, { workers: Infinity }) });
            describe('workers', () => it('should be: 1', () => { expect(instance.workers).toEqual(1) }));
        });

        describe('when options.workers: < 1', () => {
            beforeEach(() => { instance = new Procedure(x => x, { workers: 0.8 }) });
            describe('workers', () => it('should be: 1', () => { expect(instance.workers).toEqual(1) }));
        });

        describe('when options.workers: 10', () => {
            beforeEach(() => { instance = new Procedure(x => x, { workers: 10 }) });
            describe('workers', () => it('should be: 10', () => { expect(instance.workers).toEqual(10) }));
        });

        describe('when options.extensionCodec: undefined', () => {
            beforeEach(() => { instance = new Procedure(x => x) });
            describe('extensionCodec', () => it(
                'should be: undefined',
                () => { expect(instance.extensionCodec).toBeUndefined() }
            ));
        })

        describe('when options.extensionCodec: instanceof ExtensionCodec', () => {
            beforeEach(
                () => { instance = new Procedure(x => x, { extensionCodec: new ExtensionCodec() }) }
            );
            describe('extensionCodec', () => it(
                'should be: instanceof ExtensionCodec',
                () => { expect(instance.extensionCodec).toBeInstanceOf(ExtensionCodec) }
            ));
        });
    });

    describe('set verbose(value: boolean)', () => {
        let instance: Procedure;
        beforeEach(() => { instance = new Procedure(x => x) });

        describe('when value: true', () => {
            beforeEach(() => { instance.verbose = true });
            describe('verbose', () => it('should be: true', () => { expect(instance.verbose).toEqual(true) }));
        });

        describe('when value: false', () => {
            beforeEach(() => { instance.verbose = false });
            describe('verbose', () => it('should be: false', () => { expect(instance.verbose).toEqual(false) }));
        });
    });

    describe('set extensionCodec(value: ExtensionCodec | undefined)', () => {
        let instance: Procedure;
        beforeEach(() => { instance = new Procedure(x => x) });

        describe('when value: undefined', () => {
            beforeEach(() => { instance.extensionCodec = undefined });
            describe('extensionCodec', () => it(
                'should be: undefined',
                () => { expect(instance.extensionCodec).toBeUndefined() }
            ));
        })

        describe('when value: instanceof ExtensionCodec', () => {
            beforeEach(() => { instance.extensionCodec = new ExtensionCodec() });
            describe('extensionCodec', () => it(
                'should be: instanceof ExtensionCodec',
                () => { expect(instance.extensionCodec).toBeInstanceOf(ExtensionCodec) }
            ));
        });
    });

    describe('set optionalParameterSupport(value: boolean)', () => {
        let instance: Procedure;
        beforeEach(() => { instance = new Procedure(x => x) });

        describe('when value: true', () => {
            beforeEach(() => { instance.optionalParameterSupport = true });
            describe('verbose', () => it(
                'should be: true',
                () => { expect(instance.optionalParameterSupport).toEqual(true) }
            ));
        });

        describe('when value: false', () => {
            beforeEach(() => instance.optionalParameterSupport = false);
            describe('verbose', () => it(
                'should be: false',
                () => { expect(instance.optionalParameterSupport).toEqual(false) }
            ));
        });
    });

    describe('set ignoreUndefinedProperties(value: boolean)', () => {
        let instance: Procedure;
        beforeEach(() => instance = new Procedure(x => x));

        describe('when value: true', () => {
            beforeEach(() => instance.ignoreUndefinedProperties = true);
            describe('verbose', () => it(
                'should be: true',
                () => { expect(instance.ignoreUndefinedProperties).toEqual(true) }
            ));
        });

        describe('when value: false', () => {
            beforeEach(() => instance.ignoreUndefinedProperties = false);
            describe('verbose', () => it(
                'should be: false',
                () => { expect(instance.ignoreUndefinedProperties).toEqual(false) }
            ));
        });
    });

    describe('bind(): this', () => {
        let instance: Procedure;
        beforeEach(() => instance = new Procedure(x => x));
        afterEach(() => { instance.unbind().removeAllListeners(); });

        it(
            'should return: this',
            () => { expect(instance.bind('inproc://foo')).toEqual(instance) }
        );

        describe('when endpoint: \'\'', () => {
            beforeEach(() => instance = new Procedure(x => x));

            describe('instance', () => it('should emit: \'error\'', () => {
                const error = jest.fn((error: unknown) => {
                    expect(error).toBeInstanceOf(ProcedureInternalServerError);
                    expect(error).toHaveProperty('data');
                    expect((<ProcedureInternalServerError>error).data).toHaveProperty('error');
                });
                instance.on('error', error).bind('');
                expect(error).toHaveBeenCalledTimes(1);
            }));

            describe('when verbose: true', () => {
                let error: jest.SpyInstance;
                beforeEach(() => {
                    instance = new Procedure(x => x);
                    instance.verbose = true;
                    error = jest.spyOn(console, 'error').mockImplementation();
                });
                describe('instance', () => it('should call console.error', () => {
                    instance.bind('');
                    expect(error).toHaveBeenCalledTimes(1);
                }));
                afterEach(() => {
                    instance.verbose = false;
                    error.mockReset();
                });
            });
        });

        describe('when endpoint: \'inproc://Procedure\'', () => {
            beforeEach(() => instance = new Procedure(x => x));
            describe('instance', () => it('should not emit: \'error\'', () => {
                const error = jest.fn();
                instance.on('error', error).bind('inproc://Procedure');
                expect(error).not.toHaveBeenCalled();
            }));

            describe('when already bound', () => {
                beforeEach(() => instance.bind('inproc://Procedure'));
                describe('instance', () => it('should emit: \'unbind\'', () => {
                    const unbind = jest.fn();
                    instance.on('unbind', unbind).bind('inproc://Procedure');
                    expect(unbind).toHaveBeenCalledTimes(1);
                }));
            });
        });
    });

    describe('unbind(): this', () => {
        let instance: Procedure;
        beforeEach(() => instance = new Procedure(x => x));

        it('should return: this', () => { expect(instance.unbind()).toEqual(instance) });

        describe('when instance bound to endpoint: \'inproc://Procedure\'', () => {
            beforeEach(() => {
                instance = new Procedure(x => x);
                instance.bind('inproc://Procedure');
            });
            describe('instance', () => it('should emit: \'unbind\'', () => {
                const unbind = jest.fn();
                instance.on('unbind', unbind).unbind();
                expect(unbind).toHaveBeenCalledTimes(1);
            }));

            describe('when verbose: true', () => {
                let log: jest.SpyInstance;

                beforeEach(() => {
                    instance.verbose = true;
                    log = jest.spyOn(console, 'log').mockImplementation();
                });
                describe('instance', () => it('should call console.log', () => {
                    instance.unbind();
                    expect(log).toHaveBeenCalledTimes(2);
                }));
                afterEach(() => {
                    instance.verbose = false;
                    log.mockReset();
                });
            });
        });
    });
});

describe('call(endpoint: string, input: Input | null, options: Partial<ProcedureCallOptions>): Promise<Output>', () => {
    let fn: Callback<unknown, unknown>;
    let procedure: Procedure<unknown, unknown>;
    let procedureEndpoint: string;
    let input: unknown;
    let callEndpoint: string | undefined;

    describe('INPROC tests', () => {
        describe(
            'when procedure callback: Callback<number, number> (simple accumulator function)',
            () => {
                beforeEach(() => {
                    let i = 0;
                    fn = jest.fn(<Callback<unknown, unknown>>((n: number) => {
                        if (typeof n !== 'number') {
                            throw new TypeError('Expected a number');
                        }

                        return i += n;
                    }));
                    procedureEndpoint = 'inproc://Procedure/Add';
                    procedure = new Procedure(fn, { workers: 3 });
                    procedure.bind(procedureEndpoint);
                });

                describe('when endpoint: correct', () => {
                    beforeEach(() => callEndpoint = procedureEndpoint);

                    describe('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input);
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it(
                            'should resolve: 0',
                            async () => { await expect(call(<string>callEndpoint, input)).resolves.toEqual(0) }
                        );

                        afterEach(() => input = undefined);

                        describe('when verbose: true', () => {
                            let log: jest.SpyInstance;
                            beforeEach(() => {
                                procedure.verbose = true;
                                log = jest.spyOn(console, 'log').mockImplementation();
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input);
                                expect(log).toHaveBeenCalledTimes(3);
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                log.mockReset();
                            });
                        });
                    });

                    describe('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it(
                            'should resolve: 1000',
                            async () => { await expect(call(<string>callEndpoint, input)).resolves.toEqual(input) }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );
                    });

                    describe('when ping: 100', () => {
                        describe('when input: 0', () => {
                            beforeEach(() => input = 0);

                            it('should emit: data, with parameter: 0', async () => {
                                let x: unknown = undefined;
                                const data = jest.fn((data: unknown) => x = data);
                                procedure.on('data', data);
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(data).toHaveBeenCalledTimes(1);
                                expect(x).toEqual(0);
                            });

                            it(
                                'should resolve: 0',
                                async () => { await expect(call(<string>callEndpoint, input, { ping: 100 })).resolves.toEqual(0) }
                            );

                            afterEach(() => input = undefined);

                            describe('when verbose: true', () => {
                                let log: jest.SpyInstance;
                                beforeEach(() => {
                                    procedure.verbose = true;
                                    log = jest.spyOn(console, 'log').mockImplementation();
                                });

                                it('should call console.log', async () => {
                                    await call(<string>callEndpoint, input, { ping: 100 });
                                    expect(log).toHaveBeenCalled();
                                });

                                afterEach(() => {
                                    procedure.verbose = false;
                                    log.mockReset();
                                });
                            });
                        });

                        describe('when input: \'foo\'', () => {
                            beforeEach(() => input = 'foo');

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: 1000', () => {
                            beforeEach(() => input = 1000);

                            it(
                                'should resolve: 1000',
                                async () => { await expect(call(<string>callEndpoint, input, { ping: 100 })).resolves.toEqual(input) }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: undefined', () => {
                            beforeEach(() => input = undefined);

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );
                        });
                    });

                    afterEach(() => callEndpoint = undefined);
                });

                // TODO: when endpoint: incorrect

                afterEach(() => procedure.unbind());
            }
        );

        describe(
            'when procedure callback: Callback<number, null> (testing nullish returns)',
            () => {
                beforeEach(() => {
                    fn = jest.fn(<Callback<unknown, unknown>>((n: number) => {
                        if (typeof n !== 'number') {
                            throw new TypeError('Expected a number');
                        }

                        return null;
                    }));
                    procedureEndpoint = 'inproc://Procedure/ReturnsNull';
                    procedure = new Procedure(fn, { workers: 3 });
                    procedure.bind(procedureEndpoint);
                });

                describe('when endpoint: correct', () => {
                    beforeEach(() => callEndpoint = procedureEndpoint);

                    describe('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input);
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);

                        describe('when verbose: true', () => {
                            let log: jest.SpyInstance;
                            beforeEach(() => {
                                procedure.verbose = true;
                                log = jest.spyOn(console, 'log').mockImplementation();
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input);
                                expect(log).toHaveBeenCalledTimes(3);
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                log.mockReset();
                            });
                        });
                    });

                    describe('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );
                    });

                    describe('when ping: 100', () => {
                        describe('when input: 0', () => {
                            beforeEach(() => input = 0);

                            it('should emit: data, with parameter: 0', async () => {
                                let x: unknown = undefined;
                                const data = jest.fn((data: unknown) => x = data);
                                procedure.on('data', data);
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(data).toHaveBeenCalledTimes(1);
                                expect(x).toEqual(0);
                            });

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);

                            describe('when verbose: true', () => {
                                let log: jest.SpyInstance;
                                beforeEach(() => {
                                    procedure.verbose = true;
                                    log = jest.spyOn(console, 'log').mockImplementation();
                                });

                                it('should call console.log', async () => {
                                    await call(<string>callEndpoint, input, { ping: 100 });
                                    expect(log).toHaveBeenCalled();
                                });

                                afterEach(() => {
                                    procedure.verbose = false;
                                    log.mockReset();
                                });
                            });
                        });

                        describe('when input: \'foo\'', () => {
                            beforeEach(() => input = 'foo');

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: 1000', () => {
                            beforeEach(() => input = 1000);

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: undefined', () => {
                            beforeEach(() => input = undefined);

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );
                        });
                    });

                    afterEach(() => callEndpoint = undefined);
                });

                // TODO: when endpoint: incorrect

                afterEach(() => procedure.unbind());
            }
        );

        describe(
            'when procedure callback: Callback<number, void> (testing nullish returns)',
            () => {
                beforeEach(() => {
                    fn = jest.fn(<Callback<unknown, unknown>>((n: number) => {
                        if (typeof n !== 'number') {
                            throw new TypeError('Expected a number');
                        }

                        return;
                    }));
                    procedureEndpoint = 'inproc://Procedure/ReturnsVoid';
                    procedure = new Procedure(fn, { workers: 3 });
                    procedure.bind(procedureEndpoint);
                });

                describe('when endpoint: correct', () => {
                    beforeEach(() => callEndpoint = procedureEndpoint);

                    describe('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input);
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);

                        describe('when verbose: true', () => {
                            let log: jest.SpyInstance;
                            beforeEach(() => {
                                procedure.verbose = true;
                                log = jest.spyOn(console, 'log').mockImplementation();
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input);
                                expect(log).toHaveBeenCalledTimes(3);
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                log.mockReset();
                            });
                        });
                    });

                    describe('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );
                    });

                    describe('when ping: 100', () => {
                        describe('when input: 0', () => {
                            beforeEach(() => input = 0);

                            it('should emit: data, with parameter: 0', async () => {
                                let x: unknown = undefined;
                                const data = jest.fn((data: unknown) => x = data);
                                procedure.on('data', data);
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(data).toHaveBeenCalledTimes(1);
                                expect(x).toEqual(0);
                            });

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);

                            describe('when verbose: true', () => {
                                let log: jest.SpyInstance;
                                beforeEach(() => {
                                    procedure.verbose = true;
                                    log = jest.spyOn(console, 'log').mockImplementation();
                                });

                                it('should call console.log', async () => {
                                    await call(<string>callEndpoint, input, { ping: 100 });
                                    expect(log).toHaveBeenCalled();
                                });

                                afterEach(() => {
                                    procedure.verbose = false;
                                    log.mockReset();
                                });
                            });
                        });

                        describe('when input: \'foo\'', () => {
                            beforeEach(() => input = 'foo');

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: 1000', () => {
                            beforeEach(() => input = 1000);

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: undefined', () => {
                            beforeEach(() => input = undefined);

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );
                        });
                    });

                    afterEach(() => callEndpoint = undefined);
                });

                // TODO: when endpoint: incorrect

                afterEach(() => procedure.unbind());
            }
        );
    });

    // TODO: test optionalParameterSupport option works as intended
    // TODO: test ignoreUndefinedProperties option works as intended

    // TODO: when callback asynchronous (completes normally, times out, throws error, infinite timeout, abortion signaled during execution, abortion signaled before execution)

    const winDescribe = process.platform === 'win32' ? describe : describe.skip;

    winDescribe('IPC tests', () => {
        describe(
            'when procedure callback: Callback<number, number> (simple accumulator function)',
            () => {
                beforeEach(() => {
                    let i = 0;
                    fn = jest.fn(<Callback<unknown, unknown>>((n: number) => {
                        if (typeof n !== 'number') {
                            throw new TypeError('Expected a number');
                        }

                        return i += n;
                    }));
                    procedureEndpoint = 'ipc://procedure/add';
                    procedure = new Procedure(fn, { workers: 3 });
                    procedure.bind(procedureEndpoint);
                });

                describe('when endpoint: correct', () => {
                    beforeEach(() => callEndpoint = procedureEndpoint);

                    describe('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input);
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it(
                            'should resolve: 0',
                            async () => { await expect(call(<string>callEndpoint, input)).resolves.toEqual(0) }
                        );

                        afterEach(() => input = undefined);

                        describe('when verbose: true', () => {
                            let log: jest.SpyInstance;
                            beforeEach(() => {
                                procedure.verbose = true;
                                log = jest.spyOn(console, 'log').mockImplementation();
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input);
                                expect(log).toHaveBeenCalledTimes(3);
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                log.mockReset();
                            });
                        });
                    });

                    describe('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it(
                            'should resolve: 1000',
                            async () => { await expect(call(<string>callEndpoint, input)).resolves.toEqual(input) }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );
                    });

                    describe('when ping: 100', () => {
                        describe('when input: 0', () => {
                            beforeEach(() => input = 0);

                            it('should emit: data, with parameter: 0', async () => {
                                let x: unknown = undefined;
                                const data = jest.fn((data: unknown) => x = data);
                                procedure.on('data', data);
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(data).toHaveBeenCalledTimes(1);
                                expect(x).toEqual(0);
                            });

                            it(
                                'should resolve: 0',
                                async () => { await expect(call(<string>callEndpoint, input, { ping: 100 })).resolves.toEqual(0) }
                            );

                            afterEach(() => input = undefined);

                            describe('when verbose: true', () => {
                                let log: jest.SpyInstance;
                                beforeEach(() => {
                                    procedure.verbose = true;
                                    log = jest.spyOn(console, 'log').mockImplementation();
                                });

                                it('should call console.log', async () => {
                                    await call(<string>callEndpoint, input, { ping: 100 });
                                    expect(log).toHaveBeenCalled();
                                });

                                afterEach(() => {
                                    procedure.verbose = false;
                                    log.mockReset();
                                });
                            });
                        });

                        describe('when input: \'foo\'', () => {
                            beforeEach(() => input = 'foo');

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: 1000', () => {
                            beforeEach(() => input = 1000);

                            it(
                                'should resolve: 1000',
                                async () => { await expect(call(<string>callEndpoint, input, { ping: 100 })).resolves.toEqual(input) }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: undefined', () => {
                            beforeEach(() => input = undefined);

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );
                        });
                    });

                    afterEach(() => callEndpoint = undefined);
                });

                // TODO: when endpoint: incorrect

                afterEach(() => procedure.unbind());
            }
        );

        describe(
            'when procedure callback: Callback<number, null> (testing nullish returns)',
            () => {
                beforeEach(() => {
                    fn = jest.fn(<Callback<unknown, unknown>>((n: number) => {
                        if (typeof n !== 'number') {
                            throw new TypeError('Expected a number');
                        }

                        return null;
                    }));
                    procedureEndpoint = 'ipc://procedure/returnsnull';
                    procedure = new Procedure(fn, { workers: 3 });
                    procedure.bind(procedureEndpoint);
                });

                describe('when endpoint: correct', () => {
                    beforeEach(() => callEndpoint = procedureEndpoint);

                    describe('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input);
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);

                        describe('when verbose: true', () => {
                            let log: jest.SpyInstance;
                            beforeEach(() => {
                                procedure.verbose = true;
                                log = jest.spyOn(console, 'log').mockImplementation();
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input);
                                expect(log).toHaveBeenCalledTimes(3);
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                log.mockReset();
                            });
                        });
                    });

                    describe('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );
                    });

                    describe('when ping: 100', () => {
                        describe('when input: 0', () => {
                            beforeEach(() => input = 0);

                            it('should emit: data, with parameter: 0', async () => {
                                let x: unknown = undefined;
                                const data = jest.fn((data: unknown) => x = data);
                                procedure.on('data', data);
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(data).toHaveBeenCalledTimes(1);
                                expect(x).toEqual(0);
                            });

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);

                            describe('when verbose: true', () => {
                                let log: jest.SpyInstance;
                                beforeEach(() => {
                                    procedure.verbose = true;
                                    log = jest.spyOn(console, 'log').mockImplementation();
                                });

                                it('should call console.log', async () => {
                                    await call(<string>callEndpoint, input, { ping: 100 });
                                    expect(log).toHaveBeenCalled();
                                });

                                afterEach(() => {
                                    procedure.verbose = false;
                                    log.mockReset();
                                });
                            });
                        });

                        describe('when input: \'foo\'', () => {
                            beforeEach(() => input = 'foo');

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: 1000', () => {
                            beforeEach(() => input = 1000);

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: undefined', () => {
                            beforeEach(() => input = undefined);

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );
                        });
                    });

                    afterEach(() => callEndpoint = undefined);
                });

                // TODO: when endpoint: incorrect

                afterEach(() => procedure.unbind());
            }
        );

        describe(
            'when procedure callback: Callback<number, void> (testing nullish returns)',
            () => {
                beforeEach(() => {
                    fn = jest.fn(<Callback<unknown, unknown>>((n: number) => {
                        if (typeof n !== 'number') {
                            throw new TypeError('Expected a number');
                        }

                        return;
                    }));
                    procedureEndpoint = 'ipc://procedure/returnsvoid';
                    procedure = new Procedure(fn, { workers: 3 });
                    procedure.bind(procedureEndpoint);
                });

                describe('when endpoint: correct', () => {
                    beforeEach(() => callEndpoint = procedureEndpoint);

                    describe('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input);
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);

                        describe('when verbose: true', () => {
                            let log: jest.SpyInstance;
                            beforeEach(() => {
                                procedure.verbose = true;
                                log = jest.spyOn(console, 'log').mockImplementation();
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input);
                                expect(log).toHaveBeenCalledTimes(3);
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                log.mockReset();
                            });
                        });
                    });

                    describe('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );
                    });

                    describe('when ping: 100', () => {
                        describe('when input: 0', () => {
                            beforeEach(() => input = 0);

                            it('should emit: data, with parameter: 0', async () => {
                                let x: unknown = undefined;
                                const data = jest.fn((data: unknown) => x = data);
                                procedure.on('data', data);
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(data).toHaveBeenCalledTimes(1);
                                expect(x).toEqual(0);
                            });

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);

                            describe('when verbose: true', () => {
                                let log: jest.SpyInstance;
                                beforeEach(() => {
                                    procedure.verbose = true;
                                    log = jest.spyOn(console, 'log').mockImplementation();
                                });

                                it('should call console.log', async () => {
                                    await call(<string>callEndpoint, input, { ping: 100 });
                                    expect(log).toHaveBeenCalled();
                                });

                                afterEach(() => {
                                    procedure.verbose = false;
                                    log.mockReset();
                                });
                            });
                        });

                        describe('when input: \'foo\'', () => {
                            beforeEach(() => input = 'foo');

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: 1000', () => {
                            beforeEach(() => input = 1000);

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: undefined', () => {
                            beforeEach(() => input = undefined);

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );
                        });
                    });

                    afterEach(() => callEndpoint = undefined);
                });

                // TODO: when endpoint: incorrect

                afterEach(() => procedure.unbind());
            }
        );
    });

    describe('TCP tests', () => {
        describe(
            'when procedure callback: Callback<number, number> (simple accumulator function)',
            () => {
                beforeEach(() => {
                    let i = 0;
                    fn = jest.fn(<Callback<unknown, unknown>>((n: number) => {
                        if (typeof n !== 'number') {
                            throw new TypeError('Expected a number');
                        }

                        return i += n;
                    }));
                    procedureEndpoint = 'tcp://127.0.0.1:33333';
                    procedure = new Procedure(fn, { workers: 3 });
                    procedure.bind(procedureEndpoint);
                });

                describe('when endpoint: correct', () => {
                    beforeEach(() => callEndpoint = procedureEndpoint);

                    describe('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input);
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it(
                            'should resolve: 0',
                            async () => { await expect(call(<string>callEndpoint, input)).resolves.toEqual(0) }
                        );

                        afterEach(() => input = undefined);

                        describe('when verbose: true', () => {
                            let log: jest.SpyInstance;
                            beforeEach(() => {
                                procedure.verbose = true;
                                log = jest.spyOn(console, 'log').mockImplementation();
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input);
                                expect(log).toHaveBeenCalledTimes(3);
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                log.mockReset();
                            });
                        });
                    });

                    describe('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it(
                            'should resolve: 1000',
                            async () => { await expect(call(<string>callEndpoint, input)).resolves.toEqual(input) }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );
                    });

                    describe('when ping: 100', () => {
                        describe('when input: 0', () => {
                            beforeEach(() => input = 0);

                            it('should emit: data, with parameter: 0', async () => {
                                let x: unknown = undefined;
                                const data = jest.fn((data: unknown) => x = data);
                                procedure.on('data', data);
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(data).toHaveBeenCalledTimes(1);
                                expect(x).toEqual(0);
                            });

                            it(
                                'should resolve: 0',
                                async () => { await expect(call(<string>callEndpoint, input, { ping: 100 })).resolves.toEqual(0) }
                            );

                            afterEach(() => input = undefined);

                            describe('when verbose: true', () => {
                                let log: jest.SpyInstance;
                                beforeEach(() => {
                                    procedure.verbose = true;
                                    log = jest.spyOn(console, 'log').mockImplementation();
                                });

                                it('should call console.log', async () => {
                                    await call(<string>callEndpoint, input, { ping: 100 });
                                    expect(log).toHaveBeenCalled();
                                });

                                afterEach(() => {
                                    procedure.verbose = false;
                                    log.mockReset();
                                });
                            });
                        });

                        describe('when input: \'foo\'', () => {
                            beforeEach(() => input = 'foo');

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: 1000', () => {
                            beforeEach(() => input = 1000);

                            it(
                                'should resolve: 1000',
                                async () => { await expect(call(<string>callEndpoint, input, { ping: 100 })).resolves.toEqual(input) }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: undefined', () => {
                            beforeEach(() => input = undefined);

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );
                        });
                    });

                    afterEach(() => callEndpoint = undefined);
                });

                // TODO: when endpoint: incorrect

                afterEach(() => procedure.unbind());
            }
        );

        describe(
            'when procedure callback: Callback<number, null> (testing nullish returns)',
            () => {
                beforeEach(() => {
                    fn = jest.fn(<Callback<unknown, unknown>>((n: number) => {
                        if (typeof n !== 'number') {
                            throw new TypeError('Expected a number');
                        }

                        return null;
                    }));
                    procedureEndpoint = 'tcp://127.0.0.1:33334';
                    procedure = new Procedure(fn, { workers: 3 });
                    procedure.bind(procedureEndpoint);
                });

                describe('when endpoint: correct', () => {
                    beforeEach(() => callEndpoint = procedureEndpoint);

                    describe('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input);
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);

                        describe('when verbose: true', () => {
                            let log: jest.SpyInstance;
                            beforeEach(() => {
                                procedure.verbose = true;
                                log = jest.spyOn(console, 'log').mockImplementation();
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input);
                                expect(log).toHaveBeenCalledTimes(3);
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                log.mockReset();
                            });
                        });
                    });

                    describe('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );
                    });

                    describe('when ping: 100', () => {
                        describe('when input: 0', () => {
                            beforeEach(() => input = 0);

                            it('should emit: data, with parameter: 0', async () => {
                                let x: unknown = undefined;
                                const data = jest.fn((data: unknown) => x = data);
                                procedure.on('data', data);
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(data).toHaveBeenCalledTimes(1);
                                expect(x).toEqual(0);
                            });

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);

                            describe('when verbose: true', () => {
                                let log: jest.SpyInstance;
                                beforeEach(() => {
                                    procedure.verbose = true;
                                    log = jest.spyOn(console, 'log').mockImplementation();
                                });

                                it('should call console.log', async () => {
                                    await call(<string>callEndpoint, input, { ping: 100 });
                                    expect(log).toHaveBeenCalled();
                                });

                                afterEach(() => {
                                    procedure.verbose = false;
                                    log.mockReset();
                                });
                            });
                        });

                        describe('when input: \'foo\'', () => {
                            beforeEach(() => input = 'foo');

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: 1000', () => {
                            beforeEach(() => input = 1000);

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: undefined', () => {
                            beforeEach(() => input = undefined);

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );
                        });
                    });

                    afterEach(() => callEndpoint = undefined);
                });

                // TODO: when endpoint: incorrect

                afterEach(() => procedure.unbind());
            }
        );

        describe(
            'when procedure callback: Callback<number, void> (testing nullish returns)',
            () => {
                beforeEach(() => {
                    fn = jest.fn(<Callback<unknown, unknown>>((n: number) => {
                        if (typeof n !== 'number') {
                            throw new TypeError('Expected a number');
                        }

                        return;
                    }));
                    procedureEndpoint = 'tcp://127.0.0.1:33335';
                    procedure = new Procedure(fn, { workers: 3 });
                    procedure.bind(procedureEndpoint);
                });

                describe('when endpoint: correct', () => {
                    beforeEach(() => callEndpoint = procedureEndpoint);

                    describe('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input);
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);

                        describe('when verbose: true', () => {
                            let log: jest.SpyInstance;
                            beforeEach(() => {
                                procedure.verbose = true;
                                log = jest.spyOn(console, 'log').mockImplementation();
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input);
                                expect(log).toHaveBeenCalledTimes(3);
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                log.mockReset();
                            });
                        });
                    });

                    describe('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );
                    });

                    describe('when ping: 100', () => {
                        describe('when input: 0', () => {
                            beforeEach(() => input = 0);

                            it('should emit: data, with parameter: 0', async () => {
                                let x: unknown = undefined;
                                const data = jest.fn((data: unknown) => x = data);
                                procedure.on('data', data);
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(data).toHaveBeenCalledTimes(1);
                                expect(x).toEqual(0);
                            });

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);

                            describe('when verbose: true', () => {
                                let log: jest.SpyInstance;
                                beforeEach(() => {
                                    procedure.verbose = true;
                                    log = jest.spyOn(console, 'log').mockImplementation();
                                });

                                it('should call console.log', async () => {
                                    await call(<string>callEndpoint, input, { ping: 100 });
                                    expect(log).toHaveBeenCalled();
                                });

                                afterEach(() => {
                                    procedure.verbose = false;
                                    log.mockReset();
                                });
                            });
                        });

                        describe('when input: \'foo\'', () => {
                            beforeEach(() => input = 'foo');

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: 1000', () => {
                            beforeEach(() => input = 1000);

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: undefined', () => {
                            beforeEach(() => input = undefined);

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );
                        });
                    });

                    afterEach(() => callEndpoint = undefined);
                });

                // TODO: when endpoint: incorrect

                afterEach(() => procedure.unbind());
            }
        );
    });

    describe('WS tests', () => {
        describe(
            'when procedure callback: Callback<number, number> (simple accumulator function)',
            () => {
                beforeEach(() => {
                    let i = 0;
                    fn = jest.fn(<Callback<unknown, unknown>>((n: number) => {
                        if (typeof n !== 'number') {
                            throw new TypeError('Expected a number');
                        }

                        return i += n;
                    }));
                    procedureEndpoint = 'ws://127.0.0.1:33333';
                    procedure = new Procedure(fn, { workers: 3 });
                    procedure.bind(procedureEndpoint);
                });

                describe('when endpoint: correct', () => {
                    beforeEach(() => callEndpoint = procedureEndpoint);

                    describe('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input);
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it(
                            'should resolve: 0',
                            async () => { await expect(call(<string>callEndpoint, input)).resolves.toEqual(0) }
                        );

                        afterEach(() => input = undefined);

                        describe('when verbose: true', () => {
                            let log: jest.SpyInstance;
                            beforeEach(() => {
                                procedure.verbose = true;
                                log = jest.spyOn(console, 'log').mockImplementation();
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input);
                                expect(log).toHaveBeenCalledTimes(3);
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                log.mockReset();
                            });
                        });
                    });

                    describe('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it(
                            'should resolve: 1000',
                            async () => { await expect(call(<string>callEndpoint, input)).resolves.toEqual(input) }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );
                    });

                    describe('when ping: 100', () => {
                        describe('when input: 0', () => {
                            beforeEach(() => input = 0);

                            it('should emit: data, with parameter: 0', async () => {
                                let x: unknown = undefined;
                                const data = jest.fn((data: unknown) => x = data);
                                procedure.on('data', data);
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(data).toHaveBeenCalledTimes(1);
                                expect(x).toEqual(0);
                            });

                            it(
                                'should resolve: 0',
                                async () => { await expect(call(<string>callEndpoint, input, { ping: 100 })).resolves.toEqual(0) }
                            );

                            afterEach(() => input = undefined);

                            describe('when verbose: true', () => {
                                let log: jest.SpyInstance;
                                beforeEach(() => {
                                    procedure.verbose = true;
                                    log = jest.spyOn(console, 'log').mockImplementation();
                                });

                                it('should call console.log', async () => {
                                    await call(<string>callEndpoint, input, { ping: 100 });
                                    expect(log).toHaveBeenCalled();
                                });

                                afterEach(() => {
                                    procedure.verbose = false;
                                    log.mockReset();
                                });
                            });
                        });

                        describe('when input: \'foo\'', () => {
                            beforeEach(() => input = 'foo');

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: 1000', () => {
                            beforeEach(() => input = 1000);

                            it(
                                'should resolve: 1000',
                                async () => { await expect(call(<string>callEndpoint, input, { ping: 100 })).resolves.toEqual(input) }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: undefined', () => {
                            beforeEach(() => input = undefined);

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );
                        });
                    });

                    afterEach(() => callEndpoint = undefined);
                });

                // TODO: when endpoint: incorrect

                afterEach(() => procedure.unbind());
            }
        );

        describe(
            'when procedure callback: Callback<number, null> (testing nullish returns)',
            () => {
                beforeEach(() => {
                    fn = jest.fn(<Callback<unknown, unknown>>((n: number) => {
                        if (typeof n !== 'number') {
                            throw new TypeError('Expected a number');
                        }

                        return null;
                    }));

                    procedureEndpoint = 'ws://127.0.0.1:33334';
                    procedure = new Procedure(fn, { workers: 3 });
                    procedure.bind(procedureEndpoint);
                });

                describe('when endpoint: correct', () => {
                    beforeEach(() => callEndpoint = procedureEndpoint);

                    describe('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input);
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);

                        describe('when verbose: true', () => {
                            let log: jest.SpyInstance;
                            beforeEach(() => {
                                procedure.verbose = true;
                                log = jest.spyOn(console, 'log').mockImplementation();
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input);
                                expect(log).toHaveBeenCalledTimes(3);
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                log.mockReset();
                            });
                        });
                    });

                    describe('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );
                    });

                    describe('when ping: 100', () => {
                        describe('when input: 0', () => {
                            beforeEach(() => input = 0);

                            it('should emit: data, with parameter: 0', async () => {
                                let x: unknown = undefined;
                                const data = jest.fn((data: unknown) => x = data);
                                procedure.on('data', data);
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(data).toHaveBeenCalledTimes(1);
                                expect(x).toEqual(0);
                            });

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);

                            describe('when verbose: true', () => {
                                let log: jest.SpyInstance;
                                beforeEach(() => {
                                    procedure.verbose = true;
                                    log = jest.spyOn(console, 'log').mockImplementation();
                                });

                                it('should call console.log', async () => {
                                    await call(<string>callEndpoint, input, { ping: 100 });
                                    expect(log).toHaveBeenCalled();
                                });

                                afterEach(() => {
                                    procedure.verbose = false;
                                    log.mockReset();
                                });
                            });
                        });

                        describe('when input: \'foo\'', () => {
                            beforeEach(() => input = 'foo');

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: 1000', () => {
                            beforeEach(() => input = 1000);

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: undefined', () => {
                            beforeEach(() => input = undefined);

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );
                        });
                    });

                    afterEach(() => callEndpoint = undefined);
                });

                // TODO: when endpoint: incorrect

                afterEach(() => procedure.unbind());
            }
        );

        describe(
            'when procedure callback: Callback<number, void> (testing nullish returns)',
            () => {
                beforeEach(() => {
                    fn = jest.fn(<Callback<unknown, unknown>>((n: number) => {
                        if (typeof n !== 'number') {
                            throw new TypeError('Expected a number');
                        }

                        return;
                    }));

                    procedureEndpoint = 'ws://127.0.0.1:33335';
                    procedure = new Procedure(fn, { workers: 3 });
                    procedure.bind(procedureEndpoint);
                });

                describe('when endpoint: correct', () => {
                    beforeEach(() => callEndpoint = procedureEndpoint);

                    describe('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = jest.fn((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input);
                            expect(data).toHaveBeenCalledTimes(1);
                            expect(x).toEqual(0);
                        });

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);

                        describe('when verbose: true', () => {
                            let log: jest.SpyInstance;
                            beforeEach(() => {
                                procedure.verbose = true;
                                log = jest.spyOn(console, 'log').mockImplementation();
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input);
                                expect(log).toHaveBeenCalledTimes(3);
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                log.mockReset();
                            });
                        });
                    });

                    describe('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it(
                            'should resolve: undefined',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .resolves.toBeUndefined()
                            }
                        );

                        afterEach(() => input = undefined);
                    });

                    describe('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it(
                            'should throw: ProcedureExecutionError',
                            async () => {
                                await expect(call(<string>callEndpoint, input))
                                    .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                            }
                        );
                    });

                    describe('when ping: 100', () => {
                        describe('when input: 0', () => {
                            beforeEach(() => input = 0);

                            it('should emit: data, with parameter: 0', async () => {
                                let x: unknown = undefined;
                                const data = jest.fn((data: unknown) => x = data);
                                procedure.on('data', data);
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(data).toHaveBeenCalledTimes(1);
                                expect(x).toEqual(0);
                            });

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);

                            describe('when verbose: true', () => {
                                let log: jest.SpyInstance;
                                beforeEach(() => {
                                    procedure.verbose = true;
                                    log = jest.spyOn(console, 'log').mockImplementation();
                                });

                                it('should call console.log', async () => {
                                    await call(<string>callEndpoint, input, { ping: 100 });
                                    expect(log).toHaveBeenCalled();
                                });

                                afterEach(() => {
                                    procedure.verbose = false;
                                    log.mockReset();
                                });
                            });
                        });

                        describe('when input: \'foo\'', () => {
                            beforeEach(() => input = 'foo');

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: 1000', () => {
                            beforeEach(() => input = 1000);

                            it(
                                'should resolve: undefined',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .resolves.toBeUndefined()
                                }
                            );

                            afterEach(() => input = undefined);
                        });

                        describe('when input: undefined', () => {
                            beforeEach(() => input = undefined);

                            it(
                                'should throw: ProcedureExecutionError',
                                async () => {
                                    await expect(call(<string>callEndpoint, input, { ping: 100 }))
                                        .rejects.toMatchObject({ message: 'An unhandled exception was thrown during procedure execution.' })
                                }
                            );
                        });
                    });

                    afterEach(() => callEndpoint = undefined);
                });

                // TODO: when endpoint: incorrect

                afterEach(() => procedure.unbind());
            }
        );
    });
});

describe('ping(endpoint: string, timeout: number | undefined = 100, signal?: AbortSignal): Promise<boolean>', () => {
    let fn: Callback<unknown, unknown>;
    let procedure: Procedure<unknown, unknown>;
    let procedureEndpoint: string;
    let pingEndpoint: string | undefined;

    describe(
        'when procedure callback: Callback<number, number> (simple accumulator function)',
        () => {
            beforeEach(() => {
                let i = 0;
                fn = jest.fn(<Callback<unknown, unknown>>((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return i += n;
                }));

                procedureEndpoint = 'inproc://Procedure/Add';
                procedure = new Procedure(fn, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            describe('when endpoint: correct', () => {
                beforeEach(() => pingEndpoint = procedureEndpoint);

                it('should not emit: data', async () => {
                    const data = jest.fn();
                    procedure.on('data', data);
                    await ping(<string>pingEndpoint);
                    expect(data).not.toHaveBeenCalled();
                });

                it(
                    'should not be rejected',
                    async () => { await expect(ping(<string>pingEndpoint)).resolves.toBeUndefined() }
                );

                describe('when signal: already aborted AbortSignal', () => {
                    let ac: AbortController;

                    beforeEach(() => {
                        ac = new AbortController();
                        ac.abort();
                    });

                    it(
                        'should throw: ProcedureCancelledError',
                        async () => {
                            await expect(ping(<string>pingEndpoint, 500, false, ac.signal))
                                .rejects.toMatchObject({ message: 'The operation was cancelled by the client.' })
                        }
                    );
                });
            });

            // TODO: when endpoint: incorrect
            // TODO: when timeout infinity, NaN
            // TODO: when abortion signaled during ping

            afterEach(() => procedure.unbind());
        }
    );
});

describe('tryPing(endpoint: string, timeout: number | undefined = 100, signal?: AbortSignal): Promise<boolean>', () => {
    let fn: Callback<unknown, unknown>;

    let procedure: Procedure<unknown, unknown>;
    let procedureEndpoint: string;
    let pingEndpoint: string | undefined;

    describe(
        'when procedure callback: Callback<number, number> (simple accumulator function)',
        () => {
            beforeEach(() => {
                let i = 0;
                fn = jest.fn(<Callback<unknown, unknown>>((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return i += n;
                }));

                procedureEndpoint = 'inproc://Procedure/Add';
                procedure = new Procedure(fn, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            describe('when endpoint: correct', () => {
                beforeEach(() => pingEndpoint = procedureEndpoint);

                it('should not emit: data', async () => {
                    const data = jest.fn();
                    procedure.on('data', data);
                    await tryPing(<string>pingEndpoint);
                    expect(data).not.toHaveBeenCalled();
                });

                it(
                    'should resolve: true',
                    async () => { await expect(tryPing(<string>pingEndpoint)).resolves.toEqual(true) }
                );

                describe('when signal: already aborted AbortSignal', () => {
                    let ac: AbortController;

                    beforeEach(() => {
                        ac = new AbortController();
                        ac.abort();
                    });

                    it(
                        'should resolve: false',
                        async () => {
                            await expect(tryPing(<string>pingEndpoint, 500, false, ac.signal))
                                .resolves.toEqual(false)
                        }
                    );
                });
            });

            // TODO: when endpoint: incorrect
            // TODO: when timeout infinity, NaN
            // TODO: when abortion signaled during ping

            afterEach(() => procedure.unbind());
        }
    );
});

// TODO: thoroughly test cached pings

describe('isPing(object: unknown): object is Ping', () => {
    let object: unknown;

    describe('when object: { ping: \'foobar\' }', () => {
        beforeEach(() => object = { ping: 'foobar' });
        it('should return: true', () => { expect(isPing(object)).toEqual(true) });
    });

    describe('when object: undefined', () => {
        beforeEach(() => object = undefined);
        it('should return: false', () => { expect(isPing(object)).toEqual(false) });
    });

    describe('when object: null', () => {
        beforeEach(() => object = null);
        it('should return: false', () => { expect(isPing(object)).toEqual(false) });
    });

    describe('when object: instanceof TypeError', () => {
        beforeEach(() => object = new TypeError());
        it('should return: true', () => { expect(isPing(object)).toEqual(false) });
    });

    describe('when object: { name: \'Foo\', message: \'Bar\' }', () => {
        beforeEach(() => object = { name: 'Foo', message: 'Bar' });
        it('should return: false', () => { expect(isPing(object)).toEqual(false) });
    });
});

// TODO: test connecting to a Procedure's bound endpoint with a socket and throwing random data at it
