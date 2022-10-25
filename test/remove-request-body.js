/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';
import deepFreeze from 'deep-freeze';

import RemoveRequestBodyTransformer from '../remove-request-body.js';

describe('RemoveRequestBodyTransformer', () => {
  for (const method of ['get', 'head', 'trace', 'GET', 'HEAD', 'TRACE']) {
    it(`removes requestBody from ${method} in path by default`, () => {
      assert.deepStrictEqual(
        new RemoveRequestBodyTransformer().transformOpenApi(deepFreeze({
          openapi: '3.0.3',
          info: {
            title: 'Title',
            version: '1.0',
          },
          paths: {
            '/test': {
              [method]: {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                      },
                    },
                  },
                },
                responses: {
                  204: {
                    description: 'Example response',
                  },
                },
              },
              post: {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                      },
                    },
                  },
                },
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
            '/test': {
              [method]: {
                responses: {
                  204: {
                    description: 'Example response',
                  },
                },
              },
              post: {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                      },
                    },
                  },
                },
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

    it(`removes requestBody from ${method} in components by default`, () => {
      assert.deepStrictEqual(
        new RemoveRequestBodyTransformer().transformOpenApi(deepFreeze({
          openapi: '3.1.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            pathItems: {
              Example: {
                [method]: {
                  requestBody: {
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                        },
                      },
                    },
                  },
                  responses: {
                    204: {
                      description: 'Example response',
                    },
                  },
                },
                post: {
                  requestBody: {
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                        },
                      },
                    },
                  },
                  responses: {
                    204: {
                      description: 'Example response',
                    },
                  },
                },
              },
            },
          },
          paths: {},
        })),
        {
          openapi: '3.1.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          components: {
            pathItems: {
              Example: {
                [method]: {
                  responses: {
                    204: {
                      description: 'Example response',
                    },
                  },
                },
                post: {
                  requestBody: {
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                        },
                      },
                    },
                  },
                  responses: {
                    204: {
                      description: 'Example response',
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

    it(`removes body parameters from ${method} by default`, () => {
      assert.deepStrictEqual(
        new RemoveRequestBodyTransformer().transformOpenApi(deepFreeze({
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          paths: {
            '/test': {
              [method]: {
                parameters: [
                  {
                    name: 'test',
                    in: 'body',
                    schema: {
                      type: 'object',
                    },
                  },
                  {
                    name: 'test2',
                    in: 'query',
                    type: 'string',
                  },
                ],
                responses: {
                  204: {
                    description: 'Example response',
                  },
                },
              },
              post: {
                parameters: [
                  {
                    name: 'test',
                    in: 'body',
                    schema: {
                      type: 'object',
                    },
                  },
                  {
                    name: 'test2',
                    in: 'query',
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
        })),
        {
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          paths: {
            '/test': {
              [method]: {
                parameters: [
                  {
                    name: 'test2',
                    in: 'query',
                    type: 'string',
                  },
                ],
                responses: {
                  204: {
                    description: 'Example response',
                  },
                },
              },
              post: {
                parameters: [
                  {
                    name: 'test',
                    in: 'body',
                    schema: {
                      type: 'object',
                    },
                  },
                  {
                    name: 'test2',
                    in: 'query',
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

    it(`removes formData parameters from ${method} by default`, () => {
      assert.deepStrictEqual(
        new RemoveRequestBodyTransformer().transformOpenApi(deepFreeze({
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          paths: {
            '/test': {
              [method]: {
                parameters: [
                  {
                    name: 'test',
                    in: 'formData',
                    type: 'string',
                  },
                  {
                    name: 'test2',
                    in: 'query',
                    type: 'string',
                  },
                ],
                responses: {
                  204: {
                    description: 'Example response',
                  },
                },
              },
              post: {
                parameters: [
                  {
                    name: 'test',
                    in: 'formData',
                    type: 'string',
                  },
                  {
                    name: 'test2',
                    in: 'query',
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
        })),
        {
          swagger: '2.0',
          info: {
            title: 'Title',
            version: '1.0',
          },
          paths: {
            '/test': {
              [method]: {
                parameters: [
                  {
                    name: 'test2',
                    in: 'query',
                    type: 'string',
                  },
                ],
                responses: {
                  204: {
                    description: 'Example response',
                  },
                },
              },
              post: {
                parameters: [
                  {
                    name: 'test',
                    in: 'formData',
                    type: 'string',
                  },
                  {
                    name: 'test2',
                    in: 'query',
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
  }

  it('does not remove requestBody from delete by default', () => {
    assert.deepStrictEqual(
      new RemoveRequestBodyTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/test': {
            delete: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
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
          '/test': {
            delete: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
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

  it('throws TypeError for non-Iterable constructor argument', () => {
    assert.throws(
      () => new RemoveRequestBodyTransformer(1),
      TypeError,
    );
  });

  it('removes only methods passed to constructor', () => {
    assert.deepStrictEqual(
      new RemoveRequestBodyTransformer(['delete']).transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/test': {
            delete: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
            get: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
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
          '/test': {
            delete: {
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
            get: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
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
