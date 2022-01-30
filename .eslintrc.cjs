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
    'plugin:unicorn/recommended',
    // 'plugin:import/recommended',
    // 'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'unicorn', 'prettier'],
  rules: {
    'unicorn/prevent-abbreviations': 0,
    'unicorn/prefer-object-from-entries': 0,
    'unicorn/no-array-reduce': 0,
    'unicorn/no-null': 0,
    'unicorn/prefer-number-properties': 0,
    'unicorn/no-new-array': 0,
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
