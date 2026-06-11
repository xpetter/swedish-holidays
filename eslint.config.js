'use strict';

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.js', '**/*.mjs'],
        languageOptions: {
            ecmaVersion: 2022,
            globals: {
                ...globals.node,
                ...globals.browser,
                ...globals.amd
            }
        },
        rules: {
            'no-var': 'error',
            'prefer-const': 'error',
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
            'no-shadow': 'error',
            'no-implicit-coercion': 'error'
        }
    },
    {
        files: ['**/*.js'],
        ignores: ['src/swedish-calendar.mjs', 'test/**/*.mjs'],
        languageOptions: {
            sourceType: 'commonjs'
        }
    },
    {
        files: ['**/*.mjs'],
        languageOptions: {
            sourceType: 'module'
        }
    },
    {
        ignores: ['node_modules/']
    }
];
