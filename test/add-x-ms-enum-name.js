/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';

import AddXMsEnumNameTransformer from '../add-x-ms-enum-name.js';

describe('AddXMsEnumNameTransformer', () => {
  it('openapi 3 without x-ms-enum in components', () => {
    assert.deepStrictEqual(
      new AddXMsEnumNameTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            StringEnum: {
              type: 'string',
              enum: [
                'value1',
                'value2',
              ],
            },
          },
        },
        paths: {},
      }),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            StringEnum: {
              type: 'string',
              enum: [
                'value1',
                'value2',
              ],
              'x-ms-enum': {
                name: 'StringEnum',
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('openapi 3 without x-ms-enum.name in components', () => {
    assert.deepStrictEqual(
      new AddXMsEnumNameTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            StringEnum: {
              type: 'string',
              enum: [
                'value1',
                'value2',
              ],
              'x-ms-enum': {
                values: [
                  {
                    name: 'Value1',
                    value: 'value1',
                  },
                  {
                    name: 'Value2',
                    value: 'value2',
                  },
                ],
              },
            },
          },
        },
        paths: {},
      }),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            StringEnum: {
              type: 'string',
              enum: [
                'value1',
                'value2',
              ],
              'x-ms-enum': {
                name: 'StringEnum',
                values: [
                  {
                    name: 'Value1',
                    value: 'value1',
                  },
                  {
                    name: 'Value2',
                    value: 'value2',
                  },
                ],
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  // Does not infer name from property name.
  // If desired, write a transform to move anonymous property schemas to named
  // components (and deduplicate as appropriate).
  it('openapi 3 property without x-ms-enum in components', () => {
    assert.deepStrictEqual(
      new AddXMsEnumNameTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'object',
              properties: {
                myenum: {
                  type: 'string',
                  enum: [
                    'value1',
                    'value2',
                  ],
                },
              },
            },
          },
        },
        paths: {},
      }),
      {
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            Example: {
              type: 'object',
              properties: {
                myenum: {
                  type: 'string',
                  enum: [
                    'value1',
                    'value2',
                  ],
                },
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  // Does not infer name from operation name.
  // If desired, write a transform to move anonymous requestBody schemas to
  // named components (and deduplicate as appropriate).
  it('openapi 3 requestBody without x-ms-enum', () => {
    assert.deepStrictEqual(
      new AddXMsEnumNameTransformer().transformOpenApi({
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
                  'application/json': {
                    schema: {
                      type: 'string',
                      enum: [
                        'value1',
                        'value2',
                      ],
                    },
                  },
                },
              },
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
            post: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'string',
                      enum: [
                        'value1',
                        'value2',
                      ],
                    },
                  },
                },
              },
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

  // Does not infer name from operation name.
  // If desired, write a transform to move anonymous response schemas to
  // named components (and deduplicate as appropriate).
  it('openapi 3 response without x-ms-enum', () => {
    assert.deepStrictEqual(
      new AddXMsEnumNameTransformer().transformOpenApi({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
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
                        enum: [
                          'value1',
                          'value2',
                        ],
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
            get: {
              responses: {
                default: {
                  description: 'Example response',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'string',
                        enum: [
                          'value1',
                          'value2',
                        ],
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

  it('swagger 2 without x-ms-enum in definitions', () => {
    assert.deepStrictEqual(
      new AddXMsEnumNameTransformer().transformOpenApi({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        definitions: {
          StringEnum: {
            type: 'string',
            enum: [
              'value1',
              'value2',
            ],
          },
        },
        paths: {},
      }),
      {
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        definitions: {
          StringEnum: {
            type: 'string',
            enum: [
              'value1',
              'value2',
            ],
            'x-ms-enum': {
              name: 'StringEnum',
            },
          },
        },
        paths: {},
      },
    );
  });
});
