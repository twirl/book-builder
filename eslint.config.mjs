// eslint.config.js
import js from '@eslint/js';
import ts from 'typescript-eslint';

export default [
    // Base configuration
    js.configs.recommended,
    ...ts.configs.recommended,
    {
        ignores: ['node_modules', 'build']
    },

    // Source files configuration (strict)
    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' }
            ], // Warn but don’t fail on unused variables, ignore variables starting with _
            '@typescript-eslint/explicit-function-return-type': 'off', // Disable explicit return types on functions
            'no-irregular-whitespace': 'off',
            'no-useless-escape': 'off'
        }
    },

    // Test files configuration (relaxed)
    {
        files: ['test/**/*.ts', 'test/**/*.tsx', 'test*.ts'],
        rules: {
            'no-console': 'off', // Allow console logs in tests
            '@typescript-eslint/no-explicit-any': 'off', // Allow 'any' type
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' }
            ], // Warn but don’t fail on unused variables, ignore variables starting with _
            '@typescript-eslint/no-non-null-assertion': 'off'
        }
    }
];
