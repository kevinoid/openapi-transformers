/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import { schema3 } from '../test-lib/skeletons.js';
import TypeNullToEnumTransformer from '../type-null-to-enum.js';

describe('TypeNullToEnumTransformer', () => {
  it('type: \'null\' to enum: [null]', () => {
    assert.deepStrictEqual(
      new TypeNullToEnumTransformer().transformOpenApi(deepFreeze(schema3({
        type: 'null',
      }, '3.1.0'))),
      schema3({
        enum: [null],
      }, '3.1.0'),
    );
  });

  it('type: [\'null\'] to enum: [null]', () => {
    assert.deepStrictEqual(
      new TypeNullToEnumTransformer().transformOpenApi(deepFreeze(schema3({
        type: ['null'],
      }, '3.1.0'))),
      schema3({
        enum: [null],
      }, '3.1.0'),
    );
  });

  it('does not change mixed type', () => {
    assert.deepStrictEqual(
      new TypeNullToEnumTransformer().transformOpenApi(deepFreeze(schema3({
        type: ['null', 'number'],
      }, '3.1.0'))),
      schema3({
        type: ['null', 'number'],
      }, '3.1.0'),
    );
  });

  it('removes type: \'null\' with existing enum', () => {
    assert.deepStrictEqual(
      new TypeNullToEnumTransformer().transformOpenApi(deepFreeze(schema3({
        type: 'null',
        enum: [null],
      }, '3.1.0'))),
      schema3({
        enum: [null],
      }, '3.1.0'),
    );
  });
});
