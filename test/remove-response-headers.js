/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import RemoveResponseHeadersTransformer from '../remove-response-headers.js';
import { get2, get3, openapi } from '../test-lib/skeletons.js';

describe('RemoveResponseHeadersTransformer', () => {
  it('removes headers from components/responses', () => {
    assert.deepStrictEqual(
      new RemoveResponseHeadersTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        components: {
          responses: {
            myresponse: {
              description: 'Example response',
              headers: {
                'X-Foo': {
                  type: 'string',
                  pattern: '^foo',
                },
              },
            },
          },
        },
        paths: {
          '/': {
            get: {
              responses: {
                204: {
                  $ref: '#/components/responses/myresponse',
                },
              },
            },
          },
        },
      })),
      {
        ...openapi,
        components: {
          responses: {
            myresponse: {
              description: 'Example response',
            },
          },
        },
        paths: {
          '/': {
            get: {
              responses: {
                204: {
                  $ref: '#/components/responses/myresponse',
                },
              },
            },
          },
        },
      },
    );
  });

  // These appear to have no effect on generated code
  it('does not remove components/headers', () => {
    assert.deepStrictEqual(
      new RemoveResponseHeadersTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        components: {
          headers: {
            myheader: {
              type: 'string',
              pattern: '^foo',
            },
          },
          responses: {
            myresponse: {
              description: 'Example response',
              headers: {
                'X-Foo': {
                  $ref: '#/components/headers/myheader',
                },
              },
            },
          },
        },
        paths: {
          '/': {
            get: {
              responses: {
                204: {
                  $ref: '#/components/responses/myresponse',
                },
              },
            },
          },
        },
      })),
      {
        ...openapi,
        components: {
          headers: {
            myheader: {
              type: 'string',
              pattern: '^foo',
            },
          },
          responses: {
            myresponse: {
              description: 'Example response',
            },
          },
        },
        paths: {
          '/': {
            get: {
              responses: {
                204: {
                  $ref: '#/components/responses/myresponse',
                },
              },
            },
          },
        },
      },
    );
  });

  it('removes headers from openapi 3 paths/responses', () => {
    assert.deepStrictEqual(
      new RemoveResponseHeadersTransformer().transformOpenApi(deepFreeze(get3({
        responses: {
          204: {
            description: 'Example response',
            headers: {
              'X-Foo': {
                type: 'string',
                pattern: '^foo',
              },
            },
          },
        },
      }))),
      get3({
        responses: {
          204: {
            description: 'Example response',
          },
        },
      }),
    );
  });

  it('removes headers from swagger 2 paths/responses', () => {
    assert.deepStrictEqual(
      new RemoveResponseHeadersTransformer().transformOpenApi(deepFreeze(get2({
        responses: {
          204: {
            description: 'Example response',
            headers: {
              'X-Foo': {
                type: 'string',
                pattern: '^foo',
              },
            },
          },
        },
      }))),
      get2({
        responses: {
          204: {
            description: 'Example response',
          },
        },
      }),
    );
  });
});
