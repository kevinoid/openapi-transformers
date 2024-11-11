/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import { responseSchema3, schema3 } from '../test-lib/skeletons.js';
import XEnumToXMsEnumTransformer from '../x-enum-to-ms.js';

describe('XEnumToXMsEnumTransformer', () => {
  it('creates x-ms-enum from x-enum-*', () => {
    assert.deepStrictEqual(
      new XEnumToXMsEnumTransformer().transformOpenApi(deepFreeze(schema3({
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
      }),
    );
  });

  it('does not create x-ms-enum without name (in property)', () => {
    assert.deepStrictEqual(
      new XEnumToXMsEnumTransformer().transformOpenApi(deepFreeze(schema3({
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
      }))),
      schema3({
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
      }),
    );
  });

  it('does not create x-ms-enum without name (in response)', () => {
    assert.deepStrictEqual(
      new XEnumToXMsEnumTransformer().transformOpenApi(deepFreeze(
        responseSchema3({
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
        }),
      )),
      responseSchema3({
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
      }),
    );
  });

  it('adds x-ms-enum.values from x-enum-*', () => {
    assert.deepStrictEqual(
      new XEnumToXMsEnumTransformer().transformOpenApi(deepFreeze(schema3({
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
              name: 'Test',
            },
          },
        },
      }))),
      schema3({
        type: 'object',
        properties: {
          myprop: {
            type: 'string',
            enum: [
              'value1',
              'value2',
            ],
            'x-ms-enum': {
              name: 'Test',
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
      }),
    );
  });

  it('does not overwrite x-ms-enum.values', () => {
    assert.deepStrictEqual(
      new XEnumToXMsEnumTransformer().transformOpenApi(deepFreeze(schema3({
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
              name: 'Test',
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
      }))),
      schema3({
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
              name: 'Test',
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
      }),
    );
  });
});
