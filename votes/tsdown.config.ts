import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  format: ['esm', 'cjs', 'iife'],
  // `.js` and `.d.ts` for ESM, as `"type": "module"` exports expect
  fixedExtension: false,
  target: 'esnext',
  // the lib tsconfig's declaration maps would emit maps for the JS too
  dts: { sourcemap: false },
  minify: true,
  globalName: 'votes',
  // tsup's name for the IIFE build, which CDN links point at
  outputOptions: (options, format) =>
    format === 'iife'
      ? { ...options, entryFileNames: '[name].global.js' }
      : options,
})
