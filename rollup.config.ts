import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import * as _ from 'lodash'
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'

import pkg from './package.json'

const libraryName = 'votes'

const config = ({ input, output }) => ({
  input,
  output,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['lodash'],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({}),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
})
export default [
  config({
    input: `src/${libraryName}.ts`,
    name: _.camelCase(libraryName),
    output: [
      {
        file: pkg.main,
        name: 'votes',
        format: 'umd',
        sourcemap: true,
        globals: {
          lodash: '_',
        },
      },
      {
        file: pkg.module,
        name: 'votes',
        format: 'es',
        sourcemap: true,
        globals: {
          lodash: '_',
        },
      },
    ],
  }),
  config({
    input: 'src/utils/index.ts',
    name: 'utils',
    output: [
      {
        file: 'dist/utils.umd.js',
        name: 'utils',
        format: 'umd',
        sourcemap: true,
        globals: {
          lodash: '_',
        },
      },
      {
        file: 'dist/utils.es5.js',
        name: 'utils',
        format: 'es',
        sourcemap: true,
        globals: {
          lodash: '_',
        },
      },
    ],
  }),
]
