import config from '@lzear/forge/eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const base = await config()

export default defineConfig(globalIgnores(['votes/docs/**']), ...base, {
  files: ['votes/**/*.test.ts'],
  rules: {
    'vitest/expect-expect': [
      'error',
      { assertFunctionNames: ['expect', 'expectNTimes'] },
    ],
  },
})
