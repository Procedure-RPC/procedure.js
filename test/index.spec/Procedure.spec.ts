import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    jest,
} from '@jest/globals';

import { ExtensionCodec } from '@msgpack/msgpack';
import Procedure from '../../src';
import { ProcedureInternalServerError } from '../../src/errors';

const consoleLogMockImplementation = <typeof console.log>(<unknown>undefined);

describe('Procedure', () => {
    describe('constructor(endpoint: string, callback: Callback, options: Partial<ProcedureOptions>)', () => {
        let instance: Procedure;

        describe('when options.verbose: true', () => {
            beforeEach(() => {
                instance = new Procedure((x) => x, { verbose: true });
            });
            describe('verbose', () =>
                it('should be: true', () => {
                    expect(instance.verbose).toEqual(true);
                }));
        });

        describe('when options.verbose is false', () => {
            beforeEach(() => {
                instance = new Procedure((x) => x, { verbose: false });
            });
            describe('verbose', () =>
                it('should be: false', () => {
                    expect(instance.verbose).toEqual(false);
                }));
        });

        describe('when options.verbose: undefined', () => {
            beforeEach(() => {
                instance = new Procedure((x) => x);
            });
            describe('verbose', () =>
                it('should be: false', () => {
                    expect(instance.verbose).toEqual(false);
                }));
        });

        describe('when options.workers: undefined', () => {
            beforeEach(() => {
                instance = new Procedure((x) => x);
            });
            describe('workers', () =>
                it('should be: 1', () => {
                    expect(instance.workers).toEqual(1);
                }));
        });

        describe('when options.workers: NaN', () => {
            beforeEach(() => {
                instance = new Procedure((x) => x, { workers: NaN });
            });
            describe('workers', () =>
                it('should be: 1', () => {
                    expect(instance.workers).toEqual(1);
                }));
        });

        describe('when options.workers: Infinity', () => {
            beforeEach(() => {
                instance = new Procedure((x) => x, { workers: Infinity });
            });
            describe('workers', () =>
                it('should be: 1', () => {
                    expect(instance.workers).toEqual(1);
                }));
        });

        describe('when options.workers: < 1', () => {
            beforeEach(() => {
                instance = new Procedure((x) => x, { workers: 0.8 });
            });
            describe('workers', () =>
                it('should be: 1', () => {
                    expect(instance.workers).toEqual(1);
                }));
        });

        describe('when options.workers: 10', () => {
            beforeEach(() => {
                instance = new Procedure((x) => x, { workers: 10 });
            });
            describe('workers', () =>
                it('should be: 10', () => {
                    expect(instance.workers).toEqual(10);
                }));
        });

        describe('when options.extensionCodec: undefined', () => {
            beforeEach(() => {
                instance = new Procedure((x) => x);
            });
            describe('extensionCodec', () =>
                it('should be: undefined', () => {
                    expect(instance.extensionCodec).toBeUndefined();
                }));
        });

        describe('when options.extensionCodec: instanceof ExtensionCodec', () => {
            beforeEach(() => {
                instance = new Procedure((x) => x, {
                    extensionCodec: new ExtensionCodec(),
                });
            });
            describe('extensionCodec', () =>
                it('should be: instanceof ExtensionCodec', () => {
                    expect(instance.extensionCodec).toBeInstanceOf(
                        ExtensionCodec
                    );
                }));
        });
    });

    describe('set verbose(value: boolean)', () => {
        let instance: Procedure;
        beforeEach(() => {
            instance = new Procedure((x) => x);
        });

        describe('when value: true', () => {
            beforeEach(() => {
                instance.verbose = true;
            });
            describe('verbose', () =>
                it('should be: true', () => {
                    expect(instance.verbose).toEqual(true);
                }));
        });

        describe('when value: false', () => {
            beforeEach(() => {
                instance.verbose = false;
            });
            describe('verbose', () =>
                it('should be: false', () => {
                    expect(instance.verbose).toEqual(false);
                }));
        });
    });

    describe('set extensionCodec(value: ExtensionCodec | undefined)', () => {
        let instance: Procedure;
        beforeEach(() => {
            instance = new Procedure((x) => x);
        });

        describe('when value: undefined', () => {
            beforeEach(() => {
                instance.extensionCodec = undefined;
            });
            describe('extensionCodec', () =>
                it('should be: undefined', () => {
                    expect(instance.extensionCodec).toBeUndefined();
                }));
        });

        describe('when value: instanceof ExtensionCodec', () => {
            beforeEach(() => {
                instance.extensionCodec = new ExtensionCodec();
            });
            describe('extensionCodec', () =>
                it('should be: instanceof ExtensionCodec', () => {
                    expect(instance.extensionCodec).toBeInstanceOf(
                        ExtensionCodec
                    );
                }));
        });
    });

    describe('set optionalParameterSupport(value: boolean)', () => {
        let instance: Procedure;
        beforeEach(() => {
            instance = new Procedure((x) => x);
        });

        describe('when value: true', () => {
            beforeEach(() => {
                instance.optionalParameterSupport = true;
            });
            describe('verbose', () =>
                it('should be: true', () => {
                    expect(instance.optionalParameterSupport).toEqual(true);
                }));
        });

        describe('when value: false', () => {
            beforeEach(() => {
                instance.optionalParameterSupport = false;
            });
            describe('verbose', () =>
                it('should be: false', () => {
                    expect(instance.optionalParameterSupport).toEqual(false);
                }));
        });
    });

    describe('set ignoreUndefinedProperties(value: boolean)', () => {
        let instance: Procedure;
        beforeEach(() => {
            instance = new Procedure((x) => x);
        });

        describe('when value: true', () => {
            beforeEach(() => {
                instance.ignoreUndefinedProperties = true;
            });
            describe('verbose', () =>
                it('should be: true', () => {
                    expect(instance.ignoreUndefinedProperties).toEqual(true);
                }));
        });

        describe('when value: false', () => {
            beforeEach(() => {
                instance.ignoreUndefinedProperties = false;
            });
            describe('verbose', () =>
                it('should be: false', () => {
                    expect(instance.ignoreUndefinedProperties).toEqual(false);
                }));
        });
    });

    describe('bind(): this', () => {
        let instance: Procedure;
        beforeEach(() => {
            instance = new Procedure((x) => x);
        });
        afterEach(() => {
            instance.unbind().removeAllListeners();
        });

        it('should return: this', () => {
            expect(instance.bind('inproc://foo')).toEqual(instance);
        });

        describe("when endpoint: ''", () => {
            beforeEach(() => {
                instance = new Procedure((x) => x);
            });

            describe('instance', () =>
                it("should emit: 'error'", () => {
                    const error = jest.fn((error: unknown) => {
                        expect(error).toBeInstanceOf(
                            ProcedureInternalServerError
                        );
                        expect(error).toHaveProperty('data');
                        expect(
                            (<ProcedureInternalServerError>error).data
                        ).toHaveProperty('error');
                    });
                    instance.on('error', error).bind('');
                    expect(error).toHaveBeenCalledTimes(1);
                }));

            describe('when verbose: true', () => {
                beforeEach(() => {
                    instance = new Procedure((x) => x);
                    instance.verbose = true;
                });
                describe('instance', () =>
                    it('should call console.error', () => {
                        const error = jest
                            .spyOn(console, 'error')
                            .mockImplementation(consoleLogMockImplementation);
                        instance.bind('');
                        expect(error).toHaveBeenCalledTimes(1);
                    }));
                afterEach(() => {
                    instance.verbose = false;
                });
            });
        });

        describe("when endpoint: 'inproc://Procedure'", () => {
            beforeEach(() => {
                instance = new Procedure((x) => x);
            });
            describe('instance', () =>
                it("should not emit: 'error'", () => {
                    const error = jest.fn();
                    instance.on('error', error).bind('inproc://Procedure');
                    expect(error).not.toHaveBeenCalled();
                }));

            describe('when already bound', () => {
                beforeEach(() => {
                    instance.bind('inproc://Procedure');
                });
                describe('instance', () =>
                    it("should emit: 'unbind'", () => {
                        const unbind = jest.fn();
                        instance
                            .on('unbind', unbind)
                            .bind('inproc://Procedure');
                        expect(unbind).toHaveBeenCalledTimes(1);
                    }));
            });
        });
    });

    describe('unbind(): this', () => {
        let instance: Procedure;
        beforeEach(() => {
            instance = new Procedure((x) => x);
        });

        it('should return: this', () => {
            expect(instance.unbind()).toEqual(instance);
        });

        describe("when instance bound to endpoint: 'inproc://Procedure'", () => {
            beforeEach(() => {
                instance = new Procedure((x) => x);
                instance.bind('inproc://Procedure');
            });
            describe('instance', () =>
                it("should emit: 'unbind'", () => {
                    const unbind = jest.fn();
                    instance.on('unbind', unbind).unbind();
                    expect(unbind).toHaveBeenCalledTimes(1);
                }));

            describe('when verbose: true', () => {
                beforeEach(() => {
                    instance.verbose = true;
                });
                describe('instance', () =>
                    it('should call console.log', () => {
                        const log = jest
                            .spyOn(console, 'log')
                            .mockImplementation(consoleLogMockImplementation);
                        instance.unbind();
                        expect(log).toHaveBeenCalledTimes(2);
                    }));
                afterEach(() => {
                    instance.verbose = false;
                });
            });
        });
    });
});
