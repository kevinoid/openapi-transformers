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
});
