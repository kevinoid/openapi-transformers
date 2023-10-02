/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import AdditionalPropertiesToObjectTransformer
  from '../additional-properties-to-object.js';

describe('AdditionalPropertiesToObjectTransformer', () => {
  it('openapi 3 additionalProperties: true to {} in components', () => {
    const transformer = new AdditionalPropertiesToObjectTransformer();
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
              additionalProperties: true,
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
              additionalProperties: {},
            },
          },
        },
        paths: {},
      },
    );
  });

  it('swagger 2 additionalProperties: true to {} in definitions', () => {
    const transformer = new AdditionalPropertiesToObjectTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        definitions: {
          Example: {
            type: 'object',
            additionalProperties: true,
          },
        },
        paths: {},
      })),
      {
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        definitions: {
          Example: {
            type: 'object',
            additionalProperties: {},
          },
        },
        paths: {},
      },
    );
  });
});
