import vue from 'eslint-plugin-vue';
import globals from 'globals';
import parser from 'vue-eslint-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ['.nuxt/', '.output/', 'node_modules/', 'static/sw.js'],
}, ...compat.extends('eslint:recommended', 'plugin:vue/recommended'), {
    plugins: {
        vue,
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: parser,
        ecmaVersion: 2020,
        sourceType: 'module',
    },

    rules: {
        curly: ['error', 'multi'],
        'linebreak-style': ['error', 'unix'],
        'no-cond-assign': 'error',
        'no-unused-vars': 'warn',

        quotes: ['error', 'single', {
            allowTemplateLiterals: true,
        }],

        semi: 'off',
        'vue/html-indent': ['warn', 4],

        'vue/html-self-closing': ['off', {
            html: {
                void: 'never',
                normal: 'always',
                component: 'always',
            },

            svg: 'always',
            math: 'always',
        }],

        'vue/html-quotes': ['warn', 'double'],
    },
}];
