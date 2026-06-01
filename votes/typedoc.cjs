module.exports = {
  out: './docs',
  entryPoints: ['./src/index.ts'],
  exclude: ['**/*.test.ts', '**/test/**/*', '../node_modules/**/*'],
  externalPattern: ['../node_modules/**/*'],
  excludeExternals: true,
  excludePrivate: true,
  excludeInternal: true,
  validation: { notExported: false },
}
