/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';
import deepFreeze from 'deep-freeze';

import RemoveQueryFromPathsTransformer from '../remove-query-from-paths.js';

describe('RemoveQueryFromPathsTransformer', () => {
  it('removes empty query', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a?': {
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
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
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

  it('changes path parameter in path item to query', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a?b={b}': {
            parameters: [
              {
                name: 'b',
                in: 'path',
                required: true,
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
          },
        },
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            parameters: [
              {
                name: 'b',
                in: 'query',
                required: true,
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
          },
        },
      },
    );
  });

  it('changes path parameter in operation to query', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a?b={b}': {
            get: {
              parameters: [
                {
                  name: 'b',
                  in: 'path',
                  required: true,
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
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            get: {
              parameters: [
                {
                  name: 'b',
                  in: 'query',
                  required: true,
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

  it('renames path parameter in path item to query', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a?b={c}': {
            parameters: [
              {
                name: 'c',
                in: 'path',
                required: true,
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
          },
        },
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            parameters: [
              {
                name: 'b',
                in: 'query',
                required: true,
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
          },
        },
      },
    );
  });

  // It's unclear what the author intended here.  Assume query param is correct.
  it('does not duplicate or change existing query param', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a?b={c}': {
            parameters: [
              {
                name: 'c',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'b',
                in: 'query',
                required: true,
                schema: {
                  type: 'number',
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
          },
        },
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            parameters: [
              {
                name: 'b',
                in: 'query',
                required: true,
                schema: {
                  type: 'number',
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
          },
        },
      },
    );
  });

  it('adds constant parameter for constant query', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a?b=c': {
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
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            parameters: [
              {
                name: 'b',
                in: 'query',
                required: true,
                schema: {
                  const: 'c',
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
          },
        },
      },
    );
  });

  it('adds constant parameter for constant query (3.0)', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a?b=c': {
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
          '/a': {
            parameters: [
              {
                name: 'b',
                in: 'query',
                required: true,
                schema: {
                  enum: ['c'],
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
          },
        },
      },
    );
  });

  it('adds constant parameter for constant query (2.0)', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a?b=c': {
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
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            parameters: [
              {
                name: 'b',
                in: 'query',
                required: true,
                type: 'string',
                enum: ['c'],
              },
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

  // OpenAPI doesn't appear to provide a mechanism for specifying query params
  // present without a value.
  // URLSearchParams and querystring.parse parse '?b=' equivalently to '?b'.
  // Treat them as equivalent.
  it('adds constant parameter for empty constant value', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a?b': {
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
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            parameters: [
              {
                name: 'b',
                in: 'query',
                required: true,
                schema: {
                  const: '',
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
          },
        },
      },
    );
  });

  // Empty query param name is parsed by URLSearchParams and querystring.parse.
  // OpenAPI requires name, but isn't explicit that it is required to be
  // non-empty.
  it('adds constant parameter for empty constant name', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a?=c': {
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
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            parameters: [
              {
                name: '',
                in: 'query',
                required: true,
                schema: {
                  const: 'c',
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
          },
        },
      },
    );
  });

  // Combine previous two for something extra pathological
  it('adds constant parameter for empty constant name and value', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a?=': {
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
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            parameters: [
              {
                name: '',
                in: 'query',
                required: true,
                schema: {
                  const: '',
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
          },
        },
      },
    );
  });

  it('does not overwrite existing parameters with constant', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a?b=c': {
            parameters: [
              {
                name: 'b',
                in: 'query',
                required: true,
                schema: {
                  type: 'number',
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
          },
        },
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            parameters: [
              {
                name: 'b',
                in: 'query',
                required: true,
                schema: {
                  type: 'number',
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
          },
        },
      },
    );
  });

  it('renames path parameter in path item to multiple queries', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a?b={c}&d={c}': {
            parameters: [
              {
                name: 'c',
                in: 'path',
                required: true,
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
          },
        },
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            parameters: [
              {
                name: 'b',
                in: 'query',
                required: true,
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'd',
                in: 'query',
                required: true,
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
          },
        },
      },
    );
  });

  it('does not rename path parameter not in query', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/{a}?b={c}': {
            parameters: [
              {
                name: 'a',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'c',
                in: 'path',
                required: true,
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
          },
        },
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/{a}': {
            parameters: [
              {
                name: 'a',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'b',
                in: 'query',
                required: true,
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
          },
        },
      },
    );
  });

  it('duplicates parameter in path and query', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/{a}?b={a}': {
            parameters: [
              {
                name: 'a',
                in: 'path',
                required: true,
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
          },
        },
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/{a}': {
            parameters: [
              {
                name: 'a',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'b',
                in: 'query',
                required: true,
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
          },
        },
      },
    );
  });

  it('combines path items without overlap', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            delete: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
          '/a?': {
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
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            delete: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
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

  it('combines path items with source params', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            delete: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
          '/a?b={c}': {
            parameters: [
              {
                name: 'c',
                in: 'path',
                required: true,
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
          },
        },
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            delete: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
            get: {
              parameters: [
                {
                  name: 'b',
                  in: 'query',
                  required: true,
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

  it('combines path items with dest path params', () => {
    assert.deepStrictEqual(
      new RemoveQueryFromPathsTransformer().transformOpenApi(deepFreeze({
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            parameters: [
              {
                name: 'd',
                in: 'cookie',
                schema: {
                  type: 'string',
                },
              },
            ],
            delete: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
          '/a?b={c}': {
            parameters: [
              {
                name: 'c',
                in: 'path',
                required: true,
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
          },
        },
      })),
      {
        openapi: '3.1.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            delete: {
              parameters: [
                {
                  name: 'd',
                  in: 'cookie',
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
            get: {
              parameters: [
                {
                  name: 'b',
                  in: 'query',
                  required: true,
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
});
