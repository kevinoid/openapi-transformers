/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import AdditionalPropertiesToUnconstrainedTransformer
  from '../additional-properties-to-unconstrained.js';
import { schema3 } from '../test-lib/skeletons.js';

describe('AdditionalPropertiesToUnconstrainedTransformer', () => {
  it('string additionalProperties to any on schema with properties', () => {
    const transformer = new AdditionalPropertiesToUnconstrainedTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        // Generates class with Myprop property and
        // [JsonExtensionData] Map<string,string> AdditionalProperties
        type: 'object',
        properties: {
          myprop: {
            type: 'string',
          },
        },
        additionalProperties: {
          type: 'string',
        },
      }))),
      schema3({
        type: 'object',
        properties: {
          myprop: {
            type: 'string',
          },
        },
        additionalProperties: {},
      }),
    );
  });

  it('does not change additionalProperties without properties', () => {
    const transformer = new AdditionalPropertiesToUnconstrainedTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        // Generates Map<string,string>, no JsonExtensionData
        type: 'object',
        additionalProperties: {
          type: 'string',
        },
      }))),
      schema3({
        type: 'object',
        additionalProperties: {
          type: 'string',
        },
      }),
    );
  });

  it('does not change additionalProperties with empty properties', () => {
    const transformer = new AdditionalPropertiesToUnconstrainedTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        // Generates Map<string,string>, no JsonExtensionData
        type: 'object',
        properties: {},
        additionalProperties: {
          type: 'string',
        },
      }))),
      schema3({
        type: 'object',
        properties: {},
        additionalProperties: {
          type: 'string',
        },
      }),
    );
  });
});
