module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  ignorePatterns: [
    '**/node_modules/*',
    '**/dist/*',
    '**/generated/*',
    '**/*.local.*',
    '.eslintrc.cjs',
    '*config.ts',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:storybook/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['react-refresh', 'simple-import-sort'],

  rules: {
    'react-refresh/only-export-components': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
  overrides: [
    {
      files: ['*.graphql'],
      parser: '@graphql-eslint/eslint-plugin',
      plugins: ['@graphql-eslint'],
      rules: {
        '@graphql-eslint/known-type-names': 'error',
      },
      parserOptions: {
        schema: './src/routes/graphql/**/*.ts',
      },
    },
  ],
};
