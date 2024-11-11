/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import BoolEnumToBoolTransformer from '../bool-enum-to-bool.js';
import { openapi, schema3 } from '../test-lib/skeletons.js';

describe('BoolEnumToBoolTransformer', () => {
  it('removes enum: [true, false] from type: boolean', () => {
    assert.deepStrictEqual(
      new BoolEnumToBoolTransformer().transformOpenApi(deepFreeze(schema3({
        type: 'boolean',
        enum: [true, false],
      }))),
      schema3({
        type: 'boolean',
      }),
    );
  });

  it('removes enum: [false, true] from type: boolean', () => {
    assert.deepStrictEqual(
      new BoolEnumToBoolTransformer().transformOpenApi(deepFreeze(schema3({
        type: 'boolean',
        enum: [false, true],
      }))),
      schema3({
        type: 'boolean',
      }),
    );
  });

  it('does not remove enum: ["true", "false"] outside string context', () => {
    assert.deepStrictEqual(
      new BoolEnumToBoolTransformer().transformOpenApi(deepFreeze(schema3({
        type: 'string',
        enum: ['true', 'false'],
      }))),
      schema3({
        type: 'string',
        enum: ['true', 'false'],
      }),
    );
  });

  it('removes enum: ["true", "false"] in components header', () => {
    assert.deepStrictEqual(
      new BoolEnumToBoolTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        components: {
          headers: {
            Example: {
              schema: {
                type: 'string',
                enum: ['true', 'false'],
              },
            },
          },
        },
        paths: {},
      })),
      {
        ...openapi,
        components: {
          headers: {
            Example: {
              schema: {
                type: 'boolean',
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('removes enum: ["true", "false"] in components path parameter', () => {
    assert.deepStrictEqual(
      new BoolEnumToBoolTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        components: {
          parameters: {
            Example: {
              name: 'example',
              in: 'path',
              schema: {
                type: 'string',
                enum: ['true', 'false'],
              },
            },
          },
        },
        paths: {},
      })),
      {
        ...openapi,
        components: {
          parameters: {
            Example: {
              name: 'example',
              in: 'path',
              schema: {
                type: 'boolean',
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('removes enum: ["true", "false"] in components query parameter', () => {
    assert.deepStrictEqual(
      new BoolEnumToBoolTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        components: {
          parameters: {
            Example: {
              name: 'example',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['true', 'false'],
              },
            },
          },
        },
        paths: {},
      })),
      {
        ...openapi,
        components: {
          parameters: {
            Example: {
              name: 'example',
              in: 'query',
              schema: {
                type: 'boolean',
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('removes mixed enum in components query parameter', () => {
    assert.deepStrictEqual(
      new BoolEnumToBoolTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        components: {
          parameters: {
            Example: {
              name: 'example',
              in: 'query',
              schema: {
                type: ['boolean', 'string'],
                enum: ['true', 'false', true, false],
              },
            },
          },
        },
        paths: {},
      })),
      {
        ...openapi,
        components: {
          parameters: {
            Example: {
              name: 'example',
              in: 'query',
              schema: {
                type: 'boolean',
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('removes enum: ["true", "false"] in components cookie parameter', () => {
    assert.deepStrictEqual(
      new BoolEnumToBoolTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        components: {
          parameters: {
            Example: {
              name: 'example',
              in: 'cookie',
              schema: {
                type: 'string',
                enum: ['true', 'false'],
              },
            },
          },
        },
        paths: {},
      })),
      {
        ...openapi,
        components: {
          parameters: {
            Example: {
              name: 'example',
              in: 'cookie',
              schema: {
                type: 'boolean',
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('does not remove enum: ["true", "false"] in JSON cookie', () => {
    assert.deepStrictEqual(
      new BoolEnumToBoolTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        components: {
          parameters: {
            Example: {
              name: 'example',
              in: 'cookie',
              content: {
                'application/json': {
                  schema: {
                    type: 'string',
                    enum: ['true', 'false'],
                  },
                },
              },
            },
          },
        },
        paths: {},
      })),
      {
        ...openapi,
        components: {
          parameters: {
            Example: {
              name: 'example',
              in: 'cookie',
              content: {
                'application/json': {
                  schema: {
                    type: 'string',
                    enum: ['true', 'false'],
                  },
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
