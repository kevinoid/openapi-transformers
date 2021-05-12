/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';

import QueriesToXMsPathsTransformer from '../queries-to-x-ms-paths.js';

describe('QueriesToXMsPathsTransformer', () => {
  it('moves paths with query to x-ms-paths in openapi 3', () => {
    assert.deepStrictEqual(
      new QueriesToXMsPathsTransformer().transformOpenApi({
        openapi: '3.0.3',
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
          '/a?foo=bar': {
            get: {
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
        'x-ms-paths': {
          '/a?foo=bar': {
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

  it('does not create x-ms-paths if none have queries', () => {
    assert.deepStrictEqual(
      new QueriesToXMsPathsTransformer().transformOpenApi({
        openapi: '3.0.3',
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
      }),
      {
        openapi: '3.0.3',
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

  // OpenAPI specifies paths is a required property.
  // Must be present, even if empty.
  it('leaves empty paths after moving', () => {
    assert.deepStrictEqual(
      new QueriesToXMsPathsTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/a?foo=bar': {
            get: {
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
        paths: {},
        'x-ms-paths': {
          '/a?foo=bar': {
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

  it('moves paths with query to x-ms-paths in swagger 2', () => {
    assert.deepStrictEqual(
      new QueriesToXMsPathsTransformer().transformOpenApi({
        swagger: '2.0',
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
          '/a?foo=bar': {
            get: {
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
        'x-ms-paths': {
          '/a?foo=bar': {
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
