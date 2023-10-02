/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import InlineNonObjectSchemaTransformer from '../inline-non-object-schemas.js';

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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
      transformer.transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
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
});
