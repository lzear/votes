import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  format: ['esm', 'cjs'],
  clean: true,
  target: 'esnext',
  dts: true,
  minify: true,
})
