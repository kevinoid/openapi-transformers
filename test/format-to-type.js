/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'assert';

import FormatToTypeTransformer from '../format-to-type.js';

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
        new FormatToTypeTransformer().transformOpenApi({
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
                  prop: {
                    type: 'string',
                    format,
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
                  prop: {
                    type,
                    // format is removed if format === type
                    ...format === type ? undefined : { format },
                  },
                },
              },
            },
          },
          paths: {},
        },
      );
    });
  }
});
