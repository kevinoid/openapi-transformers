/**
 * @copyright Copyright 2021, 2025 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import MergeAnyOfTransformer from '../merge-any-of.js';
import { schema3 } from '../test-lib/skeletons.js';

describe('MergeAnyOfTransformer', () => {
  it('does not modify non-Object schema', () => {
    assert.deepStrictEqual(
      new MergeAnyOfTransformer().transformOpenApi(deepFreeze(schema3(0))),
      schema3(0),
    );
  });

  it('does not modify non-Array', () => {
    assert.deepStrictEqual(
      new MergeAnyOfTransformer().transformOpenApi(deepFreeze(schema3({
        anyOf: 123,
      }))),
      schema3({
        anyOf: 123,
      }),
    );
  });

  // draft-bhutton-json-schema-00 specifies anyOf MUST be non-empty.
  // Removing it would change validation result (from all fail to all pass).
  // If removal is desired, use a transformer for this specific purpose.
  it('does not modify empty Array', () => {
    assert.deepStrictEqual(
      new MergeAnyOfTransformer().transformOpenApi(deepFreeze(schema3({
        anyOf: [],
      }))),
      schema3({
        anyOf: [],
      }),
    );
  });

  it('intersects single element with parent', () => {
    assert.deepStrictEqual(
      new MergeAnyOfTransformer().transformOpenApi(deepFreeze(schema3({
        maximum: 5,
        anyOf: [
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
      new MergeAnyOfTransformer().transformOpenApi(deepFreeze(schema3({
        maximum: 5,
        anyOf: [
          {
            minimum: 3,
            anyOf: [
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

  it('throws Error for multiple anyOf schemas', () => {
    assert.throws(
      () => new MergeAnyOfTransformer().transformOpenApi(deepFreeze(schema3({
        anyOf: [
          { minimum: 3 },
          { multipleOf: 2 },
        ],
      }))),
      /not (?:implemented|supported)/i,
    );
  });
});
