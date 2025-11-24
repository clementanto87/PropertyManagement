module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
        project: ['./tsconfig.json'],
    },
    plugins: ['@typescript-eslint', 'react', 'react-hooks', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:prettier/recommended',
    ],
    env: {
        browser: true,
        node: true,
        es2021: true,
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        // Example customizations
        'react/react-in-jsx-scope': 'off', // not needed with new JSX transform
        '@typescript-eslint/no-explicit-any': 'warn',
        'prettier/prettier': ['error'],
    },
};
