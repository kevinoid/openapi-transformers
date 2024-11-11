/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

import deepFreeze from 'deep-freeze';

import PatternPropertiesToAdditionalPropertiesTransformer
  from '../pattern-properties-to-additional-properties.js';
import { schema3 } from '../test-lib/skeletons.js';

describe('PatternPropertiesToAdditionalPropertiesTransformer', () => {
  it('removes empty patternProperties', () => {
    const transformer =
      new PatternPropertiesToAdditionalPropertiesTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        type: 'object',
        patternProperties: {},
      }, '3.1.0'))),
      schema3({
        type: 'object',
      }, '3.1.0'),
    );
  });

  it('converts single patternProperties to additionalProperties', () => {
    const transformer =
      new PatternPropertiesToAdditionalPropertiesTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        type: 'object',
        patternProperties: {
          '^value[0-9]+$': {
            type: 'string',
          },
        },
      }, '3.1.0'))),
      schema3({
        type: 'object',
        additionalProperties: {
          type: 'string',
        },
      }, '3.1.0'),
    );
  });

  it('combines multiple patternProperties with anyOf', () => {
    const transformer =
      new PatternPropertiesToAdditionalPropertiesTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        type: 'object',
        patternProperties: {
          '^string[0-9]+$': {
            type: 'string',
          },
          '^number[0-9]+$': {
            type: 'number',
          },
          '^bool[0-9]+$': {
            type: 'boolean',
          },
        },
      }, '3.1.0'))),
      schema3({
        type: 'object',
        additionalProperties: {
          anyOf: [
            { type: 'string' },
            { type: 'number' },
            { type: 'boolean' },
          ],
        },
      }, '3.1.0'),
    );
  });

  it('combines anyOf patternProperties with additionalProperties', () => {
    const transformer =
      new PatternPropertiesToAdditionalPropertiesTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        type: 'object',
        patternProperties: {
          '^string[0-9]+$': {
            type: 'string',
          },
          '^number[0-9]+$': {
            type: 'number',
          },
          '^bool[0-9]+$': {
            type: 'boolean',
          },
        },
        additionalProperties: {
          type: 'object',
        },
      }, '3.1.0'))),
      schema3({
        type: 'object',
        additionalProperties: {
          anyOf: [
            { type: 'string' },
            { type: 'number' },
            { type: 'boolean' },
            { type: 'object' },
          ],
        },
      }, '3.1.0'),
    );
  });

  it('combines duplicate patternProperties with additionalProperties', () => {
    const transformer =
      new PatternPropertiesToAdditionalPropertiesTransformer();
    assert.deepStrictEqual(
      transformer.transformOpenApi(deepFreeze(schema3({
        type: 'object',
        patternProperties: {
          '^shortName[0-9]+$': {
            type: 'string',
          },
          '^longName[0-9]+$': {
            type: 'string',
          },
        },
        additionalProperties: {
          type: 'string',
        },
      }, '3.1.0'))),
      schema3({
        type: 'object',
        additionalProperties: {
          type: 'string',
        },
      }, '3.1.0'),
    );
  });
});
