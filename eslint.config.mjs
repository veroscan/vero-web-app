import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', '.data/**', 'docs/**', '**/*.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      // Off on purpose: async Fastify hooks and async test stubs are normal here, and
      // no-floating-promises and no-misused-promises above catch the real mistakes.
      '@typescript-eslint/require-await': 'off',
      eqeqeq: ['error', 'always'],
    },
  },
  {
    // Raw database access is only allowed in the data layer, so no route or module
    // can run a query outside withOrg / withUser / withSystem by accident.
    files: ['apps/api/src/**/*.ts'],
    ignores: ['apps/api/src/db/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'pg', message: 'Use the Database class in src/db (withOrg, withUser, withSystem).' },
            { name: 'drizzle-orm/node-postgres', message: 'Use the Database class in src/db.' },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },
);
