import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  format: 'esm',
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
})
