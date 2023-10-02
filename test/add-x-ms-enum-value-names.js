/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import AddXMsEnumValueNamesTransformer from '../add-x-ms-enum-value-names.js';

describe('AddXMsEnumValueNamesTransformer', () => {
  it('openapi 3 with x-ms-enum.name in components', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze({
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
                'my value1',
                'my value2',
              ],
              'x-ms-enum': {
                name: 'StringEnum',
              },
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
            StringEnum: {
              type: 'string',
              enum: [
                'my value1',
                'my value2',
              ],
              'x-ms-enum': {
                name: 'StringEnum',
                values: [
                  { name: 'MyValue1', value: 'my value1' },
                  { name: 'MyValue2', value: 'my value2' },
                ],
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  // Without x-ms-enum, enum type is not generated, so name is irrelevant
  it('openapi 3 without x-ms-enum in components', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze({
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
                'my value1',
                'my value2',
              ],
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
            StringEnum: {
              type: 'string',
              enum: [
                'my value1',
                'my value2',
              ],
            },
          },
        },
        paths: {},
      },
    );
  });

  it('openapi 3 with x-ms-enum.values without name in components', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze({
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
                'my value1',
                'my value2',
              ],
              'x-ms-enum': {
                name: 'StringEnum',
                values: [
                  { value: 'my value1' },
                  { value: 'my value2' },
                ],
              },
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
            StringEnum: {
              type: 'string',
              enum: [
                'my value1',
                'my value2',
              ],
              'x-ms-enum': {
                name: 'StringEnum',
                values: [
                  { name: 'MyValue1', value: 'my value1' },
                  { name: 'MyValue2', value: 'my value2' },
                ],
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('openapi 3 with x-ms-enum.values with some names in components', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze({
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
                'my value1',
                'my value2',
              ],
              'x-ms-enum': {
                name: 'StringEnum',
                values: [
                  { value: 'my value1' },
                  { name: 'MyValue', value: 'my value2' },
                ],
              },
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
            StringEnum: {
              type: 'string',
              enum: [
                'my value1',
                'my value2',
              ],
              'x-ms-enum': {
                name: 'StringEnum',
                values: [
                  { name: 'MyValue1', value: 'my value1' },
                  { name: 'MyValue', value: 'my value2' },
                ],
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('openapi 3 with x-ms-enum.name in parameter schema', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze({
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
                    enum: [
                      'my value1',
                      'my value2',
                    ],
                    'x-ms-enum': {
                      name: 'StringEnum',
                    },
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
                    enum: [
                      'my value1',
                      'my value2',
                    ],
                    'x-ms-enum': {
                      name: 'StringEnum',
                      values: [
                        { name: 'MyValue1', value: 'my value1' },
                        { name: 'MyValue2', value: 'my value2' },
                      ],
                    },
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

  it('openapi 3 with x-ms-enum.name in parameter content', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze({
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
                  content: {
                    'application/json': {
                      schema: {
                        type: 'string',
                        enum: [
                          'my value1',
                          'my value2',
                        ],
                        'x-ms-enum': {
                          name: 'StringEnum',
                        },
                      },
                    },
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
                  content: {
                    'application/json': {
                      schema: {
                        type: 'string',
                        enum: [
                          'my value1',
                          'my value2',
                        ],
                        'x-ms-enum': {
                          name: 'StringEnum',
                          values: [
                            { name: 'MyValue1', value: 'my value1' },
                            { name: 'MyValue2', value: 'my value2' },
                          ],
                        },
                      },
                    },
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

  it('openapi 3 requestBody with x-ms-enum.name', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze({
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
                        'my value1',
                        'my value2',
                      ],
                      'x-ms-enum': {
                        name: 'StringEnum',
                      },
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
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'string',
                      enum: [
                        'my value1',
                        'my value2',
                      ],
                      'x-ms-enum': {
                        name: 'StringEnum',
                        values: [
                          { name: 'MyValue1', value: 'my value1' },
                          { name: 'MyValue2', value: 'my value2' },
                        ],
                      },
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

  it('openapi 3 response with x-ms-enum.name', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze({
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
                          'my value1',
                          'my value2',
                        ],
                        'x-ms-enum': {
                          name: 'StringEnum',
                        },
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
            get: {
              responses: {
                default: {
                  description: 'Example response',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'string',
                        enum: [
                          'my value1',
                          'my value2',
                        ],
                        'x-ms-enum': {
                          name: 'StringEnum',
                          values: [
                            { name: 'MyValue1', value: 'my value1' },
                            { name: 'MyValue2', value: 'my value2' },
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
      },
    );
  });

  it('swagger 2 parameter with x-ms-enum.name', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze({
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
                  in: 'query',
                  name: 'myquery',
                  type: 'string',
                  enum: [
                    'my value1',
                    'my value2',
                  ],
                  'x-ms-enum': {
                    name: 'StringEnum',
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
            get: {
              parameters: [
                {
                  in: 'query',
                  name: 'myquery',
                  type: 'string',
                  enum: [
                    'my value1',
                    'my value2',
                  ],
                  'x-ms-enum': {
                    name: 'StringEnum',
                    values: [
                      { name: 'MyValue1', value: 'my value1' },
                      { name: 'MyValue2', value: 'my value2' },
                    ],
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
});
