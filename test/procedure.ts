import 'mocha'
import chai, { expect } from 'chai'
import spies from 'chai-spies'
import chaiAsPromised from 'chai-as-promised'
import Procedure, { call, ping, tryPing, Callback, isPing } from '../src'
import { ExtensionCodec } from '@msgpack/msgpack'
import { ProcedureInternalServerError } from '../src/errors'

chai.use(spies);
chai.use(chaiAsPromised);

// TODO: thoroughly test cached pings

describe('Procedure', () => {
    describe('constructor(endpoint: string, callback: Callback, options: Partial<ProcedureOptions>)', () => {
        let instance: Procedure;

        context('when options.verbose: true', () => {
            beforeEach(() => instance = new Procedure(x => x, { verbose: true }));
            describe('verbose', () => it('should be: true', () => expect(instance.verbose).to.be.true));
        });

        context('when options.verbose is false', () => {
            beforeEach(() => instance = new Procedure(x => x, { verbose: false }));
            describe('verbose', () => it('should be: false', () => expect(instance.verbose).to.be.false));
        });

        context('when options.verbose: undefined', () => {
            beforeEach(() => instance = new Procedure(x => x));
            describe('verbose', () => it('should be: false', () => expect(instance.verbose).to.be.false));
        });

        context('when options.workers: undefined', () => {
            beforeEach(() => instance = new Procedure(x => x));
            describe('workers', () => it('should be: 1', () => expect(instance.workers).to.equal(1)));
        });

        context('when options.workers: NaN', () => {
            beforeEach(() => instance = new Procedure(x => x, { workers: NaN }));
            describe('workers', () => it('should be: 1', () => expect(instance.workers).to.equal(1)));
        });

        context('when options.workers: Infinity', () => {
            beforeEach(() => instance = new Procedure(x => x, { workers: Infinity }));
            describe('workers', () => it('should be: 1', () => expect(instance.workers).to.equal(1)));
        });

        context('when options.workers: < 1', () => {
            beforeEach(() => instance = new Procedure(x => x, { workers: 0.8 }));
            describe('workers', () => it('should be: 1', () => expect(instance.workers).to.equal(1)));
        });

        context('when options.workers: 10', () => {
            beforeEach(() => instance = new Procedure(x => x, { workers: 10 }));
            describe('workers', () => it('should be: 10', () => expect(instance.workers).to.equal(10)));
        });

        context('when options.extensionCodec: undefined', () => {
            beforeEach(() => instance = new Procedure(x => x));
            describe('extensionCodec', () => it('should be: undefined', () => expect(instance.extensionCodec).to.be.undefined));
        })

        context('when options.extensionCodec: instanceof ExtensionCodec', () => {
            beforeEach(() => instance = new Procedure(x => x, { extensionCodec: new ExtensionCodec() }));
            describe('extensionCodec', () => it('should be: instanceof ExtensionCodec', () => expect(instance.extensionCodec).to.be.instanceof(ExtensionCodec)));
        });
    });

    describe('set verbose(value: boolean)', () => {
        let instance: Procedure;
        beforeEach(() => instance = new Procedure(x => x));

        context('when value: true', () => {
            beforeEach(() => instance.verbose = true);
            describe('verbose', () => it('should be: true', () => expect(instance.verbose).to.be.true));
        });

        context('when value: false', () => {
            beforeEach(() => instance.verbose = false);
            describe('verbose', () => it('should be: false', () => expect(instance.verbose).to.be.false));
        });
    });

    describe('set extensionCodec(value: ExtensionCodec | undefined)', () => {
        let instance: Procedure;
        beforeEach(() => instance = new Procedure(x => x));

        context('when value: undefined', () => {
            beforeEach(() => instance.extensionCodec = undefined);
            describe('extensionCodec', () => it('should be: undefined', () => expect(instance.extensionCodec).to.be.undefined));
        })

        context('when value: instanceof ExtensionCodec', () => {
            beforeEach(() => instance.extensionCodec = new ExtensionCodec());
            describe('extensionCodec', () => it('should be: instanceof ExtensionCodec', () => expect(instance.extensionCodec).to.be.instanceof(ExtensionCodec)));
        });
    });

    describe('set optionalParameterSupport(value: boolean)', () => {
        let instance: Procedure;
        beforeEach(() => instance = new Procedure(x => x));

        context('when value: true', () => {
            beforeEach(() => instance.optionalParameterSupport = true);
            describe('verbose', () => it('should be: true', () => expect(instance.optionalParameterSupport).to.be.true));
        });

        context('when value: false', () => {
            beforeEach(() => instance.optionalParameterSupport = false);
            describe('verbose', () => it('should be: false', () => expect(instance.optionalParameterSupport).to.be.false));
        });
    });

    describe('set ignoreUndefinedProperties(value: boolean)', () => {
        let instance: Procedure;
        beforeEach(() => instance = new Procedure(x => x));

        context('when value: true', () => {
            beforeEach(() => instance.ignoreUndefinedProperties = true);
            describe('verbose', () => it('should be: true', () => expect(instance.ignoreUndefinedProperties).to.be.true));
        });

        context('when value: false', () => {
            beforeEach(() => instance.ignoreUndefinedProperties = false);
            describe('verbose', () => it('should be: false', () => expect(instance.ignoreUndefinedProperties).to.be.false));
        });
    });

    describe('bind(): this', () => {
        let instance: Procedure;
        beforeEach(() => instance = new Procedure(x => x));
        afterEach(() => { instance.unbind().removeAllListeners(); });

        it('should return: this', () => expect(instance.bind()).to.equal(instance));

        context('when endpoint: \'\'', () => {
            beforeEach(() => instance = new Procedure(x => x));

            describe('instance', () => it('should emit: \'error\'', () => {
                const error = chai.spy((error: unknown) => {
                    expect(error).to.be.instanceof(ProcedureInternalServerError)
                        .and.to.have.property('data');
                    expect((<ProcedureInternalServerError>error).data).to.have.property('error');
                });
                instance.on('error', error).bind('');
                expect(error).to.have.been.called.once;
            }));

            context('when verbose: true', () => {
                const sandbox = chai.spy.sandbox();
                beforeEach(() => {
                    instance = new Procedure(x => x);
                    instance.verbose = true;
                    sandbox.on(console, 'error', () => { return })
                });
                describe('instance', () => it('should call console.error', () => {
                    instance.bind('');
                    expect(console.error).to.have.been.called.once;
                }));
                afterEach(() => {
                    instance.verbose = false;
                    sandbox.restore();
                });
            });
        });

        context('when endpoint: \'inproc://Procedure\'', () => {
            beforeEach(() => instance = new Procedure(x => x));
            describe('instance', () => it('should not emit: \'error\'', () => {
                const error = chai.spy(() => { return });
                instance.on('error', error).bind('inproc://Procedure');
                expect(error).to.not.have.been.called();
            }));

            context('when already bound', () => {
                beforeEach(() => instance.bind('inproc://Procedure'));
                describe('instance', () => it('should emit: \'unbind\'', () => {
                    const unbind = chai.spy(() => { return });
                    instance.on('unbind', unbind).bind();
                    expect(unbind).to.have.been.called.once;
                }));
            });
        });
    });

    describe('unbind(): this', () => {
        let instance: Procedure;
        beforeEach(() => instance = new Procedure(x => x));

        it('should return: this', () => expect(instance.unbind()).to.equal(instance));

        context('when instance bound to endpoint: \'inproc://Procedure\'', () => {
            beforeEach(() => {
                instance = new Procedure(x => x);
                instance.bind('inproc://Procedure');
            });
            describe('instance', () => it('should emit: \'unbind\'', () => {
                const unbind = chai.spy(() => { return });
                instance.on('unbind', unbind).unbind();
                expect(unbind).to.have.been.called.once;
            }));

            context('when verbose: true', () => {
                const sandbox = chai.spy.sandbox();

                beforeEach(() => {
                    instance.verbose = true;
                    sandbox.on(console, 'log', () => { return });
                });
                describe('instance', () => it('should call console.log', () => {
                    instance.unbind();
                    expect(console.log).to.have.been.called.twice;
                }));
                afterEach(() => {
                    instance.verbose = false;
                    sandbox.restore();
                });
            });
        });
    });
});

describe('call(endpoint: string, input: Input | null, options: Partial<ProcedureCallOptions>): Promise<Output>', () => {
    let func: Callback<unknown, unknown>;
    let spy: ChaiSpies.SpyFunc1<unknown, unknown>;
    let procedure: Procedure<unknown, unknown>;
    let procedureEndpoint: string;
    let input: unknown;
    let callEndpoint: string | undefined;

    context('INPROC tests', () => {
        context('when procedure callback: Callback<number, number> (simple accumulator function)', () => {
            beforeEach(() => {
                let i = 0;
                func = <Callback<unknown, unknown>>((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return i += n;
                });
                spy = chai.spy(func);
                procedureEndpoint = 'inproc://Procedure/Add';
                procedure = new Procedure(spy, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            context('when endpoint: correct', () => {
                beforeEach(() => callEndpoint = procedureEndpoint);

                context('when input: 0', () => {
                    beforeEach(() => input = 0);

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = chai.spy((data: unknown) => x = data);
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).to.have.been.called.once;
                        expect(x).to.equal(0);
                    });

                    it('should resolve: 0', async () => await expect(call(<string>callEndpoint, input)).to.eventually.equal(0));

                    afterEach(() => input = undefined);

                    context('when verbose: true', () => {
                        const sandbox = chai.spy.sandbox();
                        beforeEach(() => {
                            procedure.verbose = true;
                            sandbox.on(console, 'log', () => { return });
                        });

                        it('should call console.log', async () => {
                            await call(<string>callEndpoint, input);
                            expect(console.log).to.have.been.called.exactly(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                            sandbox.restore();
                        });
                    });
                });

                context('when input: \'foo\'', () => {
                    beforeEach(() => input = 'foo');

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                    afterEach(() => input = undefined);
                });

                context('when input: 1000', () => {
                    beforeEach(() => input = 1000);

                    it('should resolve: 1000', async () => await expect(call(<string>callEndpoint, input)).to.eventually.equal(input));

                    afterEach(() => input = undefined);
                });

                context('when input: undefined', () => {
                    beforeEach(() => input = undefined);

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                });

                context('when ping: 100', () => {
                    context('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = chai.spy((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, { ping: 100 });
                            expect(data).to.have.been.called.once;
                            expect(x).to.equal(0);
                        });

                        it('should resolve: 0', async () => await expect(call(<string>callEndpoint, input, { ping: 100 })).to.eventually.equal(0));

                        afterEach(() => input = undefined);

                        context('when verbose: true', () => {
                            const sandbox = chai.spy.sandbox();
                            beforeEach(() => {
                                procedure.verbose = true;
                                sandbox.on(console, 'log', () => { return });
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(console.log).to.have.been.called();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                sandbox.restore();
                            });
                        });
                    });

                    context('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                        afterEach(() => input = undefined);
                    });

                    context('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it('should resolve: 1000', async () => await expect(call(<string>callEndpoint, input, { ping: 100 })).to.eventually.equal(input));

                        afterEach(() => input = undefined);
                    });

                    context('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                    });
                });

                afterEach(() => callEndpoint = undefined);
            });

            // TODO: when endpoint: incorrect

            afterEach(() => procedure.unbind());
        });

        context('when procedure callback: Callback<number, null> (testing nullish returns)', () => {
            beforeEach(() => {
                func = <Callback<unknown, unknown>>((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return null;
                });
                spy = chai.spy(func);
                procedureEndpoint = 'inproc://Procedure/ReturnsNull';
                procedure = new Procedure(spy, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            context('when endpoint: correct', () => {
                beforeEach(() => callEndpoint = procedureEndpoint);

                context('when input: 0', () => {
                    beforeEach(() => input = 0);

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = chai.spy((data: unknown) => x = data);
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).to.have.been.called.once;
                        expect(x).to.equal(0);
                    });

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);

                    context('when verbose: true', () => {
                        const sandbox = chai.spy.sandbox();
                        beforeEach(() => {
                            procedure.verbose = true;
                            sandbox.on(console, 'log', () => { return });
                        });

                        it('should call console.log', async () => {
                            await call(<string>callEndpoint, input);
                            expect(console.log).to.have.been.called.exactly(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                            sandbox.restore();
                        });
                    });
                });

                context('when input: \'foo\'', () => {
                    beforeEach(() => input = 'foo');

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                    afterEach(() => input = undefined);
                });

                context('when input: 1000', () => {
                    beforeEach(() => input = 1000);

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);
                });

                context('when input: undefined', () => {
                    beforeEach(() => input = undefined);

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                });

                context('when ping: 100', () => {
                    context('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = chai.spy((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, { ping: 100 });
                            expect(data).to.have.been.called.once;
                            expect(x).to.equal(0);
                        });

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);

                        context('when verbose: true', () => {
                            const sandbox = chai.spy.sandbox();
                            beforeEach(() => {
                                procedure.verbose = true;
                                sandbox.on(console, 'log', () => { return });
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(console.log).to.have.been.called();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                sandbox.restore();
                            });
                        });
                    });

                    context('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                        afterEach(() => input = undefined);
                    });

                    context('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);
                    });

                    context('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                    });
                });

                afterEach(() => callEndpoint = undefined);
            });

            // TODO: when endpoint: incorrect

            afterEach(() => procedure.unbind());
        });

        context('when procedure callback: Callback<number, void> (testing nullish returns)', () => {
            beforeEach(() => {
                func = <Callback<unknown, unknown>>((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return;
                });
                spy = chai.spy(func);
                procedureEndpoint = 'inproc://Procedure/ReturnsVoid';
                procedure = new Procedure(spy, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            context('when endpoint: correct', () => {
                beforeEach(() => callEndpoint = procedureEndpoint);

                context('when input: 0', () => {
                    beforeEach(() => input = 0);

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = chai.spy((data: unknown) => x = data);
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).to.have.been.called.once;
                        expect(x).to.equal(0);
                    });

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);

                    context('when verbose: true', () => {
                        const sandbox = chai.spy.sandbox();
                        beforeEach(() => {
                            procedure.verbose = true;
                            sandbox.on(console, 'log', () => { return });
                        });

                        it('should call console.log', async () => {
                            await call(<string>callEndpoint, input);
                            expect(console.log).to.have.been.called.exactly(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                            sandbox.restore();
                        });
                    });
                });

                context('when input: \'foo\'', () => {
                    beforeEach(() => input = 'foo');

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                    afterEach(() => input = undefined);
                });

                context('when input: 1000', () => {
                    beforeEach(() => input = 1000);

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);
                });

                context('when input: undefined', () => {
                    beforeEach(() => input = undefined);

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                });

                context('when ping: 100', () => {
                    context('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = chai.spy((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, { ping: 100 });
                            expect(data).to.have.been.called.once;
                            expect(x).to.equal(0);
                        });

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);

                        context('when verbose: true', () => {
                            const sandbox = chai.spy.sandbox();
                            beforeEach(() => {
                                procedure.verbose = true;
                                sandbox.on(console, 'log', () => { return });
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(console.log).to.have.been.called();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                sandbox.restore();
                            });
                        });
                    });

                    context('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                        afterEach(() => input = undefined);
                    });

                    context('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);
                    });

                    context('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                    });
                });

                afterEach(() => callEndpoint = undefined);
            });

            // TODO: when endpoint: incorrect

            afterEach(() => procedure.unbind());
        });
    });

    // TODO: test optionalParameterSupport option works as intended
    // TODO: test ignoreUndefinedProperties option works as intended

    // TODO: when callback asynchronous (completes normally, times out, throws error, infinite timeout, abortion signaled during execution, abortion signaled before execution)

    context('IPC tests', () => {
        before(function () {
            if (process.platform !== 'win32') {
                this.skip();
            }
        });

        context('when procedure callback: Callback<number, number> (simple accumulator function)', () => {
            beforeEach(() => {
                let i = 0;
                func = <Callback<unknown, unknown>>((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return i += n;
                });
                spy = chai.spy(func);
                procedureEndpoint = 'ipc://procedure/add';
                procedure = new Procedure(spy, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            context('when endpoint: correct', () => {
                beforeEach(() => callEndpoint = procedureEndpoint);

                context('when input: 0', () => {
                    beforeEach(() => input = 0);

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = chai.spy((data: unknown) => x = data);
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).to.have.been.called.once;
                        expect(x).to.equal(0);
                    });

                    it('should resolve: 0', async () => await expect(call(<string>callEndpoint, input)).to.eventually.equal(0));

                    afterEach(() => input = undefined);

                    context('when verbose: true', () => {
                        const sandbox = chai.spy.sandbox();
                        beforeEach(() => {
                            procedure.verbose = true;
                            sandbox.on(console, 'log', () => { return });
                        });

                        it('should call console.log', async () => {
                            await call(<string>callEndpoint, input);
                            expect(console.log).to.have.been.called.exactly(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                            sandbox.restore();
                        });
                    });
                });

                context('when input: \'foo\'', () => {
                    beforeEach(() => input = 'foo');

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                    afterEach(() => input = undefined);
                });

                context('when input: 1000', () => {
                    beforeEach(() => input = 1000);

                    it('should resolve: 1000', async () => await expect(call(<string>callEndpoint, input)).to.eventually.equal(input));

                    afterEach(() => input = undefined);
                });

                context('when input: undefined', () => {
                    beforeEach(() => input = undefined);

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                });

                context('when ping: 100', () => {
                    context('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = chai.spy((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, { ping: 100 });
                            expect(data).to.have.been.called.once;
                            expect(x).to.equal(0);
                        });

                        it('should resolve: 0', async () => await expect(call(<string>callEndpoint, input, { ping: 100 })).to.eventually.equal(0));

                        afterEach(() => input = undefined);

                        context('when verbose: true', () => {
                            const sandbox = chai.spy.sandbox();
                            beforeEach(() => {
                                procedure.verbose = true;
                                sandbox.on(console, 'log', () => { return });
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(console.log).to.have.been.called();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                sandbox.restore();
                            });
                        });
                    });

                    context('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                        afterEach(() => input = undefined);
                    });

                    context('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it('should resolve: 1000', async () => await expect(call(<string>callEndpoint, input, { ping: 100 })).to.eventually.equal(input));

                        afterEach(() => input = undefined);
                    });

                    context('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                    });
                });

                afterEach(() => callEndpoint = undefined);
            });

            // TODO: when endpoint: incorrect

            afterEach(() => procedure.unbind());
        });

        context('when procedure callback: Callback<number, null> (testing nullish returns)', () => {
            beforeEach(() => {
                func = <Callback<unknown, unknown>>((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return null;
                });
                spy = chai.spy(func);
                procedureEndpoint = 'ipc://procedure/returnsnull';
                procedure = new Procedure(spy, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            context('when endpoint: correct', () => {
                beforeEach(() => callEndpoint = procedureEndpoint);

                context('when input: 0', () => {
                    beforeEach(() => input = 0);

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = chai.spy((data: unknown) => x = data);
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).to.have.been.called.once;
                        expect(x).to.equal(0);
                    });

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);

                    context('when verbose: true', () => {
                        const sandbox = chai.spy.sandbox();
                        beforeEach(() => {
                            procedure.verbose = true;
                            sandbox.on(console, 'log', () => { return });
                        });

                        it('should call console.log', async () => {
                            await call(<string>callEndpoint, input);
                            expect(console.log).to.have.been.called.exactly(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                            sandbox.restore();
                        });
                    });
                });

                context('when input: \'foo\'', () => {
                    beforeEach(() => input = 'foo');

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                    afterEach(() => input = undefined);
                });

                context('when input: 1000', () => {
                    beforeEach(() => input = 1000);

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);
                });

                context('when input: undefined', () => {
                    beforeEach(() => input = undefined);

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                });

                context('when ping: 100', () => {
                    context('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = chai.spy((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, { ping: 100 });
                            expect(data).to.have.been.called.once;
                            expect(x).to.equal(0);
                        });

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);

                        context('when verbose: true', () => {
                            const sandbox = chai.spy.sandbox();
                            beforeEach(() => {
                                procedure.verbose = true;
                                sandbox.on(console, 'log', () => { return });
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(console.log).to.have.been.called();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                sandbox.restore();
                            });
                        });
                    });

                    context('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                        afterEach(() => input = undefined);
                    });

                    context('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);
                    });

                    context('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                    });
                });

                afterEach(() => callEndpoint = undefined);
            });

            // TODO: when endpoint: incorrect

            afterEach(() => procedure.unbind());
        });

        context('when procedure callback: Callback<number, void> (testing nullish returns)', () => {
            beforeEach(() => {
                func = <Callback<unknown, unknown>>((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return;
                });
                spy = chai.spy(func);
                procedureEndpoint = 'ipc://procedure/returnsvoid';
                procedure = new Procedure(spy, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            context('when endpoint: correct', () => {
                beforeEach(() => callEndpoint = procedureEndpoint);

                context('when input: 0', () => {
                    beforeEach(() => input = 0);

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = chai.spy((data: unknown) => x = data);
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).to.have.been.called.once;
                        expect(x).to.equal(0);
                    });

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);

                    context('when verbose: true', () => {
                        const sandbox = chai.spy.sandbox();
                        beforeEach(() => {
                            procedure.verbose = true;
                            sandbox.on(console, 'log', () => { return });
                        });

                        it('should call console.log', async () => {
                            await call(<string>callEndpoint, input);
                            expect(console.log).to.have.been.called.exactly(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                            sandbox.restore();
                        });
                    });
                });

                context('when input: \'foo\'', () => {
                    beforeEach(() => input = 'foo');

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                    afterEach(() => input = undefined);
                });

                context('when input: 1000', () => {
                    beforeEach(() => input = 1000);

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);
                });

                context('when input: undefined', () => {
                    beforeEach(() => input = undefined);

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                });

                context('when ping: 100', () => {
                    context('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = chai.spy((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, { ping: 100 });
                            expect(data).to.have.been.called.once;
                            expect(x).to.equal(0);
                        });

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);

                        context('when verbose: true', () => {
                            const sandbox = chai.spy.sandbox();
                            beforeEach(() => {
                                procedure.verbose = true;
                                sandbox.on(console, 'log', () => { return });
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(console.log).to.have.been.called();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                sandbox.restore();
                            });
                        });
                    });

                    context('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                        afterEach(() => input = undefined);
                    });

                    context('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);
                    });

                    context('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                    });
                });

                afterEach(() => callEndpoint = undefined);
            });

            // TODO: when endpoint: incorrect

            afterEach(() => procedure.unbind());
        });
    });

    context('TCP tests', () => {
        context('when procedure callback: Callback<number, number> (simple accumulator function)', () => {
            beforeEach(() => {
                let i = 0;
                func = <Callback<unknown, unknown>>((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return i += n;
                });
                spy = chai.spy(func);
                procedureEndpoint = 'tcp://127.0.0.1:33333';
                procedure = new Procedure(spy, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            context('when endpoint: correct', () => {
                beforeEach(() => callEndpoint = procedureEndpoint);

                context('when input: 0', () => {
                    beforeEach(() => input = 0);

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = chai.spy((data: unknown) => x = data);
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).to.have.been.called.once;
                        expect(x).to.equal(0);
                    });

                    it('should resolve: 0', async () => await expect(call(<string>callEndpoint, input)).to.eventually.equal(0));

                    afterEach(() => input = undefined);

                    context('when verbose: true', () => {
                        const sandbox = chai.spy.sandbox();
                        beforeEach(() => {
                            procedure.verbose = true;
                            sandbox.on(console, 'log', () => { return });
                        });

                        it('should call console.log', async () => {
                            await call(<string>callEndpoint, input);
                            expect(console.log).to.have.been.called.exactly(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                            sandbox.restore();
                        });
                    });
                });

                context('when input: \'foo\'', () => {
                    beforeEach(() => input = 'foo');

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                    afterEach(() => input = undefined);
                });

                context('when input: 1000', () => {
                    beforeEach(() => input = 1000);

                    it('should resolve: 1000', async () => await expect(call(<string>callEndpoint, input)).to.eventually.equal(input));

                    afterEach(() => input = undefined);
                });

                context('when input: undefined', () => {
                    beforeEach(() => input = undefined);

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                });

                context('when ping: 100', () => {
                    context('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = chai.spy((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, { ping: 100 });
                            expect(data).to.have.been.called.once;
                            expect(x).to.equal(0);
                        });

                        it('should resolve: 0', async () => await expect(call(<string>callEndpoint, input, { ping: 100 })).to.eventually.equal(0));

                        afterEach(() => input = undefined);

                        context('when verbose: true', () => {
                            const sandbox = chai.spy.sandbox();
                            beforeEach(() => {
                                procedure.verbose = true;
                                sandbox.on(console, 'log', () => { return });
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(console.log).to.have.been.called();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                sandbox.restore();
                            });
                        });
                    });

                    context('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                        afterEach(() => input = undefined);
                    });

                    context('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it('should resolve: 1000', async () => await expect(call(<string>callEndpoint, input, { ping: 100 })).to.eventually.equal(input));

                        afterEach(() => input = undefined);
                    });

                    context('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                    });
                });

                afterEach(() => callEndpoint = undefined);
            });

            // TODO: when endpoint: incorrect

            afterEach(() => procedure.unbind());
        });

        context('when procedure callback: Callback<number, null> (testing nullish returns)', () => {
            beforeEach(() => {
                func = <Callback<unknown, unknown>>((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return null;
                });
                spy = chai.spy(func);
                procedureEndpoint = 'tcp://127.0.0.1:33334';
                procedure = new Procedure(spy, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            context('when endpoint: correct', () => {
                beforeEach(() => callEndpoint = procedureEndpoint);

                context('when input: 0', () => {
                    beforeEach(() => input = 0);

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = chai.spy((data: unknown) => x = data);
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).to.have.been.called.once;
                        expect(x).to.equal(0);
                    });

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);

                    context('when verbose: true', () => {
                        const sandbox = chai.spy.sandbox();
                        beforeEach(() => {
                            procedure.verbose = true;
                            sandbox.on(console, 'log', () => { return });
                        });

                        it('should call console.log', async () => {
                            await call(<string>callEndpoint, input);
                            expect(console.log).to.have.been.called.exactly(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                            sandbox.restore();
                        });
                    });
                });

                context('when input: \'foo\'', () => {
                    beforeEach(() => input = 'foo');

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                    afterEach(() => input = undefined);
                });

                context('when input: 1000', () => {
                    beforeEach(() => input = 1000);

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);
                });

                context('when input: undefined', () => {
                    beforeEach(() => input = undefined);

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                });

                context('when ping: 100', () => {
                    context('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = chai.spy((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, { ping: 100 });
                            expect(data).to.have.been.called.once;
                            expect(x).to.equal(0);
                        });

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);

                        context('when verbose: true', () => {
                            const sandbox = chai.spy.sandbox();
                            beforeEach(() => {
                                procedure.verbose = true;
                                sandbox.on(console, 'log', () => { return });
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(console.log).to.have.been.called();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                sandbox.restore();
                            });
                        });
                    });

                    context('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                        afterEach(() => input = undefined);
                    });

                    context('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);
                    });

                    context('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                    });
                });

                afterEach(() => callEndpoint = undefined);
            });

            // TODO: when endpoint: incorrect

            afterEach(() => procedure.unbind());
        });

        context('when procedure callback: Callback<number, void> (testing nullish returns)', () => {
            beforeEach(() => {
                func = <Callback<unknown, unknown>>((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return;
                });
                spy = chai.spy(func);
                procedureEndpoint = 'tcp://127.0.0.1:33335';
                procedure = new Procedure(spy, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            context('when endpoint: correct', () => {
                beforeEach(() => callEndpoint = procedureEndpoint);

                context('when input: 0', () => {
                    beforeEach(() => input = 0);

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = chai.spy((data: unknown) => x = data);
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).to.have.been.called.once;
                        expect(x).to.equal(0);
                    });

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);

                    context('when verbose: true', () => {
                        const sandbox = chai.spy.sandbox();
                        beforeEach(() => {
                            procedure.verbose = true;
                            sandbox.on(console, 'log', () => { return });
                        });

                        it('should call console.log', async () => {
                            await call(<string>callEndpoint, input);
                            expect(console.log).to.have.been.called.exactly(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                            sandbox.restore();
                        });
                    });
                });

                context('when input: \'foo\'', () => {
                    beforeEach(() => input = 'foo');

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                    afterEach(() => input = undefined);
                });

                context('when input: 1000', () => {
                    beforeEach(() => input = 1000);

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);
                });

                context('when input: undefined', () => {
                    beforeEach(() => input = undefined);

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                });

                context('when ping: 100', () => {
                    context('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = chai.spy((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, { ping: 100 });
                            expect(data).to.have.been.called.once;
                            expect(x).to.equal(0);
                        });

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);

                        context('when verbose: true', () => {
                            const sandbox = chai.spy.sandbox();
                            beforeEach(() => {
                                procedure.verbose = true;
                                sandbox.on(console, 'log', () => { return });
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(console.log).to.have.been.called();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                sandbox.restore();
                            });
                        });
                    });

                    context('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                        afterEach(() => input = undefined);
                    });

                    context('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);
                    });

                    context('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                    });
                });

                afterEach(() => callEndpoint = undefined);
            });

            // TODO: when endpoint: incorrect

            afterEach(() => procedure.unbind());
        });
    });

    context('WS tests', () => {
        context('when procedure callback: Callback<number, number> (simple accumulator function)', () => {
            beforeEach(() => {
                let i = 0;
                func = <Callback<unknown, unknown>>((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return i += n;
                });
                spy = chai.spy(func);
                procedureEndpoint = 'ws://127.0.0.1:33333';
                procedure = new Procedure(spy, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            context('when endpoint: correct', () => {
                beforeEach(() => callEndpoint = procedureEndpoint);

                context('when input: 0', () => {
                    beforeEach(() => input = 0);

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = chai.spy((data: unknown) => x = data);
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).to.have.been.called.once;
                        expect(x).to.equal(0);
                    });

                    it('should resolve: 0', async () => await expect(call(<string>callEndpoint, input)).to.eventually.equal(0));

                    afterEach(() => input = undefined);

                    context('when verbose: true', () => {
                        const sandbox = chai.spy.sandbox();
                        beforeEach(() => {
                            procedure.verbose = true;
                            sandbox.on(console, 'log', () => { return });
                        });

                        it('should call console.log', async () => {
                            await call(<string>callEndpoint, input);
                            expect(console.log).to.have.been.called.exactly(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                            sandbox.restore();
                        });
                    });
                });

                context('when input: \'foo\'', () => {
                    beforeEach(() => input = 'foo');

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                    afterEach(() => input = undefined);
                });

                context('when input: 1000', () => {
                    beforeEach(() => input = 1000);

                    it('should resolve: 1000', async () => await expect(call(<string>callEndpoint, input)).to.eventually.equal(input));

                    afterEach(() => input = undefined);
                });

                context('when input: undefined', () => {
                    beforeEach(() => input = undefined);

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                });

                context('when ping: 100', () => {
                    context('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = chai.spy((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, { ping: 100 });
                            expect(data).to.have.been.called.once;
                            expect(x).to.equal(0);
                        });

                        it('should resolve: 0', async () => await expect(call(<string>callEndpoint, input, { ping: 100 })).to.eventually.equal(0));

                        afterEach(() => input = undefined);

                        context('when verbose: true', () => {
                            const sandbox = chai.spy.sandbox();
                            beforeEach(() => {
                                procedure.verbose = true;
                                sandbox.on(console, 'log', () => { return });
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(console.log).to.have.been.called();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                sandbox.restore();
                            });
                        });
                    });

                    context('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                        afterEach(() => input = undefined);
                    });

                    context('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it('should resolve: 1000', async () => await expect(call(<string>callEndpoint, input, { ping: 100 })).to.eventually.equal(input));

                        afterEach(() => input = undefined);
                    });

                    context('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                    });
                });

                afterEach(() => callEndpoint = undefined);
            });

            // TODO: when endpoint: incorrect

            afterEach(() => procedure.unbind());
        });

        context('when procedure callback: Callback<number, null> (testing nullish returns)', () => {
            beforeEach(() => {
                func = <Callback<unknown, unknown>>((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return null;
                });
                spy = chai.spy(func);
                procedureEndpoint = 'ws://127.0.0.1:33334';
                procedure = new Procedure(spy, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            context('when endpoint: correct', () => {
                beforeEach(() => callEndpoint = procedureEndpoint);

                context('when input: 0', () => {
                    beforeEach(() => input = 0);

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = chai.spy((data: unknown) => x = data);
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).to.have.been.called.once;
                        expect(x).to.equal(0);
                    });

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);

                    context('when verbose: true', () => {
                        const sandbox = chai.spy.sandbox();
                        beforeEach(() => {
                            procedure.verbose = true;
                            sandbox.on(console, 'log', () => { return });
                        });

                        it('should call console.log', async () => {
                            await call(<string>callEndpoint, input);
                            expect(console.log).to.have.been.called.exactly(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                            sandbox.restore();
                        });
                    });
                });

                context('when input: \'foo\'', () => {
                    beforeEach(() => input = 'foo');

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                    afterEach(() => input = undefined);
                });

                context('when input: 1000', () => {
                    beforeEach(() => input = 1000);

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);
                });

                context('when input: undefined', () => {
                    beforeEach(() => input = undefined);

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                });

                context('when ping: 100', () => {
                    context('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = chai.spy((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, { ping: 100 });
                            expect(data).to.have.been.called.once;
                            expect(x).to.equal(0);
                        });

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);

                        context('when verbose: true', () => {
                            const sandbox = chai.spy.sandbox();
                            beforeEach(() => {
                                procedure.verbose = true;
                                sandbox.on(console, 'log', () => { return });
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(console.log).to.have.been.called();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                sandbox.restore();
                            });
                        });
                    });

                    context('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                        afterEach(() => input = undefined);
                    });

                    context('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);
                    });

                    context('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                    });
                });

                afterEach(() => callEndpoint = undefined);
            });

            // TODO: when endpoint: incorrect

            afterEach(() => procedure.unbind());
        });

        context('when procedure callback: Callback<number, void> (testing nullish returns)', () => {
            beforeEach(() => {
                func = <Callback<unknown, unknown>>((n: number) => {
                    if (typeof n !== 'number') {
                        throw new TypeError('Expected a number');
                    }

                    return;
                });
                spy = chai.spy(func);
                procedureEndpoint = 'ws://127.0.0.1:33335';
                procedure = new Procedure(spy, { workers: 3 });
                procedure.bind(procedureEndpoint);
            });

            context('when endpoint: correct', () => {
                beforeEach(() => callEndpoint = procedureEndpoint);

                context('when input: 0', () => {
                    beforeEach(() => input = 0);

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = chai.spy((data: unknown) => x = data);
                        procedure.on('data', data);
                        await call(<string>callEndpoint, input);
                        expect(data).to.have.been.called.once;
                        expect(x).to.equal(0);
                    });

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);

                    context('when verbose: true', () => {
                        const sandbox = chai.spy.sandbox();
                        beforeEach(() => {
                            procedure.verbose = true;
                            sandbox.on(console, 'log', () => { return });
                        });

                        it('should call console.log', async () => {
                            await call(<string>callEndpoint, input);
                            expect(console.log).to.have.been.called.exactly(3);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                            sandbox.restore();
                        });
                    });
                });

                context('when input: \'foo\'', () => {
                    beforeEach(() => input = 'foo');

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                    afterEach(() => input = undefined);
                });

                context('when input: 1000', () => {
                    beforeEach(() => input = 1000);

                    it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input))
                        .to.eventually.be.undefined);

                    afterEach(() => input = undefined);
                });

                context('when input: undefined', () => {
                    beforeEach(() => input = undefined);

                    it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input))
                        .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                });

                context('when ping: 100', () => {
                    context('when input: 0', () => {
                        beforeEach(() => input = 0);

                        it('should emit: data, with parameter: 0', async () => {
                            let x: unknown = undefined;
                            const data = chai.spy((data: unknown) => x = data);
                            procedure.on('data', data);
                            await call(<string>callEndpoint, input, { ping: 100 });
                            expect(data).to.have.been.called.once;
                            expect(x).to.equal(0);
                        });

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);

                        context('when verbose: true', () => {
                            const sandbox = chai.spy.sandbox();
                            beforeEach(() => {
                                procedure.verbose = true;
                                sandbox.on(console, 'log', () => { return });
                            });

                            it('should call console.log', async () => {
                                await call(<string>callEndpoint, input, { ping: 100 });
                                expect(console.log).to.have.been.called();
                            });

                            afterEach(() => {
                                procedure.verbose = false;
                                sandbox.restore();
                            });
                        });
                    });

                    context('when input: \'foo\'', () => {
                        beforeEach(() => input = 'foo');

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));

                        afterEach(() => input = undefined);
                    });

                    context('when input: 1000', () => {
                        beforeEach(() => input = 1000);

                        it('should resolve: undefined', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.eventually.be.undefined);

                        afterEach(() => input = undefined);
                    });

                    context('when input: undefined', () => {
                        beforeEach(() => input = undefined);

                        it('should throw: ProcedureExecutionError', async () => await expect(call(<string>callEndpoint, input, { ping: 100 }))
                            .to.be.rejectedWith('An unhandled exception was thrown during procedure execution'));
                    });
                });

                afterEach(() => callEndpoint = undefined);
            });

            // TODO: when endpoint: incorrect

            afterEach(() => procedure.unbind());
        });
    });
});

describe('ping(endpoint: string, timeout: number | undefined = 100, signal?: AbortSignal): Promise<boolean>', () => {
    let func: Callback<unknown, unknown>;
    let spy: ChaiSpies.SpyFunc1<unknown, unknown>;
    let procedure: Procedure<unknown, unknown>;
    let procedureEndpoint: string;
    let pingEndpoint: string | undefined;

    context('when procedure callback: Callback<number, number> (simple accumulator function)', () => {
        beforeEach(() => {
            let i = 0;
            func = <Callback<unknown, unknown>>((n: number) => {
                if (typeof n !== 'number') {
                    throw new TypeError('Expected a number');
                }

                return i += n;
            });
            spy = chai.spy(func);
            procedureEndpoint = 'inproc://Procedure/Add';
            procedure = new Procedure(spy, { workers: 3 });
            procedure.bind(procedureEndpoint);
        });

        context('when endpoint: correct', () => {
            beforeEach(() => pingEndpoint = procedureEndpoint);

            it('should not emit: data', async () => {
                const data = chai.spy(() => { return });
                procedure.on('data', data);
                await ping(<string>pingEndpoint);
                expect(data).to.have.been.called.exactly(0);
            });

            it('should not be rejected', async () => await expect(ping(<string>pingEndpoint)).to.not.be.rejected);

            context('when signal: already aborted AbortSignal', () => {
                let ac: AbortController;

                beforeEach(() => {
                    ac = new AbortController();
                    ac.abort();
                });

                it('should throw: ProcedureCancelledError', async () => await expect(ping(<string>pingEndpoint, 500, ac.signal))
                    .to.be.rejectedWith('The operation was cancelled by the client'));
            });
        });

        // TODO: when endpoint: incorrect
        // TODO: when timeout infinity, NaN
        // TODO: when abortion signaled during ping

        afterEach(() => procedure.unbind());
    });
});

describe('tryPing(endpoint: string, timeout: number | undefined = 100, signal?: AbortSignal): Promise<boolean>', () => {
    let func: Callback<unknown, unknown>;
    let spy: ChaiSpies.SpyFunc1<unknown, unknown>;
    let procedure: Procedure<unknown, unknown>;
    let procedureEndpoint: string;
    let pingEndpoint: string | undefined;

    context('when procedure callback: Callback<number, number> (simple accumulator function)', () => {
        beforeEach(() => {
            let i = 0;
            func = <Callback<unknown, unknown>>((n: number) => {
                if (typeof n !== 'number') {
                    throw new TypeError('Expected a number');
                }

                return i += n;
            });
            spy = chai.spy(func);
            procedureEndpoint = 'inproc://Procedure/Add';
            procedure = new Procedure(spy, { workers: 3 });
            procedure.bind(procedureEndpoint);
        });

        context('when endpoint: correct', () => {
            beforeEach(() => pingEndpoint = procedureEndpoint);

            it('should not emit: data', async () => {
                const data = chai.spy(() => { return });
                procedure.on('data', data);
                await tryPing(<string>pingEndpoint);
                expect(data).to.have.been.called.exactly(0);
            });

            it('should resolve: true', async () => await expect(tryPing(<string>pingEndpoint)).to.eventually.be.true.and.to.not.be.rejected);

            context('when signal: already aborted AbortSignal', () => {
                let ac: AbortController;

                beforeEach(() => {
                    ac = new AbortController();
                    ac.abort();
                });

                it('should resolve: false', async () => await expect(tryPing(<string>pingEndpoint, 500, ac.signal))
                    .to.eventually.be.false.and.to.not.be.rejected);
            });
        });

        // TODO: when endpoint: incorrect
        // TODO: when timeout infinity, NaN
        // TODO: when abortion signaled during ping

        afterEach(() => procedure.unbind());
    });
});

describe('isPing(object: unknown): object is Ping', () => {
    let object: unknown;

    context('when object: { ping: \'foobar\' }', () => {
        beforeEach(() => object = { ping: 'foobar' });
        it('should return: true', () => expect(isPing(object)).to.be.true);
    });

    context('when object: undefined', () => {
        beforeEach(() => object = undefined);
        it('should return: false', () => expect(isPing(object)).to.be.false);
    });

    context('when object: null', () => {
        beforeEach(() => object = null);
        it('should return: false', () => expect(isPing(object)).to.be.false);
    });

    context('when object: instanceof TypeError', () => {
        beforeEach(() => object = new TypeError());
        it('should return: true', () => expect(isPing(object)).to.be.false);
    });

    context('when object: { name: \'Foo\', message: \'Bar\' }', () => {
        beforeEach(() => object = { name: 'Foo', message: 'Bar' });
        it('should return: false', () => expect(isPing(object)).to.be.false);
    });
});

// TODO: test connecting to a Procedure's bound endpoint with a socket and throwing random data at it
