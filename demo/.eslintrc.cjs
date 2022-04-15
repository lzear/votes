module.exports = {
  extends: ['next/babel', 'next/core-web-vitals'],
  parserOptions: {
    ecmaVersion: 2022
  },
  env: {
    browser: true,
    es2020: true,
    es2021: true,
    node: true,
  },
  rules: {
    'jsx-quotes': 2,
  },
}
