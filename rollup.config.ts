import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'

import pkg from './package.json'

const libraryName = 'votes'

const rollupConfig = {
  input: `src/${libraryName}.ts`,
  external: ['lodash'],
  output: [
    {
      file: pkg.module,
      format: 'es',
      globals: { lodash: '_' },
      name: 'votes',
      sourcemap: true,
    },
    {
      file: pkg.main,
      format: 'umd',
      globals: { lodash: '_' },
      name: 'votes',
      sourcemap: true,
    },
  ],
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
  watch: { include: 'src/**' },
}

export default rollupConfig
