/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import ConstToEnumTransformer from '../const-to-enum.js';

describe('ConstToEnumTransformer', () => {
  it('const: 1 to enum: [1]', () => {
    assert.deepStrictEqual(
      new ConstToEnumTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              const: 1,
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
              enum: [1],
            },
          },
        },
        paths: {},
      },
    );
  });

  it('const: null to enum: [null]', () => {
    assert.deepStrictEqual(
      new ConstToEnumTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              const: null,
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

  // const and enum on the same type is redundant, but valid (AFAICT)
  it('removes const with matching enum', () => {
    assert.deepStrictEqual(
      new ConstToEnumTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              const: 1,
              enum: [1],
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
              enum: [1],
            },
          },
        },
        paths: {},
      },
    );
  });

  // since const value is only one which satisfies both constraints
  it('narrows matching enum to only const value', () => {
    assert.deepStrictEqual(
      new ConstToEnumTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              const: null,
              enum: [1, null],
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
