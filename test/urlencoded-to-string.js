/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';

import UrlencodedToStringTransformer from '../urlencoded-to-string.js';

describe('UrlencodedToStringTransformer', () => {
  it('converts non-string properties of urlencoded to string', () => {
    assert.deepStrictEqual(
      new UrlencodedToStringTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            post: {
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
            post: {
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
            },
          },
        },
      },
    );
  });

  it('converts non-string properties of urlencoded to string', () => {
    assert.deepStrictEqual(
      new UrlencodedToStringTransformer().transformOpenApi({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
      }),
      {
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
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

  it('does not convert properties of urlencoded+form-data', () => {
    assert.deepStrictEqual(
      new UrlencodedToStringTransformer().transformOpenApi({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
      }),
      {
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
