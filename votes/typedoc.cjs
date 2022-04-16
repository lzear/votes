module.exports = {
  out: './docs',
  includes: './src/index.ts',
  entryPoints: ['./src/index.ts'],
  exclude: ['**/*.test.ts', '**/test/**/*', '../node_modules/**/*'],
  externalPattern: ['../node_modules/**/*'],
  excludeExternals: true,
  excludePrivate: true,
}
