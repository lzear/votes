import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  format: ['esm', 'cjs', 'iife'],
  clean: true,
  target: 'esnext',
  dts: true,
  minify: true,
  // Tie-break traces and election steps report class names.
  keepNames: true,
  globalName: 'votes',
})
