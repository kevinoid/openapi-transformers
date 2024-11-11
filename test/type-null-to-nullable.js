/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import { schema3 } from '../test-lib/skeletons.js';
import TypeNullToNullableTransformer from '../type-null-to-nullable.js';

describe('TypeNullToNullableTransformer', () => {
  it('adds `nullable: true`, removes "null" from 2-type', () => {
    assert.deepStrictEqual(
      new TypeNullToNullableTransformer().transformOpenApi(deepFreeze(schema3({
        type: ['null', 'number'],
      }, '3.1.0'))),
      schema3({
        type: 'number',
        nullable: true,
      }, '3.1.0'),
    );
  });

  it('adds `nullable: true`, removes "null" from 3-type', () => {
    assert.deepStrictEqual(
      new TypeNullToNullableTransformer().transformOpenApi(deepFreeze(schema3({
        type: ['number', 'null', 'string'],
      }, '3.1.0'))),
      schema3({
        type: ['number', 'string'],
        nullable: true,
      }, '3.1.0'),
    );
  });

  it('removes "null" on schema with `nullable: true`', () => {
    assert.deepStrictEqual(
      new TypeNullToNullableTransformer().transformOpenApi(deepFreeze(schema3({
        type: ['null', 'number'],
        nullable: true,
      }, '3.1.0'))),
      schema3({
        type: 'number',
        nullable: true,
      }, '3.1.0'),
    );
  });

  it('does not change schema without "null" type', () => {
    assert.deepStrictEqual(
      new TypeNullToNullableTransformer().transformOpenApi(deepFreeze(schema3({
        type: ['number', 'string'],
      }, '3.1.0'))),
      schema3({
        type: ['number', 'string'],
      }, '3.1.0'),
    );
  });

  // Removing `type: 'null'` would allow any type instead of only null.
  // `type: 'null'` is handled by type-null-to-enum.js
  it('does not change schema with type: \'null\'', () => {
    assert.deepStrictEqual(
      new TypeNullToNullableTransformer().transformOpenApi(deepFreeze(schema3({
        type: 'null',
      }, '3.1.0'))),
      schema3({
        type: 'null',
      }, '3.1.0'),
    );
  });

  // Removing `type: ['null']` would allow any type instead of only null.
  // `type: ['null']` is handled by type-null-to-enum.js
  it('does not change schema with type: [\'null\']', () => {
    assert.deepStrictEqual(
      new TypeNullToNullableTransformer().transformOpenApi(deepFreeze(schema3({
        type: ['null'],
      }, '3.1.0'))),
      schema3({
        type: ['null'],
      }, '3.1.0'),
    );
  });
});
