/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';

import AdditionalPropertiesToUnconstrainedTransformer
  from '../additional-properties-to-unconstrained.js';

describe('AdditionalPropertiesToUnconstrainedTransformer', () => {
  it('string additionalProperties to any on schema with properties', () => {
    assert.deepStrictEqual(
      new AdditionalPropertiesToUnconstrainedTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            // Example generates class with Myprop property and
            // [JsonExtensionData] Map<string,string> AdditionalProperties
            Example: {
              type: 'object',
              properties: {
                myprop: {
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
              properties: {
                myprop: {
                  type: 'string',
                },
              },
              additionalProperties: {},
            },
          },
        },
        paths: {},
      },
    );
  });

  it('does not change additionalProperties without properties', () => {
    assert.deepStrictEqual(
      new AdditionalPropertiesToUnconstrainedTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            // Example generates Map<string,string>, no JsonExtensionData
            Example: {
              type: 'object',
              additionalProperties: {
                type: 'string',
              },
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

  it('does not change additionalProperties with empty properties', () => {
    assert.deepStrictEqual(
      new AdditionalPropertiesToUnconstrainedTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            // Example generates Map<string,string>, no JsonExtensionData
            Example: {
              type: 'object',
              properties: {},
              additionalProperties: {
                type: 'string',
              },
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
              properties: {},
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
