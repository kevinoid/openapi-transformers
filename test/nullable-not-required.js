/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import NullableNotRequiredTransformer from '../nullable-not-required.js';
import { schema2, schema3 } from '../test-lib/skeletons.js';

describe('NullableNotRequiredTransformer', () => {
  it('nullable required property to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer().transformOpenApi(deepFreeze(schema3({
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
      new NullableNotRequiredTransformer().transformOpenApi(deepFreeze(schema2({
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

  // null is allowed for property of unconstrained object
  it('unconstrained object to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer().transformOpenApi(deepFreeze(schema3({
        type: 'object',
        required: ['name'],
      }))),
      schema3({
        type: 'object',
      }),
    );
  });

  // null is allowed for unconstrained properties
  it('unconstrained properties to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer().transformOpenApi(deepFreeze(schema3({
        type: 'object',
        properties: {},
        required: ['name'],
      }))),
      schema3({
        type: 'object',
        properties: {},
      }),
    );
  });

  // test undefined is treated consistently with missing
  it('undefined properties to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer().transformOpenApi(deepFreeze(schema3({
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
      }),
    );
  });

  // null is not a valid Schema
  // test that null matches undefined/missing for consistency
  it('null properties to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer().transformOpenApi(deepFreeze(schema3({
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
      }),
    );
  });

  it('nullable required allOf property to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer().transformOpenApi(deepFreeze(schema3({
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
      new NullableNotRequiredTransformer().transformOpenApi(deepFreeze(schema3({
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

  it('nullable required anyOf property to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer().transformOpenApi(deepFreeze(schema3({
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
      new NullableNotRequiredTransformer().transformOpenApi(deepFreeze(schema3({
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
      new NullableNotRequiredTransformer().transformOpenApi(deepFreeze(schema3({
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
      new NullableNotRequiredTransformer().transformOpenApi(deepFreeze(schema3({
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
});
