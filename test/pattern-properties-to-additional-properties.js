/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';
import deepFreeze from 'deep-freeze';

import PatternPropertiesToAdditionalPropertiesTransformer
  from '../pattern-properties-to-additional-properties.js';

describe('PatternPropertiesToAdditionalPropertiesTransformer', () => {
  it('removes empty patternProperties', () => {
    const transformer =
      new PatternPropertiesToAdditionalPropertiesTransformer();
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
              type: 'object',
              patternProperties: {},
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
              type: 'object',
            },
          },
        },
        paths: {},
      },
    );
  });

  it('converts single patternProperties to additionalProperties', () => {
    const transformer =
      new PatternPropertiesToAdditionalPropertiesTransformer();
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
              type: 'object',
              patternProperties: {
                '^value[0-9]+$': {
                  type: 'string',
                },
              },
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
              type: 'object',
              additionalProperties: {
                type: 'string',
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('combines multiple patternProperties with anyOf', () => {
    const transformer =
      new PatternPropertiesToAdditionalPropertiesTransformer();
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
              type: 'object',
              patternProperties: {
                '^string[0-9]+$': {
                  type: 'string',
                },
                '^number[0-9]+$': {
                  type: 'number',
                },
                '^bool[0-9]+$': {
                  type: 'boolean',
                },
              },
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
              type: 'object',
              additionalProperties: {
                anyOf: [
                  { type: 'string' },
                  { type: 'number' },
                  { type: 'boolean' },
                ],
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('combines anyOf patternProperties with additionalProperties', () => {
    const transformer =
      new PatternPropertiesToAdditionalPropertiesTransformer();
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
              type: 'object',
              patternProperties: {
                '^string[0-9]+$': {
                  type: 'string',
                },
                '^number[0-9]+$': {
                  type: 'number',
                },
                '^bool[0-9]+$': {
                  type: 'boolean',
                },
              },
              additionalProperties: {
                type: 'object',
              },
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
              type: 'object',
              additionalProperties: {
                anyOf: [
                  { type: 'string' },
                  { type: 'number' },
                  { type: 'boolean' },
                  { type: 'object' },
                ],
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('combines duplicate patternProperties with additionalProperties', () => {
    const transformer =
      new PatternPropertiesToAdditionalPropertiesTransformer();
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
              type: 'object',
              patternProperties: {
                '^shortName[0-9]+$': {
                  type: 'string',
                },
                '^longName[0-9]+$': {
                  type: 'string',
                },
              },
              additionalProperties: {
                type: 'string',
              },
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
              type: 'object',
              additionalProperties: {
                type: 'string',
              },
            },
          },
        },
        paths: {},
      },
    );
  });
});
