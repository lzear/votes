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
      globals: (a) => {
        const split = a.split('/')
        return split[split.length - 1]
      },
    },
    {
      file: pkg.module,
      name: 'votes',
      format: 'es',
      sourcemap: true,
    },
  ],
  external: (id) => Object.keys(pkg.dependencies).some((d) => id.startsWith(d)),
  watch: {
    include: 'src/**',
  },
  plugins: [
    json(),
    typescript(),
    commonjs(),
    resolve({
      jsnext: true,
      skip: Object.keys(pkg.dependencies),
    }),
    sourceMaps(),
    sizes(),
  ],
}
