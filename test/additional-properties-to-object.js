/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';

import AdditionalPropertiesToObjectTransformer
  from '../additional-properties-to-object.js';

describe('AdditionalPropertiesToObjectTransformer', () => {
  it('openapi 3 additionalProperties: true to {} in components', () => {
    assert.deepStrictEqual(
      new AdditionalPropertiesToObjectTransformer().transformOpenApi({
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
      }),
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
    assert.deepStrictEqual(
      new AdditionalPropertiesToObjectTransformer().transformOpenApi({
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
      }),
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
