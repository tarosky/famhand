module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
        "jest/globals": true,
    },
    plugins: [
        "jest",
    ],
    extends: [
        'eslint:recommended',
    ],
    rules: {
    },
    parserOptions: {
        sourceType: 'module',
    }
};
