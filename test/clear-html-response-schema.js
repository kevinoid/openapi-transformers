/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import ClearHtmlResponseSchemaTransformer
  from '../clear-html-response-schema.js';
import { openapi, swagger } from '../test-lib/skeletons.js';

describe('ClearHtmlResponseSchemaTransformer', () => {
  it('removes schema for text/html response in openapi 3', () => {
    assert.deepStrictEqual(
      new ClearHtmlResponseSchemaTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        paths: {
          '/': {
            get: {
              responses: {
                default: {
                  description: 'Example response',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'string',
                        format: 'binary',
                      },
                    },
                  },
                },
              },
            },
          },
          '/html': {
            get: {
              responses: {
                default: {
                  description: 'Example response',
                  content: {
                    'text/html': {
                      schema: {
                        type: 'string',
                        format: 'binary',
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
        ...openapi,
        paths: {
          '/': {
            get: {
              responses: {
                default: {
                  description: 'Example response',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'string',
                        format: 'binary',
                      },
                    },
                  },
                },
              },
            },
          },
          '/html': {
            get: {
              responses: {
                default: {
                  description: 'Example response',
                  content: {
                    'text/html': {},
                  },
                },
              },
            },
          },
        },
      },
    );
  });

  it('removes schema for text/html;charset response in openapi 3', () => {
    assert.deepStrictEqual(
      new ClearHtmlResponseSchemaTransformer().transformOpenApi(deepFreeze({
        ...openapi,
        paths: {
          '/': {
            get: {
              responses: {
                default: {
                  description: 'Example response',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'string',
                        format: 'binary',
                      },
                    },
                  },
                },
              },
            },
          },
          '/html': {
            get: {
              responses: {
                default: {
                  description: 'Example response',
                  content: {
                    'text/html;charset=utf-8': {
                      schema: {
                        type: 'string',
                        format: 'binary',
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
        ...openapi,
        paths: {
          '/': {
            get: {
              responses: {
                default: {
                  description: 'Example response',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'string',
                        format: 'binary',
                      },
                    },
                  },
                },
              },
            },
          },
          '/html': {
            get: {
              responses: {
                default: {
                  description: 'Example response',
                  content: {
                    'text/html;charset=utf-8': {},
                  },
                },
              },
            },
          },
        },
      },
    );
  });

  it('removes schema for text/html response in swagger 2', () => {
    assert.deepStrictEqual(
      new ClearHtmlResponseSchemaTransformer().transformOpenApi(deepFreeze({
        ...swagger,
        paths: {
          '/': {
            get: {
              produces: ['application/json'],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    type: 'file',
                  },
                },
              },
            },
          },
          '/html': {
            get: {
              produces: ['text/html'],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    type: 'file',
                  },
                },
              },
            },
          },
        },
      })),
      {
        ...swagger,
        paths: {
          '/': {
            get: {
              produces: ['application/json'],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    type: 'file',
                  },
                },
              },
            },
          },
          '/html': {
            get: {
              produces: ['text/html'],
              responses: {
                default: {
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
