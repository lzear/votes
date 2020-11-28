import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import sizes from 'rollup-plugin-sizes'

import pkg from './package.json'

const libraryName = 'votes'

export default {
  input: `src/${libraryName}.ts`,
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
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['lodash'],
  watch: {
    include: 'src/**',
  },
  plugins: [json(), typescript(), commonjs(), resolve(), sourceMaps(), sizes()],
}
