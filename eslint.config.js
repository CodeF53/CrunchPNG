import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': ['error', {
      allow: ['time', 'timeEnd', 'error'],
    }],
    'yml/no-empty-mapping-value': 0,
  },
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
  ignorePatterns: ['**/*.scss'],
})
