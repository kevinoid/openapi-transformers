/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import RemoveTypeIfTransformer, { allNonNullTypes } from '../remove-type-if.js';

describe('RemoveTypeIfTransformer', () => {
  it('throws TypeError without predicate', () => {
    assert.throws(
      () => new RemoveTypeIfTransformer(),
      TypeError,
    );
  });

  it('throws TypeError with non-function predicate', () => {
    assert.throws(
      () => new RemoveTypeIfTransformer({}),
      TypeError,
    );
  });

  it('removes type where predicate(type) is true', () => {
    // eslint-disable-next-line no-use-before-define
    const transformer = new RemoveTypeIfTransformer(predicate);
    const type1 = ['boolean'];
    const type2 = 'number';
    let callCount = 0;
    function predicate(type) {
      callCount += 1;
      assert.strictEqual(this, transformer);
      assert(type === type1 || type === type2);
      return type === type1;
    }
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example1: {
              type: type1,
            },
            Example2: {
              type: type2,
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
            Example1: {},
            Example2: {
              type: type2,
            },
          },
        },
        paths: {},
      },
    );
    assert.strictEqual(callCount, 2);
  });

  it('removes type where predicate(type) is truthy', () => {
    // eslint-disable-next-line no-use-before-define
    const transformer = new RemoveTypeIfTransformer(predicate);
    const type1 = ['boolean'];
    const type2 = 'number';
    let callCount = 0;
    function predicate(type) {
      callCount += 1;
      assert.strictEqual(this, transformer);
      assert(type === type1 || type === type2);
      return type === type1 ? 1 : 0;
    }
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example1: {
              type: type1,
            },
            Example2: {
              type: type2,
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
            Example1: {},
            Example2: {
              type: type2,
            },
          },
        },
        paths: {},
      },
    );
    assert.strictEqual(callCount, 2);
  });

  it('does not call predicate with undefined', () => {
    assert.deepStrictEqual(
      new RemoveTypeIfTransformer(assert.fail).transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example1: {},
            Example2: {
              type: undefined,
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
            Example1: {},
            Example2: {
              type: undefined,
            },
          },
        },
        paths: {},
      },
    );
  });

  describe('validatesAllNonNullTypes', () => {
    it('removes type with all 5 non-null/integer types', () => {
      const transformer = new RemoveTypeIfTransformer(allNonNullTypes);
      assert.deepStrictEqual(
        transformer.transformOpenApi(deepFreeze({
          openapi: '3.1.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            schemas: {
              Example: {
                type: ['array', 'boolean', 'number', 'object', 'string'],
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
              Example: {},
            },
          },
          paths: {},
        },
      );
    });

    it('removes type with all 7 types', () => {
      const transformer = new RemoveTypeIfTransformer(allNonNullTypes);
      assert.deepStrictEqual(
        transformer.transformOpenApi(deepFreeze({
          openapi: '3.1.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            schemas: {
              Example: {
                type: [
                  'array',
                  'boolean',
                  'integer',
                  'null',
                  'number',
                  'object',
                  'string',
                ],
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
              Example: {},
            },
          },
          paths: {},
        },
      );
    });

    it('does not remove single type', () => {
      const transformer = new RemoveTypeIfTransformer(allNonNullTypes);
      assert.deepStrictEqual(
        transformer.transformOpenApi(deepFreeze({
          openapi: '3.1.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            schemas: {
              Example: {
                type: 'boolean',
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
                type: 'boolean',
              },
            },
          },
          paths: {},
        },
      );
    });

    it('does not remove type missing array', () => {
      const transformer = new RemoveTypeIfTransformer(allNonNullTypes);
      assert.deepStrictEqual(
        transformer.transformOpenApi(deepFreeze({
          openapi: '3.1.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            schemas: {
              Example: {
                type: [
                  'boolean',
                  'integer',
                  'null',
                  'number',
                  'object',
                  'string',
                ],
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
                type: [
                  'boolean',
                  'integer',
                  'null',
                  'number',
                  'object',
                  'string',
                ],
              },
            },
          },
          paths: {},
        },
      );
    });

    // JSON Schema specifies type array elements "MUST be unique".
    // Check that invalid documents are handled correctly anyway.
    it('removes type with 7 + duplicate types', () => {
      const transformer = new RemoveTypeIfTransformer(allNonNullTypes);
      assert.deepStrictEqual(
        transformer.transformOpenApi(deepFreeze({
          openapi: '3.1.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            schemas: {
              Example: {
                type: [
                  'array',
                  'boolean',
                  'integer',
                  'null',
                  'number',
                  'object',
                  'string',
                  'array',
                  'number',
                ],
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
              Example: {},
            },
          },
          paths: {},
        },
      );
    });

    // JSON Schema specifies type array elements "MUST be unique".
    // Check that invalid documents are handled correctly anyway.
    it('does not remove type with duplicates missing number', () => {
      const transformer = new RemoveTypeIfTransformer(allNonNullTypes);
      assert.deepStrictEqual(
        transformer.transformOpenApi(deepFreeze({
          openapi: '3.1.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            schemas: {
              Example: {
                type: [
                  'array',
                  'boolean',
                  'integer',
                  'null',
                  'object',
                  'string',
                  'integer',
                ],
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
                type: [
                  'array',
                  'boolean',
                  'integer',
                  'null',
                  'object',
                  'string',
                  'integer',
                ],
              },
            },
          },
          paths: {},
        },
      );
    });
  });
});
