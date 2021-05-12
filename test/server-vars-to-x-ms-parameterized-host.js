/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';

import ServerVarsToParamHostTransformer
  from '../server-vars-to-x-ms-parameterized-host.js';

describe('ServerVarsToParamHostTransformer', () => {
  it('throws TypeError with null options', () => {
    assert.throws(
      () => new ServerVarsToParamHostTransformer(null),
      TypeError,
    );
  });

  it('throws TypeError with non-Array options.omitDefault', () => {
    assert.throws(
      () => new ServerVarsToParamHostTransformer({ omitDefault: {} }),
      TypeError,
    );
  });

  it('throws TypeError with non-object options.xMsParameterizedHost', () => {
    assert.throws(
      () => new ServerVarsToParamHostTransformer({ xMsParameterizedHost: 1 }),
      TypeError,
    );
  });

  it('server variables in host part to x-ms-parameterized-host', () => {
    assert.deepStrictEqual(
      new ServerVarsToParamHostTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        servers: [
          {
            url: 'https://example.{domain}/foo',
            variables: {
              domain: {
                enum: ['com', 'org'],
                default: 'org',
              },
            },
          },
        ],
        paths: {},
      }),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        servers: [
          {
            url: 'https://example.{domain}/foo',
            variables: {
              domain: {
                enum: ['com', 'org'],
                default: 'org',
              },
            },
          },
        ],
        'x-ms-parameterized-host': {
          hostTemplate: 'example.{domain}',
          useSchemePrefix: true,
          parameters: [
            {
              in: 'path',
              name: 'domain',
              required: true,
              type: 'string',
              enum: ['com', 'org'],
              default: 'org',
            },
          ],
        },
        paths: {},
      },
    );
  });

  it('does not create x-ms-parameterized-host if no host vars', () => {
    assert.deepStrictEqual(
      new ServerVarsToParamHostTransformer().transformOpenApi({
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
        paths: {},
      }),
      {
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
        paths: {},
      },
    );
  });

  it('server variables in scheme part to x-ms-parameterized-host', () => {
    assert.deepStrictEqual(
      new ServerVarsToParamHostTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        servers: [
          {
            url: '{scheme}://example.{domain}/foo',
            variables: {
              domain: {
                enum: ['com', 'org'],
                default: 'org',
              },
              scheme: {
                enum: ['https', 'http'],
                default: 'https',
              },
            },
          },
        ],
        paths: {},
      }),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        servers: [
          {
            url: '{scheme}://example.{domain}/foo',
            variables: {
              domain: {
                enum: ['com', 'org'],
                default: 'org',
              },
              scheme: {
                enum: ['https', 'http'],
                default: 'https',
              },
            },
          },
        ],
        'x-ms-parameterized-host': {
          hostTemplate: '{scheme}://example.{domain}',
          useSchemePrefix: false,
          parameters: [
            {
              in: 'path',
              name: 'scheme',
              required: true,
              type: 'string',
              enum: ['https', 'http'],
              default: 'https',
            },
            {
              in: 'path',
              name: 'domain',
              required: true,
              type: 'string',
              enum: ['com', 'org'],
              default: 'org',
            },
          ],
        },
        paths: {},
      },
    );
  });

  it('server variables in path part not in x-ms-parameterized-host', () => {
    assert.deepStrictEqual(
      new ServerVarsToParamHostTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        servers: [
          {
            url: '{scheme}://example.{domain}/{foo}',
            variables: {
              domain: {
                enum: ['com', 'org'],
                default: 'org',
              },
              foo: {
                enum: ['bar', 'baz'],
                default: 'bar',
              },
              scheme: {
                enum: ['https', 'http'],
                default: 'https',
              },
            },
          },
        ],
        paths: {},
      }),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        servers: [
          {
            url: '{scheme}://example.{domain}/{foo}',
            variables: {
              domain: {
                enum: ['com', 'org'],
                default: 'org',
              },
              foo: {
                enum: ['bar', 'baz'],
                default: 'bar',
              },
              scheme: {
                enum: ['https', 'http'],
                default: 'https',
              },
            },
          },
        ],
        'x-ms-parameterized-host': {
          hostTemplate: '{scheme}://example.{domain}',
          useSchemePrefix: false,
          parameters: [
            {
              in: 'path',
              name: 'scheme',
              required: true,
              type: 'string',
              enum: ['https', 'http'],
              default: 'https',
            },
            {
              in: 'path',
              name: 'domain',
              required: true,
              type: 'string',
              enum: ['com', 'org'],
              default: 'org',
            },
          ],
        },
        paths: {},
      },
    );
  });
});
