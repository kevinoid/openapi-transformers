/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';
import deepFreeze from 'deep-freeze';

import RemoveResponseHeadersTransformer from '../remove-response-headers.js';

describe('RemoveResponseHeadersTransformer', () => {
  it('removes headers from components/responses', () => {
    assert.deepStrictEqual(
      new RemoveResponseHeadersTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
      new RemoveResponseHeadersTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            get: {
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
          '/': {
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

  it('removes headers from swagger 2 paths/responses', () => {
    assert.deepStrictEqual(
      new RemoveResponseHeadersTransformer().transformOpenApi(deepFreeze({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            get: {
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
