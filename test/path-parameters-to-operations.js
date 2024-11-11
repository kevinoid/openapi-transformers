/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import PathParametersToOperationTransformer
  from '../path-parameters-to-operations.js';
import { openapi, swagger } from '../test-lib/skeletons.js';

describe('PathParametersToOperationTransformer', () => {
  it('openapi 3 path to operation parameters', () => {
    assert.deepStrictEqual(
      new PathParametersToOperationTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        paths: {
          '/': {
            parameters: [
              {
                in: 'query',
                name: 'myquery',
                schema: {
                  type: 'string',
                },
              },
            ],
            get: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
            head: {
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
          '/': {
            get: {
              parameters: [
                {
                  in: 'query',
                  name: 'myquery',
                  schema: {
                    type: 'string',
                  },
                },
              ],
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
            head: {
              parameters: [
                {
                  in: 'query',
                  name: 'myquery',
                  schema: {
                    type: 'string',
                  },
                },
              ],
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

  it('openapi 3 path prepend to operation parameters', () => {
    assert.deepStrictEqual(
      new PathParametersToOperationTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        paths: {
          '/': {
            parameters: [
              {
                in: 'query',
                name: 'myquery',
                schema: {
                  type: 'string',
                },
              },
            ],
            get: {
              parameters: [
                {
                  in: 'query',
                  name: 'myquery2',
                  schema: {
                    type: 'string',
                  },
                },
              ],
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
            head: {
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
          '/': {
            get: {
              parameters: [
                {
                  in: 'query',
                  name: 'myquery',
                  schema: {
                    type: 'string',
                  },
                },
                {
                  in: 'query',
                  name: 'myquery2',
                  schema: {
                    type: 'string',
                  },
                },
              ],
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
            head: {
              parameters: [
                {
                  in: 'query',
                  name: 'myquery',
                  schema: {
                    type: 'string',
                  },
                },
              ],
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

  it('swagger 2 path to operation parameters', () => {
    assert.deepStrictEqual(
      new PathParametersToOperationTransformer().transformOpenApi(deepFreeze({
        ...swagger,
        paths: {
          '/': {
            parameters: [
              {
                in: 'query',
                name: 'myquery',
                type: 'string',
              },
            ],
            get: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
            head: {
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
        ...swagger,
        paths: {
          '/': {
            get: {
              parameters: [
                {
                  in: 'query',
                  name: 'myquery',
                  type: 'string',
                },
              ],
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
            head: {
              parameters: [
                {
                  in: 'query',
                  name: 'myquery',
                  type: 'string',
                },
              ],
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
