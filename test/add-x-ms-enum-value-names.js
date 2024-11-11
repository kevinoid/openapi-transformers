/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import AddXMsEnumValueNamesTransformer from '../add-x-ms-enum-value-names.js';
import {
  get2,
  get3,
  post3,
  responseSchema3,
  schema3,
} from '../test-lib/skeletons.js';

describe('AddXMsEnumValueNamesTransformer', () => {
  it('openapi 3 with x-ms-enum.name in components', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze(
        schema3({
          type: 'string',
          enum: [
            'my value1',
            'my value2',
          ],
          'x-ms-enum': {
            name: 'StringEnum',
          },
        }),
      )),
      schema3({
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
      }),
    );
  });

  // Without x-ms-enum, enum type is not generated, so name is irrelevant
  it('openapi 3 without x-ms-enum in components', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze(
        schema3({
          type: 'string',
          enum: [
            'my value1',
            'my value2',
          ],
        }),
      )),
      schema3({
        type: 'string',
        enum: [
          'my value1',
          'my value2',
        ],
      }),
    );
  });

  it('openapi 3 with x-ms-enum.values without name in components', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze(
        schema3({
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
        }),
      )),
      schema3({
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
      }),
    );
  });

  it('openapi 3 with x-ms-enum.values with some names in components', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze(
        schema3({
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
        }),
      )),
      schema3({
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
      }),
    );
  });

  it('openapi 3 with x-ms-enum.name in parameter schema', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze(get3({
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
      }))),
      get3({
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
      }),
    );
  });

  it('openapi 3 with x-ms-enum.name in parameter content', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze(get3({
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
      }))),
      get3({
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
      }),
    );
  });

  it('openapi 3 requestBody with x-ms-enum.name', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze(post3({
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
      }))),
      post3({
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
      }),
    );
  });

  it('openapi 3 response with x-ms-enum.name', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze(
        responseSchema3({
          type: 'string',
          enum: [
            'my value1',
            'my value2',
          ],
          'x-ms-enum': {
            name: 'StringEnum',
          },
        }),
      )),
      responseSchema3({
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
      }),
    );
  });

  it('swagger 2 parameter with x-ms-enum.name', () => {
    assert.deepStrictEqual(
      new AddXMsEnumValueNamesTransformer().transformOpenApi(deepFreeze(get2({
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
      }))),
      get2({
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
      }),
    );
  });
});
