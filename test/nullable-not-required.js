/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import NullableNotRequiredTransformer from '../nullable-not-required.js';
import { schema2, schema3 } from '../test-lib/skeletons.js';

function describeWithOptions(options) {
  const requiredUnconstrained =
    options?.requireUnconstrained ? { required: ['name'] } : undefined;

  it('nullable required property to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          type: 'object',
          properties: {
            name: {
              type: 'string',
              nullable: true,
            },
          },
          required: ['name'],
        }))),
      schema3({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            nullable: true,
          },
        },
      }),
    );
  });

  it('x-nullable required property to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema2({
          type: 'object',
          properties: {
            name: {
              type: 'string',
              'x-nullable': true,
            },
          },
          required: ['name'],
        }))),
      schema2({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            'x-nullable': true,
          },
        },
      }),
    );
  });

  it('nullable additionalProperties to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          type: 'object',
          additionalProperties: {
            type: 'string',
            nullable: true,
          },
          required: ['name'],
        }))),
      schema3({
        type: 'object',
        additionalProperties: {
          type: 'string',
          nullable: true,
        },
      }),
    );
  });

  it('non-nullable additionalProperties still required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          type: 'object',
          additionalProperties: {
            type: 'string',
          },
          required: ['name'],
        }))),
      schema3({
        type: 'object',
        additionalProperties: {
          type: 'string',
        },
        required: ['name'],
      }),
    );
  });

  it('nullable with non-nullable additionalProperties not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          type: 'object',
          properties: {
            name: {
              type: 'string',
              nullable: true,
            },
          },
          additionalProperties: {
            type: 'string',
          },
          required: ['name'],
        }))),
      schema3({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            nullable: true,
          },
        },
        additionalProperties: {
          type: 'string',
        },
      }),
    );
  });

  it('non-nullable with nullable additionalProperties still required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
          },
          additionalProperties: {
            type: 'string',
            nullable: true,
          },
          required: ['name'],
        }))),
      schema3({
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
        additionalProperties: {
          type: 'string',
          nullable: true,
        },
        required: ['name'],
      }),
    );
  });

  it('null required property to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          type: 'object',
          properties: {
            name: {
              type: 'null',
            },
          },
          required: ['name'],
        }, '3.1.0'))),
      schema3({
        type: 'object',
        properties: {
          name: {
            type: 'null',
          },
        },
      }, '3.1.0'),
    );
  });

  it('string/null required property to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          type: 'object',
          properties: {
            name: {
              type: ['string', 'null'],
            },
          },
          required: ['name'],
        }, '3.1.0'))),
      schema3({
        type: 'object',
        properties: {
          name: {
            type: ['string', 'null'],
          },
        },
      }, '3.1.0'),
    );
  });

  // null is allowed for property of unconstrained object
  it('unconstrained object optionally required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          type: 'object',
          required: ['name'],
        }))),
      schema3({
        type: 'object',
        ...requiredUnconstrained,
      }),
    );
  });

  // null is allowed for unconstrained properties
  it('unconstrained properties optionally required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          type: 'object',
          properties: {},
          required: ['name'],
        }))),
      schema3({
        type: 'object',
        properties: {},
        ...requiredUnconstrained,
      }),
    );
  });

  // test undefined is treated consistently with missing
  it('undefined properties optionally required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          type: 'object',
          properties: {
            name: undefined,
          },
          required: ['name'],
        }))),
      schema3({
        type: 'object',
        properties: {
          name: undefined,
        },
        ...requiredUnconstrained,
      }),
    );
  });

  // null is not a valid Schema
  // test that null matches undefined/missing for consistency
  it('null properties optionally required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          type: 'object',
          properties: {
            name: null,
          },
          required: ['name'],
        }))),
      schema3({
        type: 'object',
        properties: {
          name: null,
        },
        ...requiredUnconstrained,
      }),
    );
  });

  it('nullable required allOf property to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          allOf: [
            {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  nullable: true,
                },
              },
            },
          ],
          required: ['name'],
        }))),
      schema3({
        allOf: [
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                nullable: true,
              },
            },
          },
        ],
      }),
    );
  });

  it('some nullable required allOf property still required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          allOf: [
            {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  nullable: true,
                },
              },
            },
            {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
              },
            },
          ],
          required: ['name'],
        }))),
      schema3({
        allOf: [
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                nullable: true,
              },
            },
          },
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
          },
        ],
        required: ['name'],
      }),
    );
  });

  it('nullable and nullable required anyOf property still required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          type: 'object',
          properties: {
            name: {
              type: 'string',
              nullable: true,
            },
          },
          anyOf: [
            {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  nullable: true,
                },
              },
            },
          ],
          required: ['name'],
        }))),
      schema3({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            nullable: true,
          },
        },
        anyOf: [
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                nullable: true,
              },
            },
          },
        ],
      }),
    );
  });

  // If a property can not be null due to properties constraint, it must
  // remain required
  it('non-nullable and nullable required anyOf property still required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
          },
          anyOf: [
            {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  nullable: true,
                },
              },
            },
          ],
          required: ['name'],
        }))),
      schema3({
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
        anyOf: [
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                nullable: true,
              },
            },
          },
        ],
        required: ['name'],
      }),
    );
  });

  // If a property can not be null due to allOf constraint, it must
  // remain required
  it('nullable and non-nullable required anyOf property still required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          type: 'object',
          properties: {
            name: {
              type: 'string',
              nullable: true,
            },
          },
          anyOf: [
            {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
              },
            },
          ],
          required: ['name'],
        }))),
      schema3({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            nullable: true,
          },
        },
        anyOf: [
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
          },
        ],
        required: ['name'],
      }),
    );
  });

  it('nullable required anyOf property to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          anyOf: [
            {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  nullable: true,
                },
              },
            },
          ],
          required: ['name'],
        }))),
      schema3({
        anyOf: [
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                nullable: true,
              },
            },
          },
        ],
      }),
    );
  });

  it('some nullable required anyOf property still required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          anyOf: [
            {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  nullable: true,
                },
              },
            },
            {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
              },
            },
          ],
          required: ['name'],
        }))),
      schema3({
        anyOf: [
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                nullable: true,
              },
            },
          },
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
          },
        ],
      }),
    );
  });

  it('nullable required oneOf property to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          oneOf: [
            {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  nullable: true,
                },
              },
            },
          ],
          required: ['name'],
        }))),
      schema3({
        oneOf: [
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                nullable: true,
              },
            },
          },
        ],
      }),
    );
  });

  it('some nullable required oneOf property still required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer(options)
        .transformOpenApi(deepFreeze(schema3({
          oneOf: [
            {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  nullable: true,
                },
              },
            },
            {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
              },
            },
          ],
          required: ['name'],
        }))),
      schema3({
        oneOf: [
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                nullable: true,
              },
            },
          },
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
          },
        ],
      }),
    );
  });
}

describe('NullableNotRequiredTransformer', () => {
  describeWithOptions();

  describe('with requireUnconstrained', () => {
    describeWithOptions({ requireUnconstrained: true });
  });
});
