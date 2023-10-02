/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import BinaryStringToFileTransformer from '../binary-string-to-file.js';

describe('BinaryStringToFileTransformer', () => {
  it('openapi 3 with format: binary in components', () => {
    assert.deepStrictEqual(
      new BinaryStringToFileTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'string',
              format: 'binary',
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'file',
            },
          },
        },
        paths: {},
      },
    );
  });

  it('openapi 3 with format: file in components', () => {
    assert.deepStrictEqual(
      new BinaryStringToFileTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'string',
              format: 'file',
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'file',
            },
          },
        },
        paths: {},
      },
    );
  });

  it('openapi 3 without format in components', () => {
    assert.deepStrictEqual(
      new BinaryStringToFileTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'string',
            },
          },
        },
        paths: {},
      })),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'string',
            },
          },
        },
        paths: {},
      },
    );
  });

  it('swagger 2 format: binary in parameter schema', () => {
    assert.deepStrictEqual(
      new BinaryStringToFileTransformer().transformOpenApi(deepFreeze({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            post: {
              parameters: [
                {
                  in: 'body',
                  name: 'myfile',
                  schema: {
                    type: 'string',
                    format: 'binary',
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
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            post: {
              parameters: [
                {
                  in: 'body',
                  name: 'myfile',
                  schema: {
                    type: 'file',
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

  it('swagger 2 format: file in parameter schema', () => {
    assert.deepStrictEqual(
      new BinaryStringToFileTransformer().transformOpenApi(deepFreeze({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            post: {
              parameters: [
                {
                  in: 'body',
                  name: 'myfile',
                  schema: {
                    type: 'string',
                    format: 'file',
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
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            post: {
              parameters: [
                {
                  in: 'body',
                  name: 'myfile',
                  schema: {
                    type: 'file',
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

  it('swagger 2 format: binary in parameter', () => {
    assert.deepStrictEqual(
      new BinaryStringToFileTransformer().transformOpenApi(deepFreeze({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            post: {
              parameters: [
                {
                  in: 'formData',
                  name: 'myfile',
                  type: 'string',
                  format: 'binary',
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
          '/': {
            post: {
              parameters: [
                {
                  in: 'formData',
                  name: 'myfile',
                  type: 'file',
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

  it('swagger 2 format: file in parameter', () => {
    assert.deepStrictEqual(
      new BinaryStringToFileTransformer().transformOpenApi(deepFreeze({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            post: {
              parameters: [
                {
                  in: 'formData',
                  name: 'myfile',
                  type: 'string',
                  format: 'file',
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
          '/': {
            post: {
              parameters: [
                {
                  in: 'formData',
                  name: 'myfile',
                  type: 'file',
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
