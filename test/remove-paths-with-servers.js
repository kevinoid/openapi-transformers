/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import RemovePathsWithServersTransformer from '../remove-paths-with-servers.js';

describe('RemovePathsWithServersTransformer', () => {
  it('removes path items with servers', () => {
    assert.deepStrictEqual(
      new RemovePathsWithServersTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            servers: [
              { url: 'https://example.com' },
            ],
            get: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
          '/b': {
            get: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
        },
      })),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/b': {
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

  it('removes path items with empty servers', () => {
    assert.deepStrictEqual(
      new RemovePathsWithServersTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        servers: [
          { url: 'https://example.com' },
        ],
        paths: {
          '/a': {
            servers: [],
            get: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
          '/b': {
            get: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
        },
      })),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        servers: [
          { url: 'https://example.com' },
        ],
        paths: {
          '/b': {
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
