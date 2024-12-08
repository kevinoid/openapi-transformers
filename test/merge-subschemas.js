/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import MergeSubschemasTransformer from '../merge-subschemas.js';
import { schema3 } from '../test-lib/skeletons.js';

describe('MergeSubschemasTransformer', () => {
  describe('allOf', () => {
    // draft-bhutton-json-schema-00 specifies allOf MUST be non-empty.
    // If removal is desired, use a transformer for this specific purpose.
    it('does not modify empty Array', () => {
      assert.deepStrictEqual(
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze(schema3({
          allOf: [],
        }))),
        schema3({
          allOf: [],
        }),
      );
    });

    it('intersects single element with parent', () => {
      assert.deepStrictEqual(
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze(schema3({
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
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze(schema3({
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
  });

  describe('anyOf', () => {
    // draft-bhutton-json-schema-00 specifies anyOf MUST be non-empty.
    // If removal is desired, use a transformer for this specific purpose.
    it('does not modify empty Array', () => {
      assert.deepStrictEqual(
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze(schema3({
          anyOf: [],
        }))),
        schema3({
          anyOf: [],
        }),
      );
    });

    it('intersects single element with parent', () => {
      assert.deepStrictEqual(
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze(schema3({
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
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze(schema3({
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
  });

  describe('oneOf', () => {
    // draft-bhutton-json-schema-00 specifies oneOf MUST be non-empty.
    // If removal is desired, use a transformer for this specific purpose.
    it('does not modify empty Array', () => {
      assert.deepStrictEqual(
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze(schema3({
          oneOf: [],
        }))),
        schema3({
          oneOf: [],
        }),
      );
    });

    it('intersects single element with parent', () => {
      assert.deepStrictEqual(
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze(schema3({
          maximum: 5,
          oneOf: [
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
        new MergeSubschemasTransformer().transformOpenApi(deepFreeze(schema3({
          maximum: 5,
          oneOf: [
            {
              minimum: 3,
              oneOf: [
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
  });
});
