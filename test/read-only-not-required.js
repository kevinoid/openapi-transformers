/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import ReadOnlyNotRequiredTransformer from '../read-only-not-required.js';

describe('ReadOnlyNotRequiredTransformer', () => {
  it('throws TypeError with null options', () => {
    assert.throws(
      () => new ReadOnlyNotRequiredTransformer(null),
      TypeError,
    );
  });

  it('throws TypeError with number options.removeValidation', () => {
    assert.throws(
      () => new ReadOnlyNotRequiredTransformer({ removeValidation: 1 }),
      TypeError,
    );
  });

  it('throws TypeError with number options.setNonNullable', () => {
    assert.throws(
      () => new ReadOnlyNotRequiredTransformer({ setNonNullable: 1 }),
      TypeError,
    );
  });

  it('make readOnly properties not-required', () => {
    const transformer = new ReadOnlyNotRequiredTransformer();
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
              properties: {
                name: {
                  type: 'string',
                  readOnly: true,
                },
              },
              required: ['name'],
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
              properties: {
                name: {
                  type: 'string',
                  readOnly: true,
                },
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('doesn\'t remove validation of readOnly properties by default', () => {
    const transformer = new ReadOnlyNotRequiredTransformer();
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
              properties: {
                name: {
                  type: 'string',
                  readOnly: true,
                  minLength: 1,
                },
              },
              required: ['name'],
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
              properties: {
                name: {
                  type: 'string',
                  readOnly: true,
                  minLength: 1,
                },
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('options.removeValidation to remove validation of readOnly props', () => {
    const transformer = new ReadOnlyNotRequiredTransformer({
      removeValidation: true,
    });
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
              properties: {
                name: {
                  type: 'string',
                  readOnly: true,
                  minLength: 1,
                },
              },
              required: ['name'],
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
              properties: {
                name: {
                  type: 'string',
                  readOnly: true,
                },
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('options.setNonNullable to add x-nullable: false to readOnly', () => {
    const transformer = new ReadOnlyNotRequiredTransformer({
      setNonNullable: true,
    });
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
              properties: {
                name: {
                  type: 'string',
                  readOnly: true,
                },
              },
              required: ['name'],
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
              properties: {
                name: {
                  type: 'string',
                  readOnly: true,
                  'x-nullable': false,
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
