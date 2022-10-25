/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';
import deepFreeze from 'deep-freeze';

import XEnumToXMsEnumTransformer from '../x-enum-to-ms.js';

describe('XEnumToXMsEnumTransformer', () => {
  it('creates x-ms-enum from x-enum-*', () => {
    assert.deepStrictEqual(
      new XEnumToXMsEnumTransformer().transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            ExampleEnum: {
              type: 'string',
              enum: [
                'value1',
                'value2',
              ],
              'x-enum-descriptions': [
                'Description 1',
                'Description 2',
              ],
              'x-enum-varnames': [
                'Var1',
                'Var2',
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
            ExampleEnum: {
              type: 'string',
              enum: [
                'value1',
                'value2',
              ],
              'x-ms-enum': {
                name: 'ExampleEnum',
                values: [
                  {
                    value: 'value1',
                    description: 'Description 1',
                    name: 'Var1',
                  },
                  {
                    value: 'value2',
                    description: 'Description 2',
                    name: 'Var2',
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

  it('does not create x-ms-enum without name (in property)', () => {
    assert.deepStrictEqual(
      new XEnumToXMsEnumTransformer().transformOpenApi(deepFreeze({
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
                myprop: {
                  type: 'string',
                  enum: [
                    'value1',
                    'value2',
                  ],
                  'x-enum-descriptions': [
                    'Description 1',
                    'Description 2',
                  ],
                  'x-enum-varnames': [
                    'Var1',
                    'Var2',
                  ],
                },
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
            Example: {
              type: 'object',
              properties: {
                myprop: {
                  type: 'string',
                  enum: [
                    'value1',
                    'value2',
                  ],
                  'x-enum-descriptions': [
                    'Description 1',
                    'Description 2',
                  ],
                  'x-enum-varnames': [
                    'Var1',
                    'Var2',
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

  it('does not create x-ms-enum without name (in response)', () => {
    assert.deepStrictEqual(
      new XEnumToXMsEnumTransformer().transformOpenApi(deepFreeze({
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
                        'x-enum-descriptions': [
                          'Description 1',
                          'Description 2',
                        ],
                        'x-enum-varnames': [
                          'Var1',
                          'Var2',
                        ],
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
                          'value1',
                          'value2',
                        ],
                        'x-enum-descriptions': [
                          'Description 1',
                          'Description 2',
                        ],
                        'x-enum-varnames': [
                          'Var1',
                          'Var2',
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

  it('adds x-ms-enum.values from x-enum-*', () => {
    assert.deepStrictEqual(
      new XEnumToXMsEnumTransformer().transformOpenApi(deepFreeze({
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
                myprop: {
                  type: 'string',
                  enum: [
                    'value1',
                    'value2',
                  ],
                  'x-enum-descriptions': [
                    'Description 1',
                    'Description 2',
                  ],
                  'x-enum-varnames': [
                    'Var1',
                    'Var2',
                  ],
                  'x-ms-enum': {
                    name: 'ExampleEnum',
                  },
                },
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
            Example: {
              type: 'object',
              properties: {
                myprop: {
                  type: 'string',
                  enum: [
                    'value1',
                    'value2',
                  ],
                  'x-ms-enum': {
                    name: 'ExampleEnum',
                    values: [
                      {
                        value: 'value1',
                        description: 'Description 1',
                        name: 'Var1',
                      },
                      {
                        value: 'value2',
                        description: 'Description 2',
                        name: 'Var2',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('does not overwrite x-ms-enum.values', () => {
    assert.deepStrictEqual(
      new XEnumToXMsEnumTransformer().transformOpenApi(deepFreeze({
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
                myprop: {
                  type: 'string',
                  enum: [
                    'value1',
                    'value2',
                  ],
                  'x-enum-descriptions': [
                    'Description 1',
                    'Description 2',
                  ],
                  'x-enum-varnames': [
                    'Var1',
                    'Var2',
                  ],
                  'x-ms-enum': {
                    name: 'ExampleEnum',
                    values: [
                      {
                        value: 'value1',
                        description: 'MS Description 1',
                        name: 'MsVar1',
                      },
                      {
                        value: 'value2',
                        description: 'MS Description 2',
                        name: 'MsVar2',
                      },
                    ],
                  },
                },
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
            Example: {
              type: 'object',
              properties: {
                myprop: {
                  type: 'string',
                  enum: [
                    'value1',
                    'value2',
                  ],
                  'x-enum-descriptions': [
                    'Description 1',
                    'Description 2',
                  ],
                  'x-enum-varnames': [
                    'Var1',
                    'Var2',
                  ],
                  'x-ms-enum': {
                    name: 'ExampleEnum',
                    values: [
                      {
                        value: 'value1',
                        description: 'MS Description 1',
                        name: 'MsVar1',
                      },
                      {
                        value: 'value2',
                        description: 'MS Description 2',
                        name: 'MsVar2',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        paths: {},
      },
    );
  });
});
