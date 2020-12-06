module.exports = {
  out: './docs',
  includes: './src',
  exclude: ['**/*.test.ts', '**/test/**/*'],
  mode: 'file',
  excludeExternals: true,
  excludeNotExported: true,
  excludePrivate: true,
}
