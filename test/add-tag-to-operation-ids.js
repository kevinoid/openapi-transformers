/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';

import AddTagToOperationIdsTransformer from '../add-tag-to-operation-ids.js';

describe('AddTagToOperationIdsTransformer', () => {
  it('throws TypeError with null options', () => {
    assert.throws(
      () => new AddTagToOperationIdsTransformer(null),
      TypeError,
    );
  });

  it('openapi 3 only tag to operationId prefix', () => {
    assert.deepStrictEqual(
      new AddTagToOperationIdsTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            get: {
              tags: ['MyTag'],
              operationId: 'getRoot',
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
              tags: ['MyTag'],
              operationId: 'MyTag_getRoot',
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

  it('openapi 3 first tag to operationId prefix', () => {
    assert.deepStrictEqual(
      new AddTagToOperationIdsTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            get: {
              tags: ['MyTag1', 'MyTag2'],
              operationId: 'getRoot',
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
              tags: ['MyTag1', 'MyTag2'],
              operationId: 'MyTag1_getRoot',
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

  it('openapi 3 no tag to operationId prefix', () => {
    assert.deepStrictEqual(
      new AddTagToOperationIdsTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            get: {
              operationId: 'getRoot',
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
              operationId: 'getRoot',
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

  it('openapi 3 empty tag to operationId prefix', () => {
    assert.deepStrictEqual(
      new AddTagToOperationIdsTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            get: {
              tags: [],
              operationId: 'getRoot',
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
              tags: [],
              operationId: 'getRoot',
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

  it('openapi 3 no operationId', () => {
    assert.deepStrictEqual(
      new AddTagToOperationIdsTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            get: {
              tags: ['MyTag'],
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
              tags: ['MyTag'],
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

  it('openapi 3 empty operationId', () => {
    assert.deepStrictEqual(
      new AddTagToOperationIdsTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            get: {
              tags: ['MyTag'],
              operationId: '',
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
              tags: ['MyTag'],
              operationId: '',
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

  it('openapi 3 options.tagSuffix appended to tag before operationId', () => {
    const transformer =
      new AddTagToOperationIdsTransformer({ tagSuffix: 'Api' });
    assert.deepStrictEqual(
      transformer.transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            get: {
              tags: ['MyTag'],
              operationId: 'getRoot',
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
              tags: ['MyTag'],
              operationId: 'MyTagApi_getRoot',
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

  it('swagger 2 only tag to operationId prefix', () => {
    assert.deepStrictEqual(
      new AddTagToOperationIdsTransformer().transformOpenApi({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            get: {
              tags: ['MyTag'],
              operationId: 'getRoot',
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
              tags: ['MyTag'],
              operationId: 'MyTag_getRoot',
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
