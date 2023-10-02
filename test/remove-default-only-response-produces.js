/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import RemoveDefaultOnlyResponseProducesTransformer
  from '../remove-default-only-response-produces.js';

describe('RemoveDefaultOnlyResponseProducesTransformer', () => {
  // Incorrectly generates method with void return type
  it('removes non-JSON produces from default response', () => {
    const transformer = new RemoveDefaultOnlyResponseProducesTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            get: {
              produces: [
                'text/plain',
              ],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    type: 'file',
                  },
                },
              },
            },
          },
        },
      })),
      {
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            get: {
              produces: [],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    type: 'file',
                  },
                },
              },
            },
          },
        },
      },
    );
  });

  it('does not remove non-JSON produces from 200 response', () => {
    const transformer = new RemoveDefaultOnlyResponseProducesTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            get: {
              produces: [
                'text/plain',
              ],
              responses: {
                200: {
                  description: 'Example response',
                  schema: {
                    type: 'file',
                  },
                },
              },
            },
          },
        },
      })),
      {
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            get: {
              produces: [
                'text/plain',
              ],
              responses: {
                200: {
                  description: 'Example response',
                  schema: {
                    type: 'file',
                  },
                },
              },
            },
          },
        },
      },
    );
  });
});
