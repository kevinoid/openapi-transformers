/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import RemovePathsWithServersTransformer from '../remove-paths-with-servers.js';
import { openapi } from '../test-lib/skeletons.js';

describe('RemovePathsWithServersTransformer', () => {
  it('removes path items with servers', () => {
    assert.deepStrictEqual(
      new RemovePathsWithServersTransformer().transformOpenApi(deepFreeze({
        ...openapi,
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
        ...openapi,
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
        ...openapi,
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
        ...openapi,
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
