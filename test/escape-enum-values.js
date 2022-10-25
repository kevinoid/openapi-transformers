/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';
import deepFreeze from 'deep-freeze';

import EscapeEnumValuesTransformer from '../escape-enum-values.js';

describe('EscapeEnumValuesTransformer', () => {
  it('throws TypeError without options', () => {
    assert.throws(
      () => new EscapeEnumValuesTransformer(),
      TypeError,
    );
  });

  it('throws TypeError without options.language', () => {
    assert.throws(
      () => new EscapeEnumValuesTransformer({}),
      TypeError,
    );
  });

  it('throws TypeError with number options.language', () => {
    assert.throws(
      () => new EscapeEnumValuesTransformer({ language: 5 }),
      TypeError,
    );
  });

  it('throws RangeError with unrecognized options.language', () => {
    assert.throws(
      () => new EscapeEnumValuesTransformer({ language: 'unrecognized' }),
      RangeError,
    );
  });

  it('escapes x-ms-enum values for csharp', () => {
    const transformer =
      new EscapeEnumValuesTransformer({ language: 'csharp' });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            MyEnum: {
              type: 'string',
              enum: [
                '"',
                "'",
                '\\',
                '\r\n',
              ],
              'x-ms-enum': {
                name: 'MyEnum',
                values: [
                  { value: '"' },
                  { value: "'" },
                  { value: '\\' },
                  { value: '\r\n' },
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
            MyEnum: {
              type: 'string',
              enum: [
                '"',
                "'",
                '\\',
                '\r\n',
              ],
              'x-ms-enum': {
                name: 'MyEnum',
                values: [
                  { value: '\\"' },
                  { value: "'" },
                  { value: '\\\\' },
                  { value: '\\r\\n' },
                ],
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('escapes x-ms-enum values for go', () => {
    const transformer =
      new EscapeEnumValuesTransformer({ language: 'go' });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            MyEnum: {
              type: 'string',
              enum: [
                '"',
                "'",
                '\\',
                '\r\n',
              ],
              'x-ms-enum': {
                name: 'MyEnum',
                values: [
                  { value: '"' },
                  { value: "'" },
                  { value: '\\' },
                  { value: '\r\n' },
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
            MyEnum: {
              type: 'string',
              enum: [
                '"',
                "'",
                '\\',
                '\r\n',
              ],
              'x-ms-enum': {
                name: 'MyEnum',
                values: [
                  { value: '\\"' },
                  { value: "'" },
                  { value: '\\\\' },
                  { value: '\\r\\n' },
                ],
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('escapes x-ms-enum values for java', () => {
    const transformer =
      new EscapeEnumValuesTransformer({ language: 'java' });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            MyEnum: {
              type: 'string',
              enum: [
                '"',
                "'",
                '\\',
                '\r\n',
              ],
              'x-ms-enum': {
                name: 'MyEnum',
                values: [
                  { value: '"' },
                  { value: "'" },
                  { value: '\\' },
                  { value: '\r\n' },
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
            MyEnum: {
              type: 'string',
              enum: [
                '"',
                "'",
                '\\',
                '\r\n',
              ],
              'x-ms-enum': {
                name: 'MyEnum',
                values: [
                  { value: '\\"' },
                  { value: "'" },
                  { value: '\\\\' },
                  { value: '\\r\\n' },
                ],
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('escapes x-ms-enum values for nodejs', () => {
    const transformer =
      new EscapeEnumValuesTransformer({ language: 'nodejs' });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            MyEnum: {
              type: 'string',
              enum: [
                '"',
                "'",
                '\\',
                '\r\n',
              ],
              'x-ms-enum': {
                name: 'MyEnum',
                values: [
                  { value: '"' },
                  { value: "'" },
                  { value: '\\' },
                  { value: '\r\n' },
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
            MyEnum: {
              type: 'string',
              enum: [
                '"',
                "'",
                '\\',
                '\r\n',
              ],
              'x-ms-enum': {
                name: 'MyEnum',
                values: [
                  { value: '\\"' },
                  { value: "\\'" },
                  { value: '\\\\' },
                  { value: '\\r\\n' },
                ],
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('escapes x-ms-enum values for php', () => {
    const transformer =
      new EscapeEnumValuesTransformer({ language: 'php' });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            MyEnum: {
              type: 'string',
              enum: [
                '"',
                "'",
                '\\',
                '\r\n',
              ],
              'x-ms-enum': {
                name: 'MyEnum',
                values: [
                  { value: '"' },
                  { value: "'" },
                  { value: '\\' },
                  { value: '\r\n' },
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
            MyEnum: {
              type: 'string',
              enum: [
                '"',
                "'",
                '\\',
                '\r\n',
              ],
              'x-ms-enum': {
                name: 'MyEnum',
                values: [
                  { value: '\\"' },
                  { value: "'" },
                  { value: '\\\\' },
                  { value: '\\r\\n' },
                ],
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('escapes x-ms-enum values for python', () => {
    const transformer =
      new EscapeEnumValuesTransformer({ language: 'python' });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            MyEnum: {
              type: 'string',
              enum: [
                '"',
                "'",
                '\\',
                '\r\n',
              ],
              'x-ms-enum': {
                name: 'MyEnum',
                values: [
                  { value: '"' },
                  { value: "'" },
                  { value: '\\' },
                  { value: '\r\n' },
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
            MyEnum: {
              type: 'string',
              enum: [
                '"',
                "'",
                '\\',
                '\r\n',
              ],
              'x-ms-enum': {
                name: 'MyEnum',
                values: [
                  { value: '\\"' },
                  { value: "\\'" },
                  { value: '\\\\' },
                  { value: '\\r\\n' },
                ],
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('escapes x-ms-enum values for ruby', () => {
    const transformer =
      new EscapeEnumValuesTransformer({ language: 'ruby' });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        openapi: '3.0.3',
        info: {
          title: 'Title',
          version: '1.0',
        },
        components: {
          schemas: {
            MyEnum: {
              type: 'string',
              enum: [
                '"',
                "'",
                '\\',
                '\r\n',
              ],
              'x-ms-enum': {
                name: 'MyEnum',
                values: [
                  { value: '"' },
                  { value: "'" },
                  { value: '\\' },
                  { value: '\r\n' },
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
            MyEnum: {
              type: 'string',
              enum: [
                '"',
                "'",
                '\\',
                '\r\n',
              ],
              'x-ms-enum': {
                name: 'MyEnum',
                values: [
                  { value: '"' },
                  { value: "\\'" },
                  { value: '\\\\' },
                  { value: '\r\n' },
                ],
              },
            },
          },
        },
        paths: {},
      },
    );
  });

  it('escapes swagger parameter x-ms-enum values for csharp', () => {
    const transformer =
      new EscapeEnumValuesTransformer({ language: 'csharp' });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze({
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        parameters: {
          myparam: {
            type: 'string',
            enum: [
              '"',
              "'",
              '\\',
              '\r\n',
            ],
            'x-ms-enum': {
              name: 'MyEnum',
              values: [
                { value: '"' },
                { value: "'" },
                { value: '\\' },
                { value: '\r\n' },
              ],
            },
          },
        },
        paths: {},
      })),
      {
        swagger: '2.0',
        info: {
          title: 'Title',
          version: '1.0',
        },
        parameters: {
          myparam: {
            type: 'string',
            enum: [
              '"',
              "'",
              '\\',
              '\r\n',
            ],
            'x-ms-enum': {
              name: 'MyEnum',
              values: [
                { value: '\\"' },
                { value: "'" },
                { value: '\\\\' },
                { value: '\\r\\n' },
              ],
            },
          },
        },
        paths: {},
      },
    );
  });
});
