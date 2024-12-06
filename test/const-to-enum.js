/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import ConstToEnumTransformer from '../const-to-enum.js';
import { schema3 } from '../test-lib/skeletons.js';

describe('ConstToEnumTransformer', () => {
  it('const: 1 to enum: [1]', () => {
    assert.deepStrictEqual(
      new ConstToEnumTransformer().transformOpenApi(deepFreeze(schema3({
        const: 1,
      }, '3.1.0'))),
      schema3({
        enum: [1],
      }, '3.1.0'),
    );
  });

  it('const: null to enum: [null]', () => {
    assert.deepStrictEqual(
      new ConstToEnumTransformer().transformOpenApi(deepFreeze(schema3({
        const: null,
      }, '3.1.0'))),
      schema3({
        enum: [null],
      }, '3.1.0'),
    );
  });

  // Special case of above.  Enum already matches const.
  it('removes const with matching enum', () => {
    assert.deepStrictEqual(
      new ConstToEnumTransformer().transformOpenApi(deepFreeze(schema3({
        const: 1,
        enum: [1],
      }, '3.1.0'))),
      schema3({
        enum: [1],
      }, '3.1.0'),
    );
  });

  // since const value is only one which satisfies both constraints
  it('narrows matching enum to only const value', () => {
    assert.deepStrictEqual(
      new ConstToEnumTransformer().transformOpenApi(deepFreeze(schema3({
        const: 2,
        enum: [1, 2, 3],
      }, '3.1.0'))),
      schema3({
        enum: [2],
      }, '3.1.0'),
    );
  });

  // since const value is only one which satisfies both constraints
  it('narrows matching enum to only null const value', () => {
    assert.deepStrictEqual(
      new ConstToEnumTransformer().transformOpenApi(deepFreeze(schema3({
        const: null,
        enum: [1, null],
      }, '3.1.0'))),
      schema3({
        enum: [null],
      }, '3.1.0'),
    );
  });

  // no value can validate both const and enum
  // represent with empty enum for consistency with above
  it('returns empty enum for non-matching enum', () => {
    assert.deepStrictEqual(
      new ConstToEnumTransformer().transformOpenApi(deepFreeze(schema3({
        const: 2,
        enum: [1, 3],
      }, '3.1.0'))),
      schema3({
        enum: [],
      }, '3.1.0'),
    );
  });

  it('returns null schema unchanged', () => {
    assert.deepStrictEqual(
      new ConstToEnumTransformer().transformOpenApi(deepFreeze(
        schema3(null, '3.1.0'),
      )),
      schema3(null, '3.1.0'),
    );
  });
});
