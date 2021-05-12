/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';

import PathParametersToOperationTransformer
  from '../path-parameters-to-operations.js';

describe('PathParametersToOperationTransformer', () => {
  it('openapi 3 path to operation parameters', () => {
    assert.deepStrictEqual(
      new PathParametersToOperationTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
      }),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
      new PathParametersToOperationTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
      }),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
      new PathParametersToOperationTransformer().transformOpenApi({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
      }),
      {
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
