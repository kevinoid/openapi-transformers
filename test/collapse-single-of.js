/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';

import CollapseSingleOfTransformer from '../collapse-single-of.js';

describe('CollapseSingleOfTransformer', () => {
  it('single allOf', () => {
    assert.deepStrictEqual(
      new CollapseSingleOfTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              allOf: [{
                type: 'object',
              }],
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
            },
          },
        },
        paths: {},
      },
    );
  });

  it('single anyOf', () => {
    assert.deepStrictEqual(
      new CollapseSingleOfTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              anyOf: [{
                type: 'object',
              }],
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
            },
          },
        },
        paths: {},
      },
    );
  });

  it('single oneOf', () => {
    assert.deepStrictEqual(
      new CollapseSingleOfTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              oneOf: [{
                type: 'object',
              }],
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
            },
          },
        },
        paths: {},
      },
    );
  });

  // Converts from valid OAS 3.0 representation of "$ref with description"
  // https://github.com/OAI/OpenAPI-Specification/issues/556#issuecomment-192007034
  // which causes problems for Autorest to OAS 3.1 "$ref with description"
  // https://github.com/OAI/OpenAPI-Specification/pull/2181
  // which works as a non-standard extension in all versions of Autorest.
  it('single allOf $ref property with description', () => {
    assert.deepStrictEqual(
      new CollapseSingleOfTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'object',
            },
            ExampleHolder: {
              type: 'object',
              properties: {
                example: {
                  description: 'Example?',
                  allOf: [
                    { $ref: '#/components/schemas/Example' },
                  ],
                },
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
            },
            ExampleHolder: {
              type: 'object',
              properties: {
                example: {
                  description: 'Example?',
                  $ref: '#/components/schemas/Example',
                },
              },
            },
          },
        },
        paths: {},
      },
    );
  });
});
