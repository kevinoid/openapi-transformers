/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import OpenApi31To30Transformer from '../openapi31to30.js';
import { schema3 } from '../test-lib/skeletons.js';

describe('OpenApi31To30Transformer', () => {
  it('converts schema with numeric exclusiveMaximum/exclusiveMinimum', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze(schema3({
        exclusiveMaximum: 24,
        exclusiveMinimum: 0,
      }, '3.1.0'))),
      schema3({
        exclusiveMaximum: true,
        maximum: 24,
        exclusiveMinimum: true,
        minimum: 0,
      }),
    );
  });

  it('converts schema with type: "null"', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze(schema3({
        type: 'null',
      }, '3.1.0'))),
      schema3({
        enum: [null],
      }),
    );
  });

  it('converts schema with const: null', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze(schema3({
        const: null,
      }, '3.1.0'))),
      schema3({
        enum: [null],
      }),
    );
  });

  it('converts schema with type: "null" and const: null', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze(schema3({
        type: 'null',
        const: null,
      }, '3.1.0'))),
      schema3({
        enum: [null],
      }),
    );
  });

  it('converts schema with type: ["number", "null"]', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze(schema3({
        type: ['number', 'null'],
      }, '3.1.0'))),
      schema3({
        type: 'number',
        nullable: true,
      }),
    );
  });

  it('converts schema with all non-null types', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze(schema3({
        type: [
          'array',
          'boolean',
          'number',
          'object',
          'string',
        ],
      }, '3.1.0'))),
      schema3({}),
    );
  });

  it('converts schema with all types', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze(schema3({
        type: [
          'array',
          'boolean',
          'integer',
          'null',
          'number',
          'object',
          'string',
        ],
      }, '3.1.0'))),
      schema3({
        nullable: true,
      }),
    );
  });

  it('converts schema with patternProperties', () => {
    assert.deepStrictEqual(
      new OpenApi31To30Transformer().transformOpenApi(deepFreeze(schema3({
        type: 'object',
        patternProperties: {
          'test.*': { type: 'string' },
        },
      }, '3.1.0'))),
      schema3({
        type: 'object',
        additionalProperties: { type: 'string' },
      }),
    );
  });
});
