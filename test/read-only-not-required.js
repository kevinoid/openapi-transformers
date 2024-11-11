/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import ReadOnlyNotRequiredTransformer from '../read-only-not-required.js';
import { schema3 } from '../test-lib/skeletons.js';

describe('ReadOnlyNotRequiredTransformer', () => {
  it('throws TypeError with null options', () => {
    assert.throws(
      () => new ReadOnlyNotRequiredTransformer(null),
      TypeError,
    );
  });

  it('throws TypeError with number options.removeValidation', () => {
    assert.throws(
      () => new ReadOnlyNotRequiredTransformer({ removeValidation: 1 }),
      TypeError,
    );
  });

  it('throws TypeError with number options.setNonNullable', () => {
    assert.throws(
      () => new ReadOnlyNotRequiredTransformer({ setNonNullable: 1 }),
      TypeError,
    );
  });

  it('make readOnly properties not-required', () => {
    const transformer = new ReadOnlyNotRequiredTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            readOnly: true,
          },
        },
        required: ['name'],
      }))),
      schema3({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            readOnly: true,
          },
        },
      }),
    );
  });

  it('doesn\'t remove validation of readOnly properties by default', () => {
    const transformer = new ReadOnlyNotRequiredTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            readOnly: true,
            minLength: 1,
          },
        },
        required: ['name'],
      }))),
      schema3({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            readOnly: true,
            minLength: 1,
          },
        },
      }),
    );
  });

  it('options.removeValidation to remove validation of readOnly props', () => {
    const transformer = new ReadOnlyNotRequiredTransformer({
      removeValidation: true,
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            readOnly: true,
            minLength: 1,
          },
        },
        required: ['name'],
      }))),
      schema3({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            readOnly: true,
          },
        },
      }),
    );
  });

  it('options.setNonNullable to add x-nullable: false to readOnly', () => {
    const transformer = new ReadOnlyNotRequiredTransformer({
      setNonNullable: true,
    });
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            readOnly: true,
          },
        },
        required: ['name'],
      }))),
      schema3({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            readOnly: true,
            'x-nullable': false,
          },
        },
      }),
    );
  });
});
