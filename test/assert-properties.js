/**
 * @copyright Copyright 2025 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import AssertPropertiesTransformer from '../assert-properties.js';
import { schema3 } from '../test-lib/skeletons.js';

describe('AssertPropertiesTransformer', () => {
  describe('constructor', () => {
    it('throws TypeError without options', () => {
      assert.throws(
        () => new AssertPropertiesTransformer(),
        TypeError,
      );
    });

    it('throws TypeError without options.schema', () => {
      assert.throws(
        () => new AssertPropertiesTransformer({}),
        TypeError,
      );
    });
    it('throws TypeError without options.schema.excludes', () => {
      assert.throws(
        () => new AssertPropertiesTransformer({ schema: {} }),
        TypeError,
      );
    });

    it('throws TypeError for non-Array options.schema.excludes', () => {
      assert.throws(
        () => new AssertPropertiesTransformer({ schema: { excludes: {} } }),
        TypeError,
      );
    });

    it('throws TypeError for non-string options.schema.excludes item', () => {
      assert.throws(
        () => new AssertPropertiesTransformer({ schema: { excludes: [1] } }),
        TypeError,
      );
    });
  });

  it('does not throw Error for no props', () => {
    assert.deepStrictEqual(
      new AssertPropertiesTransformer({ schema: { excludes: [] } })
        .transformOpenApi(deepFreeze(schema3({}))),
      schema3({}),
    );
  });

  it('does not throw Error for no matching props', () => {
    assert.deepStrictEqual(
      new AssertPropertiesTransformer({ schema: { excludes: [] } })
        .transformOpenApi(deepFreeze(schema3({ type: 'string' }))),
      schema3({ type: 'string' }),
    );
  });

  it('throws Error for matching prop', () => {
    assert.throws(
      () => new AssertPropertiesTransformer({
        schema: {
          excludes: ['minimum'],
        },
      })
        .transformOpenApi(deepFreeze(schema3({ minimum: 1 }))),
      /minimum/,
    );
  });

  it('throws Error for matching nested prop', () => {
    assert.throws(
      () => new AssertPropertiesTransformer({
        schema: {
          excludes: ['minimum'],
        },
      })
        .transformOpenApi(deepFreeze(schema3({ allOf: [{ minimum: 1 }] }))),
      /minimum/,
    );
  });

  it('does not throw Error for inherited prop', () => {
    assert.deepStrictEqual(
      new AssertPropertiesTransformer({ schema: { excludes: ['prototype'] } })
        .transformOpenApi(deepFreeze(schema3({}))),
      schema3({}),
    );
  });

  it('does not throw Error for undefined prop', () => {
    assert.deepStrictEqual(
      new AssertPropertiesTransformer({ schema: { excludes: ['minimum'] } })
        .transformOpenApi(deepFreeze(schema3({ minimum: undefined }))),
      schema3({ minimum: undefined }),
    );
  });
});
