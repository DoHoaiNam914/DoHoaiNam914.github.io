'use strict';

module.exports = {
  env: {
    browser: true,
    es2021: true,
    jquery: true,
  },
  extends: 'airbnb-base',
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script',
  },
  rules: {
    'eol-last': [
      'off',
      'always',
    ],
    // CHANGES: error -> off
    'newline-per-chained-call': [
      'off',
      {
        ignoreChainWithDepth: 4,
      },
    ],
    // CHANGES: error -> off
    'max-len': [
      'warn',
      100,
      2,
      {
        ignoreUrls: true,
        ignoreComments: false,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    // CHANGES: error -> warn
    'no-underscore-dangle': [
      'warn',
      {
        allow: [],
        allowAfterThis: false,
        allowAfterSuper: false,
        enforceInMethodNames: true,
      },
    ],
    // CHANGES: error -> warn
    'default-param-last': 'error',
    // Không xác định,
    'no-duplicate-imports': 'off',
    'import/no-duplicates': 'error',
    // no-duplicate-imports -> import/no-duplicates,
    // Project,
    'no-await-in-loop': 'warn',
    // error -> warn,
    'no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
      },
    ],
    // error -> warn,
    'no-use-before-define': [
      'warn',
      {
        functions: true,
        classes: true,
        variables: true,
      },
    ],
    // error -> warn,
    'max-classes-per-file': [
      'warn',
      1,
    ],
    // error -> warn,
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: [
          //          'acc',
          //          // for reduce accumulators,
          //          'accumulator',
          //          // for reduce accumulators,
          //          'e',
          //          // for e.returnvalue,
          //          'ctx',
          //          // for Koa routing,
          //          'context',
          //          // for Koa routing,
          //          'req',
          //          // for Express requests,
          //          'request',
          //          // for Express requests,
          //          'res',
          //          // for Express responses,
          //          'response',
          //          // for Express responses,
          //          '$scope',
          //          // for Angular 1 scopes,
          //          'staticContext',
          //          // for ReactRouter context,
          'array',
        ],
      },
    ],
    // error -> warn,
    'no-return-assign': [
      'warn',
      'always',
    ],
    // error -> warn,
    // Strict,
    strict: [
      'error',
      'global',
    ],
    // CHANGES: error -> warn, never -> global,
  },
};
