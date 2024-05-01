const typescriptParser = require('@typescript-eslint/parser')
const typescriptEslintPlugin = require('@typescript-eslint/eslint-plugin')
const importPlugin = require('eslint-plugin-import')
const prettierPlugin = require('eslint-plugin-prettier')
const solidPlugin = require('eslint-plugin-solid')

module.exports = {
    files: ['src/**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    ignores: ['dist/', 'node_modules/', '**/*.scss.d.ts'],
    languageOptions: {
        parser: typescriptParser,
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: {
        '@typescript-eslint': typescriptEslintPlugin,
        'import': importPlugin,
        'prettier': prettierPlugin,
        'solid': solidPlugin
    },
    rules: {
        '@typescript-eslint/no-unused-vars': 'warn',
        'import/order': [
            'warn',
            {
                'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                'newlines-between': 'never',
                'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
            }
        ],
        'prettier/prettier': 'error',
    },
}
