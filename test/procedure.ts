import 'mocha'
import chai, { expect } from 'chai'
import chaiQuantifiers from 'chai-quantifiers'
import spies from 'chai-spies'
import chaiAsPromised from 'chai-as-promised'
import Procedure, { Callback, cloneError, errorEntries, isError, isErrorLike } from '../src/procedure'
import { ExtensionCodec } from '@msgpack/msgpack'

chai.use(chaiQuantifiers);
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
                    // const log = chai.spy.on(console, 'log', () => { return; })
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

            afterEach(() => callEndpoint = undefined);
        });

        afterEach(() => procedure.unbind());
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
