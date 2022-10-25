/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';
import deepFreeze from 'deep-freeze';

import TypeNullToNullableTransformer from '../type-null-to-nullable.js';

describe('TypeNullToNullableTransformer', () => {
  it('adds `nullable: true`, removes "null" from 2-type', () => {
    assert.deepStrictEqual(
      new TypeNullToNullableTransformer().transformOpenApi(deepFreeze({
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
              type: 'number',
              nullable: true,
            },
          },
        },
        paths: {},
      },
    );
  });

  it('adds `nullable: true`, removes "null" from 3-type', () => {
    assert.deepStrictEqual(
      new TypeNullToNullableTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: ['number', 'null', 'string'],
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
              type: ['number', 'string'],
              nullable: true,
            },
          },
        },
        paths: {},
      },
    );
  });

  it('removes "null" on schema with `nullable: true`', () => {
    assert.deepStrictEqual(
      new TypeNullToNullableTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: ['null', 'number'],
              nullable: true,
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
              type: 'number',
              nullable: true,
            },
          },
        },
        paths: {},
      },
    );
  });

  it('does not change schema without "null" type', () => {
    assert.deepStrictEqual(
      new TypeNullToNullableTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: ['number', 'string'],
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
              type: ['number', 'string'],
            },
          },
        },
        paths: {},
      },
    );
  });

  // Removing `type: 'null'` would allow any type instead of only null.
  // `type: 'null'` is handled by type-null-to-enum.js
  it('does not change schema with type: \'null\'', () => {
    assert.deepStrictEqual(
      new TypeNullToNullableTransformer().transformOpenApi(deepFreeze({
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
              type: 'null',
            },
          },
        },
        paths: {},
      },
    );
  });

  // Removing `type: ['null']` would allow any type instead of only null.
  // `type: ['null']` is handled by type-null-to-enum.js
  it('does not change schema with type: [\'null\']', () => {
    assert.deepStrictEqual(
      new TypeNullToNullableTransformer().transformOpenApi(deepFreeze({
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
              type: ['null'],
            },
          },
        },
        paths: {},
      },
    );
  });
});
