/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import NullableToTypeNullTransformer from '../nullable-to-type-null.js';
import { schema2, schema3 } from '../test-lib/skeletons.js';

describe('NullableToTypeNullTransformer', () => {
  it('adds "null" to type: "number" with nullable: true', () => {
    assert.deepStrictEqual(
      new NullableToTypeNullTransformer().transformOpenApi(deepFreeze(schema3({
        type: 'number',
        nullable: true,
      }))),
      schema3({
        type: ['number', 'null'],
      }),
    );
  });

  it('adds "null" to type: ["number", "string"] with nullable: true', () => {
    assert.deepStrictEqual(
      new NullableToTypeNullTransformer().transformOpenApi(deepFreeze(schema3({
        type: ['number', 'string'],
        nullable: true,
      }))),
      schema3({
        type: ['number', 'string', 'null'],
      }),
    );
  });

  // type should be unique.  Don't duplicate 'null'.
  it('removes nullable: true from type: ["number", "null"]', () => {
    assert.deepStrictEqual(
      new NullableToTypeNullTransformer().transformOpenApi(deepFreeze(schema3({
        type: ['number', 'null'],
        nullable: true,
      }))),
      schema3({
        type: ['number', 'null'],
      }),
    );
  });

  // if type is unconstrained, null type is already accepted
  it('removes nullable: true without type', () => {
    assert.deepStrictEqual(
      new NullableToTypeNullTransformer().transformOpenApi(deepFreeze(schema3({
        nullable: true,
      }))),
      schema3({}),
    );
  });

  it('adds "null" to type: "number" with x-nullable: true', () => {
    assert.deepStrictEqual(
      new NullableToTypeNullTransformer().transformOpenApi(deepFreeze(schema2({
        type: 'number',
        'x-nullable': true,
      }))),
      schema2({
        type: ['number', 'null'],
      }),
    );
  });

  it('adds "null" to type: "number" with nullable and x-nullable: true', () => {
    assert.deepStrictEqual(
      new NullableToTypeNullTransformer().transformOpenApi(deepFreeze(schema3({
        type: 'number',
        nullable: true,
        'x-nullable': true,
      }))),
      schema3({
        type: ['number', 'null'],
      }),
    );
  });
});
