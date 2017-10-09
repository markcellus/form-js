module.exports = {
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
    env: {
        es6: true,
        browser: true,
        node: true,
        qunit: true,
    },
    rules: {
        'no-console': [
            'error', {
                allow: ['warn', 'error']
            }
        ],
    },
};
