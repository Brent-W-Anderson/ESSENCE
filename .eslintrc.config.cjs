const typescriptParser = require('@typescript-eslint/parser')
const typescriptEslintPlugin = require('@typescript-eslint/eslint-plugin')
const importPlugin = require('eslint-plugin-import')
const prettierPlugin = require('eslint-plugin-prettier')

module.exports = {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
        parser: typescriptParser,
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: {
        '@typescript-eslint': typescriptEslintPlugin,
        'import': importPlugin,
        'prettier': prettierPlugin
    },
    rules: {
        '@typescript-eslint/no-unused-vars': 'warn',
        'import/order': [
            'warn',
            {
                'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                'newlines-between': 'always',
                'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
            }
        ],
        'prettier/prettier': 'error',
    },
    ignores: ['dist/', 'node_modules/', '**/*.scss.d.ts'],
}
