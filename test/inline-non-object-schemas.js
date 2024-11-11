/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import InlineNonObjectSchemaTransformer from '../inline-non-object-schemas.js';
import { openapi, schema3 } from '../test-lib/skeletons.js';

describe('InlineNonObjectSchemaTransformer', () => {
  it('throws TypeError with null options', () => {
    assert.throws(
      () => new InlineNonObjectSchemaTransformer(null),
      TypeError,
    );
  });

  it('throws TypeError with number options.resolveRef', () => {
    assert.throws(
      () => new InlineNonObjectSchemaTransformer({ resolveRef: 1 }),
      TypeError,
    );
  });

  it('inlines non-object schema with constraints by default', () => {
    assert.deepStrictEqual(
      new InlineNonObjectSchemaTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        components: {
          schemas: {
            Weight: {
              type: 'number',
              minimum: 0,
            },
            Example: {
              type: 'object',
              properties: {
                weight: {
                  $ref: '#/components/schemas/Weight',
                },
              },
            },
          },
        },
        paths: {},
      })),
      {
        ...openapi,
        components: {
          schemas: {
            Weight: {
              type: 'number',
              minimum: 0,
            },
            Example: {
              type: 'object',
              properties: {
                weight: {
                  type: 'number',
                  minimum: 0,
                },
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('does not inline non-object schema without constraints by default', () => {
    assert.deepStrictEqual(
      new InlineNonObjectSchemaTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        components: {
          schemas: {
            Weight: {
              type: 'number',
            },
            Example: {
              type: 'object',
              properties: {
                weight: {
                  $ref: '#/components/schemas/Weight',
                },
              },
            },
          },
        },
        paths: {},
      })),
      {
        ...openapi,
        components: {
          schemas: {
            Weight: {
              type: 'number',
            },
            Example: {
              type: 'object',
              properties: {
                weight: {
                  $ref: '#/components/schemas/Weight',
                },
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('inlines non-object schema without constraints with inlineAll', () => {
    const transformer =
      new InlineNonObjectSchemaTransformer({ inlineAll: true });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        ...openapi,
        components: {
          schemas: {
            Weight: {
              type: 'number',
            },
            Example: {
              type: 'object',
              properties: {
                weight: {
                  $ref: '#/components/schemas/Weight',
                },
              },
            },
          },
        },
        paths: {},
      })),
      {
        ...openapi,
        components: {
          schemas: {
            Weight: {
              type: 'number',
            },
            Example: {
              type: 'object',
              properties: {
                weight: {
                  type: 'number',
                },
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('uses options.resolveRef to resolve $ref', () => {
    function resolveRef($ref) {
      assert.strictEqual($ref, '#/components/schemas/Weight');
      return {
        type: 'number',
        minimum: 0,
      };
    }
    const transformer = new InlineNonObjectSchemaTransformer({ resolveRef });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        type: 'object',
        properties: {
          weight: {
            $ref: '#/components/schemas/Weight',
          },
        },
      }))),
      schema3({
        type: 'object',
        properties: {
          weight: {
            type: 'number',
            minimum: 0,
          },
        },
      }),
    );
  });
});
