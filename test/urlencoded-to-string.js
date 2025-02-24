/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import { post3, swagger } from '../test-lib/skeletons.js';
import UrlencodedToStringTransformer from '../urlencoded-to-string.js';

describe('UrlencodedToStringTransformer', () => {
  it('converts non-string properties of urlencoded to string', () => {
    assert.deepStrictEqual(
      new UrlencodedToStringTransformer().transformOpenApi(deepFreeze(post3({
        requestBody: {
          content: {
            'application/x-www-form-urlencoded': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  hp: {
                    type: 'integer',
                  },
                  speed: {
                    type: 'number',
                  },
                  inverted: {
                    type: 'boolean',
                  },
                },
              },
            },
          },
        },
        responses: {
          default: {
            description: 'Example response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    newSpeed: {
                      type: 'number',
                    },
                  },
                },
              },
            },
          },
        },
      }))),
      post3({
        requestBody: {
          content: {
            'application/x-www-form-urlencoded': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  hp: {
                    type: 'string',
                  },
                  speed: {
                    type: 'string',
                  },
                  inverted: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          default: {
            description: 'Example response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    newSpeed: {
                      type: 'number',
                    },
                  },
                },
              },
            },
          },
        },
      }),
    );
  });

  it('converts non-string formData parameters of urlencoded to string', () => {
    assert.deepStrictEqual(
      new UrlencodedToStringTransformer().transformOpenApi(deepFreeze({
        ...swagger,
        produces: ['application/json'],
        paths: {
          '/': {
            post: {
              consumes: ['application/x-www-form-urlencoded'],
              parameters: [
                {
                  name: 'name',
                  in: 'formData',
                  type: 'string',
                },
                {
                  name: 'hp',
                  in: 'formData',
                  type: 'integer',
                },
                {
                  name: 'speed',
                  in: 'formData',
                  type: 'number',
                },
                {
                  name: 'inverted',
                  in: 'formData',
                  type: 'boolean',
                },
              ],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    type: 'object',
                    properties: {
                      newSpeed: {
                        type: 'number',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })),
      {
        ...swagger,
        produces: ['application/json'],
        paths: {
          '/': {
            post: {
              consumes: ['application/x-www-form-urlencoded'],
              parameters: [
                {
                  name: 'name',
                  in: 'formData',
                  type: 'string',
                },
                {
                  name: 'hp',
                  in: 'formData',
                  type: 'string',
                },
                {
                  name: 'speed',
                  in: 'formData',
                  type: 'string',
                },
                {
                  name: 'inverted',
                  in: 'formData',
                  type: 'string',
                },
              ],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    type: 'object',
                    properties: {
                      newSpeed: {
                        type: 'number',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    );
  });

  it('converts parameters when urlencoded is inherited', () => {
    assert.deepStrictEqual(
      new UrlencodedToStringTransformer().transformOpenApi(deepFreeze({
        ...swagger,
        produces: ['application/json'],
        consumes: ['application/x-www-form-urlencoded'],
        paths: {
          '/': {
            post: {
              parameters: [
                {
                  name: 'name',
                  in: 'formData',
                  type: 'string',
                },
                {
                  name: 'hp',
                  in: 'formData',
                  type: 'integer',
                },
                {
                  name: 'speed',
                  in: 'formData',
                  type: 'number',
                },
                {
                  name: 'inverted',
                  in: 'formData',
                  type: 'boolean',
                },
              ],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    type: 'object',
                    properties: {
                      newSpeed: {
                        type: 'number',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })),
      {
        ...swagger,
        produces: ['application/json'],
        consumes: ['application/x-www-form-urlencoded'],
        paths: {
          '/': {
            post: {
              parameters: [
                {
                  name: 'name',
                  in: 'formData',
                  type: 'string',
                },
                {
                  name: 'hp',
                  in: 'formData',
                  type: 'string',
                },
                {
                  name: 'speed',
                  in: 'formData',
                  type: 'string',
                },
                {
                  name: 'inverted',
                  in: 'formData',
                  type: 'string',
                },
              ],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    type: 'object',
                    properties: {
                      newSpeed: {
                        type: 'number',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    );
  });

  // Autorest treats properties of body parameter schema the same as formData
  // parameters https://github.com/Azure/autorest/issues/3449 occurs.
  //
  // Note: Autorest generates parameters of type object for any non-primitive
  // body property types ($ref or not).  There's no need to convert or skip
  // these, since the generated code is not usable anyway.
  it('converts non-string body properties of urlencoded to string', () => {
    assert.deepStrictEqual(
      new UrlencodedToStringTransformer().transformOpenApi(deepFreeze({
        ...swagger,
        produces: ['application/json'],
        consumes: ['application/x-www-form-urlencoded'],
        paths: {
          '/': {
            post: {
              parameters: [
                {
                  name: 'whatever',
                  in: 'body',
                  schema: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                      },
                      hp: {
                        type: 'integer',
                      },
                      speed: {
                        type: 'number',
                      },
                      inverted: {
                        type: 'boolean',
                      },
                    },
                  },
                },
              ],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    type: 'object',
                    properties: {
                      newSpeed: {
                        type: 'number',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })),
      {
        ...swagger,
        produces: ['application/json'],
        consumes: ['application/x-www-form-urlencoded'],
        paths: {
          '/': {
            post: {
              parameters: [
                {
                  name: 'whatever',
                  in: 'body',
                  schema: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                      },
                      hp: {
                        type: 'string',
                      },
                      speed: {
                        type: 'string',
                      },
                      inverted: {
                        type: 'string',
                      },
                    },
                  },
                },
              ],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    type: 'object',
                    properties: {
                      newSpeed: {
                        type: 'number',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    );
  });

  it('does not convert properties of urlencoded+form-data', () => {
    assert.deepStrictEqual(
      new UrlencodedToStringTransformer().transformOpenApi(deepFreeze({
        ...swagger,
        produces: ['application/json'],
        paths: {
          '/': {
            post: {
              consumes: [
                'application/x-www-form-urlencoded',
                'multipart/form-data',
              ],
              parameters: [
                {
                  name: 'name',
                  in: 'formData',
                  type: 'string',
                },
                {
                  name: 'hp',
                  in: 'formData',
                  type: 'integer',
                },
                {
                  name: 'speed',
                  in: 'formData',
                  type: 'number',
                },
                {
                  name: 'inverted',
                  in: 'formData',
                  type: 'boolean',
                },
              ],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    type: 'object',
                    properties: {
                      newSpeed: {
                        type: 'number',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })),
      {
        ...swagger,
        produces: ['application/json'],
        paths: {
          '/': {
            post: {
              consumes: [
                'application/x-www-form-urlencoded',
                'multipart/form-data',
              ],
              parameters: [
                {
                  name: 'name',
                  in: 'formData',
                  type: 'string',
                },
                {
                  name: 'hp',
                  in: 'formData',
                  type: 'integer',
                },
                {
                  name: 'speed',
                  in: 'formData',
                  type: 'number',
                },
                {
                  name: 'inverted',
                  in: 'formData',
                  type: 'boolean',
                },
              ],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    type: 'object',
                    properties: {
                      newSpeed: {
                        type: 'number',
                      },
                    },
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
