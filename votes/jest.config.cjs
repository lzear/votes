module.exports = {
  preset: 'ts-jest',

  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  transform: {},
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '/src/axioms/',
    '/dist/',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 50,
      lines: 95,
      statements: 95,
    },
  },
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/docs/'],
}
