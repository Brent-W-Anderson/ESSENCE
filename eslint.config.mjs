// eslint.config.js
import js from '@eslint/js'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import solid from 'eslint-plugin-solid'
import globals from 'globals'

export default [
    { ignores: ['dist/', 'node_modules/', '**/*.module.scss.d.ts', '.yarn/'] },

    js.configs.recommended,

    {
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: { jsx: true }
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                window: 'readonly',
                document: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': ts,
            solid
        },
        rules: {
            ...ts.configs.recommended.rules,
            'no-trailing-spaces': 'error',
            '@typescript-eslint/member-ordering': ['error', { default: { order: 'alphabetically' } }],
            'max-len': ['error', {
                code: 80,
                ignoreComments: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
                ignoreRegExpLiterals: true
            }],
            'no-multiple-empty-lines': ['error', {
                max: 1,
                maxEOF: 1,
                maxBOF: 0
            }],
            'object-curly-newline': ['warn', {
                ObjectExpression: {
                    minProperties: 99,
                    multiline: true,
                    consistent: true
                },
                ObjectPattern:    {
                    minProperties: 99,
                    multiline: true,
                    consistent: true
                },
                ImportDeclaration:{
                    minProperties: 99,
                    multiline: true,
                    consistent: true
                },
                ExportDeclaration:{
                    minProperties: 99,
                    multiline: true,
                    consistent: true
                }
            }],
            indent: ['error', 4],
            semi: ['error', 'never'],
            quotes: ['error', 'single', { avoidEscape: true }],
            'function-call-argument-newline': ['error', 'consistent'],
            'function-paren-newline': ['error', 'multiline'],
            'object-property-newline': ['error', { allowAllPropertiesOnSameLine: false }],
            'space-in-parens': ['error', 'always'],
            'eol-last': ['error', 'never'],
            'array-bracket-spacing': ['error', 'never'],
            'object-curly-spacing': ['error', 'always'],
            'operator-linebreak': ['error', 'before'],
            'comma-dangle': ['error', 'never']
        }
    },

    // TS-only rules for TS files
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: { parser: tsParser },
        plugins: { '@typescript-eslint': ts }
    }
]