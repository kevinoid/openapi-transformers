/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';
import deepFreeze from 'deep-freeze';

import NullableToTypeNullTransformer from '../nullable-to-type-null.js';

describe('NullableToTypeNullTransformer', () => {
  it('adds "null" to type: "number" with nullable: true', () => {
    assert.deepStrictEqual(
      new NullableToTypeNullTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'number',
              nullable: true,
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
              type: ['number', 'null'],
            },
          },
        },
        paths: {},
      },
    );
  });

  it('adds "null" to type: ["number", "string"] with nullable: true', () => {
    assert.deepStrictEqual(
      new NullableToTypeNullTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: ['number', 'string'],
              nullable: true,
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
              type: ['number', 'string', 'null'],
            },
          },
        },
        paths: {},
      },
    );
  });

  // type should be unique.  Don't duplicate 'null'.
  it('removes nullable: true from type: ["number", "null"]', () => {
    assert.deepStrictEqual(
      new NullableToTypeNullTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: ['number', 'null'],
              nullable: true,
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
              type: ['number', 'null'],
            },
          },
        },
        paths: {},
      },
    );
  });

  // if type is unconstrained, null type is already accepted
  it('removes nullable: true without type', () => {
    assert.deepStrictEqual(
      new NullableToTypeNullTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              nullable: true,
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
            Example: {},
          },
        },
        paths: {},
      },
    );
  });

  it('adds "null" to type: "number" with x-nullable: true', () => {
    assert.deepStrictEqual(
      new NullableToTypeNullTransformer().transformOpenApi(deepFreeze({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        definitions: {
          Example: {
            type: 'number',
            'x-nullable': true,
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
            type: ['number', 'null'],
          },
        },
        paths: {},
      },
    );
  });

  it('adds "null" to type: "number" with nullable and x-nullable: true', () => {
    assert.deepStrictEqual(
      new NullableToTypeNullTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'number',
              nullable: true,
              'x-nullable': true,
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
              type: ['number', 'null'],
            },
          },
        },
        paths: {},
      },
    );
  });
});
