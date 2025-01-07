/**
 * @copyright Copyright 2021, 2025 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import MergeAllOfTransformer from '../merge-all-of.js';
import { schema3 } from '../test-lib/skeletons.js';

describe('MergeAllOfTransformer', () => {
  it('does not modify non-Object schema', () => {
    assert.deepStrictEqual(
      new MergeAllOfTransformer().transformOpenApi(deepFreeze(schema3(0))),
      schema3(0),
    );
  });

  it('does not modify non-Array', () => {
    assert.deepStrictEqual(
      new MergeAllOfTransformer().transformOpenApi(deepFreeze(schema3({
        allOf: 123,
      }))),
      schema3({
        allOf: 123,
      }),
    );
  });

  // draft-bhutton-json-schema-00 specifies allOf MUST be non-empty.
  // However, the removal shouldn't change the (trivially satisfied) result.
  it('removes empty Array', () => {
    assert.deepStrictEqual(
      new MergeAllOfTransformer().transformOpenApi(deepFreeze(schema3({
        allOf: [],
      }))),
      schema3({}),
    );
  });

  it('intersects single element with parent', () => {
    assert.deepStrictEqual(
      new MergeAllOfTransformer().transformOpenApi(deepFreeze(schema3({
        maximum: 5,
        allOf: [
          { minimum: 3 },
        ],
      }))),
      schema3({
        maximum: 5,
        minimum: 3,
      }),
    );
  });

  it('merges recursively', () => {
    assert.deepStrictEqual(
      new MergeAllOfTransformer().transformOpenApi(deepFreeze(schema3({
        maximum: 5,
        allOf: [
          {
            minimum: 3,
            allOf: [
              { multipleOf: 2 },
            ],
          },
        ],
      }))),
      schema3({
        maximum: 5,
        minimum: 3,
        multipleOf: 2,
      }),
    );
  });

  describe('with onlySingle', () => {
    it('intersects single element with parent', () => {
      assert.deepStrictEqual(
        new MergeAllOfTransformer({ onlySingle: true })
          .transformOpenApi(deepFreeze(schema3({
            maximum: 5,
            allOf: [
              { minimum: 3 },
            ],
          }))),
        schema3({
          maximum: 5,
          minimum: 3,
        }),
      );
    });

    it('does not modify multi-element allOf', () => {
      assert.deepStrictEqual(
        new MergeAllOfTransformer({ onlySingle: true })
          .transformOpenApi(deepFreeze(schema3({
            maximum: 5,
            allOf: [
              { minimum: 3 },
              { multipleOf: 2 },
            ],
          }))),
        schema3({
          maximum: 5,
          allOf: [
            { minimum: 3 },
            { multipleOf: 2 },
          ],
        }),
      );
    });
  });
});
