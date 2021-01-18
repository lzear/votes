module.exports = {
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
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
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
}
