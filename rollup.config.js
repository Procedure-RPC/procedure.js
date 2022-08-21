import typescript from 'rollup-plugin-ts';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: './src/index.ts',
    output: [{
        sourcemap: true,
        format: 'esm',
        file: './dist/index.esm.js',
    },
    {
        sourcemap: true,
        format: 'cjs',
        file: './dist/index.cjs.js',
    }],
    plugins: [
        typescript({
            tsconfig: './tsconfig.json'
        }),
        terser({
            format: {
                comments: false
            },
            compress: false
        }),
        resolve({
            modulesOnly: true,
        }),
        commonjs(),
        nodePolyfills(),
    ],
};
