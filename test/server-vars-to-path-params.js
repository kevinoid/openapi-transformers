/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';

import ServerVarsToPathParamsTransformer
  from '../server-vars-to-path-params.js';

describe('ServerVarsToPathParamsTransformer', () => {
  it('throws TypeError with null options', () => {
    assert.throws(
      () => new ServerVarsToPathParamsTransformer(null),
      TypeError,
    );
  });

  it('throws TypeError with number options', () => {
    assert.throws(
      () => new ServerVarsToPathParamsTransformer(1),
      TypeError,
    );
  });

  it('throws TypeError with non-Array options.omitDefault', () => {
    assert.throws(
      () => new ServerVarsToPathParamsTransformer({ omitDefault: {} }),
      TypeError,
    );
  });

  it('server variables in path part to path parameters', () => {
    assert.deepStrictEqual(
      new ServerVarsToPathParamsTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        servers: [
          {
            url: 'https://example.com/{foo}',
            variables: {
              foo: {
                enum: ['bar', 'baz'],
                default: 'bar',
              },
            },
          },
        ],
        paths: {
          '/': {
            get: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
        },
      }),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        servers: [
          {
            url: 'https://example.com',
          },
        ],
        components: {
          parameters: {
            foo: {
              in: 'path',
              name: 'foo',
              required: true,
              schema: {
                type: 'string',
                enum: ['bar', 'baz'],
                default: 'bar',
              },
            },
          },
        },
        paths: {
          '/{foo}/': {
            parameters: [
              { $ref: '#/components/parameters/foo' },
            ],
            get: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
        },
      },
    );
  });

  it('omits default for names in options.omitDefault', () => {
    const transformer =
      new ServerVarsToPathParamsTransformer({ omitDefault: ['foo'] });
    assert.deepStrictEqual(
      transformer.transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        servers: [
          {
            url: 'https://example.com/{foo}',
            variables: {
              foo: {
                enum: ['bar', 'baz'],
                default: 'bar',
              },
            },
          },
        ],
        paths: {
          '/': {
            get: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
        },
      }),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        servers: [
          {
            url: 'https://example.com',
          },
        ],
        components: {
          parameters: {
            foo: {
              in: 'path',
              name: 'foo',
              required: true,
              schema: {
                type: 'string',
                enum: ['bar', 'baz'],
              },
            },
          },
        },
        paths: {
          '/{foo}/': {
            parameters: [
              { $ref: '#/components/parameters/foo' },
            ],
            get: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
        },
      },
    );
  });

  it('does not move server variables in host part', () => {
    assert.deepStrictEqual(
      new ServerVarsToPathParamsTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        servers: [
          {
            url: 'https://example.{domain}/{foo}',
            variables: {
              domain: {
                enum: ['com', 'org'],
                default: 'org',
              },
              foo: {
                enum: ['bar', 'baz'],
                default: 'bar',
              },
            },
          },
        ],
        paths: {
          '/': {
            get: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
        },
      }),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        servers: [
          {
            url: 'https://example.{domain}',
            variables: {
              domain: {
                enum: ['com', 'org'],
                default: 'org',
              },
            },
          },
        ],
        components: {
          parameters: {
            foo: {
              in: 'path',
              name: 'foo',
              required: true,
              schema: {
                type: 'string',
                enum: ['bar', 'baz'],
                default: 'bar',
              },
            },
          },
        },
        paths: {
          '/{foo}/': {
            parameters: [
              { $ref: '#/components/parameters/foo' },
            ],
            get: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
        },
      },
    );
  });
});