import typescript from 'rollup-plugin-ts';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import commonjs from '@rollup/plugin-commonjs';
import externals from '@yelo/rollup-node-external';

export default {
    input: './src/index.ts',
    output: [{
        sourcemap: true,
        format: 'esm',
        file: './dist/index.mjs',
    }],
    external: externals(),
    plugins: [
        resolve({
            modulesOnly: false,
        }),
        commonjs(),
        nodePolyfills(),
        typescript({
            tsconfig: './tsconfig.json'
        }),
        terser({
            format: {
                comments: false
            },
            compress: false
        }),
    ],
};
