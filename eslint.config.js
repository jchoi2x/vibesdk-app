import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  {
    ignores: [
      'dist',
      '**/dist',
      'wrangler-configuration.d.ts',
      '**/cloudflare-env.d.ts',
      'test-diff-formatters/**',
      'cf-git/**',
      '**/.wrangler/**',
      '.nx/**',
      'apps/vibesdk-api/templates/build/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
  },
  // Disable react-refresh/only-export-components for UI components
  // as shadcn/ui components commonly export both components and utilities
  {
    files: ['apps/vibesdk-web/src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // Contexts and feature modules intentionally export hooks/objects
  {
    files: [
      'apps/vibesdk-web/src/contexts/**/*.{ts,tsx}',
      'apps/vibesdk-web/src/features/**/*.{ts,tsx}',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // Auth modal provider exports a hook + provider
  {
    files: ['apps/vibesdk-web/src/components/auth/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
);
