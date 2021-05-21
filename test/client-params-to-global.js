/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';
import deepFreeze from 'deep-freeze';

import ClientParamsToGlobalTransformer from '../client-params-to-global.js';

describe('ClientParamsToGlobalTransformer', () => {
  it('openapi 3 client parameter', () => {
    assert.deepStrictEqual(
      new ClientParamsToGlobalTransformer().transformOpenApi(deepFreeze({
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
                  name: 'myquery',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  'x-ms-parameter-location': 'client',
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          parameters: {
            myquery: {
              name: 'myquery',
              in: 'query',
              schema: {
                type: 'string',
              },
              'x-ms-parameter-location': 'client',
            },
          },
        },
        paths: {
          '/': {
            get: {
              parameters: [
                { $ref: '#/components/parameters/myquery' },
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

  it('openapi 3 combines same client parameter', () => {
    assert.deepStrictEqual(
      new ClientParamsToGlobalTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            get: {
              parameters: [
                {
                  name: 'myquery',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  'x-ms-parameter-location': 'client',
                },
              ],
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
          '/b': {
            get: {
              parameters: [
                {
                  'x-ms-parameter-location': 'client',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  name: 'myquery',
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          parameters: {
            myquery: {
              name: 'myquery',
              in: 'query',
              schema: {
                type: 'string',
              },
              'x-ms-parameter-location': 'client',
            },
          },
        },
        paths: {
          '/a': {
            get: {
              parameters: [
                { $ref: '#/components/parameters/myquery' },
              ],
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
          '/b': {
            get: {
              parameters: [
                { $ref: '#/components/parameters/myquery' },
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

  it('openapi 3 references existing parameter of same name', () => {
    assert.deepStrictEqual(
      new ClientParamsToGlobalTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          parameters: {
            myquery: {
              name: 'myquery',
              in: 'query',
              schema: {
                type: 'string',
              },
              'x-ms-parameter-location': 'client',
            },
          },
        },
        paths: {
          '/a': {
            get: {
              parameters: [
                {
                  name: 'myquery',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  'x-ms-parameter-location': 'client',
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          parameters: {
            myquery: {
              name: 'myquery',
              in: 'query',
              schema: {
                type: 'string',
              },
              'x-ms-parameter-location': 'client',
            },
          },
        },
        paths: {
          '/a': {
            get: {
              parameters: [
                { $ref: '#/components/parameters/myquery' },
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

  it('openapi 3 references existing parameter of different name', () => {
    assert.deepStrictEqual(
      new ClientParamsToGlobalTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          parameters: {
            notmyquery: {
              name: 'myquery',
              in: 'query',
              schema: {
                type: 'string',
              },
              'x-ms-parameter-location': 'client',
            },
          },
        },
        paths: {
          '/a': {
            get: {
              parameters: [
                {
                  name: 'myquery',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  'x-ms-parameter-location': 'client',
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          parameters: {
            notmyquery: {
              name: 'myquery',
              in: 'query',
              schema: {
                type: 'string',
              },
              'x-ms-parameter-location': 'client',
            },
          },
        },
        paths: {
          '/a': {
            get: {
              parameters: [
                { $ref: '#/components/parameters/notmyquery' },
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

  // Autorest treates unspecified x-ms-parameter-location as 'client' for
  // parameters defined in components.
  it('openapi 3 references existing parameter without x-ms-p-l', () => {
    assert.deepStrictEqual(
      new ClientParamsToGlobalTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          parameters: {
            notmyquery: {
              name: 'myquery',
              in: 'query',
              schema: {
                type: 'string',
              },
            },
          },
        },
        paths: {
          '/a': {
            get: {
              parameters: [
                {
                  name: 'myquery',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  'x-ms-parameter-location': 'client',
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          parameters: {
            notmyquery: {
              name: 'myquery',
              in: 'query',
              schema: {
                type: 'string',
              },
            },
          },
        },
        paths: {
          '/a': {
            get: {
              parameters: [
                { $ref: '#/components/parameters/notmyquery' },
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

  it('openapi 3 does not combine different client parameter', () => {
    assert.deepStrictEqual(
      new ClientParamsToGlobalTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a': {
            get: {
              parameters: [
                {
                  name: 'myquery',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  'x-ms-parameter-location': 'client',
                },
              ],
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
          '/b': {
            get: {
              parameters: [
                {
                  name: 'myquery',
                  in: 'query',
                  schema: {
                    type: 'number',
                  },
                  'x-ms-parameter-location': 'client',
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          parameters: {
            myquery: {
              name: 'myquery',
              in: 'query',
              schema: {
                type: 'string',
              },
              'x-ms-parameter-location': 'client',
            },
            myquery2: {
              name: 'myquery',
              in: 'query',
              schema: {
                type: 'number',
              },
              'x-ms-parameter-location': 'client',
            },
          },
        },
        paths: {
          '/a': {
            get: {
              parameters: [
                { $ref: '#/components/parameters/myquery' },
              ],
              responses: {
                204: {
                  description: 'Example response',
                },
              },
            },
          },
          '/b': {
            get: {
              parameters: [
                { $ref: '#/components/parameters/myquery2' },
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

  it('openapi 3 client parameter encodes name in $ref', () => {
    assert.deepStrictEqual(
      new ClientParamsToGlobalTransformer().transformOpenApi(deepFreeze({
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
                  name: 'my~query/thing',
                  in: 'query',
                  schema: {
                    type: 'string',
                  },
                  'x-ms-parameter-location': 'client',
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          parameters: {
            'my~query/thing': {
              name: 'my~query/thing',
              in: 'query',
              schema: {
                type: 'string',
              },
              'x-ms-parameter-location': 'client',
            },
          },
        },
        paths: {
          '/': {
            get: {
              parameters: [
                { $ref: '#/components/parameters/my~0query~1thing' },
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

  it('swagger 2 client parameter', () => {
    assert.deepStrictEqual(
      new ClientParamsToGlobalTransformer().transformOpenApi(deepFreeze({
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
                  name: 'myquery',
                  in: 'query',
                  type: 'string',
                  'x-ms-parameter-location': 'client',
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
        parameters: {
          myquery: {
            name: 'myquery',
            in: 'query',
            type: 'string',
            'x-ms-parameter-location': 'client',
          },
        },
        paths: {
          '/': {
            get: {
              parameters: [
                { $ref: '#/parameters/myquery' },
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
