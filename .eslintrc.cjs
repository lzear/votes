module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 0,
    'prettier/prettier': 2,
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ['*.ts'],
      rules: { '@typescript-eslint/explicit-module-boundary-types': 2 },
    },
  ],
}
