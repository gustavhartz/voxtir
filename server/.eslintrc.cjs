module.exports = {
  env: {
    browser: false,
    es6: true,
    node: true,
  },
  ignorePatterns: [
    '**/node_modules/*',
    '**/dist/*',
    '**/generated/*',
    '**/*.local.*',
    '.eslintrc.cjs',
    '*config.ts',
    'jest.setup.ts'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    "@typescript-eslint/no-non-null-assertion": "off"
  },
};
