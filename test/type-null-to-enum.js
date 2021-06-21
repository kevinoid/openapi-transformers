/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';
import deepFreeze from 'deep-freeze';

import TypeNullToEnumTransformer from '../type-null-to-enum.js';

describe('TypeNullToEnumTransformer', () => {
  it('type: \'null\' to enum: [null]', () => {
    assert.deepStrictEqual(
      new TypeNullToEnumTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'null',
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              enum: [null],
            },
          },
        },
        paths: {},
      },
    );
  });

  it('type: [\'null\'] to enum: [null]', () => {
    assert.deepStrictEqual(
      new TypeNullToEnumTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: ['null'],
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              enum: [null],
            },
          },
        },
        paths: {},
      },
    );
  });

  it('does not change mixed type', () => {
    assert.deepStrictEqual(
      new TypeNullToEnumTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: ['null', 'number'],
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: ['null', 'number'],
            },
          },
        },
        paths: {},
      },
    );
  });

  it('removes type: \'null\' with existing enum', () => {
    assert.deepStrictEqual(
      new TypeNullToEnumTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'null',
              enum: [null],
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              enum: [null],
            },
          },
        },
        paths: {},
      },
    );
  });
});
