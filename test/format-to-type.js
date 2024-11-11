/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import FormatToTypeTransformer from '../format-to-type.js';
import { schema3 } from '../test-lib/skeletons.js';

describe('FormatToTypeTransformer', () => {
  const formatToType = {
    decimal: 'number',
    double: 'number',
    float: 'number',
    integer: 'integer',
    int32: 'integer',
    int64: 'integer',
  };
  for (const [format, type] of Object.entries(formatToType)) {
    it(`openapi 3 format: ${format} to type ${type} in components`, () => {
      assert.deepStrictEqual(
        new FormatToTypeTransformer().transformOpenApi(deepFreeze(schema3({
          type: 'object',
          properties: {
            prop: {
              type: 'string',
              format,
            },
          },
        }))),
        schema3({
          type: 'object',
          properties: {
            prop: {
              type,
              // format is removed if format === type
              ...format === type ? undefined : { format },
            },
          },
        }),
      );
    });
  }
});
