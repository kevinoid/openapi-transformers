/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import AddXMsEnumNameTransformer from '../add-x-ms-enum-name.js';
import {
  post3,
  responseSchema3,
  schema2,
  schema3,
} from '../test-lib/skeletons.js';

describe('AddXMsEnumNameTransformer', () => {
  it('openapi 3 without x-ms-enum in components', () => {
    assert.deepStrictEqual(
      new AddXMsEnumNameTransformer().transformOpenApi(deepFreeze(schema3({
        type: 'string',
        enum: [
          'value1',
          'value2',
        ],
      }))),
      schema3({
        type: 'string',
        enum: [
          'value1',
          'value2',
        ],
        'x-ms-enum': {
          name: 'Test',
        },
      }),
    );
  });

  it('openapi 3 without x-ms-enum.name in components', () => {
    assert.deepStrictEqual(
      new AddXMsEnumNameTransformer().transformOpenApi(deepFreeze(schema3({
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
      }))),
      schema3({
        type: 'string',
        enum: [
          'value1',
          'value2',
        ],
        'x-ms-enum': {
          name: 'Test',
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
      }),
    );
  });

  // Does not infer name from property name.
  // If desired, write a transform to move anonymous property schemas to named
  // components (and deduplicate as appropriate).
  it('openapi 3 property without x-ms-enum in components', () => {
    assert.deepStrictEqual(
      new AddXMsEnumNameTransformer().transformOpenApi(deepFreeze(schema3({
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
      }))),
      schema3({
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
      }),
    );
  });

  // Does not infer name from operation name.
  // If desired, write a transform to move anonymous requestBody schemas to
  // named components (and deduplicate as appropriate).
  it('openapi 3 requestBody without x-ms-enum', () => {
    assert.deepStrictEqual(
      new AddXMsEnumNameTransformer().transformOpenApi(deepFreeze(post3({
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
      }))),
      post3({
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
      }),
    );
  });

  // Does not infer name from operation name.
  // If desired, write a transform to move anonymous response schemas to
  // named components (and deduplicate as appropriate).
  it('openapi 3 response without x-ms-enum', () => {
    assert.deepStrictEqual(
      new AddXMsEnumNameTransformer().transformOpenApi(deepFreeze(
        responseSchema3({
          type: 'string',
          enum: [
            'value1',
            'value2',
          ],
        }),
      )),
      responseSchema3({
        type: 'string',
        enum: [
          'value1',
          'value2',
        ],
      }),
    );
  });

  it('swagger 2 without x-ms-enum in definitions', () => {
    assert.deepStrictEqual(
      new AddXMsEnumNameTransformer().transformOpenApi(deepFreeze(schema2({
        type: 'string',
        enum: [
          'value1',
          'value2',
        ],
      }))),
      schema2({
        type: 'string',
        enum: [
          'value1',
          'value2',
        ],
        'x-ms-enum': {
          name: 'Test',
        },
      }),
    );
  });
});
