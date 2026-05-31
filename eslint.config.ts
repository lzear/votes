import config from '@lzear/forge/eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const base = await config()

export default defineConfig(
  globalIgnores([
    'dist/**',
    'build/**',
    'coverage/**',
    'node_modules/**',
    'votes/docs/**',
  ]),
  ...base,
  {
    rules: {
      curly: [2, 'multi'],
    },
  },
  {
    files: ['votes/**/*.test.ts'],
    rules: {
      'vitest/expect-expect': [
        'error',
        { assertFunctionNames: ['expect', 'expectNTimes'] },
      ],
    },
  },
)
