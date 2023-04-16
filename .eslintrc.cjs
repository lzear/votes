module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:markdown/recommended',
    'plugin:import/recommended',
    'plugin:import/errors',
    'plugin:import/typescript',
    'plugin:unicorn/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.cjs']
      }
    },
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'eslint-plugin-tsdoc',
    'react',
    'unicorn',
    'prettier',
    'simple-import-sort',
  ],
  rules: {
    // '@typescript-eslint/no-floating-promises': 2,

    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/consistent-type-imports': 2,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-unused-vars': [
      2,
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: `^_`,
      },
    ],
    'import/first': 2,
    'import/newline-after-import': 2,
    'import/no-duplicates': 2,
    'import/order': 0,
    'jsx-quotes': 2,
    'object-shorthand': 2,
    'prettier/prettier': 2,
    'react/jsx-curly-brace-presence': [2, 'never'],
    'simple-import-sort/exports': 2,
    'simple-import-sort/imports': [
      2,
      {
        groups: [
          // Node.js builtins. You could also generate this regex if you use a `.js` config.
          // For example: `^(${require("module").builtinModules.join("|")})(/|$)`
          // Note that if you use the `node:` prefix for Node.js builtins,
          // you can avoid this complexity: You can simply use "^node:".
          ['^node:'],
          [
            '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
          ],
          // Packages. `react` related packages come first.
          ['^react', '^@?\\w'],
          // Internal packages.
          ['^(votes)(\\/.*|$)'],
          // Side effect imports.
          ['^\\u0000'],
          // Parent imports. Put `..` last.
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // Other relative imports. Put same-folder imports and `.` last.
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Style imports.
          ['^.+\\.s?css$'],
        ],
      },
    ],
    'tsdoc/syntax': 1,
    'unicorn/no-array-reduce': 0,
    'unicorn/no-new-array': 0,
    'unicorn/no-null': 0,
    'unicorn/prefer-number-properties': 0,
    'unicorn/prefer-object-from-entries': 0,
    'unicorn/prevent-abbreviations': 0,
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ['*.ts'],
      rules: { '@typescript-eslint/explicit-module-boundary-types': 2 },
    },
    {
      // enable the rule specifically for TypeScript files
      files: ['*.test.ts'],
      rules: { '@typescript-eslint/ban-ts-comment': 0 },
    },
  ],
}
