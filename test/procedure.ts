import 'mocha'
import chai, { expect } from 'chai'
import spies from 'chai-spies'
import chaiAsPromised from 'chai-as-promised'
import Procedure, { Callback } from '../src'
import { ExtensionCodec } from '@msgpack/msgpack'

chai.use(spies);
chai.use(chaiAsPromised);

describe('Procedure', () => {
    describe('constructor(endpoint: string, callback: Callback, options: Partial<ProcedureOptions>)', () => {
        let instance: Procedure;

        context('when options.verbose: true', () => {
            beforeEach(() => instance = new Procedure('', x => x, { verbose: true }));
            describe('verbose', () => it('should be: true', () => expect(instance.verbose).to.be.true));
        });

        context('when options.verbose is false', () => {
            beforeEach(() => instance = new Procedure('', x => x, { verbose: false }));
            describe('verbose', () => it('should be: false', () => expect(instance.verbose).to.be.false));
        });

        context('when options.verbose: undefined', () => {
            beforeEach(() => instance = new Procedure('', x => x));
            describe('verbose', () => it('should be: false', () => expect(instance.verbose).to.be.false));
        });

        context('when options.workers: undefined', () => {
            beforeEach(() => instance = new Procedure('', x => x));
            describe('workers', () => it('should be: 1', () => expect(instance.workers).to.equal(1)));
        });

        context('when options.workers: NaN', () => {
            beforeEach(() => instance = new Procedure('', x => x, { workers: NaN }));
            describe('workers', () => it('should be: 1', () => expect(instance.workers).to.equal(1)));
        });

        context('when options.workers: Infinity', () => {
            beforeEach(() => instance = new Procedure('', x => x, { workers: Infinity }));
            describe('workers', () => it('should be: 1', () => expect(instance.workers).to.equal(1)));
        });

        context('when options.workers: < 1', () => {
            beforeEach(() => instance = new Procedure('', x => x, { workers: 0.8 }));
            describe('workers', () => it('should be: 1', () => expect(instance.workers).to.equal(1)));
        });

        context('when options.workers: 10', () => {
            beforeEach(() => instance = new Procedure('', x => x, { workers: 10 }));
            describe('workers', () => it('should be: 10', () => expect(instance.workers).to.equal(10)));
        });

        context('when options.extensionCodec: undefined', () => {
            beforeEach(() => instance = new Procedure('', x => x));
            describe('extensionCodec', () => it('should be: undefined', () => expect(instance.extensionCodec).to.be.undefined));
        })

        context('when options.extensionCodec: instanceof ExtensionCodec', () => {
            beforeEach(() => instance = new Procedure('', x => x, { extensionCodec: new ExtensionCodec() }));
            describe('extensionCodec', () => it('should be: instanceof ExtensionCodec', () => expect(instance.extensionCodec).to.be.instanceof(ExtensionCodec)));
        });
    });

    describe('set verbose(value: boolean)', () => {
        let instance: Procedure;
        beforeEach(() => instance = new Procedure('', x => x));

        context('when value: true', () => {
            beforeEach(() => instance.verbose = true);
            describe('verbose', () => it('should be: true', () => expect(instance.verbose).to.be.true));
        });

        context('when value: false', () => {
            beforeEach(() => instance.verbose = false);
            describe('verbose', () => it('should be: false', () => expect(instance.verbose).to.be.false));
        });
    });

    describe('bind(): this', () => {
        let instance: Procedure;
        beforeEach(() => instance = new Procedure('', x => x));
        afterEach(() => { instance.unbind().removeAllListeners() });

        it('should return: this', () => expect(instance.bind()).to.equal(instance));

        context('when endpoint: \'\'', () => {
            beforeEach(() => instance = new Procedure('', x => x));
            describe('instance', () => it('should emit: \'error\'', () => {
                const error = chai.spy((error: unknown) => { expect(error).to.be.instanceof(Error) });
                instance.on('error', error).bind();
                expect(error).to.have.been.called.once;
            }));

            context('when verbose: true', () => {
                const sandbox = chai.spy.sandbox();
                beforeEach(() => {
                    instance.verbose = true;
                    sandbox.on(console, 'error', () => { return })
                });
                describe('instance', () => it('should call console.error', () => {
                    instance.bind();
                    expect(console.error).to.have.been.called.once;
                }));
                afterEach(() => {
                    instance.verbose = false;
                    sandbox.restore();
                });
            });
        });

        context('when endpoint: \'ipc://Procedure.ipc\'', () => {
            beforeEach(() => instance = new Procedure('ipc://Procedure.ipc', x => x));
            describe('instance', () => it('should not emit: \'error\'', () => {
                const error = chai.spy(() => { return });
                instance.on('error', error).bind();
                expect(error).to.not.have.been.called();
            }));

            context('when already bound', () => {
                beforeEach(() => instance.bind());
                describe('instance', () => it('should emit: \'unbind\'', () => {
                    const unbind = chai.spy(() => { return });
                    instance.on('unbind', unbind).bind();
                    expect(unbind).to.have.been.called.once;
                }));
            });
        });

        // TODO: test optionalParameterSupport property
        // TODO: test stripUndefinedProperties property
    });

    describe('unbind(): this', () => {
        let instance: Procedure;
        beforeEach(() => instance = new Procedure('', x => x));

        it('should return: this', () => expect(instance.unbind()).to.equal(instance));

        context('when endpoint: \'ipc://Procedure.ipc\' and instance is bound', () => {
            beforeEach(() => {
                instance = new Procedure('ipc://Procedure.ipc', x => x);
                instance.bind();
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

describe('Procedure.call(endpoint: string, input: Input | null, options: Partial<ProcedureCallOptions>): Promise<Output>', () => {
    let func: Callback<unknown, unknown>;
    let spy: ChaiSpies.SpyFunc1<unknown, unknown>;
    let procedure: Procedure<unknown, unknown>;
    let procedureEndpoint: string;
    let input: unknown;
    let callEndpoint: string | undefined;

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
            procedureEndpoint = 'ipc://Procedure/Add.ipc';
            procedure = new Procedure(procedureEndpoint, spy, { workers: 3 });
            procedure.bind();
        });

        context('when endpoint: correct', () => {
            beforeEach(() => callEndpoint = procedureEndpoint);

            context('when input: 0', () => {
                beforeEach(() => input = 0);

                it('should emit: data, with parameter: 0', async () => {
                    let x: unknown = undefined;
                    const data = chai.spy((data: unknown) => x = data);
                    procedure.on('data', data);
                    await Procedure.call(<string>callEndpoint, input);
                    expect(data).to.have.been.called.once;
                    expect(x).to.equal(0);
                });

                it('should return: 0', async () => await expect(Procedure.call(<string>callEndpoint, input)).to.eventually.equal(0));

                afterEach(() => input = undefined);

                context('when verbose: true', () => {
                    const sandbox = chai.spy.sandbox();
                    beforeEach(() => {
                        procedure.verbose = true;
                        sandbox.on(console, 'log', () => { return });
                    });

                    it('should call console.log', async () => {
                        await Procedure.call(<string>callEndpoint, input);
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

                it('should throw: TypeError', async () => await expect(Procedure.call(<string>callEndpoint, input)).to.be.rejectedWith('Expected a number'));

                afterEach(() => input = undefined);
            });

            context('when input: 1000', () => {
                beforeEach(() => input = 1000);

                it('should return: 1000', async () => await expect(Procedure.call(<string>callEndpoint, input)).to.eventually.equal(input));

                afterEach(() => input = undefined);
            });

            context('when input: undefined', () => {
                beforeEach(() => input = undefined);

                it('should throw: TypeError', async () => await expect(Procedure.call(<string>callEndpoint, input)).to.be.rejectedWith('Expected a number'));
            });

            context('when ping: 100', () => {
                context('when input: 0', () => {
                    beforeEach(() => input = 0);

                    it('should emit: data, with parameter: 0', async () => {
                        let x: unknown = undefined;
                        const data = chai.spy((data: unknown) => x = data);
                        procedure.on('data', data);
                        await Procedure.call(<string>callEndpoint, input, { ping: 100 });
                        expect(data).to.have.been.called.once;
                        expect(x).to.equal(0);
                    });

                    it('should return: 0', async () => await expect(Procedure.call(<string>callEndpoint, input, { ping: 100 })).to.eventually.equal(0));

                    afterEach(() => input = undefined);

                    context('when verbose: true', () => {
                        const sandbox = chai.spy.sandbox();
                        beforeEach(() => {
                            procedure.verbose = true;
                            sandbox.on(console, 'log', () => { return });
                        });

                        it('should call console.log', async () => {
                            await Procedure.call(<string>callEndpoint, input, { ping: 100 });
                            expect(console.log).to.have.been.called.exactly(5);
                        });

                        afterEach(() => {
                            procedure.verbose = false;
                            sandbox.restore();
                        });
                    });
                });

                context('when input: \'foo\'', () => {
                    beforeEach(() => input = 'foo');

                    it('should throw: TypeError', async () => await expect(Procedure.call(<string>callEndpoint, input, { ping: 100 })).to.be.rejectedWith('Expected a number'));

                    afterEach(() => input = undefined);
                });

                context('when input: 1000', () => {
                    beforeEach(() => input = 1000);

                    it('should return: 1000', async () => await expect(Procedure.call(<string>callEndpoint, input, { ping: 100 })).to.eventually.equal(input));

                    afterEach(() => input = undefined);
                });

                context('when input: undefined', () => {
                    beforeEach(() => input = undefined);

                    it('should throw: TypeError', async () => await expect(Procedure.call(<string>callEndpoint, input, { ping: 100 })).to.be.rejectedWith('Expected a number'));
                });
            });

            afterEach(() => callEndpoint = undefined);
        });

        // TODO: when endpoint: incorrect

        afterEach(() => procedure.unbind());
    });

    // TODO: test optionalParameterSupport property
    // TODO: test stripUndefinedProperties property

    // TODO: when callback asynchronous (completes normally, times out, throws error, infinite timeout, abortion signaled during execution, abortion signaled before execution)
});

describe('Procedure.ping(endpoint: string, timeout: number | undefined = 100, signal?: AbortSignal): Promise<boolean>', () => {
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
            procedureEndpoint = 'ipc://Procedure/Add.ipc';
            procedure = new Procedure(procedureEndpoint, spy, { workers: 3 });
            procedure.bind();
        });

        context('when endpoint: correct', () => {
            beforeEach(() => pingEndpoint = procedureEndpoint);

            it('should not emit: data', async () => {
                const data = chai.spy(() => { return });
                procedure.on('data', data);
                await Procedure.ping(<string>pingEndpoint);
                expect(data).to.have.been.called.exactly(0);
            });

            it('should return: true', async () => await expect(Procedure.ping(<string>pingEndpoint)).to.eventually.equal(true));

            context('when signal: already aborted AbortSignal', () => {
                let ac: AbortController;

                beforeEach(() => {
                    ac = new AbortController();
                    ac.abort();
                });

                it('should throw: Error', async () => await expect(Procedure.ping(<string>pingEndpoint, 500, ac.signal)).to.be.rejectedWith('signal was aborted'));
            });
        });

        // TODO: when endpoint: incorrect
        // TODO: when timeout infinity, NaN
        // TODO: when abortion signaled during ping

        afterEach(() => procedure.unbind());
    });
});
