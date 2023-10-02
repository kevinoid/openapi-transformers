/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import OpenApi31To30Transformer from '../openapi31to30.js';

describe('OpenApi31To30Transformer', () => {
  it('converts schema with numeric exclusiveMaximum/exclusiveMinimum', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              exclusiveMaximum: 24,
              exclusiveMinimum: 0,
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
              exclusiveMaximum: true,
              maximum: 24,
              exclusiveMinimum: true,
              minimum: 0,
            },
          },
        },
        paths: {},
      },
    );
  });

  it('converts schema with type: "null"', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'null',
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
              enum: [null],
            },
          },
        },
        paths: {},
      },
    );
  });

  it('converts schema with const: null', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              const: null,
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
              enum: [null],
            },
          },
        },
        paths: {},
      },
    );
  });

  it('converts schema with type: "null" and const: null', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'null',
              const: null,
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
              enum: [null],
            },
          },
        },
        paths: {},
      },
    );
  });

  it('converts schema with type: ["number", "null"]', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
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
              type: 'number',
              nullable: true,
            },
          },
        },
        paths: {},
      },
    );
  });

  it('converts schema with all non-null types', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: [
                'array',
                'boolean',
                'number',
                'object',
                'string',
              ],
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

  it('converts schema with all types', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: [
                'array',
                'boolean',
                'integer',
                'null',
                'number',
                'object',
                'string',
              ],
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
              nullable: true,
            },
          },
        },
        paths: {},
      },
    );
  });

  it('converts schema with patternProperties', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze({
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
                'test.*': { type: 'string' },
              },
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
              additionalProperties: { type: 'string' },
            },
          },
        },
        paths: {},
      },
    );
  });
});
