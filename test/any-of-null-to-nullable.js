/**
 * @copyright Copyright 2025 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import AnyOfNullToNullableTransformer from '../any-of-null-to-nullable.js';
import { schema3 } from '../test-lib/skeletons.js';

describe('AnyOfNullToNullableTransformer', () => {
  it('preserves non-object schema', () => {
    assert.deepStrictEqual(
      new AnyOfNullToNullableTransformer().transformOpenApi(schema3(1)),
      schema3(1),
    );
  });

  it('preserves non-object anyOf', () => {
    assert.deepStrictEqual(
      new AnyOfNullToNullableTransformer().transformOpenApi(deepFreeze(schema3({
        anyOf: 1,
      }, '3.1.0'))),
      schema3({
        anyOf: 1,
      }, '3.1.0'),
    );
  });

  it('preserves empty anyOf', () => {
    assert.deepStrictEqual(
      new AnyOfNullToNullableTransformer().transformOpenApi(deepFreeze(schema3({
        anyOf: [],
      }, '3.1.0'))),
      schema3({
        anyOf: [],
      }, '3.1.0'),
    );
  });

  // Creating a schema with only nullable: true would accept anything,
  // instead of only null
  it('preserves anyOf with only `type: null`', () => {
    assert.deepStrictEqual(
      new AnyOfNullToNullableTransformer().transformOpenApi(deepFreeze(schema3({
        anyOf: [
          { type: 'null' },
        ],
      }, '3.1.0'))),
      schema3({
        anyOf: [
          { type: 'null' },
        ],
      }, '3.1.0'),
    );
  });

  it('adds `nullable: true`, removes `type: null` from anyOf', () => {
    assert.deepStrictEqual(
      new AnyOfNullToNullableTransformer().transformOpenApi(deepFreeze(schema3({
        anyOf: [
          { type: 'number' },
          { type: 'null' },
        ],
      }, '3.1.0'))),
      schema3({
        anyOf: [
          { type: 'number' },
        ],
        nullable: true,
      }, '3.1.0'),
    );
  });

  it('adds `nullable: true`, removes multiple `type: null` from anyOf', () => {
    assert.deepStrictEqual(
      new AnyOfNullToNullableTransformer().transformOpenApi(deepFreeze(schema3({
        anyOf: [
          { type: 'null' },
          { type: 'number' },
          { type: 'null' },
        ],
      }, '3.1.0'))),
      schema3({
        anyOf: [
          { type: 'number' },
        ],
        nullable: true,
      }, '3.1.0'),
    );
  });
});
