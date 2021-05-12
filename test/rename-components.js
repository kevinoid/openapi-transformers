/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';

import RenameComponentsTransformer from '../rename-components.js';

describe('RenameComponentsTransformer', () => {
  it('throws TypeError with null options', () => {
    assert.throws(
      () => new RenameComponentsTransformer(null),
      TypeError,
    );
  });

  it('throws TypeError with number options', () => {
    assert.throws(
      () => new RenameComponentsTransformer(1),
      TypeError,
    );
  });

  it('throws TypeError with number options.schemas', () => {
    assert.throws(
      () => new RenameComponentsTransformer({ schemas: 1 }),
      TypeError,
    );
  });

  it('rename with options.schemas function openapi 3', () => {
    const transformer = new RenameComponentsTransformer({
      schemas: (name) => (name === 'ResponseType' ? `New${name}` : name),
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            RequestType: {
              type: 'object',
            },
            ResponseType: {
              type: 'object',
            },
          },
        },
        paths: {
          '/': {
            post: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/RequestType',
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
                        $ref: '#/components/schemas/ResponseType',
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
        components: {
          schemas: {
            RequestType: {
              type: 'object',
            },
            NewResponseType: {
              type: 'object',
            },
          },
        },
        paths: {
          '/': {
            post: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/RequestType',
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
                        $ref: '#/components/schemas/NewResponseType',
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

  it('rename encoded with options.schemas function openapi 3', () => {
    const transformer = new RenameComponentsTransformer({
      schemas: (name) => (name === 'Response~Type#2' ? `New${name}` : name),
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            RequestType: {
              type: 'object',
            },
            'Response~Type#2': {
              type: 'object',
            },
          },
        },
        paths: {
          '/': {
            post: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/RequestType',
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
                        $ref: '#/components/schemas/Response~0Type%232',
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
        components: {
          schemas: {
            RequestType: {
              type: 'object',
            },
            'NewResponse~Type#2': {
              type: 'object',
            },
          },
        },
        paths: {
          '/': {
            post: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/RequestType',
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
                        $ref: '#/components/schemas/NewResponse~0Type%232',
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

  it('rename with options.schemas function swagger 2', () => {
    const transformer = new RenameComponentsTransformer({
      schemas: (name) => (name === 'ResponseType' ? `New${name}` : name),
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        definitions: {
          RequestType: {
            type: 'object',
          },
          ResponseType: {
            type: 'object',
          },
        },
        paths: {
          '/': {
            post: {
              parameters: [
                {
                  in: 'body',
                  name: 'body',
                  schema: {
                    $ref: '#/definitions/RequestType',
                  },
                },
              ],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    $ref: '#/definitions/ResponseType',
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
        definitions: {
          RequestType: {
            type: 'object',
          },
          NewResponseType: {
            type: 'object',
          },
        },
        paths: {
          '/': {
            post: {
              parameters: [
                {
                  in: 'body',
                  name: 'body',
                  schema: {
                    $ref: '#/definitions/RequestType',
                  },
                },
              ],
              responses: {
                default: {
                  description: 'Example response',
                  schema: {
                    $ref: '#/definitions/NewResponseType',
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
