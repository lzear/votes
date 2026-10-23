import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  format: ['esm', 'cjs', 'iife'],
  // `.js` and `.d.ts` for ESM, as `"type": "module"` exports expect
  fixedExtension: false,
  target: 'esnext',
  // No declaration maps: the package doesn't ship them.
  dts: { sourcemap: false },
  plugins: [
    {
      // rolldown-plugin-dts drops the ESM build's d.ts map, but not the
      // comment naming it
      name: 'dts-without-map-comment',
      generateBundle: (_, bundle) => {
        for (const chunk of Object.values(bundle))
          if (chunk.type === 'chunk' && chunk.fileName.endsWith('.d.ts'))
            chunk.code = chunk.code.replace(/\n\/\/# sourceMappingURL=\S+$/, '')
      },
    },
  ],
  minify: true,
  globalName: 'votes',
  // tsup's name for the IIFE build, which CDN links point at
  // The CJS d.ts builds alone, without the plugins above.
  outputOptions: (options, format, { cjsDts }) =>
    format === 'iife'
      ? { ...options, entryFileNames: '[name].global.js' }
      : cjsDts
        ? { ...options, sourcemap: false }
        : options,
})
