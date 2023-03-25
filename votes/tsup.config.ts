import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  format: ['esm', 'cjs', 'iife'],
  clean: true,
  target: 'esnext',
  dts: true,
  minify: true,
  globalName: 'votes',
})
