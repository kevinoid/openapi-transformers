/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';

import NullableNotRequiredTransformer from '../nullable-not-required.js';

describe('NullableNotRequiredTransformer', () => {
  it('nullable required property to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer().transformOpenApi({
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
                name: {
                  type: 'string',
                  nullable: true,
                },
              },
              required: ['name'],
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
                name: {
                  type: 'string',
                  nullable: true,
                },
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('x-nullable required property to not required', () => {
    assert.deepStrictEqual(
      new NullableNotRequiredTransformer().transformOpenApi({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        definitions: {
          Example: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                'x-nullable': true,
              },
            },
            required: ['name'],
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
            properties: {
              name: {
                type: 'string',
                'x-nullable': true,
              },
            },
          },
        },
        paths: {},
      },
    );
  });
});
