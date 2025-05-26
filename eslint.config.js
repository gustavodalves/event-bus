import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
    {
        files: ['**/*.{js,mjs,cjs,ts}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module'
            }
        },
        plugins: {
            '@typescript-eslint': tseslint
        },
        rules: {
            'indent': ['error', 4],
            'quotes': [2, 'single', 'avoid-escape'],
            'semi': ['error', 'always'],
            'comma-dangle': ['error', 'never'],
            'eol-last': ['error', 'always'],
            'arrow-body-style': ['error', 'as-needed'],
            'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 0 }],
            '@typescript-eslint/ban-types': 'off'
        }
    }
];
