/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import AdditionalPropertiesToObjectTransformer
  from '../additional-properties-to-object.js';
import { schema2, schema3 } from '../test-lib/skeletons.js';

describe('AdditionalPropertiesToObjectTransformer', () => {
  it('openapi 3 additionalProperties: true to {} in components', () => {
    const transformer = new AdditionalPropertiesToObjectTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        type: 'object',
        additionalProperties: true,
      }))),
      schema3({
        type: 'object',
        additionalProperties: {},
      }),
    );
  });

  it('swagger 2 additionalProperties: true to {} in definitions', () => {
    const transformer = new AdditionalPropertiesToObjectTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema2({
        type: 'object',
        additionalProperties: true,
      }))),
      schema2({
        type: 'object',
        additionalProperties: {},
      }),
    );
  });
});
