const { defineConfig } = require('eslint/config')
const js = require('@eslint/js')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const prettier = require('eslint-config-prettier/flat')
const globals = require('globals')

module.exports = defineConfig([
  {
    ignores: ['**/node_modules/**', '**/bin/**', '**/dist/**', '**/tools/**', '**/test/helpers/**'],
  },
  {
    files: ['**/*.{ts,js}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/*.ts'],
    extends: [tsPlugin.configs['flat/recommended']],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
  prettier,
])
