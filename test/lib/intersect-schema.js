/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';
import { isDeepStrictEqual } from 'node:util';

import deepFreeze from 'deep-freeze';

import intersectSchema, { EmptyIntersectionError, IntersectNotSupportedError }
  from '../../lib/intersect-schema.js';

function deepStrictEqualAnyOf(actual, expected) {
  if (!expected.some((e) => isDeepStrictEqual(actual, e))) {
    throw new assert.AssertionError({
      actual,
      // expected is used for diff.  Only include one.
      expected: expected[0],
      operator: 'deepStrictEqual',
      stackStartFn: deepStrictEqualAnyOf,
    });
  }
}

// eslint-disable-next-line no-shadow
function testIntersectSchema(intersectSchema) {
  it('throws TypeError if schema is undefined', () => {
    assert.throws(
      () => intersectSchema(undefined, {}),
      TypeError,
    );
  });

  it('unconstrained and unconstrained is unconstrained', () => {
    assert.deepStrictEqual(
      intersectSchema(
        deepFreeze({}),
        deepFreeze({}),
      ),
      {},
    );
  });

  it('false and anything is false', () => {
    assert.deepStrictEqual(
      intersectSchema(
        false,
        deepFreeze({ type: 'string' }),
      ),
      false,
    );
  });

  it('true and true is true', () => {
    assert.deepStrictEqual(
      intersectSchema(
        true,
        true,
      ),
      true,
    );
  });

  it('true and anything is anything', () => {
    assert.deepStrictEqual(
      intersectSchema(
        true,
        deepFreeze({ type: 'number' }),
      ),
      { type: 'number' },
    );
  });

  it('unspecified and unconstrained is unspecified', () => {
    assert.deepStrictEqual(
      intersectSchema(
        deepFreeze({ unspecified: 1 }),
        deepFreeze({}),
      ),
      { unspecified: 1 },
    );
  });

  it('unspecified === unspecified is unspecified', () => {
    assert.deepStrictEqual(
      intersectSchema(
        deepFreeze({ unspecified: 1 }),
        deepFreeze({ unspecified: 1 }),
      ),
      { unspecified: 1 },
    );
  });

  it('isDeepStrictEqual(unspecified, unspecified) is unspecified', () => {
    assert.deepStrictEqual(
      intersectSchema(
        deepFreeze({ unspecified: [1] }),
        deepFreeze({ unspecified: [1] }),
      ),
      { unspecified: [1] },
    );
  });

  it('unspecified !== unspecified throws IntersectNotSupportedError', () => {
    assert.throws(
      () => intersectSchema(
        deepFreeze({ unspecified: 1 }),
        deepFreeze({ unspecified: '1' }),
      ),
      IntersectNotSupportedError,
    );
  });

  // These tests should pass for any schema validation keyword.
  // Test once, since they share the same code.
  describe('for any keyword', () => {
    it('keyword and unconstrained is keyword', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ type: 'boolean' }),
          deepFreeze({}),
        ),
        { type: 'boolean' },
      );
    });

    it('undefined keyword is unconstrained', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ type: undefined }),
          deepFreeze({ type: 'boolean' }),
        ),
        { type: 'boolean' },
      );
    });

    it('keyword1 === keyword2 is keyword1/2', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ type: 'boolean' }),
          deepFreeze({ type: 'boolean' }),
        ),
        { type: 'boolean' },
      );
    });

    it('isDeepStrictEqual(keyword1, keyword2) is keyword1/2', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ type: ['boolean'] }),
          deepFreeze({ type: ['boolean'] }),
        ),
        { type: ['boolean'] },
      );
    });
  });

  describe('for properties', () => {
    it('combines non-overlapping properties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ properties: { b: { type: 'boolean' } } }),
          deepFreeze({ properties: { n: { type: 'number' } } }),
        ),
        {
          properties: {
            b: { type: 'boolean' },
            n: { type: 'number' },
          },
        },
      );
    });

    it('intersects same-name properties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ properties: { n: { maximum: 10 } } }),
          deepFreeze({ properties: { n: { minimum: 5 } } }),
        ),
        {
          properties: {
            n: {
              minimum: 5,
              maximum: 10,
            },
          },
        },
      );
    });

    it('handles schema without properties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({}),
          deepFreeze({ properties: { n: { type: 'number' } } }),
        ),
        {
          properties: {
            n: { type: 'number' },
          },
        },
      );
    });

    it('handles schema with empty properties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ properties: {} }),
          deepFreeze({ properties: { n: { type: 'number' } } }),
        ),
        {
          properties: {
            n: { type: 'number' },
          },
        },
      );
    });

    it('ignores undefined properties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ properties: { n: undefined } }),
          deepFreeze({ properties: { n: { type: 'number' } } }),
        ),
        {
          properties: {
            n: { type: 'number' },
          },
        },
      );
    });

    it('combines non-overlapping patternProperties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ patternProperties: { b: { type: 'boolean' } } }),
          deepFreeze({ patternProperties: { n: { type: 'number' } } }),
        ),
        {
          patternProperties: {
            b: { type: 'boolean' },
            n: { type: 'number' },
          },
        },
      );
    });

    it('intersects identical patternProperties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ patternProperties: { n: { maximum: 10 } } }),
          deepFreeze({ patternProperties: { n: { minimum: 5 } } }),
        ),
        {
          patternProperties: {
            n: {
              minimum: 5,
              maximum: 10,
            },
          },
        },
      );
    });

    it('handles schema without patternProperties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({}),
          deepFreeze({ patternProperties: { n: { type: 'number' } } }),
        ),
        {
          patternProperties: {
            n: { type: 'number' },
          },
        },
      );
    });

    it('handles schema with empty patternProperties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ patternProperties: {} }),
          deepFreeze({ patternProperties: { n: { type: 'number' } } }),
        ),
        {
          patternProperties: {
            n: { type: 'number' },
          },
        },
      );
    });

    it('intersects properties matching patternProperties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ properties: { n: { maximum: 10 } } }),
          deepFreeze({ patternProperties: { n: { minimum: 5 } } }),
        ),
        {
          properties: {
            n: {
              minimum: 5,
              maximum: 10,
            },
          },
          patternProperties: {
            n: { minimum: 5 },
          },
        },
      );
    });

    // Nope: Result must have `n: false` (or no n), since any non-false value
    // would validate {n:10} not allowed by schema2.
    it('intersects properties matching patternProperties: false', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ properties: { n: { maximum: 10 } } }),
          deepFreeze({ patternProperties: { n: false } }),
        ),
        {
          properties: {
            n: false,
          },
          patternProperties: {
            n: false,
          },
        },
      );
    });

    it('intersects properties not matching patternProperties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ properties: { n: { maximum: 10 } } }),
          deepFreeze({ patternProperties: { m: { minimum: 5 } } }),
        ),
        {
          properties: {
            n: { maximum: 10 },
          },
          patternProperties: {
            m: { minimum: 5 },
          },
        },
      );
    });

    // patternProperties from schema2 does not apply to n, since it is included
    // in properties.
    it('intersects properties skipping patternProperties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ properties: { n: { maximum: 10 } } }),
          deepFreeze({
            properties: { n: { multipleOf: 2 } },
            patternProperties: { n: { minimum: 5 } },
          }),
        ),
        {
          properties: {
            n: {
              maximum: 10,
              multipleOf: 2,
            },
          },
          patternProperties: {
            n: { minimum: 5 },
          },
        },
      );
    });

    it('intersects properties matching multiple patternProperties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ properties: { n1: { maximum: 10 } } }),
          deepFreeze({
            patternProperties: {
              n: { minimum: 5 },
              1: { multipleOf: 2 },
            },
          }),
        ),
        {
          properties: {
            n1: {
              minimum: 5,
              maximum: 10,
              multipleOf: 2,
            },
          },
          patternProperties: {
            n: { minimum: 5 },
            1: { multipleOf: 2 },
          },
        },
      );
    });

    it('intersects additionalProperties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ additionalProperties: { maximum: 10 } }),
          deepFreeze({ additionalProperties: { minimum: 5 } }),
        ),
        {
          additionalProperties: {
            minimum: 5,
            maximum: 10,
          },
        },
      );
    });

    it('intersects additionalProperties: true', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ additionalProperties: true }),
          deepFreeze({ additionalProperties: true }),
        ),
        {
          additionalProperties: true,
        },
      );
    });

    it('intersects additionalProperties: false', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ additionalProperties: false }),
          deepFreeze({ additionalProperties: false }),
        ),
        {
          additionalProperties: false,
        },
      );
    });

    it('intersects additionalProperties: true/false', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ additionalProperties: true }),
          deepFreeze({ additionalProperties: false }),
        ),
        {
          additionalProperties: false,
        },
      );
    });

    it('intersects properties matching additionalProperties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ properties: { n: { maximum: 10 } } }),
          deepFreeze({ additionalProperties: { minimum: 5 } }),
        ),
        {
          properties: {
            n: {
              minimum: 5,
              maximum: 10,
            },
          },
          additionalProperties: { minimum: 5 },
        },
      );
    });

    // Nope: Result must have `n: false` (or no n), since any non-false value
    // would validate {n:10} not allowed by schema2.
    it('intersects properties matching additionalProperties: false', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ properties: { n: { maximum: 10 } } }),
          deepFreeze({ additionalProperties: false }),
        ),
        {
          properties: {
            n: false,
          },
          additionalProperties: false,
        },
      );
    });

    // additionalProperties from schema2 does not apply to n, since it is
    // included in properties.
    it('intersects properties skipping additionalProperties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ properties: { n: { maximum: 10 } } }),
          deepFreeze({
            properties: { n: { multipleOf: 2 } },
            additionalProperties: { minimum: 5 },
          }),
        ),
        {
          properties: {
            n: {
              maximum: 10,
              multipleOf: 2,
            },
          },
          additionalProperties: { minimum: 5 },
        },
      );
    });

    it('intersects properties no additionalProperties due to pattern', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ properties: { n1: { maximum: 10 } } }),
          deepFreeze({
            patternProperties: { n: { multipleOf: 2 } },
            additionalProperties: { minimum: 5 },
          }),
        ),
        {
          properties: {
            n1: {
              maximum: 10,
              multipleOf: 2,
            },
          },
          patternProperties: { n: { multipleOf: 2 } },
          additionalProperties: { minimum: 5 },
        },
      );
    });

    it('intersects patternProperties with additionalProperties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ patternProperties: { n: { maximum: 10 } } }),
          deepFreeze({ additionalProperties: { minimum: 5 } }),
        ),
        {
          patternProperties: {
            n: {
              maximum: 10,
              minimum: 5,
            },
          },
          additionalProperties: { minimum: 5 },
        },
      );
    });

    it('throws TypeError for non-object first properties', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ properties: true }),
            deepFreeze({ properties: {} }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-object second properties', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ properties: {} }),
            deepFreeze({ properties: true }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-object first patternProperties', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ patternProperties: true }),
            deepFreeze({ patternProperties: {} }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-object second patternProperties', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ patternProperties: {} }),
            deepFreeze({ patternProperties: true }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-object first additionalProperties', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ additionalProperties: 1 }),
            deepFreeze({ additionalProperties: {} }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-object second additionalProperties', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ additionalProperties: {} }),
            deepFreeze({ additionalProperties: 1 }),
          );
        },
        TypeError,
      );
    });
  });

  describe('for allOf', () => {
    it('concatenates', () => {
      deepStrictEqualAnyOf(
        intersectSchema(
          deepFreeze({ allOf: [{ maximum: 10 }] }),
          deepFreeze({ allOf: [{ minimum: 5 }] }),
        ),
        [
          {
            allOf: [
              { maximum: 10 },
              { minimum: 5 },
            ],
          },
          {
            allOf: [
              { minimum: 5 },
              { maximum: 10 },
            ],
          },
        ],
      );
    });

    it('removes duplicates', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ allOf: [{ maximum: 10 }] }),
          deepFreeze({ allOf: [{ maximum: 10 }] }),
        ),
        {
          allOf: [
            { maximum: 10 },
          ],
        },
      );
    });

    it('throws TypeError for non-Array first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ allOf: true }),
            deepFreeze({ allOf: [{ maximum: 10 }] }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-Array second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ allOf: [{ maximum: 10 }] }),
            deepFreeze({ allOf: true }),
          );
        },
        TypeError,
      );
    });
  });

  describe('for anyOf', () => {
    it('one is subset of other', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ anyOf: [{ maximum: 10 }] }),
          deepFreeze({ anyOf: [{ minimum: 12 }, { maximum: 10 }] }),
        ),
        { anyOf: [{ maximum: 10 }] },
      );
    });

    it('intersects each if one is single element', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ anyOf: [{ multipleOf: 1 }] }),
          deepFreeze({ anyOf: [{ minimum: 12 }, { maximum: 10 }] }),
        ),
        {
          anyOf: [
            { minimum: 12, multipleOf: 1 },
            { maximum: 10, multipleOf: 1 },
          ],
        },
      );
    });

    it('throws IntersectNotSupportedError if neither subset nor single', () => {
      assert.throws(
        () => intersectSchema(
          deepFreeze({ anyOf: [{ minimum: 12 }, { maximum: 10 }] }),
          deepFreeze({ anyOf: [{ multipleOf: 1 }, { const: 3.14 }] }),
        ),
        IntersectNotSupportedError,
      );
    });

    it('throws TypeError for non-Array first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ anyOf: true }),
            deepFreeze({ anyOf: [{ maximum: 10 }] }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-Array second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ anyOf: [{ maximum: 10 }] }),
            deepFreeze({ anyOf: true }),
          );
        },
        TypeError,
      );
    });
  });

  describe('for const', () => {
    // Note: equal const is handled by generic keyword handling test above

    it('throws EmptyIntersectionError if not equal', () => {
      assert.throws(
        () => intersectSchema(
          deepFreeze({ const: 1 }),
          deepFreeze({ const: '1' }),
        ),
        EmptyIntersectionError,
      );
    });
  });

  describe('for dependentRequired', () => {
    it('returns empty if both empty', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ dependentRequired: {} }),
          deepFreeze({ dependentRequired: {} }),
        ),
        { dependentRequired: {} },
      );
    });

    it('returns non-empty if other empty', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({
            dependentRequired: {
              a: ['b'],
            },
          }),
          deepFreeze({ dependentRequired: {} }),
        ),
        {
          dependentRequired: {
            a: ['b'],
          },
        },
      );
    });

    it('returns non-overlapping properties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({
            dependentRequired: {
              a: ['b'],
            },
          }),
          deepFreeze({
            dependentRequired: {
              c: ['d'],
            },
          }),
        ),
        {
          dependentRequired: {
            a: ['b'],
            c: ['d'],
          },
        },
      );
    });

    it('returns union of overlapping properties', () => {
      deepStrictEqualAnyOf(
        intersectSchema(
          deepFreeze({
            dependentRequired: {
              a: ['b'],
            },
          }),
          deepFreeze({
            dependentRequired: {
              a: ['d'],
            },
          }),
        ),
        [
          {
            dependentRequired: {
              a: ['b', 'd'],
            },
          },
          {
            dependentRequired: {
              a: ['d', 'b'],
            },
          },
        ],
      );
    });

    it('returns unique union of overlapping properties', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({
            dependentRequired: {
              a: ['b'],
            },
          }),
          deepFreeze({
            dependentRequired: {
              a: ['b', 'd'],
            },
          }),
        ),
        {
          dependentRequired: {
            a: ['b', 'd'],
          },
        },
      );
    });

    it('throws TypeError for non-object first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ dependentRequired: true }),
            deepFreeze({ dependentRequired: {} }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-object second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ dependentRequired: {} }),
            deepFreeze({ dependentRequired: true }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-Array first property', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ dependentRequired: { a: true } }),
            deepFreeze({ dependentRequired: { a: [] } }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-Array second property', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ dependentRequired: { a: [] } }),
            deepFreeze({ dependentRequired: { a: true } }),
          );
        },
        TypeError,
      );
    });
  });

  describe('for deprecated', () => {
    it('not deprecated if one is not deprecated', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ deprecated: true }),
          deepFreeze({}),
        ),
        {},
      );
    });

    it('not deprecated if one is false', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ deprecated: true }),
          deepFreeze({ deprecated: false }),
        ),
        {},
      );
    });

    it('returns true if both true', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ deprecated: true }),
          deepFreeze({ deprecated: true }),
        ),
        { deprecated: true },
      );
    });
  });

  describe('for description', () => {
    it('is combination of both descriptions', () => {
      deepStrictEqualAnyOf(
        intersectSchema(
          deepFreeze({ description: 'description1' }),
          deepFreeze({ description: 'description2' }),
        ),
        [
          { description: 'Intersection of description1 and description2' },
          { description: 'Intersection of description2 and description1' },
        ],
      );
    });

    it('is surrounds spaced description with with parens', () => {
      deepStrictEqualAnyOf(
        intersectSchema(
          deepFreeze({ description: 'My description1' }),
          deepFreeze({ description: 'My_description2' }),
        ),
        [
          {
            description:
              'Intersection of (My description1) and My_description2',
          },
          {
            description:
              'Intersection of My_description2 and (My description1)',
          },
        ],
      );
    });
  });

  describe('for enum', () => {
    it('intersects permuted values', () => {
      deepStrictEqualAnyOf(
        intersectSchema(
          deepFreeze({ enum: [1, '1', 2] }),
          deepFreeze({ enum: [2, 1, '1'] }),
        ),
        [
          { enum: [1, '1', 2] },
          { enum: [2, 1, '1'] },
        ],
      );
    });

    it('common subset of first and second', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ enum: [1, 2, 3] }),
          deepFreeze({ enum: [0, 1, 2] }),
        ),
        { enum: [1, 2] },
      );
    });

    it('treats null like any other value', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ enum: [1, 2, 3, null] }),
          deepFreeze({ enum: [0, 1, 2, null] }),
        ),
        { enum: [1, 2, null] },
      );
    });

    it('throws EmptyIntersectionError if none in common', () => {
      assert.throws(
        () => intersectSchema(
          deepFreeze({ enum: [2, 3] }),
          deepFreeze({ enum: [0, 1] }),
        ),
        EmptyIntersectionError,
      );
    });

    // TODO: Support this
    it('throws IntersectNotSupportedError if one has an object', () => {
      assert.throws(
        () => intersectSchema(
          deepFreeze({ enum: [2, {}] }),
          deepFreeze({ enum: [0, 1] }),
        ),
        IntersectNotSupportedError,
      );
    });

    it('throws TypeError for non-Array first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ enum: true }),
            deepFreeze({ enum: [0, 1] }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-Array second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ enum: [0, 1] }),
            deepFreeze({ enum: true }),
          );
        },
        TypeError,
      );
    });
  });

  describe('for examples', () => {
    it('concatenates', () => {
      deepStrictEqualAnyOf(
        intersectSchema(
          deepFreeze({ examples: [10] }),
          deepFreeze({ examples: [5] }),
        ),
        [
          { examples: [10, 5] },
          { examples: [5, 10] },
        ],
      );
    });

    it('removes duplicates', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ examples: [10] }),
          deepFreeze({ examples: [10] }),
        ),
        {
          examples: [10],
        },
      );
    });

    it('throws TypeError for non-Array first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ examples: true }),
            deepFreeze({ examples: [10] }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-Array second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ examples: [10] }),
            deepFreeze({ examples: true }),
          );
        },
        TypeError,
      );
    });
  });

  // eslint-disable-next-line no-shadow
  function boolExclusiveMax(intersectSchema) {
    it('returns smaller with exclusive true', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ maximum: 3 }),
          deepFreeze({ exclusiveMaximum: true, maximum: 2 }),
        ),
        { exclusiveMaximum: true, maximum: 2 },
      );
    });

    it('returns smaller without exclusive true', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ exclusiveMaximum: true, maximum: 3 }),
          deepFreeze({ maximum: 2 }),
        ),
        { maximum: 2 },
      );
    });

    it('returns more negative with exclusive true', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ exclusiveMaximum: true, maximum: -3 }),
          deepFreeze({ maximum: -2 }),
        ),
        { exclusiveMaximum: true, maximum: -3 },
      );
    });

    it('throws TypeError for non-number first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ maximum: true }),
            deepFreeze({ maximum: 1 }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-number second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ maximum: 1 }),
            deepFreeze({ maximum: true }),
          );
        },
        TypeError,
      );
    });
  }

  describe('for exclusiveMaximum', () => {
    it('returns smaller', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ exclusiveMaximum: 3 }),
          deepFreeze({ exclusiveMaximum: 2 }),
        ),
        { exclusiveMaximum: 2 },
      );
    });

    it('returns more negative', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ exclusiveMaximum: -3 }),
          deepFreeze({ exclusiveMaximum: -2 }),
        ),
        { exclusiveMaximum: -3 },
      );
    });

    it('returns smaller exclusiveMaximum', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ maximum: 3 }),
          deepFreeze({ exclusiveMaximum: 2 }),
        ),
        { exclusiveMaximum: 2 },
      );
    });

    it('returns smaller maximum', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ exclusiveMaximum: 3 }),
          deepFreeze({ maximum: 2 }),
        ),
        { maximum: 2 },
      );
    });

    it('throws TypeError for non-number first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ exclusiveMaximum: 'test' }),
            deepFreeze({ exclusiveMaximum: 1 }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-number second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ exclusiveMaximum: 1 }),
            deepFreeze({ exclusiveMaximum: 'test' }),
          );
        },
        TypeError,
      );
    });

    boolExclusiveMax(intersectSchema);

    // exclusiveMaximum:false should behave the same as undefined
    // Run same tests with false in place of undefined
    function intersectSchemaFalse(schema1, schema2) {
      if (schema1.exclusiveMaximum === undefined) {
        schema1 = { ...schema1, exclusiveMaximum: false };
      }
      if (schema2.exclusiveMaximum === undefined) {
        schema2 = { ...schema2, exclusiveMaximum: false };
      }
      return intersectSchema(schema1, schema2);
    }
    boolExclusiveMax(intersectSchemaFalse);
  });

  // eslint-disable-next-line no-shadow
  function boolExclusiveMin(intersectSchema) {
    it('returns larger with exclusive true', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ minimum: 2 }),
          deepFreeze({ exclusiveMinimum: true, minimum: 3 }),
        ),
        { exclusiveMinimum: true, minimum: 3 },
      );
    });

    it('returns larger without exclusive true', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ exclusiveMinimum: true, minimum: 2 }),
          deepFreeze({ minimum: 3 }),
        ),
        { minimum: 3 },
      );
    });

    it('returns less negative with exclusive true', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ exclusiveMinimum: true, minimum: -2 }),
          deepFreeze({ minimum: -3 }),
        ),
        { exclusiveMinimum: true, minimum: -2 },
      );
    });

    it('throws TypeError for non-number first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ minimum: true }),
            deepFreeze({ minimum: 1 }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-number second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ minimum: 1 }),
            deepFreeze({ minimum: true }),
          );
        },
        TypeError,
      );
    });
  }

  describe('for exclusiveMinimum', () => {
    it('returns larger', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ exclusiveMinimum: 3 }),
          deepFreeze({ exclusiveMinimum: 2 }),
        ),
        { exclusiveMinimum: 3 },
      );
    });

    it('returns less negative', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ exclusiveMinimum: -3 }),
          deepFreeze({ exclusiveMinimum: -2 }),
        ),
        { exclusiveMinimum: -2 },
      );
    });

    it('returns larger exclusiveMinimum', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ minimum: 2 }),
          deepFreeze({ exclusiveMinimum: 3 }),
        ),
        { exclusiveMinimum: 3 },
      );
    });

    it('returns larger minimum', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ exclusiveMinimum: 2 }),
          deepFreeze({ minimum: 3 }),
        ),
        { minimum: 3 },
      );
    });

    it('throws TypeError for non-number first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ exclusiveMinimum: 'test' }),
            deepFreeze({ exclusiveMinimum: 1 }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-number second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ exclusiveMinimum: 1 }),
            deepFreeze({ exclusiveMinimum: 'test' }),
          );
        },
        TypeError,
      );
    });

    boolExclusiveMin(intersectSchema);

    // exclusiveMinimum:false should behave the same as undefined
    // Run same tests with false in place of undefined
    function intersectSchemaFalse(schema1, schema2) {
      if (schema1.exclusiveMinimum === undefined) {
        schema1 = { ...schema1, exclusiveMinimum: false };
      }
      if (schema2.exclusiveMinimum === undefined) {
        schema2 = { ...schema2, exclusiveMinimum: false };
      }
      return intersectSchema(schema1, schema2);
    }
    boolExclusiveMin(intersectSchemaFalse);
  });

  describe('for maxItems', () => {
    it('returns smaller', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ maxItems: 3 }),
          deepFreeze({ maxItems: 2 }),
        ),
        { maxItems: 2 },
      );
    });
  });

  describe('for maxLength', () => {
    it('returns smaller', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ maxLength: 3 }),
          deepFreeze({ maxLength: 2 }),
        ),
        { maxLength: 2 },
      );
    });
  });

  describe('for maxProperties', () => {
    it('returns smaller', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ maxProperties: 3 }),
          deepFreeze({ maxProperties: 2 }),
        ),
        { maxProperties: 2 },
      );
    });
  });

  describe('for maximum', () => {
    it('returns smaller', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ maximum: 3 }),
          deepFreeze({ maximum: 2 }),
        ),
        { maximum: 2 },
      );
    });

    it('returns more negative', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ maximum: -3 }),
          deepFreeze({ maximum: -2 }),
        ),
        { maximum: -3 },
      );
    });
  });

  describe('for minItems', () => {
    it('returns larger', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ minItems: 3 }),
          deepFreeze({ minItems: 2 }),
        ),
        { minItems: 3 },
      );
    });
  });

  describe('for minLength', () => {
    it('returns larger', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ minLength: 3 }),
          deepFreeze({ minLength: 2 }),
        ),
        { minLength: 3 },
      );
    });
  });

  describe('for minProperties', () => {
    it('returns larger', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ minProperties: 3 }),
          deepFreeze({ minProperties: 2 }),
        ),
        { minProperties: 3 },
      );
    });
  });

  describe('for minimum', () => {
    it('returns larger', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ minimum: 3 }),
          deepFreeze({ minimum: 2 }),
        ),
        { minimum: 3 },
      );
    });

    it('returns less negative', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ minimum: -3 }),
          deepFreeze({ minimum: -2 }),
        ),
        { minimum: -2 },
      );
    });
  });

  describe('for multipleOf', () => {
    it('returns one if multiple of other (integer)', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ multipleOf: 4 }),
          deepFreeze({ multipleOf: 2 }),
        ),
        { multipleOf: 4 },
      );
    });

    it('returns one if multiple of other (float)', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ multipleOf: 1 }),
          deepFreeze({ multipleOf: 0.5 }),
        ),
        { multipleOf: 1 },
      );
    });

    it('otherwise returns multiple of first and second', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ multipleOf: 2 }),
          deepFreeze({ multipleOf: 3 }),
        ),
        { multipleOf: 6 },
      );
    });

    it('throws TypeError for non-number first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ multipleOf: true }),
            deepFreeze({ multipleOf: 1 }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-number second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ multipleOf: 1 }),
            deepFreeze({ multipleOf: true }),
          );
        },
        TypeError,
      );
    });
  });

  describe('for required', () => {
    it('returns empty if both empty', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ required: [] }),
          deepFreeze({ required: [] }),
        ),
        { required: [] },
      );
    });

    it('returns non-empty if other empty', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ required: ['a'] }),
          deepFreeze({ required: [] }),
        ),
        { required: ['a'] },
      );
    });

    it('returns union with no intersection', () => {
      deepStrictEqualAnyOf(
        intersectSchema(
          deepFreeze({ required: ['a'] }),
          deepFreeze({ required: ['b'] }),
        ),
        [
          { required: ['a', 'b'] },
          { required: ['b', 'a'] },
        ],
      );
    });

    it('returns either if permuted', () => {
      deepStrictEqualAnyOf(
        intersectSchema(
          deepFreeze({ required: ['a', 'b'] }),
          deepFreeze({ required: ['b', 'a'] }),
        ),
        [
          { required: ['a', 'b'] },
          { required: ['b', 'a'] },
        ],
      );
    });

    it('throws TypeError for non-Array first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ required: true }),
            deepFreeze({ required: ['a', 'b'] }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-Array second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ required: ['a', 'b'] }),
            deepFreeze({ required: true }),
          );
        },
        TypeError,
      );
    });
  });

  describe('for oneOf', () => {
    it('one is permuted other', () => {
      deepStrictEqualAnyOf(
        intersectSchema(
          deepFreeze({ oneOf: [{ maximum: 10 }, { minimum: 12 }] }),
          deepFreeze({ oneOf: [{ minimum: 12 }, { maximum: 10 }] }),
        ),
        [
          { oneOf: [{ maximum: 10 }, { minimum: 12 }] },
          { oneOf: [{ minimum: 12 }, { maximum: 10 }] },
        ],
      );
    });

    it('intersects each if one is single element', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ oneOf: [{ multipleOf: 1 }] }),
          deepFreeze({ oneOf: [{ minimum: 12 }, { maximum: 10 }] }),
        ),
        {
          oneOf: [
            { minimum: 12, multipleOf: 1 },
            { maximum: 10, multipleOf: 1 },
          ],
        },
      );
    });

    it('throws IntersectNotSupportedError if not permuted nor single', () => {
      assert.throws(
        () => intersectSchema(
          deepFreeze({ oneOf: [{ minimum: 12 }, { maximum: 10 }] }),
          deepFreeze({ oneOf: [{ multipleOf: 1 }, { const: 3.14 }] }),
        ),
        IntersectNotSupportedError,
      );
    });

    it('throws TypeError for non-Array first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ oneOf: true }),
            deepFreeze({ oneOf: [{ maximum: 10 }] }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-Array second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ oneOf: [{ maximum: 10 }] }),
            deepFreeze({ oneOf: true }),
          );
        },
        TypeError,
      );
    });
  });

  describe('for propertyNames', () => {
    it('intersects', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ propertyNames: { maxLength: 10 } }),
          deepFreeze({ propertyNames: { minLength: 5 } }),
        ),
        {
          propertyNames: {
            minLength: 5,
            maxLength: 10,
          },
        },
      );
    });
  });

  describe('for pattern', () => {
    it('returns anchored lookahead assertion for each pattern', () => {
      deepStrictEqualAnyOf(
        intersectSchema(
          deepFreeze({ pattern: 'hi' }),
          deepFreeze({ pattern: 'ho' }),
        ),
        [
          { pattern: '^(?=.*hi)(?=.*ho)' },
          { pattern: '^(?=.*ho)(?=.*hi)' },
        ],
      );
    });

    it('skips .* for anchored patterns', () => {
      deepStrictEqualAnyOf(
        intersectSchema(
          deepFreeze({ pattern: '^hi' }),
          deepFreeze({ pattern: '^ho' }),
        ),
        [
          { pattern: '^(?=^hi)(?=^ho)' },
          { pattern: '^(?=^ho)(?=^hi)' },
        ],
      );
    });

    it('throws TypeError for non-string first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ pattern: true }),
            deepFreeze({ pattern: 'hi' }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-string second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ pattern: 'hi' }),
            deepFreeze({ pattern: true }),
          );
        },
        TypeError,
      );
    });
  });

  describe('for readOnly', () => {
    it('returns true if either true', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ readOnly: true }),
          deepFreeze({ readOnly: false }),
        ),
        { readOnly: true },
      );
    });

    it('throws TypeError for non-boolean first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ readOnly: 'hi' }),
            deepFreeze({ readOnly: true }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-boolean second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ readOnly: true }),
            deepFreeze({ readOnly: 'hi' }),
          );
        },
        TypeError,
      );
    });
  });

  describe('for title', () => {
    it('is combination of both titles', () => {
      deepStrictEqualAnyOf(
        intersectSchema(
          deepFreeze({ title: 'title1' }),
          deepFreeze({ title: 'title2' }),
        ),
        [
          { title: 'Intersection of title1 and title2' },
          { title: 'Intersection of title2 and title1' },
        ],
      );
    });

    it('is surrounds spaced title with with parens', () => {
      deepStrictEqualAnyOf(
        intersectSchema(
          deepFreeze({ title: 'My title1' }),
          deepFreeze({ title: 'My_title2' }),
        ),
        [
          { title: 'Intersection of (My title1) and My_title2' },
          { title: 'Intersection of My_title2 and (My title1)' },
        ],
      );
    });
  });

  describe('for type', () => {
    it('type1 intersect type2 is type1 when same', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ type: 'number' }),
          deepFreeze({ type: 'number' }),
        ),
        { type: 'number' },
      );
    });

    it('type1 intersect unconstrained is type1', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ type: 'number' }),
          deepFreeze({}),
        ),
        { type: 'number' },
      );
    });

    it('type2 intersect unconstrained is type2', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({}),
          deepFreeze({ type: 'number' }),
        ),
        { type: 'number' },
      );
    });

    it('type1 !== type2 throws EmptyIntersectionError', () => {
      assert.throws(
        () => intersectSchema(
          deepFreeze({ type: 'boolean' }),
          deepFreeze({ type: 'number' }),
        ),
        EmptyIntersectionError,
      );
    });

    it('type1 intersect type2 empty EmptyIntersectionError', () => {
      assert.throws(
        () => intersectSchema(
          deepFreeze({ type: ['boolean'] }),
          deepFreeze({ type: ['number'] }),
        ),
        EmptyIntersectionError,
      );
    });

    it('integer intersect number is integer', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ type: 'integer' }),
          deepFreeze({ type: 'number' }),
        ),
        { type: 'integer' },
      );
    });

    it('permuted array types intersect', () => {
      deepStrictEqualAnyOf(
        intersectSchema(
          deepFreeze({ type: ['boolean', 'number'] }),
          deepFreeze({ type: ['number', 'boolean'] }),
        ),
        [
          { type: ['boolean', 'number'] },
          { type: ['number', 'boolean'] },
        ],
      );
    });

    it('type1 subset type2 intersect', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ type: ['boolean', 'string'] }),
          deepFreeze({ type: ['boolean', 'number', 'string'] }),
        ),
        { type: ['boolean', 'string'] },
      );
    });

    it('type2 subset type1 intersect to single element', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ type: ['boolean', 'number', 'string'] }),
          deepFreeze({ type: ['null', 'string'] }),
        ),
        { type: 'string' },
      );
    });
  });

  describe('for uniqueItems', () => {
    it('returns true if either true', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ uniqueItems: true }),
          deepFreeze({ uniqueItems: false }),
        ),
        { uniqueItems: true },
      );
    });

    it('throws TypeError for non-boolean first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ uniqueItems: 'hi' }),
            deepFreeze({ uniqueItems: true }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-boolean second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ uniqueItems: true }),
            deepFreeze({ uniqueItems: 'hi' }),
          );
        },
        TypeError,
      );
    });
  });

  describe('for writeOnly', () => {
    it('returns true if either true', () => {
      assert.deepStrictEqual(
        intersectSchema(
          deepFreeze({ writeOnly: true }),
          deepFreeze({ writeOnly: false }),
        ),
        { writeOnly: true },
      );
    });

    it('throws TypeError for non-boolean first', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ writeOnly: 'hi' }),
            deepFreeze({ writeOnly: true }),
          );
        },
        TypeError,
      );
    });

    it('throws TypeError for non-boolean second', () => {
      assert.throws(
        () => {
          intersectSchema(
            deepFreeze({ writeOnly: true }),
            deepFreeze({ writeOnly: 'hi' }),
          );
        },
        TypeError,
      );
    });
  });
}

describe('intersectSchema', () => testIntersectSchema(intersectSchema));

// intersectSchema should be symmetric.  Test with args swapped.
function intersectSchemaSwapped(schema1, schema2) {
  return intersectSchema(schema2, schema1);
}
describe(
  'intersectSchema (swapped)',
  () => testIntersectSchema(intersectSchemaSwapped),
);
