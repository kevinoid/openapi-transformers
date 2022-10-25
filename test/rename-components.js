/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';
import deepFreeze from 'deep-freeze';

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
      transformer.transformOpenApi(deepFreeze({
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
      })),
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

  it('preserves properties on JSON Reference', () => {
    const transformer = new RenameComponentsTransformer({
      schemas: (name) => (name === 'ResponseType' ? `New${name}` : name),
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
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
                      prop1: 'foo',
                      $ref: '#/components/schemas/RequestType',
                      prop2: 'bar',
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
                        prop3: 'baz',
                        $ref: '#/components/schemas/ResponseType',
                        prop4: 'quux',
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
                      prop1: 'foo',
                      $ref: '#/components/schemas/RequestType',
                      prop2: 'bar',
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
                        prop3: 'baz',
                        $ref: '#/components/schemas/NewResponseType',
                        prop4: 'quux',
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

  it('does not throw for unresolvable URI in $ref', () => {
    const transformer = new RenameComponentsTransformer({
      schemas: (name) => (name === 'ResponseType' ? `New${name}` : name),
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
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
                      $ref: '#/components/schemas/RequestType2',
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
                        $ref: '#/components/schemas/ResponseType2',
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
                      $ref: '#/components/schemas/RequestType2',
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
                        $ref: '#/components/schemas/ResponseType2',
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

  it('ignores invalid URI in $ref', () => {
    const transformer = new RenameComponentsTransformer({
      schemas: (name) => (name === 'ResponseType' ? `New${name}` : name),
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            post: {
              responses: {
                default: {
                  description: 'Example response',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '##',
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        paths: {
          '/': {
            post: {
              responses: {
                default: {
                  description: 'Example response',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '##',
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

  it('does not modify remote URI in $ref openapi 3', () => {
    const transformer = new RenameComponentsTransformer({
      schemas: (name) => (name === 'ResponseType' ? `New${name}` : name),
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
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
                      $ref: 'remote.json#/components/schemas/RequestType',
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
                        $ref: 'remote.json#/components/schemas/ResponseType',
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
                      $ref: 'remote.json#/components/schemas/RequestType',
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
                        $ref: 'remote.json#/components/schemas/ResponseType',
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
      transformer.transformOpenApi(deepFreeze({
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
      })),
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

  it('rename options.schemas handles child schemas correctly', () => {
    const transformer = new RenameComponentsTransformer({
      schemas: (name) => `New${name}2`,
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            ResponseType: {
              type: 'object',
              properties: {
                request: {
                  type: 'object',
                },
              },
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
                      $ref:
                        '#/components/schemas/ResponseType/properties/request',
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
      })),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            NewResponseType2: {
              type: 'object',
              properties: {
                request: {
                  type: 'object',
                },
              },
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
                      $ref: '#/components/schemas/NewResponseType2'
                        + '/properties/request',
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
                        $ref: '#/components/schemas/NewResponseType2',
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

  it('options.schemas does not rename outside components.schemas', () => {
    const transformer = new RenameComponentsTransformer({
      schemas: (name) => `New${name}`,
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        'x-stuff': {
          RequestType: {
            type: 'object',
          },
        },
        components: {
          myschemas: {
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
                      $ref: '#/x-stuff/RequestType',
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
                        $ref: '#/components/myschemas/ResponseType',
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
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        'x-stuff': {
          RequestType: {
            type: 'object',
          },
        },
        components: {
          myschemas: {
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
                      $ref: '#/x-stuff/RequestType',
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
                        $ref: '#/components/myschemas/ResponseType',
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
      transformer.transformOpenApi(deepFreeze({
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
      })),
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

  it('rename with options.schemas doesn\'t affect responses', () => {
    const transformer = new RenameComponentsTransformer({
      schemas: (name) => 'renamed',
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
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
});
